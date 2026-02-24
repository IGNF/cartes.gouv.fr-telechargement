interface NetworkInformation extends EventTarget {
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
}
interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

export const formatBytes = (bytes = 0): string => {
  // Vérifie que bytes est un nombre valide et positif
  if (!bytes || bytes < 0 || !Number.isFinite(bytes)) return "0 octets";
  
  const k = 1024;
  const sizes = ["octets", "KB", "MB", "GB", "TB"];
  
  // Calcule l'index de l'unité appropriée
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  // Sécurité: limite l'index à la taille du tableau
  const safeIndex = Math.min(i, sizes.length - 1);
  
  // Formate et retourne la valeur
  const value = parseFloat((bytes / Math.pow(k, safeIndex)).toFixed(2));
  return `${value} ${sizes[safeIndex]}`;
};
