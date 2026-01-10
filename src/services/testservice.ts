import {api} from "../api/server"

export const testService = {
    ping: async () => {
        const response = await api.get("/ping")
        return response.data
    },
    callLlamaTest: async () => {
        const response = await api.get("/llama_test")
        return response.data;
    },
    callSimplipy: async (input: string, selected_service: string) => {
        console.log(input)
        const response = await api.post("/simplipy", { input_text: input, selected_service: selected_service });
        return response.data;
    }
}