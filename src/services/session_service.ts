import {api} from "../api/server"

export const sessionService = {
    createSnapshot: async (inputText: string, outputText: string, sessionId: number, ownerId: number) => {
        console.log("Creating snapshot for session:", sessionId, "and user:", ownerId);
        const response = await api.post(`/sessions/${sessionId}/snapshots?userId=${ownerId}`, { input: inputText,output: outputText});
        return response.data;   
    },
    createSession: async ( userId: number, name: string,) => {
        console.log("Creating session for user:", userId);
        const response = await api.post("/sessions", { userId: userId, sessionName: name });
        return response.data;
    }
}