import { use, useEffect, useRef, useState } from "react";
import { simplifyService } from "../services/simplify_service";
import IOTextBox from "./iotextbox";
import Grid from "@mui/material/Grid";
import OptionManager from "../services/option_manager";
import Scorecard from "./scorecard";
import { analyzeService } from "../services/analyze_service";

type SimplifierProps = {
    optionManager?: OptionManager;
}

function Simplifier({ optionManager }: SimplifierProps) {
    const [inputText, setInputText] = useState("");
    const [outputText, setOutputText] = useState("");
    const [inputScores, setInputScores] = useState<{ [key: string]: number | void }>({});
    const [outputScores, setOutputScores] = useState<{ [key: string]: number | void }>({});
    const outputSetterRef = useRef<(val: string) => void>(() => {});
    
    const updateOutputSetterRef = (val: string) => {
        outputSetterRef.current?.(val);
    }

    const handleSimplify = () => {
        simplifyService.callSimplifyGenTxt(inputText, "openai").then(res => updateOutputSetterRef(res)).catch(err => {
            console.error("Error simplifying text:", err);
        });
    };

    const handleScore = async (scoreType: string, text: string): Promise<number> => {
        try {
            const res = await analyzeService.callGetScore(scoreType, text);
            console.log(`Fetched score (${scoreType}):`, res);
            return res;
        } catch (err) {
            console.error(`Error fetching score (${scoreType}):`, err);
            return 0; // fallback if API fails
        }
    };

    useEffect(() => {
        const fetchScores = async () => {
            if (!optionManager) return;
            const scores = optionManager.getSelectedLegibilityScores();
            const results = await Promise.all(scores.map(score => handleScore(score, inputText)));
            const newScores: Record<string, number> = {};
            scores.forEach((score, i) => {
                newScores[score] = results[i];
            });
            setInputScores(newScores);
        };
        fetchScores();
    }, [inputText, optionManager]);

    useEffect(() => {
        const fetchScores = async () => {
            if (!optionManager) return;
            const scores = optionManager.getSelectedLegibilityScores();
            const results = await Promise.all(scores.map(score => handleScore(score, outputText)));
            const newScores: Record<string, number> = {};
            scores.forEach((score, i) => {
                newScores[score] = results[i];
            });
            setOutputScores(newScores);
        };
        fetchScores();
    }, [optionManager, outputText]);


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
                        <Scorecard label="Legibility" scores={Object.entries(inputScores).map(([name, value]) => ({name, value: value || 0})) || []} />
                        <IOTextBox onTextChange={setInputText} sentenceAPICallback={simplifyService.callSimplifySentenceSimplify} model="openai" optionManager={optionManager} />
                    </Grid>
                    <Grid size={6}>
                        <Grid container spacing={1} sx={{ marginBottom: 1 }}>
                            <Grid size ={3}>
                                <Scorecard label="Context retention" scores={[]} />
                            </Grid>
                            <Grid size ={3}>
                                <Scorecard label="Legibility" scores={Object.entries(outputScores).map(([name, value]) => ({name, value: value || 0})) || []} />
                            </Grid>
                        </Grid>
                        <IOTextBox onTextChange={setOutputText} setTextFromParent={(setter: (val: string) => void) => {outputSetterRef.current = setter; }} sentenceAPICallback={simplifyService.callSimplifySentenceSuggest} model="openai" optionManager={optionManager} />
                    </Grid>
                </Grid>
            </div>
            <button id="simplifyButton" onClick={handleSimplify}>Simplify</button>
        </div>
    );
}

export default Simplifier;