import { useRef, useState } from "react";
import { simplifyService } from "../services/simplify_service";
import IOTextBox from "./iotextbox";
import Grid from "@mui/material/Grid";
import OptionManager from "../services/option_manager";

type SimplifierProps = {
    optionManager?: OptionManager;
}

function Simplifier({ optionManager }: SimplifierProps) {
    const [inputText, setInputText] = useState("");   
    const outputSetterRef = useRef<(val: string) => void>(() => {});
    
    const updateOutputSetterRef = (val: string) => {
        outputSetterRef.current?.(val);
    }

    const handleSimplify = () => {
        simplifyService.callSimplifyGenTxt(inputText, "openai").then(res => updateOutputSetterRef(res)).catch(err => {
            console.error("Error simplifying text:", err);
        });
    };

    // const onSentenceSelect = (sentence: string | null, sentenceIndex: number | null) => {
    //     if (!sentence) return;
    //     simplifyService.callSimplifySentenceSuggest(sentence, "openai").then(res => {
    //         console.log("Suggestions for sentence:", res);
    //     }).catch(err => {
    //         console.error("Error fetching sentence suggestions:", err);
    //     });
    // };

    return (
        <div>
            <div>
                <Grid container spacing={1} sx={{ marginBottom: 1 }}>
                    <Grid size={6}>
                        <IOTextBox onTextChange={setInputText} sentenceAPICallback={simplifyService.callSimplifySentenceSimplify} model="openai" optionManager={optionManager} />
                    </Grid>
                    <Grid size={6}>
                        <IOTextBox setTextFromParent={(setter: (val: string) => void) => {outputSetterRef.current = setter; }} sentenceAPICallback={simplifyService.callSimplifySentenceSuggest} model="openai" optionManager={optionManager} />
                    </Grid>
                </Grid>
            </div>
            <button id="simplifyButton" onClick={handleSimplify}>Simplify</button>
        </div>
    );
}

export default Simplifier;