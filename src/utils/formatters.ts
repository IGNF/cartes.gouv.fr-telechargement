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
  if (!bytes) return "0 octets";
  const k = 1024;
  const sizes = ["octets", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const getConnectionSpeed = (): number => {
  try {
    const connection = (navigator as NavigatorWithConnection).connection;
    if (connection && connection.downlink) {
      // downlink en Mbps -> octets/s
      return connection.downlink * 0.125 * 1024 * 1024;
    }
  } catch {
    // fallback
  }
  return 1024 * 1024; // 1 Mo/s
};