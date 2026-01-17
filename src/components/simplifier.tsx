import { useState } from "react";
import { simplifyService } from "../services/simplify_service";
import IOTextBox from "./iotextbox";
import Grid from "@mui/material/Grid";


function Simplifier() {
    const [inputText, setInputText] = useState("");   
    const [outputText, setOutputText] = useState("");
    const [sentenceSuggestEnabled, setSentenceSuggestEnabled] = useState(false);

    const handleSimplify = () => {
        simplifyService.callSimplifyGenTxt(inputText, "openai").then(res => setOutputText(res)).catch(err => {
            console.error("Error simplifying text:", err);
        });
    };

    const onSentenceSelect = (sentence: string | null, sentenceIndex: number | null) => {
        if (!sentence) return;
        simplifyService.callSimplifySentenceSuggest(sentence, "openai").then(res => {
            console.log("Suggestions for sentence:", res);
        }).catch(err => {
            console.error("Error fetching sentence suggestions:", err);
        });
    };

    return (
        <div>
            <div>
                <Grid container spacing={1} sx={{ marginBottom: 1 }}>
                    <Grid size={6}>
                        <IOTextBox/>
                    </Grid>
                    <Grid size={6}>
                        <IOTextBox/>
                    </Grid>
                </Grid>
            </div>
            <button id="simplifyButton" onClick={handleSimplify}>Simplify</button>
        </div>
    );
}

export default Simplifier;