// PDF Upload and Management Types

export interface PdfFile {
  id: string;
  filename: string;
  file_size: number;
  file_path: string;
  upload_url: string;
  created_at: string;
  public_url?: string;
  is_selected?: boolean; // For compatibility with old structure
}

// New structure from get_all_pdfs_endpoint
export interface PdfFileWithSelection {
  id: string;
  filename: string;
  size: number;
  storage_path: string;
  public_url: string;
  is_selected: boolean;
  created_at: string;
}

export interface PdfUploadResponse {
  id: string;
  filename: string;
  file_size: number;
  file_path: string;
  upload_url: string;
  created_at: string;
  message: string;
}

export interface PdfDeleteResponse {
  message: string;
  deleted_file: string;
}

export interface PdfListResponse {
  files: PdfFile[];
  total: number;
  message: string;
}

// New response structure from get_all_pdfs_endpoint
export interface PdfAllResponse {
  files: PdfFileWithSelection[];
  total: number;
  message: string;
}

// Toggle selection response
export interface PdfToggleSelectionResponse {
  success: boolean;
  data: PdfFileWithSelection;
  message: string;
}

export interface PdfUploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface PdfUploadComponentProps {
  onUploadSuccess?: (response: PdfUploadResponse) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

export interface PdfListComponentProps {
  files: PdfFileWithSelection[];
  onDelete?: (filename: string) => void;
  onView?: (url: string) => void;
  onToggleSelection?: (id: string) => void;
  loading?: boolean;
}

export interface PdfManagementState {
  files: PdfFileWithSelection[];
  uploading: boolean;
  loading: boolean;
  error: string | null;
  uploadProgress: PdfUploadProgress[];
}