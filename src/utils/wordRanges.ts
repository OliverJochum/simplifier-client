import type { Range } from "./sentenceRanges";

export function getWordRange(text: string, cursorPos: number): Range | null {
    if (!text) return null;

    // if cur
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

  return start === end ? null : { start, end };
}