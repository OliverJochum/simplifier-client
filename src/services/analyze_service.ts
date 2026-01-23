import {api} from "../api/server"

export const analyzeService = {
    callGetScore: async (score: string, text: string) => {
        const response = await api.get(`/analyze/${score}`, {params: { text }})
        return response.data;
    },
}