import Box from '@mui/material/Box';
import { useEffect, useRef, useState } from 'react';
import { TailoringPopper } from './tailoringpopper';
import OptionManager from '../services/option_manager';
import { simplifyService } from '../services/simplify_service';
import { useComplexSentencesEnabled, useComplexWordsEnabled, useSentenceSuggestEnabled, useShowDiff, useSynonymModeEnabled } from '../services/option_manager_hooks';
import { SystemIntent } from './simplifier';
import { DiffProps } from '../services/session_service';
import SessionManager from '../services/session_manager';
import { type Range, getSentenceRanges, highlightRanges, getWordRangeFromCursorPos, findRangesFromTargetList, getWordRanges  } from '../utils/range_utils';
import { CircularProgress, CSSProperties } from '@mui/material';
import { setCaretAt } from '../utils/caret_utils';
import { analyzeService } from '../services/analyze_service';
import OverlayBox from './overlaybox';

export type VirtualAnchor = {
    getBoundingClientRect: () => DOMRect;
};

type IOTextBoxProps = {
    textChangeWithinTextareaCallback?: (value: string, source: SystemIntent) => void;
    setTextFromParent?: (setter: (val: string, source: SystemIntent, diff?: DiffProps[]) => void) => void;
    sentenceAPICallback?: (input: string, selected_service: string) => Promise<any>;
    model?: string;
    optionManager?: OptionManager;
    sessionManager?: SessionManager;
    loading?: boolean;
}

/**
 * Input / Output text box component 
 * @param textChangeWithinTextareaCallback Callback when text changes in textbox
 * @param setTextFromParent Function to allow parent to set text
 * @param sentenceAPICallback Callback to fetch sentence suggestions/simplifications
 * @param model AI Model to use for sentence suggestions/simplifications
 * @param optionManager OptionManager to get settings from Option vertical bar
 * @return IOTextBox component
 */
