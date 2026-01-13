import { Box } from "@mui/material";
import { useRef, useState } from "react";

type IOTextBoxProps = {
    text: string;
    onSentenceSelect?: (sentence: string, index: number) => void;
    onWordSelect?: (word: string, index: number) => void;
}


export default function IOTextBox({text, onSentenceSelect, onWordSelect}: IOTextBoxProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const [hovered, setHovered] = useState<number | null>(null);
    const [clicked, setClicked] = useState<number | null>(null);

    const mouseDownPos = useRef<{ x: number; y: number } | null>(null);
    const didDrag = useRef(false);

    const sentences =
        text.match(/[^.!?]+[.!?]*/g)?.map((s) => s.trim()) ?? [];

    const onMouseDown = (e: React.MouseEvent) => {
        mouseDownPos.current = { x: e.clientX, y: e.clientY };
        didDrag.current = false;
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!mouseDownPos.current) return;

        const dx = Math.abs(e.clientX - mouseDownPos.current.x);
        const dy = Math.abs(e.clientY - mouseDownPos.current.y);

        if (dx > 4 || dy > 4) {
        didDrag.current = true;
        }
    };

    const onMouseUp = (index: number) => {
        mouseDownPos.current = null;

        if (didDrag.current) return; // allow native selection only

        setClicked(index);
        onSentenceSelect?.(sentences[index], index);
    };

    return (
        <Box 
            ref={containerRef}
            sx={{
                border: "1px solid",
                borderColor: "grey.300",
                borderRadius: 1,
                padding: 2,
                userSelect: "text",
                cursor: "text",
                whiteSpace: "pre-wrap",
                "::selection": {
                    backgroundColor: "rgba(255, 213, 79, 0.6)",
                },
            }}
    >
        {sentences.map((sentence, index) => (
            <Box
            key={index}
            component="span"
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={() => onMouseUp(index)}
            sx={{
                backgroundColor:
                clicked === index
                    ? "primary.light"
                    : hovered === index
                    ? "grey.200"
                    : "transparent",
                borderRadius: "4px",
                transition: "background-color 0.12s ease-in-out",
                display: "inline"
            }}
            >
                {sentence}{" "}
            </Box>
        ))}
    </Box>
    );
}
