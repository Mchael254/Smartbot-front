import type { 
  PdfUploadResponse, 
  PdfListResponse,
  PdfAllResponse,
  PdfToggleSelectionResponse
} from '../types/pdf';

// Base API URL - adjust this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class PdfService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/pdf`;
  }

  /**
   * Upload a PDF file
   */
  async uploadPdf(file: File, customName?: string): Promise<PdfUploadResponse> {
    try {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('Only PDF files are allowed');
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size too large. Maximum size is 10MB');
      }

      const formData = new FormData();
      formData.append('file', file);
      if (customName) {
        formData.append('custom_name', customName);
      }

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  /**
   * Upload a PDF file with progress tracking
   */
  async uploadPdfWithProgress(
    file: File, 
    onProgress?: (progress: number) => void,
    customName?: string
  ): Promise<PdfUploadResponse> {
    try {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('Only PDF files are allowed');
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size too large. Maximum size is 10MB');
      }

      const formData = new FormData();
      formData.append('file', file);
      if (customName) {
        formData.append('custom_name', customName);
      }

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (error) {
              reject(new Error('Invalid response format'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.detail || 'Upload failed'));
            } catch (error) {
              reject(new Error(`Upload failed with status: ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.open('POST', `${this.baseUrl}/upload`);
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  /**
   * Delete a PDF file by ID
   */
  async deletePdf(pdfId: string): Promise<{ success: boolean; message: string; deleted_id?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/delete/${encodeURIComponent(pdfId)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Delete failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }

  /**
   * List all PDF files
   */
  async listPdfs(): Promise<PdfListResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/list`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch files');
      }

      return await response.json();
    } catch (error) {
      console.error('List files error:', error);
      throw error;
    }
  }

  /**
   * Get public URL for a PDF file
   */
  async getPdfUrl(filename: string): Promise<{ url: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/url/${encodeURIComponent(filename)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get file URL');
      }

      return await response.json();
    } catch (error) {
      console.error('Get URL error:', error);
      throw error;
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
   * Get all PDF files with selection status
   */
  async getAllPdfs(): Promise<PdfAllResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/all`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch all PDFs');
      }

      return await response.json();
    } catch (error) {
      console.error('Get all PDFs error:', error);
      throw error;
    }
  }

  /**
   * Toggle PDF selection status
   */
  async togglePdfSelection(pdfId: string): Promise<PdfToggleSelectionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${pdfId}/toggle-selection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to toggle PDF selection');
      }

      return await response.json();
    } catch (error) {
      console.error('Toggle PDF selection error:', error);
      throw error;
    }
  }

  /**
   * Validate PDF file
   */
  validatePdfFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return { valid: false, error: 'Only PDF files are allowed' };
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size too large. Maximum size is 10MB' };
    }

    return { valid: true };
  }
}

// Export singleton instance
export const pdfService = new PdfService();
export default pdfService;