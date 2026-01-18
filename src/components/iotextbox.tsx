import Box from '@mui/material/Box';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { useEffect, useRef, useState } from 'react';
import { TailoringPopper } from './tailoringpopper';
import getCaretCoordinates from 'textarea-caret';
import { IOTextBoxUtils } from '../utils/iotextbox_utils';
import { MATCH_WORD_REGEX, MATCH_SENTENCE_REGEX } from '../utils/constants';
import OptionManager from '../services/option_manager';
import { simplifyService } from '../services/simplify_service';

export type VirtualAnchor = {
    getBoundingClientRect: () => DOMRect;
};

type IOTextBoxProps = {
    onTextChange?: (value: string) => void;
    setTextFromParent?: (setter: (val: string) => void) => void;
    sentenceAPICallback?: (input: string, selected_service: string) => Promise<any>;
    model?: string;
    optionManager?: OptionManager;
}

/**
 * Input / Output text box component 
 * @param onTextChange Callback when text changes
 * @param setTextFromParent Function to allow parent to set text
 * @param sentenceAPICallback Callback to fetch sentence suggestions/simplifications
 * @param model AI Model to use for sentence suggestions/simplifications
 * @param optionManager OptionManager to get settings from Option vertical bar
 * @return IOTextBox component
 */
function IOTextBox({ onTextChange, setTextFromParent, sentenceAPICallback, model, optionManager }: IOTextBoxProps) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    const [text, setText] = useState("");

    const [sentences, setSentences] = useState<string[]>([]);
    const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null);
    const [highlightedSentence, setHighlightedSentence] = useState("");
    const [suggestedSentences, setSuggestedSentences] = useState<string[]>([]);

    const [words, setWords] = useState<string[]>([]);
    const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
    const [highlightedWord, setHighlightedWord] = useState("");
    const [suggestedSynonyms, setSuggestedSynonyms] = useState<string[]>([]);

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

    // on cursor position change
    useEffect(() => {
        // select word by getting index from cursor position
        // Slice text between beginning and where text cursor is, split text into array by spaces, get length of array - 1
        // Since word is last element in sliced array, pos in total text is length - 1
        setSelectedWordIndex(text.slice(0, cursor.start).split(/\s+/).length - 1);

        // select sentence
        // same logic, except split by sentence ending punctuation
        setSelectedSentenceIndex(text.slice(0, cursor.start).split(/[.!?]/g).length - 1);

    }, [cursor.start, cursor.end, cursor, text]);

    useEffect(() => {
        setHighlightedWord(IOTextBoxUtils.highlightWord(text, selectedWordIndex));
    }, [selectedWordIndex, text, words]);

    // on selected sentence change - same logic as word highlighting, different regex
    useEffect(() => {
        setHighlightedSentence(IOTextBoxUtils.highlightSentence(text, selectedSentenceIndex));
    }, [selectedSentenceIndex, sentences, text]);

    // if sentence suggestion enabled, call sentence suggestion API
    useEffect(() => {
        if (optionManager?.isSentenceSuggestEnabled() && sentenceAPICallback && selectedSentenceIndex !== null && model !== undefined) {
            const sentence = sentences[selectedSentenceIndex];
            if (sentence) {
                sentenceAPICallback(sentence, model).then(res => {
                    setSuggestedSentences(JSON.parse(res.replace(/'/g, '"')));
                }).catch(err => {
                    console.error("Error fetching sentence suggestions:", err);
                });
            }
        }
    }, [sentenceAPICallback, selectedSentenceIndex, sentences, model, optionManager]);

    // if synonym mode enabled, call synonym API
    useEffect(() => {
        if (optionManager?.isSynonymModeEnabled() && selectedWordIndex !== null && model !== undefined) {
            const word = words[selectedWordIndex];
            if (word) {
                simplifyService.callSimplifySynonyms(word, model).then(res => {
                    setSuggestedSynonyms(JSON.parse(res.replace(/'/g, '"')));
                }
                ).catch(err => {
                    console.error("Error fetching synonyms:", err);
                }
                );
            }
        }
    }, [selectedWordIndex, words, model, optionManager]);

    // on text change, update words and sentences, and notify parent
    useEffect(() => {
        setWords(text.match(MATCH_WORD_REGEX) || []);
        setSentences(text.match(MATCH_SENTENCE_REGEX) || []);
        if (onTextChange) {
            onTextChange(text);
        }
    }, [text, onTextChange]);

    // allow parent to set text (output box user case)
    useEffect(() => {
        if (setTextFromParent) {
        setTextFromParent(setText);
        }
    }, [setTextFromParent]);

    // debugging crap
    // useEffect(() => {
    //     console.log("Words updated:", words);
    //     console.log("Sentences updated:", sentences);
    //     console.log("Selected word:", words[selectedWordIndex ?? -1]);
    //     console.log("Selected sentence:", sentences[selectedSentenceIndex ?? -1]);
    // }, [selectedSentenceIndex, selectedWordIndex, sentences, words]);

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
        if (selectedSentenceIndex === null) return;

        sentences[selectedSentenceIndex] = newSentence;
        const newText = sentences.join(" ");
        setText(newText);

        setSelectedWordIndex(text.slice(0, cursor.start).split(/\s+/).length - 1);
        setSelectedSentenceIndex(text.slice(0, cursor.start).split(/[.!?]/g).length - 1);
        IOTextBoxUtils.highlightWord(newText, selectedWordIndex);
        IOTextBoxUtils.highlightSentence(newText, selectedSentenceIndex);
    }

    function replaceSelectedWord(newWord: string) {
        if (selectedWordIndex === null) return;
        
        words[selectedWordIndex] = newWord;
        const newText = words.join(" ");
        setText(newText);

        setSelectedWordIndex(text.slice(0, cursor.start).split(/\s+/).length - 1);
        IOTextBoxUtils.highlightWord(newText, selectedWordIndex);
    }

    const sharedStyles = {
        width: "100%",
        padding: "8px",
        lineHeight: 1.5,
        fontFamily: "inherit",
        fontSize: "inherit",
        letterSpacing: "inherit",
        whiteSpace: "pre-wrap",
    };


    return (
        <>
            <Box position="relative" width="400px">
            {/* Highlight layer */}
            <Box
                component="div"
                sx={{
                    ...sharedStyles,
                    // debugging
                    // color: "rgba(0,0,0,0.2)",
                    // background: "rgba(255,0,0,0.05)",
                    overflowWrap: "break-word",
                    boxSizing: "border-box",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    color: "transparent",
                    pointerEvents: "none",
                }}
                dangerouslySetInnerHTML={{ __html: highlightedSentence }}
            />
            <Box
                component="div"
                sx={{
                    ...sharedStyles,
                    // debugging
                    // color: "rgba(0,0,0,0.2)",
                    // background: "rgba(255,0,0,0.05)",
                    overflowWrap: "break-word",
                    boxSizing: "border-box",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    color: "transparent",
                    pointerEvents: "none",
                }}
                dangerouslySetInnerHTML={{ __html: highlightedWord }}
            />
            {/* Textarea layer */}
            <TextareaAutosize
            ref={textareaRef}
            minRows={20}
            maxRows={40}
            style={{
                ...sharedStyles,
                boxSizing: "border-box",
                overflowWrap: "break-word",
                background: "transparent",
                position: "relative",
                zIndex: 1,
            }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onSelect={updateCursor}
            onKeyUp={() => { updateCursor(); updateAnchor(); }}
            onMouseUp={() => { updateCursor(); updateAnchor(); }}
            onScroll={syncScroll}
            />
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