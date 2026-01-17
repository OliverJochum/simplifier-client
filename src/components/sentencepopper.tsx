import Box from "@mui/material/Box";
import Popper from "@mui/material/Popper";
import type { VirtualAnchor } from "./iotextbox"

type SentenceItemProps = {
    sentence: string;
}

type SentencePopperProps = {
    sentences: string[];
    hidden?: boolean;
    anchorEl?: HTMLElement | VirtualAnchor | null;
}

function SentenceItem({ sentence }: SentenceItemProps) {
    return (
        <Box sx={{ border: 1, padding: 1, margin: 1 }}>
            {sentence}
        </Box>
    );
}

function SentencePopper({ sentences, hidden, anchorEl }: SentencePopperProps) {
    return (
        <Popper open={!!anchorEl && !hidden} anchorEl={anchorEl} placement="bottom-start">
            {sentences.map((text, idx) => (
                <SentenceItem key={idx} sentence={text} />
            ))}
        </Popper>
    );
}

export { SentencePopper, SentenceItem };