import { useState } from "react";
import { testService } from "../services/testservice";
import { simplifyService } from "../services/simplify_service";
import Box from "@mui/material/Box";
import IOTextBox from "./iotextbox";
import Grid from "@mui/material/Grid";


function Simplifier() {
    const [inputText, setInputText] = useState("");   
    const [outputText, setOutputText] = useState(""); 

    const handleSimplify = () => {
        simplifyService.callSimplifyGenTxt(inputText, "openai").then(res => setOutputText(res));
    };
    
    return (
        <div>
            <div>
                <Grid container spacing={1} sx={{ marginBottom: 1 }}>
                    <Grid size={6}>
                        <IOTextBox text={inputText} onSentenceSelect={undefined} />
                    </Grid>
                    <Grid size={6}>
                        <IOTextBox text={outputText} onSentenceSelect={undefined} />
                    </Grid>
                </Grid>
            </div>
            <button id="simplifyButton" onClick={handleSimplify}>Simplify</button>
        </div>
    );
}

export default Simplifier;