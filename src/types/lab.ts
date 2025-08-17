export interface LabFile {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  content: string | null; // null if no access to premium content
  is_premium: boolean;
  access_granted: boolean;
  access_message?: string;
  children?: LabFile[];
  language?: string;
}

export interface LabAccess {
  can_afford_premium: boolean;
  has_premium_access: boolean;
  premium_cost: number;
  user_wallet_balance: number;  
}

export interface LabInfo {
  category: string
  course_id: string
  course_level: string
  course_title: string
  description: string
  difficulty: string
  duration: string
  estimatedMinutes: number
  is_interactive: boolean
  is_popular: boolean
  last_updated: string | null
  prerequisites: string[]
  source: string
  tags: string[]
  title: string
  url: string
}

export interface LabContentData {
  free_files_count: number;
  lab_files: LabFile[];
  premium_files_count: number;
  premium_preview: LabFile[];
}

export interface LabContent {
  access: LabAccess;
  branch: string;
  content: LabContentData;
  isPublic: boolean;
  lab_info: LabInfo;
  lab_url: string;
}

export interface LabContentResponse {
  success: boolean;
  data: LabContent;
  error?: string;
}