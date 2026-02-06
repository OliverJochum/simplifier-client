import { forwardRef, use, useEffect, useImperativeHandle, useRef, useState } from "react";
import { simplifyService } from "../services/simplify_service";
import IOTextBox from "./iotextbox";
import Grid from "@mui/material/Grid";
import OptionManager from "../services/option_manager";
import Scorecard from "./scorecard";
import { analyzeService } from "../services/analyze_service";
import { sessionService } from "../services/session_service";
import { useOwnerId, useSelectedCtxtRetentionScores, useSelectedLegibilityScores, useSelectedSessionId, useSessionModeEnabled, useSnapshotToPopulate } from "../services/option_manager_hooks";
import SessionManager from "../services/session_manager";

type SimplifierProps = {
    optionManager?: OptionManager;
    sessionManager?: SessionManager;
}

export type SimplifierHandle = {
    commitPreviewChanges: () => void;
};

// Commit means a change in textbox that the user has finalized (typing, word/sentence replacement, simplify)
// preview means a change in textbox not yet finalized by user (snapshot preview)
export type SystemIntent = "commit" | "preview";

const Simplifier = forwardRef<SimplifierHandle, SimplifierProps>((props, ref) => {
    const { optionManager, sessionManager } = props;
    // values for whats in the textboxes
    // const [inputText, setInputText] = useState("");
    // const [outputText, setOutputText] = useState("");

    const [textInTextAreas, setTextInTextAreas] = useState({ input: "", output: "" });
    const [textCommittedByUser, setTextCommittedByUser] = useState({ input: "", output: "" });

    const [inputScores, setInputScores] = useState<{ [key: string]: number | 0 }>({});
    const [outputScores, setOutputScores] = useState<{ [key: string]: number | 0 }>({});
    const [ctxtRetentionScores, setCtxtRetentionScores] = useState<{ [key: string]: number | 0 }>({});
    const inputSetterRef = useRef<(val: string, source: SystemIntent) => void>(() => { });
    const outputSetterRef = useRef<(val: string, source: SystemIntent) => void>(() => { });

    const selectedLegibilityScores = useSelectedLegibilityScores(optionManager!);
    const selectedCtxtRetentionScores = useSelectedCtxtRetentionScores(optionManager!);
    const selectedSessionId = useSelectedSessionId(optionManager!);
    const ownerId = useOwnerId(optionManager!);
    const sessionModeEnabled = useSessionModeEnabled(optionManager!);
    const snapshotToPopulate = useSnapshotToPopulate(sessionManager!);

    const updateOutputSetterRef = (val: string, source: SystemIntent) => {
        outputSetterRef.current?.(val, source);
    }

    const updateInputSetterRef = (val: string, source: SystemIntent) => {
        inputSetterRef.current?.(val, source);
    }

    const handleTextInInputAreaChange = (value: string, source: SystemIntent) => {
        setTextInTextAreas(prev => {
            if (prev.input === value) return prev;
            return { ...prev, input: value };
        });

        if (source === "commit") {
            setTextCommittedByUser(prev => {
                if (prev.input === value) return prev;
                return { ...prev, input: value };
            });
        }
    }

    const handleTextInOutputAreaChange = (value: string, source: SystemIntent) => {
        setTextInTextAreas(prev => {
            if (prev.output === value) return prev;
            return { ...prev, output: value };
        });

        if (source === "commit") {
            setTextCommittedByUser(prev => {
                if (prev.output === value) return prev;
                return { ...prev, output: value };
            });
        }
    }
    
    const commitPreviewChanges = () => {
        updateInputSetterRef(textInTextAreas.input, "commit");
        updateOutputSetterRef(textInTextAreas.output, "commit");
        setTextCommittedByUser({ input: textInTextAreas.input, output: textInTextAreas.output });
    }

    useImperativeHandle(ref, () => ({
        commitPreviewChanges,
    }));

    const handleSimplify = () => {
        simplifyService.callSimplifyGenTxt(textInTextAreas.input, "openai").then(res => updateOutputSetterRef(res, "commit")).catch(err => {
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
            const results = await Promise.all(scores.map(score => handleReadabilityScore(score, textInTextAreas.input)));
            const newScores: Record<string, number> = {};
            scores.forEach((score, i) => {
                newScores[score] = results[i];
            });
            setInputScores(newScores);
        };
        fetchInputLegibilityScores();
    }, [textInTextAreas.input, selectedLegibilityScores]);

    useEffect(() => {
        const fetchOutputLegibilityScores = async () => {
            const scores = selectedLegibilityScores;
            const results = await Promise.all(scores.map(score => handleReadabilityScore(score, textInTextAreas.output)));
            const newScores: Record<string, number> = {};
            scores.forEach((score, i) => {
                newScores[score] = results[i];
            });
            setOutputScores(newScores);
        };
        fetchOutputLegibilityScores();
    }, [textInTextAreas.output, selectedLegibilityScores]);

    useEffect(() => {
        const fetchCtxtRetentionScores = async () => {
            const scores = selectedCtxtRetentionScores;
            const results = await Promise.all(scores.map(score => handleCtxtRetentionScore(score, textInTextAreas.output, textInTextAreas.input)));
            const newScores: Record<string, number> = {};
            scores.forEach((score, i) => {
                newScores[score] = results[i];
            });
            setCtxtRetentionScores(newScores);
        }
        fetchCtxtRetentionScores();
    }, [textInTextAreas.input, textInTextAreas.output, selectedCtxtRetentionScores]);

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

    // Create snapshot on input/output text change with debounce, only if !sessionModeEnabled so that loaded snapshots do not create new snapshots
    useEffect(() => {
        if (!ownerId || !selectedSessionId || (!textInTextAreas.input && !textInTextAreas.output) || sessionModeEnabled) return;

        console.log("Creating snapshot from effect", selectedSessionId, ownerId);
        const timeout = setTimeout(() => {
            sessionService.createSnapshot(
            textInTextAreas.input,
            textInTextAreas.output,
            selectedSessionId,
            ownerId
            );
        }, 5000);

        return () => clearTimeout(timeout); // before effect runs again, clear timeout (in case of text change)
    }, [textInTextAreas.input, textInTextAreas.output, selectedSessionId, ownerId, sessionModeEnabled]);

    useEffect(() => {
        if (!sessionModeEnabled || !snapshotToPopulate) return;
        updateInputSetterRef(snapshotToPopulate.input, "preview");
        updateOutputSetterRef(snapshotToPopulate.output, "preview");

        console.log(snapshotToPopulate);
    }, [sessionModeEnabled, snapshotToPopulate]);

    useEffect(() => {
        if (sessionModeEnabled) return;
        const discardPreviewChanges = () => {
            updateInputSetterRef(textCommittedByUser.input, "commit");
            updateOutputSetterRef(textCommittedByUser.output, "commit");
        };
        discardPreviewChanges();
    }, [sessionModeEnabled, textCommittedByUser.input, textCommittedByUser.output]);

    return (
        <div>
            <div>
                <Grid container spacing={1} sx={{ marginBottom: 1 }}>
                    <Grid size={6}>
                        <Scorecard label="Legibility" scores={Object.entries(inputScores).map(([name, value]) => ({ name, value: value || 0 })) || []} />
                        <IOTextBox 
                            textChangeWithinTextareaCallback={handleTextInInputAreaChange} 
                            setTextFromParent={(setter: (val: string, source: SystemIntent) => void) => {inputSetterRef.current = setter; }} 
                            sentenceAPICallback={simplifyService.callSimplifySentenceSimplify} 
                            model="openai" 
                            optionManager={optionManager}  
                        />
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
                        <IOTextBox 
                            textChangeWithinTextareaCallback={handleTextInOutputAreaChange} 
                            setTextFromParent={(setter: (val: string, source: SystemIntent) => void) => { outputSetterRef.current = setter; }} 
                            sentenceAPICallback={simplifyService.callSimplifySentenceSuggest} 
                            model="openai" 
                            optionManager={optionManager} 
                        />
                    </Grid>
                </Grid>
            </div>
            <button id="simplifyButton" onClick={handleSimplify}>Simplify</button>
        </div>
    );
});

export default Simplifier;