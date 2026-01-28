import {api} from "../api/server"

export const analyzeService = {
    callGetReadabilityScore: async (score: string, text: string) => {
        const response = await api.get(`/analyze/readability/${score}`, {params: { text }})
        return response.data;
    },
    callGetCtxtRetentionScore: async (score: string, candidate_text: string, reference_text: string) => {
        const response = await api.get(`/analyze/context_retention/${score}`, {params: { candidateText: candidate_text, referenceText: reference_text }})
        return response.data;
    }
}