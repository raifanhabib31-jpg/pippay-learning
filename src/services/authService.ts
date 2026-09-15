import type { UserProfile } from '../types';

const STORAGE_KEYS = {
  ACTIVE_USER: 'pippay_active_user',
  ALL_USERS: 'pippay_registered_users',
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
   * Login dengan Google (Credential JWT dari Google Identity Services atau Mock)
   */
  async loginWithGoogleCredential(credentialToken: string): Promise<UserProfile> {
    const payload = decodeJwtResponse(credentialToken);
    if (!payload || !payload.email) {
      throw new Error('Token Google tidak valid.');
    }

    const user: UserProfile = {
      id: `google_${payload.sub || payload.email}`,
      name: payload.name || payload.email.split('@')[0],
      email: payload.email,
      avatarUrl: payload.picture,
      university: 'Universitas Indonesia',
      provider: 'google',
      createdAt: new Date().toISOString(),
    };

    this.setCurrentUser(user);
    return user;
  },

  /**
   * Login cepat simulasi Google (jika tanpa Client ID atau via modal interaktif)
   */
  async loginWithGoogleDirect(email: string, name?: string, avatarUrl?: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const displayName = name?.trim() || cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const user: UserProfile = {
      id: `google_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: displayName,
      email: cleanEmail,
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${cleanEmail}&backgroundColor=ffdfbf,ffd5dc,d1d4f9,c0aede,b6e3f4`,
      university: 'Fakultas Ilmu Komputer',
      provider: 'google',
      createdAt: new Date().toISOString(),
    };

    this.setCurrentUser(user);
    return user;
  },

  /**
   * Login manual dengan Email & Nama Mahasiswa
   */
  async loginWithEmail(name: string, email: string, university?: string, major?: string): Promise<UserProfile> {
    if (!email.trim() || !name.trim()) {
      throw new Error('Nama dan Email wajib diisi.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const user: UserProfile = {
      id: `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: name.trim(),
      email: cleanEmail,
      avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${cleanEmail}&backgroundColor=ffdfbf,ffd5dc,d1d4f9,c0aede,b6e3f4`,
      university: university?.trim() || 'Universitas Indonesia',
      major: major?.trim() || 'Ilmu Komputer',
      provider: 'email',
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
