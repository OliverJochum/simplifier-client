import {api} from "../api/server"
import { ScoreType } from "../utils/constants";

export const userService = {
    callGetUser: async (id: number) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },
    callPutScores: async (userId: number, scores: Map<string, ScoreType>) => {
        console.log("Submitting scores for user:", userId, "Scores:", scores);
        const scoresObj: Record<string, ScoreType> = Object.fromEntries(scores);
        const response = await api.put(`/users/${userId}/selected_scores`, scoresObj);
        return response.data;
    }
}