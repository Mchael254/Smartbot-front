// URLs service for managing web URLs via Smartacademy-Chatbot-Backend API

interface WebUrl {
    id: string;
    title: string;
    url: string;
    description?: string;
    is_active: boolean;
    created_at: string;
}

interface WebUrlsResponse {
    urls: WebUrl[];
    total: number;
    message: string;
}

interface InsertWebUrlRequest {
    title: string;
    url: string;
    description?: string;
    is_active?: boolean;
}

interface UrlApiResponse {
    success: boolean;
    data?: any;
    message: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class UrlsService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = `${API_BASE_URL}`;
    }

    /**
     * Get all web URLs
     */
    async getAllUrls(): Promise<WebUrlsResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/url/all`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: WebUrlsResponse = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to fetch URLs:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch URLs');
        }
    }

    /**
     * Insert a new web URL
     */
    async insertUrl(urlData: InsertWebUrlRequest): Promise<UrlApiResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/url/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(urlData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: UrlApiResponse = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to insert URL:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to insert URL');
        }
    }

    /**
     * Toggle active status of a web URL
     */
    async toggleUrlActive(urlId: string): Promise<UrlApiResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/url/${urlId}/toggle-active`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: UrlApiResponse = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to toggle URL active status:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to toggle URL active status');
        }
    }

    /**
     * Delete a web URL
     */
    async deleteUrl(urlId: string): Promise<UrlApiResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/url/delete/${urlId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: UrlApiResponse = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to delete URL:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to delete URL');
        }
    }

    /**
     * Format URL for display
     */
    formatUrl(url: string, maxLength: number = 50): string {
        if (url.length <= maxLength) {
            return url;
        }
        return `${url.substring(0, maxLength)}...`;
    }

    /**
     * Validate URL format
     */
    isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}

// Export singleton instance
export const urlsService = new UrlsService();

// Export types
export type { WebUrl, WebUrlsResponse, InsertWebUrlRequest, UrlApiResponse };