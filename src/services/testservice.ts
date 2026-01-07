import {api} from "../api/server"

export const testService = {
    ping: async () => {
        const response = await api.get("/ping")
        return response.data
    }
}