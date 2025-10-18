import axios from "axios";

const BASE_URL = import.meta.env.VITE_LLM_API_BASE_URL; 

// TypeScript interfaces for API request and response
export interface ChatRequest {
    user_input: string;
    chat_history: string[];
}

export interface ChatResponse {
    response: string;
    sources: Array<{
        [key: string]: any;
    }>;
}

// Utility function to auto-linkify URLs in text
export const linkifyText = (text: string): string => {
    // URL regex pattern that matches http, https, and www URLs
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
    
    return text.replace(urlRegex, (url) => {
        // Ensure URL has protocol
        const href = url.startsWith('http') ? url : `https://${url}`;
        return `[${url}](${href})`;
    });
};

export const chatBot = async (userMessage: string, chatHistory: string[] = []): Promise<ChatResponse> => {      
    try {         
        
        const payload: ChatRequest = {
            user_input: userMessage,
            chat_history: chatHistory
        };

        const response = await axios.post(`${BASE_URL}/chat`, payload, {             
            headers: {                 
                'Content-Type': 'application/json'             
            }         
        });         
        
        if(response.data) {
            // Auto-linkify URLs in the response
            const linkifiedResponse = linkifyText(response.data.response || "");
            return {
                ...response.data,
                response: linkifiedResponse
            };
        }
        
        console.log(response.data);
        
        // Fallback response if no data
        return {
            response: "I didn't understand that. Could you rephrase?",
            sources: []
        };              
    } catch (error) {         
        if (axios.isAxiosError(error)) {             
            const message = error.response?.data?.detail || "Chat request failed";             
            throw new Error(message);         
        } else {             
            throw new Error("Something went wrong");         
        }      
    }  
}