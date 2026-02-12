import * as sbd from "sbd";

type Range = { text: string; start: number; end: number };


/**
 * Util function using sentence boundary detection package to get the start and end character indices of all sentences in a given text.
 * @param text 
 * @returns Range[] - An array of objects, containing the start and end character indices of a sentence in the input text.
 */
function getSentenceRanges(text: string): Range[] {
    const sentences = sbd.sentences(text, {
        newline_boundaries: true,
        sanitize: false,
    });

    const ranges: Range[] = [];
    let cursor = 0;

    for (const sentence of sentences) {
        const start = text.indexOf(sentence, cursor);
        if (start === -1) continue;

        const end = start + sentence.length;
        ranges.push({ text: sentence, start, end });
        cursor = end;
    }

    return ranges;
}

/**
 * Util function to get the start and end character indices of the word at a given cursor position in a text.
 * @param text 
 * @param cursorPos 
 * @returns Range of word at cursor position
 */
function getWordRangeFromCursorPos(text: string, cursorPos: number): Range | null {
    if (!text) return null;

    if (cursorPos > 0 && /\s/.test(text[cursorPos])) {
        cursorPos--;
    }

    const isWordChar = (ch: string) =>
        /\p{L}|\p{N}/u.test(ch); 

    let start = cursorPos;
    let end = cursorPos;

    while (start > 0 && isWordChar(text[start - 1])) {
        start--;
    }

    while (end < text.length && isWordChar(text[end])) {
        end++;
    }

    const word = text.slice(start, end);

    return start === end ? null : { text: word, start, end };
}

/**
 * Highlights a specified range of characters in a given text by wrapping it in a span with the provided CSS class
 * @param text Given text
 * @param ranges: Range array of character indices that should be highlighted.
 * @param className: The CSS class to apply to the highlighted portion of the text.
 * @returns The text, with spans injected for highlighting the specified range, and with HTML special characters escaped 
 */
function highlightRanges(text: string,ranges: Range[] | null,className: string): string {
    if (!ranges || ranges.length === 0) {
        return escapeHtml(text);
    }

    const sorted = [...ranges].sort((a, b) => a.start - b.start);

    let result = "";
    let lastIndex = 0;

    for (const range of sorted) {
        result += escapeHtml(text.slice(lastIndex, range.start));

        result += `<span class="${className}">` +
        escapeHtml(text.slice(range.start, range.end)) +
        `</span>`;

        lastIndex = range.end;
    }

    result += escapeHtml(text.slice(lastIndex));

    return result;
}


function escapeHtml(str: string) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

/**
 * Finds the ranges of sentences from a list of sentences within a given set of sentence ranges.
 * @param sentenceRanges all ranges of a text
 * @param sentenceList List of sentences for which to get the ranges
 * @returns 
 */
function findSentenceRangesFromSentenceList(
    sentenceRanges: Range[],
    sentenceList: string[]
) {
    const selectedRanges = new Set(sentenceList.map(s => s.trim()));

    return sentenceRanges.filter(range =>
        selectedRanges.has(range.text.trim())
    );
}



export { type Range, getSentenceRanges, getWordRangeFromCursorPos, highlightRanges, findSentenceRangesFromSentenceList };