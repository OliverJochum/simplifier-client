import Box from '@mui/material/Box';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { use, useEffect, useRef, useState } from 'react';

type IOTextBoxProps = {
}

function IOTextBox({ }: IOTextBoxProps) {

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [text, setText] = useState("");
    const [sentences, setSentences] = useState<string[]>([]);
    const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null);
    const [words, setWords] = useState<string[]>([]);
    const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
    const [wordRect, setWordRect] = useState<Range>();
    const [sentenceRect, setSentenceRect] = useState<Range>();
    const [cursor, setCursor] = useState({
        start: 0,
        end: 0,
    });

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
        console.log("Cursor updated:", cursor);
        // select word by getting index from cursor position
        // Slice text between beginning and where text cursor is, split text into array by spaces, get length of array - 1
        // Since word is last element in sliced array, pos in total text is length - 1
        setSelectedWordIndex(text.slice(0, cursor.start).split(/\s+/).length - 1);

        // select sentence
        // same logic, except split by sentence ending punctuation
        setSelectedSentenceIndex(text.slice(0, cursor.start).split(/[.!?]/g).length - 1);

    }, [cursor.start, cursor.end]);

    // on selected word change
    useEffect(() => {
        if (selectedWordIndex === null || selectedWordIndex < 0 || selectedWordIndex >= words.length) {
            console.log("No word selected");
            return;
        }
        const selectedWord = words[selectedWordIndex];
        console.log("Selected word index:", selectedWordIndex);
        console.log("Selected word:", selectedWord);
    }, [selectedWordIndex]);

    // on selected sentence change
    useEffect(() => {
        if (selectedSentenceIndex === null || selectedSentenceIndex < 0 || selectedSentenceIndex >= sentences.length) {
            console.log("No sentence selected");
            return;
        }
        const selectedSentence = sentences[selectedSentenceIndex];
        console.log("Selected sentence index:", selectedSentenceIndex);
        console.log("Selected sentence:", selectedSentence);
    }, [selectedSentenceIndex]);

    // on text change, update words and sentences
    useEffect(() => {
        setWords(text.match(/\b[\p{L}\p{N}']+\b/gu) || []);
        setSentences(text.replace(/\n+/g, " ").split(/(?<=[.!?])\s+/));
    }, [text]);

    // on words change
    useEffect(() => {
        console.log("Words updated:", words);

    }, [words]);

    // on sentences change
    useEffect(() => {
        console.log("Sentences updated:", sentences);
    }, [sentences]);


    return (
        <TextareaAutosize
            ref={textareaRef} 
            minRows={20} 
            maxRows={40} 
            style={{
                width: "100%",
                boxSizing: "border-box",
                background: "transparent",
                position: "relative",
                zIndex: 1,
                padding: "8px",
                lineHeight: 1.5,
                fontFamily: "inherit",
            }} 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            onSelect={updateCursor}
            onKeyUp={updateCursor}
            onMouseUp={updateCursor}
        />

    );
}

export default IOTextBox;