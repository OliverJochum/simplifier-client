import Box from '@mui/material/Box';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { useEffect, useRef, useState } from 'react';

type IOTextBoxProps = {
    onTextChange?: (value: string) => void;
    setTextFromParent?: (setter: (val: string) => void) => void;
}

const MATCH_WORD_REGEX = /\b[\p{L}\p{N}']+\b/gu;
const MATCH_SENTENCE_REGEX = /[^.!?]+[.!?]*/g;

function IOTextBox({ onTextChange, setTextFromParent }: IOTextBoxProps) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [text, setText] = useState("");
    const [sentences, setSentences] = useState<string[]>([]);
    const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null);
    const [words, setWords] = useState<string[]>([]);
    const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
    const [highlightedWord, setHighlightedWord] = useState("");
    const [highlightedSentence, setHighlightedSentence] = useState("");
    const [cursor, setCursor] = useState({
        start: 0,
        end: 0,
    });

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
        // replace selected word in text with highlighted version
        const selectedWord = text.replace(
            MATCH_WORD_REGEX, // by using this regex, text can be split into words (arr of matches) NOTE: could make this constant
            // then, per match
            (match, _offset, full) => {
                // get index of current word by checking how many words are before it in full text
                // slice returns substring of full text from 0 to _offset (number of chars from beginning to current match)
                // match returns array of words in substring
                // index of current match in full text is length of that array (number of words before current match)
                // ex. for "Hello world", current match "world" at offset 6
                // ex. 0th match -> slice(0, 0) -> [] -> length 0
                // ex. 1st match -> slice(0, 5) -> ["Hello"] -> length 1
                const index = (full
                .slice(0, _offset)
                .match(MATCH_WORD_REGEX)?.length ?? 0); // edge case: if no words are before current match, current match must be index 0
                
                // highlight if index of current word matches selectedWordIndex
                return index === selectedWordIndex
                ? `<span class="highlight-word">${match}</span>`
                : match;
            }
        );
        // inner HTML of overlay is text with highlighted word wrapped in "highlight" span
        setHighlightedWord(selectedWord);
    }, [selectedWordIndex, text, words]);

    // on selected sentence change - same logic as word highlighting, different regex
    useEffect(() => {
        const selectedSentence = text.replace(
            MATCH_SENTENCE_REGEX, 
            (match, _offset, full) => {
                const index = (full
                .slice(0, _offset)
                .match(MATCH_SENTENCE_REGEX)?.length ?? 0); 

                return index === selectedSentenceIndex
                ? `<span class="highlight-sentence">${match}</span>`
                : match;
            }
        );
        setHighlightedSentence(selectedSentence);
    }, [selectedSentenceIndex, sentences, text]);

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
        onKeyUp={updateCursor}
        onMouseUp={updateCursor}
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
    );
}

export default IOTextBox;