import Box from '@mui/material/Box';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { useEffect, useRef, useState } from 'react';
import { TailoringPopper } from './tailoringpopper';
import getCaretCoordinates from 'textarea-caret';
import OptionManager from '../services/option_manager';
import { simplifyService } from '../services/simplify_service';
import { useSentenceSuggestEnabled, useShowDiff, useSynonymModeEnabled } from '../services/option_manager_hooks';
import { SystemIntent } from './simplifier';
import { DiffProps } from '../services/session_service';
import SessionManager from '../services/session_manager';
import { type Range, getSentenceRanges } from '../utils/sentenceRanges';
import { highlightRange } from '../utils/highlightRange';
import { getWordRange } from '../utils/wordRanges';
import { CSSProperties } from '@mui/material';

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
function IOTextBox({ textChangeWithinTextareaCallback, setTextFromParent, sentenceAPICallback, model, optionManager, sessionManager }: IOTextBoxProps) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const lastSourceRef = useRef<SystemIntent | null>(null);
    const isParentUpdateRef = useRef(false);
    const lastNotifiedValueRef = useRef<string | null>(null);

    const [text, setText] = useState("");
    const [diff, setDiff] = useState<DiffProps[] | undefined>(undefined);


    const [sentenceRanges, setSentenceRanges] = useState<Range[]>([]);
    const [selectedSentenceRange, setSelectedSentenceRange] = useState<{ start: number; end: number } | null>(null);
    const [suggestedSentences, setSuggestedSentences] = useState<string[]>([]);

    const [selectedWordRange, setSelectedWordRange] = useState<Range | null>(null);
    const [suggestedSynonyms, setSuggestedSynonyms] = useState<string[]>([]);

    const isSynonymModeEnabled = useSynonymModeEnabled(optionManager!);
    const isSentenceSuggestEnabled = useSentenceSuggestEnabled(optionManager!);
    const showDiff = useShowDiff(sessionManager!);

    const [cursor, setCursor] = useState({
        start: 0,
        end: 0,
    });
    const [anchorEl, setAnchorEl] = useState<VirtualAnchor | null>(null);

    // match scroll positions of textarea and overlay
    const syncScroll = () => {
        if (!textareaRef.current || !overlayRef.current) return;

        overlayRef.current.scrollTop = textareaRef.current.scrollTop;
        overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    };

    const updateCursor = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        setCursor({
            start: textarea.selectionStart,
            end: textarea.selectionEnd,
        });
    }

    useEffect(() => {
        const range = sentenceRanges.find(
            r => cursor.start >= r.start && cursor.start <= r.end
        ) || null;

        setSelectedSentenceRange(range);

        const wordRange = getWordRange(text, cursor.start);
        setSelectedWordRange(wordRange);
    }, [cursor.start, sentenceRanges, text]);

    // on text change, update sentence ranges
    useEffect(() => {
        setSentenceRanges(getSentenceRanges(text));
    }, [text]);

    // if sentence suggestion enabled, call sentence suggestion API
    useEffect(() => {
        if (!isSentenceSuggestEnabled || !sentenceAPICallback || !selectedSentenceRange || model === undefined) {
            return;
        }
        const sentence = text.slice(selectedSentenceRange.start,selectedSentenceRange.end);

        if (!sentence.trim()) return;

        sentenceAPICallback(sentence, model).then(res => {
            setSuggestedSentences(JSON.parse(res.replace(/'/g, '"')));
        }).catch(err => {
            console.error("Error fetching sentence suggestions:", err);
        });
    }, [text,selectedSentenceRange,sentenceAPICallback,model,isSentenceSuggestEnabled,]);

    // if synonym mode enabled, call synonym API
    useEffect( () => {
        async function fetchSynonyms() {
            if (!isSynonymModeEnabled || !selectedWordRange || !selectedSentenceRange || model === undefined) return;
            
            const word = text.slice(selectedWordRange.start,selectedWordRange.end);
            const sentence = text.slice(selectedSentenceRange.start,selectedSentenceRange.end);
            if (!word || !sentence) return;

            try {
                const data: { response: [string, number][] } = await simplifyService.callSimplifySynonyms(word, sentence);
                const parsed = data.response.map(([word, _score]) => word);
                setSuggestedSynonyms(parsed);
            } catch (err) {
            console.error("Error fetching synonyms:", err);
            }   
        }
        fetchSynonyms();
    }, [text,selectedWordRange,selectedSentenceRange,model,isSynonymModeEnabled,]);

    function updateAnchor() {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const caret = textarea.selectionEnd;
        if (caret == null) return;

        const coords = getCaretCoordinates(textarea, caret);

        setAnchorEl({
            getBoundingClientRect: () =>
                new DOMRect(
                    coords.left + textarea.getBoundingClientRect().left + window.scrollX,
                    coords.top +
                        textarea.getBoundingClientRect().top +
                        coords.height +
                        window.scrollY,
                    0,
                    0
                ),
        });
    }

    function replaceSelectedSentence(newSentence: string) {
        if (!selectedSentenceRange) return;

        const { start, end } = selectedSentenceRange;
        const newText =
            text.slice(0, start) +
            newSentence +
            text.slice(end);
        const newCursorPos = start + newSentence.length;

        setText(newText);

        setSelectedSentenceRange(null);
        setSelectedWordRange(null);
        setSuggestedSentences([]);

        requestAnimationFrame(() => {
            textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
        });
    }

    function replaceSelectedWord(newWord: string) {
        if (!selectedWordRange) return;

        const { start, end } = selectedWordRange;

        const newText =
            text.slice(0, start) +
            newWord +
            text.slice(end);

        const newCursorPos = start + newWord.length;

        setText(newText);

        setSelectedWordRange(null);
        setSuggestedSynonyms([]);

        requestAnimationFrame(() => {
            textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
        }); 
    }

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

    // onchange shouldn't fire if value is changed programmatically
    const handleChangeInTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;

        isParentUpdateRef.current = false;
        lastSourceRef.current = "commit";

        setText(val);
        textChangeWithinTextareaCallback?.(val, "commit");
    };

    // when text changes, notify parent via callback
    useEffect(() => {
        if (!textChangeWithinTextareaCallback) return;
        if (!lastSourceRef.current) return;
        if (text === lastNotifiedValueRef.current) return;

        lastNotifiedValueRef.current = text;
        textChangeWithinTextareaCallback(text, lastSourceRef.current);

        isParentUpdateRef.current = false;
    }, [text, textChangeWithinTextareaCallback]);

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
            <Box position="relative" width="400px">
            {/* Highlight layer */}
            <Box
                component="div"
                sx={{
                    ...sharedStyles,
                    width: "calc(100% - 1px)",
                    position: "absolute",
                    overflow: "hidden",
                    top: 0,
                    left: 0,
                    // debugging
                    // color: "rgba(0,0,0,0.2)",
                    // background: "rgba(255,0,0,0.05)",
                    color: "transparent",
                    pointerEvents: "none",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                    wordBreak: "normal",
                    hyphens: "none",
                }}
                dangerouslySetInnerHTML={{
                    __html: highlightRange(text, selectedSentenceRange, "highlight-sentence"),
                }}
            />
            <Box
                component="div"
                sx={{
                    ...sharedStyles,
                    width: "calc(100% - 1px)",
                    position: "absolute",
                    overflow: "hidden",
                    top: 0,
                    left: 0,
                    color: "transparent",
                    pointerEvents: "none",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                    wordBreak: "normal",
                    hyphens: "none",
                }}
                dangerouslySetInnerHTML={{
                    __html: highlightRange(text, selectedWordRange, "highlight-word"),
                }}
            />
            {/* Textarea layer */}
            <TextareaAutosize
            ref={textareaRef}
            minRows={20}
            maxRows={40}
            spellCheck={false}     // 🔑 prevents hidden wrapping changes
            autoCorrect="off"
            autoCapitalize="off"
            style={{
                ...sharedStyles,
                width: "100%",
                overflowY: "scroll",
                resize: "none",
                background: "transparent",
                position: "relative",
                zIndex: 1,
                color: showDiff ? "transparent" : undefined,
                caretColor: showDiff ? "transparent" : undefined,
            }}
            value={text}
            onChange={handleChangeInTextarea}
            onSelect={updateCursor}
            onKeyUp={() => { updateCursor(); updateAnchor(); }}
            onMouseUp={() => { updateCursor(); updateAnchor(); }}
            onScroll={syncScroll}
            />
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
                    background-color: rgba(255, 235, 59, 0.4);
                }
                .highlight-sentence {
                    background-color: rgba(255, 193, 7, 0.4);
                }`}
            </style>
        </Box>
        <TailoringPopper values={suggestedSentences} hidden={suggestedSentences.length === 0} anchorEl={anchorEl} onValueClick={(value: string) => {replaceSelectedSentence(value);}}/>
        <TailoringPopper values={suggestedSynonyms} hidden={suggestedSynonyms.length === 0} anchorEl={anchorEl} onValueClick={(value: string) => {replaceSelectedWord(value);}}/>
    </>
    );
}

export default IOTextBox;