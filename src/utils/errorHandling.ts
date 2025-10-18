import axios from "axios";

export const errorHandlingService = {
    handleError: (error: unknown): string => {
        if (axios.isAxiosError(error)) {
            // Handle 422 validation errors specifically
            if (error.response?.status === 422) {
                const details = error.response.data?.detail;
                if (Array.isArray(details)) {
                    return details.map(d => d.msg || d.message).join(', ');
                }
                return 'Validation error occurred';
            }
            
            // Handle other Axios errors
            if (error.response) {
                return `Server error: ${error.response.status} - ${error.response.data?.message || 'No additional information'}`;
            } else if (error.request) {
                return 'No response received from server';
            } else {
                return `Request setup error: ${error.message}`;
            }
        } else if (error instanceof Error) {
            return error.message;
        } else if (typeof error === 'string') {
            return error;
        }
        return 'An unexpected error occurred';
    },

    logError: (error: unknown): void => {
        const errorMessage = errorHandlingService.handleError(error);
        console.error('API Error:', errorMessage);
    }
};