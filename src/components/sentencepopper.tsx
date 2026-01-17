import Box from "@mui/material/Box";
import Popper from "@mui/material/Popper";

type SentenceItemProps = {
    sentence: string;
}

type SentencePopperProps = {
    sentences: string[];
}

function SentenceItem({ sentence }: SentenceItemProps) {
    return (
        <Box sx={{ border: 1, padding: 1, margin: 1 }}>
            {sentence}
        </Box>
    );
}

function SentencePopper({ sentences }: SentencePopperProps) {
    return (
        <Popper open={true}>
            {sentences.map((text, idx) => (
                <SentenceItem key={idx} sentence={text} />
            ))}
        </Popper>
    );
}

export { SentencePopper, SentenceItem };