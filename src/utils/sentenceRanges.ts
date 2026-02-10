import * as sbd from "sbd";

export type Range = { start: number; end: number };

/**
 * Util function using sentence boundary detection package to get the start and end character indices of sentences in a given text.
 * @param text 
 * @returns Range[] - An array of objects, containing the start and end character indices of a sentence in the input text.
 */
export function getSentenceRanges(text: string): Range[] {
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
        ranges.push({ start, end });
        cursor = end;
    }

    return ranges;
}