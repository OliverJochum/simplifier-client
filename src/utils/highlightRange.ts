
/**
 * Highlights a specified range of characters in a given text by wrapping it in a span with the provided CSS class
 * @param text Given text
 * @param range: Range of character indices that should be highlighted.
 * @param className: The CSS class to apply to the highlighted portion of the text.
 * @returns The text, with spans injected for highlighting the specified range, and with HTML special characters escaped 
 */
export function highlightRange(
    text: string,
    range: { start: number; end: number } | null,
    className: string
): string {
    if (!range) return escapeHtml(text);

    const before = escapeHtml(text.slice(0, range.start));
    const middle = escapeHtml(text.slice(range.start, range.end));
    const after = escapeHtml(text.slice(range.end));

    return `${before}<span class="${className}">${middle}</span>${after}`;
}

function escapeHtml(str: string) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}