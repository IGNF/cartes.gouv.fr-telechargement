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
