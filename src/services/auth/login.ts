import axios from "axios";
import type { loginPayload } from "../../types/auth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const userLogin = async (loginPayload: loginPayload) => {

    try {
        const response = await axios.post(`${BASE_URL}/auth/signin`, loginPayload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if(response.data)
       
        return response.data;
        

    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.detail || "Login failed";
            throw new Error(message);
        } else {
            throw new Error("Something went wrong");
        }

    }

}