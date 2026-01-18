import Box from "@mui/material/Box";
import Popper from "@mui/material/Popper";
import type { VirtualAnchor } from "./iotextbox"
import { ListItem, ListItemButton, ListItemText } from "@mui/material";

type SentenceItemProps = {
    sentence: string;
    onClick?: (sentence: string) => void;
}

type SentencePopperProps = {
    sentences: string[];
    hidden?: boolean;
    anchorEl?: HTMLElement | VirtualAnchor | null;
    onSentenceClick?: (sentence: string) => void;
}

function SentenceItem({ sentence, onClick }: SentenceItemProps) {
    return (
        <ListItemButton 
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onClick?.(sentence)}>
            <ListItemText primary={sentence}/>
        </ListItemButton>
    );
}

function SentencePopper({ sentences, hidden, anchorEl, onSentenceClick }: SentencePopperProps) {
    return (
        <Popper open={!!anchorEl && !hidden} anchorEl={anchorEl} placement="bottom-start" sx={{maxWidth: 400, fontSize: 12, backgroundColor: 'background.paper', boxShadow: 3, zIndex: 1300}}>
            <p style={{padding: "10px", fontWeight: "bold"}}>Here are some alternative options:</p>
            {sentences.map((text, idx) => (
                <SentenceItem key={idx} sentence={text} onClick={onSentenceClick} />
            ))}
        </Popper>
    );
}

export { SentencePopper, SentenceItem };