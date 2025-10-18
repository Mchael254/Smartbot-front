export interface KnowledgeBaseStats {
  collection_exists: boolean;
  embeddings_count: number;
  files_count: number;
  files: string[];
  urls_count: number;
  urls: string[];
  last_load_stats: {
    last_load_time: string;
    load_duration: number;
    documents_count: number;
    embeddings_count: number;
    changed_files: string[];
  };
  chroma_path: string;
  storage_path: string;
}

export interface KnowledgeBaseReloadResponse {
  status: string;
  message: string;
  load_duration?: number;
  documents_count?: number;
  embeddings_count?: number;
  changed_files?: string[];
  local_changes?: string[];
  supabase_changes?: string[];
  files_processed?: number;
  forced?: boolean;
  synced_count?: number;
  removed_count?: number;
  removed_files?: string[];
}

export interface PdfSyncResponse {
  status: string;
  message: string;
  sync_duration: number;
  synced_count: number;
  total_count: number;
  removed_count?: number;
  failed_downloads?: string[];
  removed_files?: string[];
  local_files: string[];
}

export interface AvailablePdfsResponse {
  pdfs: Array<{
    id: string;
    filename: string;
    storage_path: string;
    public_url: string;
    is_selected: boolean;
    created_at: string;
  }>;
  total: number;
  message: string;
}