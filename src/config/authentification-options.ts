import { authOptionsFromEnv, type AuthOptionsInput } from 'authentification-vue-oidc';
import { getRuntimeConfig } from './configService';

/** Adapte la configuration publique runtime aux options de la SPA OIDC. */
export function createAuthOptions(): AuthOptionsInput {
  const config = getRuntimeConfig();
  const basePath = `${(config.BASE_URL || import.meta.env.BASE_URL).replace(/\/+$/, '')}/`;
  const baseUrl = new URL(basePath, window.location.origin);

  return {
    ...authOptionsFromEnv({
      ...config,
      IAM_AUTHORITY: config.IAM_AUTHORITY || undefined,
      IAM_REDIRECT_URI: config.IAM_REDIRECT_URI || new URL('login', baseUrl).href,
      IAM_POST_LOGOUT_REDIRECT_URI: config.IAM_POST_LOGOUT_REDIRECT_URI || baseUrl.href,
      IAM_SCOPE: (config.IAM_SCOPE || 'openid profile email').replace(/,/g, ' '),
      IAM_STORAGE: config.IAM_STORAGE || 'memory',
    }),
    silentRedirectUri: config.IAM_SILENT_REDIRECT_URI || new URL('silent-renew.html', baseUrl).href,
    silentRestore: config.IAM_DISABLE !== '1',
    // Ne jamais transmettre les tokens aux liens externes de métadonnées/téléchargement.
    apiBaseUrls: [config.IAM_ENTREPOT_API_URL, config.IAM_API_EXTRACTION_URL].filter(Boolean),
  };
}