import {api} from "../api/server"

export const simplifyService = {
    callSimplifyGenTxt: async (input: string, selected_service: string) => {
        console.log(input)
        const response = await api.post("/simplify/generate_text", { input_text: input, selected_service: selected_service });
        return response.data;
    },
    callSimplifySentenceSimplify: async (input: string, selected_service: string) => {
        console.log(input)
        const response = await api.post("/simplify/sentence_simplify", { input_text: input, selected_service: selected_service });
        return response.data;
    },
    callSimplifySentenceSuggest: async (input: string, selected_service: string) => {
        console.log(input)
        const response = await api.post("/simplify/sentence_suggest", { input_text: input, selected_service: selected_service });
        return response.data;
    }
}