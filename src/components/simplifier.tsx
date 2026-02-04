import { useEffect, useRef, useState } from "react";
import { simplifyService } from "../services/simplify_service";
import IOTextBox from "./iotextbox";
import Grid from "@mui/material/Grid";
import OptionManager from "../services/option_manager";
import Scorecard from "./scorecard";
import { analyzeService } from "../services/analyze_service";
import { sessionService } from "../services/session_service";
import { useOwnerId, useSelectedCtxtRetentionScores, useSelectedLegibilityScores, useSelectedSessionId } from "../services/option_manager_hooks";

type SimplifierProps = {
    optionManager?: OptionManager;
}

function Simplifier({ optionManager }: SimplifierProps) {
    const [inputText, setInputText] = useState("");
    const [outputText, setOutputText] = useState("");
    const [inputScores, setInputScores] = useState<{ [key: string]: number | 0 }>({});
    const [outputScores, setOutputScores] = useState<{ [key: string]: number | 0 }>({});
    const [ctxtRetentionScores, setCtxtRetentionScores] = useState<{ [key: string]: number | 0 }>({});
    const outputSetterRef = useRef<(val: string) => void>(() => { });

    const selectedLegibilityScores = useSelectedLegibilityScores(optionManager!);
    const selectedCtxtRetentionScores = useSelectedCtxtRetentionScores(optionManager!);
    const selectedSessionId = useSelectedSessionId(optionManager!);
    const ownerId = useOwnerId(optionManager!);

    const updateOutputSetterRef = (val: string) => {
        outputSetterRef.current?.(val);
    }

    const handleSimplify = () => {
        simplifyService.callSimplifyGenTxt(inputText, "openai").then(res => updateOutputSetterRef(res)).catch(err => {
            console.error("Error simplifying text:", err);
        });
    };

    const handleReadabilityScore = async (scoreType: string, text: string): Promise<number> => {
        if (!text || text.trim() === "") return 0;
        try {
            const res = await analyzeService.callGetReadabilityScore(scoreType, text);
            console.log(`Fetched score (${scoreType}):`, res);
            return res;
        } catch (err) {
            console.error(`Error fetching score (${scoreType}):`, err);
            return 0; // fallback if API fails
        }
    };

    const handleCtxtRetentionScore = async (scoreType: string, candidateText: string, referenceText: string): Promise<number> => {
        if (!candidateText || candidateText.trim() === "" || !referenceText || referenceText.trim() === "") return 0;
        try {
            const res = await analyzeService.callGetCtxtRetentionScore(scoreType, candidateText, referenceText);
            console.log(`Fetched context retention score (${scoreType}):`, res);
            return res;
        } catch (err) {
            console.error(`Error fetching context retention score (${scoreType}):`, err);
            return 0;
        }
    }

    useEffect(() => {
        const fetchInputLegibilityScores = async () => {
            const scores = selectedLegibilityScores;
            const results = await Promise.all(scores.map(score => handleReadabilityScore(score, inputText)));
            const newScores: Record<string, number> = {};
            scores.forEach((score, i) => {
                newScores[score] = results[i];
            });
            setInputScores(newScores);
        };
        fetchInputLegibilityScores();
    }, [inputText, selectedLegibilityScores]);

    useEffect(() => {
        const fetchOutputLegibilityScores = async () => {
            const scores = selectedLegibilityScores;
            const results = await Promise.all(scores.map(score => handleReadabilityScore(score, outputText)));
            const newScores: Record<string, number> = {};
            scores.forEach((score, i) => {
                newScores[score] = results[i];
            });
            setOutputScores(newScores);
        };
        fetchOutputLegibilityScores();
    }, [outputText, selectedLegibilityScores]);

    useEffect(() => {
        const fetchCtxtRetentionScores = async () => {
            const scores = selectedCtxtRetentionScores;
            const results = await Promise.all(scores.map(score => handleCtxtRetentionScore(score, outputText, inputText)));
            const newScores: Record<string, number> = {};
            scores.forEach((score, i) => {
                newScores[score] = results[i];
            });
            setCtxtRetentionScores(newScores);
        }
        fetchCtxtRetentionScores();
    }, [inputText, outputText, selectedCtxtRetentionScores]);

    // const onSentenceSelect = (sentence: string | null, sentenceIndex: number | null) => {
    //     if (!sentence) return;
    //     simplifyService.callSimplifySentenceSuggest(sentence, "openai").then(res => {
    //         console.log("Suggestions for sentence:", res);
    //     }).catch(err => {
    //         console.error("Error fetching sentence suggestions:", err);
    //     });
    // };


    // useEffect(() => {
    //     console.log("Create session effect triggered");
    //     if (!ownerId) return;
    //     if (selectedSessionId) return;

    //     console.log("Creating session from effect", ownerId);
    //     sessionService.createSession(ownerId, "Untitled Session")
    //         .then(res => {
    //             optionManager?.setSelectedSessionId(res.id);
    //         });
    // }, [ownerId, selectedSessionId, optionManager]);

    useEffect(() => {
        if (!ownerId || !selectedSessionId || (!inputText && !outputText)) return;

        console.log("Creating snapshot from effect", selectedSessionId, ownerId);
        const timeout = setTimeout(() => {
            sessionService.createSnapshot(
            inputText,
            outputText,
            selectedSessionId,
            ownerId
            );
        }, 5000);

        return () => clearTimeout(timeout); // before effect runs again, clear timeout (in case of text change)
    }, [inputText, outputText, selectedSessionId, ownerId]);

    return (
        <div>
            <div>
                <Grid container spacing={1} sx={{ marginBottom: 1 }}>
                    <Grid size={6}>
                        <Scorecard label="Legibility" scores={Object.entries(inputScores).map(([name, value]) => ({ name, value: value || 0 })) || []} />
                        <IOTextBox onTextChange={setInputText} sentenceAPICallback={simplifyService.callSimplifySentenceSimplify} model="openai" optionManager={optionManager} />
                    </Grid>
                    <Grid size={6}>
                        <Grid container spacing={1} sx={{ marginBottom: 1 }}>
                            <Grid size={3}>
                                <Scorecard label="Context retention" scores={Object.entries(ctxtRetentionScores).map(([name, value]) => ({ name, value: value || 0 })) || []} />
                            </Grid>
                            <Grid size={3}>
                                <Scorecard label="Legibility" scores={Object.entries(outputScores).map(([name, value]) => ({ name, value: value || 0 })) || []} />
                            </Grid>
                        </Grid>
                        <IOTextBox onTextChange={setOutputText} setTextFromParent={(setter: (val: string) => void) => { outputSetterRef.current = setter; }} sentenceAPICallback={simplifyService.callSimplifySentenceSuggest} model="openai" optionManager={optionManager} />
                    </Grid>
                </Grid>
            </div>
            <button id="simplifyButton" onClick={handleSimplify}>Simplify</button>
        </div>
    );
}

export default Simplifier;