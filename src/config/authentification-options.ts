import { authOptionsFromEnv, type AuthOptionsInput } from "authentification-vue-oidc";
import { getRuntimeConfig } from "./configService";

export function createAuthOptions(): AuthOptionsInput {
  const config = getRuntimeConfig();
  const baseUrl = new URL(config.BASE_URL, window.location.origin);

  return {
    ...authOptionsFromEnv({
      ...config,
      IAM_AUTHORITY: config.IAM_AUTHORITY || undefined,
      IAM_REDIRECT_URI: config.IAM_REDIRECT_URI || new URL("login", baseUrl).href,
      IAM_POST_LOGOUT_REDIRECT_URI: config.IAM_POST_LOGOUT_REDIRECT_URI || baseUrl.href,
      IAM_SCOPE: (config.IAM_SCOPE || "openid profile email").replace(/,/g, " "),
      IAM_STORAGE: config.IAM_STORAGE || "memory",
    }),
    silentRedirectUri: config.IAM_SILENT_REDIRECT_URI || new URL("silent-renew.html", baseUrl).href,
    // Même sens que dans extraction : ne désactive PAS la connexion explicite.
    silentRestore: config.IAM_DISABLE !== "1",
    // Aucun jeton vers les métadonnées, flux cartographiques ou fichiers externes.
    apiBaseUrls: [config.IAM_ENTREPOT_API_URL].filter(Boolean),
  };
}