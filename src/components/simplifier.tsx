import { useState } from "react";
import { testService } from "../services/testservice";
import { simplifyService } from "../services/simplify_service";


function Simplifier() {
    const [inputText, setInputText] = useState("");   
    const [outputText, setOutputText] = useState(""); 

    const handleSimplify = () => {
        simplifyService.callSimplifyGenTxt(inputText, "openai").then(res => setOutputText(res));
    };
    return (
        <div>
            <div>
                <textarea id="inputText" value={inputText} onChange={(e) => setInputText(e.target.value)} rows={5} cols={50} placeholder="Type text here..."></textarea>
                <textarea id="outputText" value={outputText} onChange={(e) => setOutputText(e.target.value)} rows={5} cols={50} placeholder="Type text here..."></textarea>
            </div>
            <button id="simplifyButton" onClick={handleSimplify}>Simplify</button>
        </div>
    );
}

export default Simplifier;