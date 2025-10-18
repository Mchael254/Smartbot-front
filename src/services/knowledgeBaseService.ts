import type { AvailablePdfsResponse, KnowledgeBaseReloadResponse, KnowledgeBaseStats, PdfSyncResponse } from "../types/knowledgeBase";

const LLM_API_BASE_URL =import.meta.env.VITE_LLM_API_BASE_URL; 

class KnowledgeBaseService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = LLM_API_BASE_URL;
  }

  /**
   * Get current knowledge base statistics
   */
  async getStats(): Promise<KnowledgeBaseStats> {
    try {
      const response = await fetch(`${this.baseUrl}/knowledge-base/stats`);
      
      if (!response.ok) {
        throw new Error(`Failed to get knowledge base stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting knowledge base stats:', error);
      throw error instanceof Error ? error : new Error('Failed to get knowledge base stats');
    }
  }

  /**
   * Reload the knowledge base (force reload)
   */
  async reloadKnowledgeBase(force: boolean = true): Promise<KnowledgeBaseReloadResponse> {
    try {
      const url = force 
        ? `${this.baseUrl}/knowledge-base/reload?force=true`
        : `${this.baseUrl}/knowledge-base/reload`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to reload knowledge base: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error reloading knowledge base:', error);
      throw error instanceof Error ? error : new Error('Failed to reload knowledge base');
    }
  }

  /**
   * Check for knowledge base changes
   */
  async checkChanges(): Promise<{ has_changed: boolean; changed_files: string[]; timestamp: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/knowledge-base/check-changes`);
      
      if (!response.ok) {
        throw new Error(`Failed to check changes: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking knowledge base changes:', error);
      throw error instanceof Error ? error : new Error('Failed to check knowledge base changes');
    }
  }

  /**
   * Sync PDFs from Supabase
   */
  async syncPdfs(force: boolean = false): Promise<PdfSyncResponse> {
    try {
      const endpoint = force ? '/pdf-sync/force-sync' : '/pdf-sync/sync';
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to sync PDFs: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error syncing PDFs:', error);
      throw error instanceof Error ? error : new Error('Failed to sync PDFs');
    }
  }

  /**
   * Get PDF sync status
   */
  async getSyncStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/pdf-sync/status`);
      
      if (!response.ok) {
        throw new Error(`Failed to get sync status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting PDF sync status:', error);
      throw error instanceof Error ? error : new Error('Failed to get PDF sync status');
    }
  }

  /**
   * Get available PDFs from Supabase
   */
  async getAvailablePdfs(): Promise<AvailablePdfsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/pdf-source/available`);
      
      if (!response.ok) {
        throw new Error(`Failed to get available PDFs: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting available PDFs:', error);
      throw error instanceof Error ? error : new Error('Failed to get available PDFs');
    }
  }

  /**
   * Check if the LLM service is healthy
   */
  async checkHealth(): Promise<{ status: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking LLM service health:', error);
      throw error instanceof Error ? error : new Error('LLM service is not available');
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format duration for display
   */
  formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  }
}

// Export singleton instance
export const knowledgeBaseService = new KnowledgeBaseService();
export default knowledgeBaseService;