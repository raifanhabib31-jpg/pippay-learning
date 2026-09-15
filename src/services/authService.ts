import type { UserProfile } from '../types';

const STORAGE_KEYS = {
  ACTIVE_USER: 'pippay_active_user',
  ALL_USERS: 'pippay_registered_users',
  GOOGLE_CLIENT_ID: 'pippay_google_client_id',
};

// Helper: Decode Google JWT Token (Credential response from Google Identity Services)
function decodeJwtResponse(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to decode Google JWT token:', e);
    return null;
  }
}

export const authService = {
  /**
   * Dapatkan Google OAuth Client ID dari localStorage atau Vite env atau default
   */
  getGoogleClientId(): string {
    return (
      localStorage.getItem(STORAGE_KEYS.GOOGLE_CLIENT_ID) ||
      (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
      '443739960849-jsjptvqpmdn4urn6lhnpa3s2cc1i3er7.apps.googleusercontent.com'
    );
  },

  /**
   * Simpan Google OAuth Client ID
   */
  setGoogleClientId(clientId: string) {
    localStorage.setItem(STORAGE_KEYS.GOOGLE_CLIENT_ID, clientId.trim());
  },

  /**
   * Redirect pengguna langsung ke laman resmi Google Sign-In (OAuth 2.0)
   */
  redirectToGoogleOAuth(loginHint?: string): boolean {
    const clientId = this.getGoogleClientId();
    if (!clientId) {
      return false; // Memerlukan Client ID
    }

    // Normalize redirect URI to exact origin (e.g. https://pippay-learning.raifanhabib31.workers.dev)
    const redirectUri = window.location.origin.replace(/\/$/, '') + '/';
    const scope = encodeURIComponent('openid email profile');
    const responseType = encodeURIComponent('id_token token');
    const nonce = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    let authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=${responseType}&scope=${scope}&nonce=${nonce}&prompt=select_account`;

    if (loginHint && loginHint.includes('@')) {
      authUrl += `&login_hint=${encodeURIComponent(loginHint.trim())}`;
    }

    window.location.href = authUrl;
    return true;
  },

  /**
   * Login interaktif menggunakan Google Identity Services (GSI) Popup / One-Tap
   * Ini tidak memerlukan Authorized Redirect URI yang rumit karena menggunakan JavaScript Popup resmi Google
   */
  loginWithGooglePopup(callback: (user: UserProfile) => void, onError: (err: any) => void) {
    const clientId = this.getGoogleClientId();
    if (!clientId) {
      onError(new Error('Google Client ID belum diatur.'));
      return;
    }

    if (typeof (window as any).google !== 'undefined' && (window as any).google.accounts?.oauth2) {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            onError(tokenResponse.error);
            return;
          }
          if (tokenResponse.access_token) {
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              if (res.ok) {
                const info = await res.json();
                const user: UserProfile = {
                  id: `google_${info.sub || info.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
                  name: info.name || info.email.split('@')[0],
                  email: info.email,
                  avatarUrl: info.picture || `https://api.dicebear.com/7.x/notionists/svg?seed=${info.email}`,
                  university: 'Fakultas Ilmu Komputer',
                  provider: 'google',
                  createdAt: new Date().toISOString(),
                };
                this.setCurrentUser(user);
                callback(user);
                return;
              }
            } catch (e) {
              onError(e);
            }
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } else {
      // Fallback redirect
      this.redirectToGoogleOAuth();
    }
  },

  /**
   * Cek dan tangani callback redirect dari Google OAuth (URL Hash #id_token=... atau #access_token=...)
   */
  async handleOAuthCallback(): Promise<UserProfile | null> {
    const hash = window.location.hash;
    if (!hash || !hash.includes('id_token=') && !hash.includes('access_token=')) {
      return null;
    }

    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const idToken = params.get('id_token');
    const accessToken = params.get('access_token');

    // 1. Prioritas id_token JWT
    if (idToken) {
      const payload = decodeJwtResponse(idToken);
      if (payload && payload.email) {
        const user: UserProfile = {
          id: `google_${payload.sub || payload.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
          name: payload.name || payload.email.split('@')[0],
          email: payload.email,
          avatarUrl: payload.picture || `https://api.dicebear.com/7.x/notionists/svg?seed=${payload.email}`,
          university: 'Fakultas Ilmu Komputer',
          provider: 'google',
          createdAt: new Date().toISOString(),
        };
        this.setCurrentUser(user);
        // Bersihkan hash dari URL agar rapi
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        return user;
      }
    }

    // 2. Fallback fetch userinfo via access_token
    if (accessToken) {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const info = await res.json();
          const user: UserProfile = {
            id: `google_${info.sub || info.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
            name: info.name || info.email.split('@')[0],
            email: info.email,
            avatarUrl: info.picture || `https://api.dicebear.com/7.x/notionists/svg?seed=${info.email}`,
            university: 'Fakultas Ilmu Komputer',
            provider: 'google',
            createdAt: new Date().toISOString(),
          };
          this.setCurrentUser(user);
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          return user;
        }
      } catch (err) {
        console.error('Failed to fetch user profile from Google access token:', err);
      }
    }

    return null;
  },

  /**
   * Dapatkan user yang sedang aktif / login saat ini
   */
  getCurrentUser(): UserProfile | null {
    const userJson = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },

  /**
   * Simpan user sebagai user aktif
   */
  setCurrentUser(user: UserProfile) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
    
    // Simpan ke daftar user terdaftar
    const allUsers = this.getAllUsers();
    const existingIdx = allUsers.findIndex((u) => u.id === user.id);
    if (existingIdx >= 0) {
      allUsers[existingIdx] = { ...allUsers[existingIdx], ...user };
    } else {
      allUsers.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(allUsers));
  },

  /**
   * Dapatkan daftar semua user yang pernah login di perangkat ini
   */
  getAllUsers(): UserProfile[] {
    const data = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  /**
   * Login cepat langsung dengan Email Google
   */
  async loginWithGoogleDirect(email: string, name?: string, avatarUrl?: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const displayName =
      name?.trim() ||
      cleanEmail
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

    const user: UserProfile = {
      id: `google_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: displayName,
      email: cleanEmail,
      avatarUrl:
        avatarUrl ||
        `https://api.dicebear.com/7.x/notionists/svg?seed=${cleanEmail}&backgroundColor=ffdfbf,ffd5dc,d1d4f9,c0aede,b6e3f4`,
      university: 'Fakultas Ilmu Komputer',
      provider: 'google',
      createdAt: new Date().toISOString(),
    };

    this.setCurrentUser(user);
    return user;
  },

  /**
   * Logout user saat ini
   */
  logout() {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
  },

  /**
   * Update data profil user saat ini
   */
  updateProfile(updates: Partial<UserProfile>): UserProfile | null {
    const current = this.getCurrentUser();
    if (!current) return null;

    const updated: UserProfile = { ...current, ...updates };
    this.setCurrentUser(updated);
    return updated;
  },
};
