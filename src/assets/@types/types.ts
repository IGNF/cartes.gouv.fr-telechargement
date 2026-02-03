export type Dalle = {
  id: string;
  name: string;
  url: string;
  timestamp: number;
  metadata?: Record<string, any>;
  isHovered?: boolean;
};

export type FilterDate = { dateStart: number | null; dateEnd: number };


export type File = { url: string; name: string };
