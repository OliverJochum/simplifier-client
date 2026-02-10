export function setCaretAt(root: HTMLElement, charOffset: number) {
    const selection = window.getSelection();
    if (!selection) return;

    let current = 0;
    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        null
    );

    let node: Text | null = null;

    while ((node = walker.nextNode() as Text | null)) {
        const next = current + node.length;
        if (charOffset <= next) {
        const range = document.createRange();
        range.setStart(node, charOffset - current);
        range.collapse(true);

        selection.removeAllRanges();
        selection.addRange(range);
        return;
        }
        current = next;
    }

    // fallback: place caret at end
    const range = document.createRange();
    range.selectNodeContents(root);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
}