import { MATCH_SENTENCE_REGEX, MATCH_WORD_REGEX } from "../constants";

export const IOTextBoxUtils = {
        
    // replace selected word in text with highlighted version
        highlightWord: (text: string, selectedWordIndex: number | null) => { 
            if (selectedWordIndex === null) return text;
            return text.replace(
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
        },

        highlightSentence: (text: string, selectedSentenceIndex: number | null) => {
            if (selectedSentenceIndex === null) return text;
            return text.replace(
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
        }

}