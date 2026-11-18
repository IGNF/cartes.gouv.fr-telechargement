/**
 * Service de configuration
 *
 * Priorité 1 : charge /config/config.json quand il est disponible
 * Priorité 2 : en développement local, fallback sur import.meta.env
 *
 * Important : `import.meta.env.*` est injecté par Vite au build.
 */

type Config = Record<string, string>;

let configInstance: Config | null = null;
let configLoaded = false;
let configError: Error | null = null;

// Charge la configuration depuis un fichier JSON (typiquement monté via ConfigMap)
async function loadConfigFromFile(configPath = `${import.meta.env.BASE_URL}/config/config.json`): Promise<Config> {
  console.log(`[Config] Chargement de la configuration depuis ${configPath}...`);
  const response = await fetch(configPath);
  if (!response.ok) {
    throw new Error(`Impossible de charger la configuration depuis ${configPath} : ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  try {
    return JSON.parse(text) as Config;
  } catch {
    throw new Error(
      `Le fichier de configuration "${configPath}" n'est pas du JSON valide. ` +
      `Vérifiez que le ConfigMap Kubernetes est correctement monté. ` +
      `Contenu reçu : ${text.slice(0, 100)}...`
    );
  }
}

// Charge la configuration depuis les variables d'environnement Vite
function loadConfigFromEnv(): Config {
  return Object.fromEntries(
    Object.entries(import.meta.env).filter(([, v]) => v !== undefined)
  ) as Config;
}

/**
 * Initialise le service de configuration.
 * Doit être appelé avant tout appel à getRuntimeConfig().
 *
 * Sur Kubernetes, la configuration runtime provient de /config/config.json.
 * En développement local, si ce fichier n'existe pas, on utilise import.meta.env.
 */
export async function initializeConfig(options: { configPath?: string } = {}): Promise<void> {
  const { configPath = `${import.meta.env.BASE_URL}/config/config.json` } = options;

  console.log(`[Config] Chemin de configuration : ${configPath}`);

  try {
    try {
      // Sur Kubernetes / Docker, on privilégie toujours la configuration runtime.
      configInstance = await loadConfigFromFile(configPath);
      configLoaded = true;
      console.log('[Config] Configuration runtime chargée depuis le fichier JSON');
      return;
    } catch (fileError) {
      const buildMode = import.meta.env.MODE || 'development';

      if (buildMode === 'production') {
        throw fileError;
      }

      // En développement local, on tolère l'absence du fichier JSON.
      configInstance = loadConfigFromEnv();
      configLoaded = true;
      console.warn('[Config] Fallback sur import.meta.env (mode développement local)', fileError);
    }
  } catch (error) {
    configError = error instanceof Error ? error : new Error(String(error));
    configLoaded = true;
    throw configError;
  }
}

/**
 * Retourne la configuration courante.
 * Nécessite qu'initializeConfig() ait été appelé au préalable dans main.ts.
 */
export function getRuntimeConfig(): Config {
  if (!configLoaded) {
    throw new Error('Configuration non initialisée. Appelez initializeConfig() dans main.ts avant d\'utiliser getRuntimeConfig().');
  }
  if (configError) throw configError;
  if (!configInstance) throw new Error('La configuration est nulle');
  return configInstance;
}

/** Indique si l'application tourne en mode production */
export function isProduction(): boolean {
  return getRuntimeConfig().MODE === 'production';
}

/** Indique si l'application tourne en mode développement */
export function isDevelopment(): boolean {
  return getRuntimeConfig().MODE === 'development';
}

/** Retourne l'URL de base de l'application */
export function getBaseUrl(): string {
  return getRuntimeConfig().BASE_URL;
}
