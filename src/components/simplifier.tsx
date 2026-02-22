import { forwardRef, use, useEffect, useImperativeHandle, useRef, useState } from "react";
import { simplifyService } from "../services/simplify_service";
import IOTextBox from "./iotextbox";
import Grid from "@mui/material/Grid";
import OptionManager from "../services/option_manager";
import Scorecard from "./scorecard";
import { analyzeService } from "../services/analyze_service";
import { sessionService, calculateDiff, DiffProps} from "../services/session_service";
import { useOwnerId, useSelectedCtxtRetentionScores, useSelectedLegibilityScores, useSelectedModel, useSelectedSessionId, useSessionModeEnabled, useShowDiff, useSnapshotToPopulate } from "../services/option_manager_hooks";
import SessionManager from "../services/session_manager";
import { Button } from "@mui/material";

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


/**
 * Simplifier groups text boxes with simplify button and scores
 */
const Simplifier = forwardRef<SimplifierHandle, SimplifierProps>((props, ref) => {
    const { optionManager, sessionManager } = props;
    // values for whats in the textboxes
    // const [inputText, setInputText] = useState("");
    // const [outputText, setOutputText] = useState("");

    const [textInTextAreas, setTextInTextAreas] = useState({ input: "", output: "" });
    const [textCommittedByUser, setTextCommittedByUser] = useState({ input: "", output: "" });
    const [currentPreview, setCurrentPreview] = useState({ input: "", output: "" });

    const [inputScores, setInputScores] = useState<{ [key: string]: { value: number; label: string } }>({});
    const [outputScores, setOutputScores] = useState<{ [key: string]: { value: number; label: string } }>({});
    const [ctxtRetentionScores, setCtxtRetentionScores] = useState<{ [key: string]: { value: number; label: string } }>({});
    const inputSetterRef = useRef<(val: string, source: SystemIntent, diff?: DiffProps[]) => void>(() => { });
    const outputSetterRef = useRef<(val: string, source: SystemIntent, diff?: DiffProps[]) => void>(() => { });

    const selectedLegibilityScores = useSelectedLegibilityScores(optionManager!);
    const selectedCtxtRetentionScores = useSelectedCtxtRetentionScores(optionManager!);
    const selectedSessionId = useSelectedSessionId(optionManager!);
    const ownerId = useOwnerId(optionManager!);
    const sessionModeEnabled = useSessionModeEnabled(optionManager!);
    const snapshotToPopulate = useSnapshotToPopulate(sessionManager!);
    const showDiff = useShowDiff(sessionManager!);
    const selectedModel = useSelectedModel(optionManager!);

    const [simplifyLoading, setSimplifyLoading] = useState(false);

    const updateOutputSetterRef = (val: string, source: SystemIntent, diff?: DiffProps[]) => {
        outputSetterRef.current?.(val, source, diff);
    }

    const updateInputSetterRef = (val: string, source: SystemIntent, diff?: DiffProps[]) => {
        inputSetterRef.current?.(val, source, diff);
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
        setSimplifyLoading(true);
        simplifyService.callSimplifyGenTxt(textInTextAreas.input, selectedModel!)
        .then(res => updateOutputSetterRef(res, "commit")).catch(err => {
            console.error("Error simplifying text:", err);
        }).finally(() => {
            setSimplifyLoading(false);
        });
    };

    const handleReadabilityScore = async (scoreType: string, text: string): Promise<{ value: number; label: string }> => {
        if (!text || text.trim() === "") return { value: 0, label: "" };
        try {
            const res = await analyzeService.callGetReadabilityScore(scoreType, text) as Record<number, string>;
            console.log(`Fetched score (${scoreType}):`, res);
            const [score, label] = Object.entries(res)[0] ?? [0, ""];
            return {
                value: Number(score),
                label: label
            };
        } catch (err) {
            console.error(`Error fetching score (${scoreType}):`, err);
            return { value: 0, label: "" }; // fallback if API fails
        }
    };

    const handleCtxtRetentionScore = async (scoreType: string, candidateText: string, referenceText: string): Promise<{ value: number; label: string }> => {
        if (!candidateText || candidateText.trim() === "" || !referenceText || referenceText.trim() === "") return { value: 0, label: "" };
        try {
            const res = await analyzeService.callGetCtxtRetentionScore(scoreType, candidateText, referenceText) as Record<number, string>;
            console.log(`Fetched context retention score (${scoreType}):`, res);
            const [score, label] = Object.entries(res)[0] ?? [0, ""];

            return {
                value: Number(score),
                label: label
            };
        } catch (err) {
            console.error(`Error fetching context retention score (${scoreType}):`, err);
            return { value: 0, label: "" };
        }
    }

    useEffect(() => {
        const fetchInputLegibilityScores = async () => {
            const scores = selectedLegibilityScores;
            const results = await Promise.all(scores.map(score => handleReadabilityScore(score, textInTextAreas.input)));
            const newScores: Record<string, { value: number; label: string }> = {};
            scores.forEach((score, i) => {
                newScores[score] = results[i];
            });
            console.log("Input legibility scores updated:", newScores);
            setInputScores(newScores);
        };
        fetchInputLegibilityScores();
    }, [textInTextAreas.input, selectedLegibilityScores]);

    useEffect(() => {
        const fetchOutputLegibilityScores = async () => {
            const scores = selectedLegibilityScores;
            const results = await Promise.all(scores.map(score => handleReadabilityScore(score, textInTextAreas.output)));
            const newScores: Record<string, { value: number; label: string }> = {};
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
            const results = await Promise.all(scores.map(score => handleCtxtRetentionScore(score, textInTextAreas.output, textInTextAreas.input))) as { value: number; label: string }[];
            const newScores: Record<string, { value: number; label: string }> = {};
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

        setCurrentPreview({ input: snapshotToPopulate.input, output: snapshotToPopulate.output });

        if (showDiff) {
            const inputdiff = calculateDiff(textCommittedByUser.input, snapshotToPopulate.input);
            const outputdiff = calculateDiff(textCommittedByUser.output, snapshotToPopulate.output);
            
            updateInputSetterRef(snapshotToPopulate.input, "preview", inputdiff);
            updateOutputSetterRef(snapshotToPopulate.output, "preview", outputdiff);
        } else {
            updateInputSetterRef(snapshotToPopulate.input, "preview");
            updateOutputSetterRef(snapshotToPopulate.output, "preview");
        }


        console.log(snapshotToPopulate);
    }, [sessionModeEnabled, showDiff, snapshotToPopulate, textCommittedByUser.input, textCommittedByUser.output]);

    useEffect(() => {
        if (sessionModeEnabled) return;
        const discardPreviewChanges = () => {
            updateInputSetterRef(textCommittedByUser.input, "commit");
            updateOutputSetterRef(textCommittedByUser.output, "commit");
        };
        discardPreviewChanges();
        sessionManager!.setShowDiff(false);
    }, [sessionModeEnabled, textCommittedByUser.input, textCommittedByUser.output, sessionManager]);

    return (
        <div>
            <div>
                <Grid container spacing={1} sx={{ marginBottom: 1 }}>
                    <Grid size={6}>
                        <Scorecard label="Legibility" scores={Object.entries(inputScores).map(([name, attrs]: [string, { value: number; label: string }]) => ({ name: name, value: attrs.value || 0, label: attrs.label ?? "" })) || []} />
                        <IOTextBox 
                            textChangeWithinTextareaCallback={handleTextInInputAreaChange} 
                            setTextFromParent={(setter: (val: string, source: SystemIntent, diff?: DiffProps[]) => void) => {inputSetterRef.current = setter; }} 
                            sentenceAPICallback={simplifyService.callSimplifySentenceSimplify} 
                            model={selectedModel!} 
                            optionManager={optionManager}
                            sessionManager={sessionManager}
                        />
                    </Grid>
                    <Grid size={6}>
                        <Grid container spacing={1} sx={{ marginBottom: 1 }}>
                            <Grid size={3}>
                                <Scorecard label="Context retention" scores={Object.entries(ctxtRetentionScores).map(([name, attrs]: [string, { value: number; label: string }]) => ({ name: name, value: attrs.value || 0, label: attrs.label ?? "" })) || []} />
                            </Grid>
                            <Grid size={3}>
                                <Scorecard label="Legibility" scores={Object.entries(outputScores).map(([name, attrs]: [string, { value: number; label: string }]) => ({ name: name, value: attrs.value || 0, label: attrs.label ?? "" })) || []} />
                            </Grid>
                        </Grid>
                        <IOTextBox 
                            textChangeWithinTextareaCallback={handleTextInOutputAreaChange} 
                            setTextFromParent={(setter: (val: string, source: SystemIntent, diff?: DiffProps[]) => void) => { outputSetterRef.current = setter; }} 
                            sentenceAPICallback={simplifyService.callSimplifySentenceSuggest} 
                            model={selectedModel!} 
                            optionManager={optionManager} 
                            sessionManager={sessionManager}
                            loading={simplifyLoading}
                        />
                    </Grid>
                </Grid>
            </div>
            <Button variant="outlined" id="simplifyButton" onClick={handleSimplify}>Simplify</Button>
        </div>
    );
});

export default Simplifier;