function IOTextBox({ textChangeWithinTextareaCallback, setTextFromParent, sentenceAPICallback, model, optionManager, sessionManager, loading }: IOTextBoxProps) {
    const editableRef = useRef<HTMLDivElement | null>(null);

    const lastSourceRef = useRef<SystemIntent | null>(null);
    const isParentUpdateRef = useRef(false);
    const isProgrammaticUpdateRef = useRef(false);
    const lastNotifiedValueRef = useRef<string | null>(null);

    const [text, setText] = useState("");
    const [diff, setDiff] = useState<DiffProps[] | undefined>(undefined);

    const [isSentencesLoading, setIsSentencesLoading] = useState(false);
    const [isSynonymsLoading, setIsSynonymsLoading] = useState(false);

    const [sentenceRanges, setSentenceRanges] = useState<Range[]>([]);
    const [complexSentences, setComplexSentences] = useState<string[]>([]);
    const [complexSentenceRanges, setComplexSentenceRanges] = useState<Range[]>([]);
    const [selectedSentenceRange, setSelectedSentenceRange] = useState< Range | null>(null);
    const [suggestedSentences, setSuggestedSentences] = useState<string[]>([]);

    const [selectedWordRange, setSelectedWordRange] = useState<Range | null>(null);
    const [suggestedSynonyms, setSuggestedSynonyms] = useState<string[]>([]);
    const [complexWords, setComplexWords] = useState<string[]>([]);
    const [complexWordRanges, setComplexWordRanges] = useState<Range[]>([]);

    const isSynonymModeEnabled = useSynonymModeEnabled(optionManager!);
    const isSentenceSuggestEnabled = useSentenceSuggestEnabled(optionManager!);
    const isComplexSentencesEnabled = useComplexSentencesEnabled(optionManager!);
    const isComplexWordsEnabled = useComplexWordsEnabled(optionManager!);
    const showDiff = useShowDiff(sessionManager!);

    const [sentencePopperOpen, setSentencePopperOpen] = useState(false);
    const [synonymPopperOpen, setSynonymPopperOpen] = useState(false);

    const [cursor, setCursor] = useState({
        start: 0,
        end: 0,
    });

    const [anchorEl, setAnchorEl] = useState<VirtualAnchor | null>(null);
    const virtualAnchorRef = useRef<VirtualAnchor | null>(null);

    // effects 

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.metaKey && e.key === ".") {
                e.preventDefault();
                setSentencePopperOpen(prev => !prev);
            }

            if (e.metaKey && e.key === ",") {
                e.preventDefault();
                setSynonymPopperOpen(prev => !prev);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (!isSentenceSuggestEnabled) {
            setSentencePopperOpen(false);
            setSuggestedSentences([]);
        }
    }, [isSentenceSuggestEnabled]);

    useEffect(() => {
        if (!isSynonymModeEnabled) {
            setSynonymPopperOpen(false);
            setSuggestedSynonyms([]);
        }
    }, [isSynonymModeEnabled]);

    useEffect(() => {
        virtualAnchorRef.current = {
            getBoundingClientRect: () => new DOMRect(),
        };
    }, []);

    // when cursor changes, update selected sentence and word ranges
    useEffect(() => {
        const range = sentenceRanges.find(
            r => cursor.start >= r.start && cursor.start <= r.end
        ) || null;

        setSelectedSentenceRange(range);

        const wordRange = getWordRangeFromCursorPos(text, cursor.start);
        setSelectedWordRange(wordRange);
    }, [cursor.start, sentenceRanges, text]);

    // on text change, update sentence ranges
    useEffect(() => {
        setSentenceRanges(getSentenceRanges(text));
    }, [text]);

    // allow parent to set text 
    useEffect(() => {
        if (!setTextFromParent) return;

        setTextFromParent((val, source, diff) => {
            isParentUpdateRef.current = true;
            lastSourceRef.current = source;
            setText(val);
            setDiff(diff)
        });
    }, [setTextFromParent]);


    // when text changes, notify parent via callback
    useEffect(() => {
        if (!textChangeWithinTextareaCallback) return;
        if (!lastSourceRef.current) return;
        if (text === lastNotifiedValueRef.current) return;

        lastNotifiedValueRef.current = text;
        textChangeWithinTextareaCallback(text, lastSourceRef.current);

        isParentUpdateRef.current = false;
    }, [text, textChangeWithinTextareaCallback]);

    // when text changes, update innerText of editable div
    useEffect(() => {
        const el = editableRef.current; 
        if (!el) return;

        if (el.innerText !== text) {
            isProgrammaticUpdateRef.current = true;
            el.innerHTML = "";
            el.appendChild(document.createTextNode(text)); // to prevent html injection

            requestAnimationFrame(() => {
            isProgrammaticUpdateRef.current = false;
            });
        }
    }, [text]);

    useEffect(() => {
        if (!text) return;
        if (!isComplexWordsEnabled) {
            setComplexWords([]);
            setComplexWordRanges([]);
            return;
        };

        analyzeService.callGetRareWords(text).then((response) => {
            const wordArray = Object.keys(response);
            setComplexWords(wordArray);
        }).catch((err) => {
            console.error("Error fetching complex words:", err);
        });
    }, [isComplexWordsEnabled, text]);

    useEffect(() => {
        if (!complexWords || complexWords.length === 0) return;
        if (!text || text.length === 0) return;

        setComplexWordRanges(findRangesFromTargetList(getWordRanges(text), complexWords));
    }, [complexWords, text]);

    useEffect(() => {
        if (!text) return;
        if (!isComplexSentencesEnabled) {
            setComplexSentences([]);
            setComplexSentenceRanges([]);
            return;
        };

        analyzeService.callGetComplexSentences(text).then((response) => {
            const sentenceArray = Object.keys(response);
            setComplexSentences(sentenceArray);
        }).catch((err) => {
            console.error("Error fetching complex sentences:", err);
        });
    }, [isComplexSentencesEnabled, text]);

    useEffect(() => {
        if (!complexSentences || complexSentences.length === 0) return;
        if (!sentenceRanges || sentenceRanges.length === 0) return;
        console.log(complexSentences)
        setComplexSentenceRanges(findRangesFromTargetList(sentenceRanges, complexSentences));
    }, [complexSentences, sentenceRanges]);

    // api calls
    // if sentence suggestion enabled, call sentence suggestion API
    useEffect(() => {
        if (!sentencePopperOpen || !isSentenceSuggestEnabled || !sentenceAPICallback || !selectedSentenceRange || model === undefined  ) {
            return;
        }
        const sentence = text.slice(selectedSentenceRange.start,selectedSentenceRange.end);

        console.log(isSentenceSuggestEnabled);
        console.log(sentencePopperOpen);

        if (!sentence.trim()) return;

        setIsSentencesLoading(true);

        sentenceAPICallback(sentence, model).then(res => {
            setSuggestedSentences(JSON.parse(res.replace(/'/g, '"')));
        }).catch(err => {
            console.error("Error fetching sentence suggestions:", err);
        }).finally(() => {
            setIsSentencesLoading(false);
        });
    }, [text, selectedSentenceRange, sentenceAPICallback, model, isSentenceSuggestEnabled, cursor.start, sentencePopperOpen]);

    // if synonym mode enabled, call synonym API
    useEffect( () => {
        async function fetchSynonyms() {
            if (!synonymPopperOpen || !isSynonymModeEnabled || !selectedWordRange || !selectedSentenceRange || model === undefined ) return;
            
            const word = text.slice(selectedWordRange.start,selectedWordRange.end);
            const sentence = text.slice(selectedSentenceRange.start,selectedSentenceRange.end);
            if (!word || !sentence) return;

            setIsSynonymsLoading(true);

            try {
                const data: { response: [string, number][] } = await simplifyService.callSimplifySynonyms(word, sentence);
                const parsed = data.response.map(([word, _score]) => word);
                setSuggestedSynonyms(parsed);
            } catch (err) {
            console.error("Error fetching synonyms:", err);
            } finally {
                setIsSynonymsLoading(false);
            }
        }
        fetchSynonyms();
    }, [text, selectedWordRange, selectedSentenceRange, model, isSynonymModeEnabled, cursor.start, synonymPopperOpen]);

    // replacement utils
    function replaceSelectedSentence(newSentence: string) {
        if (!selectedSentenceRange) return;

        const { start, end } = selectedSentenceRange;
        const newText = text.slice(0, start) + newSentence + text.slice(end);
        const newCursorPos = start + newSentence.length;

        setText(newText);

        setSelectedSentenceRange(null);
        setSelectedWordRange(null);
        setSuggestedSentences([]);

        requestAnimationFrame(() => {
            if (editableRef.current) {
                setCaretAt(editableRef.current, newCursorPos);
            }
        });
        setAnchorEl(null);
    }

    function replaceSelectedWord(newWord: string) {
        if (!selectedWordRange) return;

        const { start, end } = selectedWordRange;

        const newText = text.slice(0, start) + newWord + text.slice(end);

        const newCursorPos = start + newWord.length;

        setText(newText);

        setSelectedWordRange(null);
        setSuggestedSynonyms([]);

        requestAnimationFrame(() => {
            if (editableRef.current) {
            setCaretAt(editableRef.current, newCursorPos);
            }
        });
        setAnchorEl(null);
    }

    // div event handlers

    function updateCursor() {
        const sel = window.getSelection();
        const root = editableRef.current;
        if (!sel || !root || sel.rangeCount === 0) return;

        const range = sel.getRangeAt(0);

        const preRange = range.cloneRange();
        preRange.selectNodeContents(root);
        preRange.setEnd(range.startContainer, range.startOffset);

        const start = preRange.toString().length;
        const end = start + range.toString().length;

        setCursor({ start, end });
    }

    // updates anchor position for popper based on caret position
    function updateAnchor() {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        const rect = sel.getRangeAt(0).getBoundingClientRect();
        if (!rect) return;

        if (!virtualAnchorRef.current) return;

        virtualAnchorRef.current.getBoundingClientRect = () =>
            new DOMRect(rect.left, rect.bottom, 0, 0);

        if (anchorEl !== virtualAnchorRef.current) {
            setAnchorEl(virtualAnchorRef.current);
        }
    }

    // handle input in contenteditable div
    function handleEditableInput() {
        if (isProgrammaticUpdateRef.current) return;

        const el = editableRef.current;
        if (!el) return;

        const val = el.innerText.replace(/\u00A0/g, " ");

        isParentUpdateRef.current = false;
        lastSourceRef.current = "commit";

        setText(val);
        textChangeWithinTextareaCallback?.(val, "commit");
    }

    // necessary to normalize text before inserting it to prevent issues such as inserting escaped html
    function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
        e.preventDefault(); 

        const clipboardText = e.clipboardData.getData("text/plain");
        const el = editableRef.current;
        if (!el) return;

        insertTextAtCursor(el, clipboardText);

        const newText = el.innerText;
        setText(newText);
    }

    function insertTextAtCursor(el: HTMLDivElement, text: string) {
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return;

        const range = sel.getRangeAt(0);
        range.deleteContents(); 
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);

        range.setStartAfter(textNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    useEffect(() => {
        if (!isSentenceSuggestEnabled) return;
        if (!selectedSentenceRange) return;

        updateAnchor();
    }, [isSentenceSuggestEnabled, selectedSentenceRange]);

    useEffect(() => {
        console.log("Suggested sentences updated:", suggestedSentences);
    }, [suggestedSentences]);

    const sharedStyles: CSSProperties = {
        padding: "8px",
        lineHeight: "1.5",
        fontFamily: "inherit",
        fontSize: "inherit",
        letterSpacing: "inherit",
        whiteSpace: "pre-wrap",
        boxSizing: "border-box",
        fontKerning: "auto",
        fontVariantLigatures: "normal",
        fontFeatureSettings: "normal",
    };

    return (
        <>
            <Box position="relative" sx={{ width: "100%", maxWidth: 600,border: "1px solid #ccc", borderRadius: 4 }} overflow="hidden">
                <OverlayBox sharedStyles={sharedStyles} dangerouslySetInnerHTML={{__html: highlightRanges(text, complexWordRanges, "underline-sentence")}}/>
                <OverlayBox sharedStyles={sharedStyles} dangerouslySetInnerHTML={{__html: highlightRanges(text, complexSentenceRanges, "underline-sentence")}}/> 
                <OverlayBox sharedStyles={sharedStyles} dangerouslySetInnerHTML={{__html: highlightRanges(text, selectedSentenceRange ? [selectedSentenceRange] : null, "highlight-sentence")}}/>
                <OverlayBox sharedStyles={sharedStyles} dangerouslySetInnerHTML={{__html: highlightRanges(text, selectedWordRange ? [selectedWordRange] : null, "highlight-word"),}}/>
                <Box
                    component="div"
                    ref={editableRef}
                    contentEditable
                    suppressContentEditableWarning
                    spellCheck={false}
                    style={{
                    ...sharedStyles,
                    width: "100%",
                    minHeight: "20lh",
                    // maxHeight: "40lh",
                    resize: "none",
                    background: "transparent",          // no white box
                    position: "relative",
                    zIndex: 2,                          // above overlays
                    outline: "none",
                    // color: "transparent",
                    color: showDiff ? "transparent" : "black",
                    caretColor: showDiff ? "transparent" : "black",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                    wordBreak: "normal",
                    hyphens: "none",
                    }}
                    overflow="hidden"
                    onInput={handleEditableInput}
                    onPaste={handlePaste}
                    onKeyUp={() => { updateCursor(); updateAnchor(); }}
                    onMouseUp={() => { updateCursor(); updateAnchor(); }}
                >
                    {loading ? <CircularProgress size={60}/> : null}
                </Box>
                {showDiff && diff && (
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        whiteSpace: "pre-wrap",
                        overflowWrap: "break-word",
                        fontFamily: sharedStyles.fontFamily,
                        fontSize: sharedStyles.fontSize,
                        lineHeight: sharedStyles.lineHeight,
                        padding: sharedStyles.padding,
                        zIndex: 2,
                    }}
                >
                    {diff.map((part, i) => (
                        <span
                            key={i}
                            style={{
                                backgroundColor: part.added
                                    ? "#d4f8d4"
                                    : part.removed
                                    ? "#f8d4d4"
                                    : "transparent",
                                textDecoration: part.removed
                                    ? "line-through"
                                    : "none",
                            }}
                        >
                            {part.value}
                        </span>
                    ))}
            </Box>
            )}
            <style>{`
                .highlight-word {
                    background-color: rgba(255, 0, 59, 0.4);
                }
                .highlight-sentence {
                    background-color: rgba(255, 193, 7, 0.4);
                }
                .underline-sentence {
                    text-decoration-line: underline;
                    text-decoration-color: red;
                    text-decoration-thickness: 2px;
                    text-underline-offset: 2px;
                }
                `}
            </style>
        </Box>
        <TailoringPopper values={suggestedSentences} hidden={!isSentenceSuggestEnabled || !sentencePopperOpen} anchorEl={anchorEl} onValueClick={(value: string) => {replaceSelectedSentence(value); setSentencePopperOpen(false);}} onClose={() => {setSentencePopperOpen(false); setAnchorEl(null); setSuggestedSentences([]);}} loading={isSentencesLoading}/>
        <TailoringPopper values={suggestedSynonyms} hidden={suggestedSynonyms.length === 0 || !synonymPopperOpen} anchorEl={anchorEl} onValueClick={(value: string) => {replaceSelectedWord(value);}} onClose={() => {setAnchorEl(null); setSuggestedSynonyms([]);}} />
    </>
    );
}

export default IOTextBox;