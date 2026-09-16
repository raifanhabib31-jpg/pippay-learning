import { onRequest as __api_ai_js_onRequest } from "/Users/raifanhabib/Documents/Programs/functions/api/ai.js"
import { onRequest as __api_send_email_js_onRequest } from "/Users/raifanhabib/Documents/Programs/functions/api/send-email.js"
import { onRequest as __api_settings_js_onRequest } from "/Users/raifanhabib/Documents/Programs/functions/api/settings.js"

export const routes = [
    {
      routePath: "/api/ai",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_ai_js_onRequest],
    },
  {
      routePath: "/api/send-email",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_send_email_js_onRequest],
    },
  {
      routePath: "/api/settings",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_settings_js_onRequest],
    },
  ]