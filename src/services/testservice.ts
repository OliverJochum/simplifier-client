import {api} from "../api/server"

export const testService = {
    ping: async () => {
        const response = await api.get("/ping")
        return response.data
    },
    callSimplipy: async () => {
        const response = await api.get("/simplipy")
        return response.data;
    }
}