import Popper from "@mui/material/Popper";
import type { VirtualAnchor } from "./iotextbox"
import { IconButton, ListItemButton, ListItemText, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from '@mui/material/CircularProgress'
import { useEffect } from "react";

type TailoringItemProps = {
    value: string;
    onClick?: (value: string) => void;
}

type TailoringPopperProps = {
    values: string[];
    hidden?: boolean;
    anchorEl?: HTMLElement | VirtualAnchor | null;
    onValueClick?: (value: string) => void;
    onClose?: () => void;
    loading?: boolean;
}

function TailoringItem({ value, onClick }: TailoringItemProps) {
    return (
        <ListItemButton 
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onClick?.(value)}>
            <ListItemText primary={value}/>
        </ListItemButton>
    );
}

/**
 * 
 * Popper for tailoring interactions, such as sentence suggestions or synonym suggestions. Anchors to the text that is being tailored.
 */

function TailoringPopper({ values, hidden, anchorEl, onValueClick, onClose, loading }: TailoringPopperProps) {
    return (
            <Popper open={!!anchorEl && !hidden} anchorEl={anchorEl} placement="bottom-start" sx={{maxWidth: 400, fontSize: 12, backgroundColor: 'background.paper', boxShadow: 3, zIndex: 1300}}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{padding: "5px 10px", borderBottom: "1px solid #ccc"}}>
                    <p style={{padding: "10px", fontWeight: "bold"}}>Here are some alternative options:</p>
                    <IconButton size="small" onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Stack>
                {loading ? <CircularProgress size={60} /> : values.map((value, idx) => (
                    <TailoringItem key={idx} value={value} onClick={onValueClick} />
                ))}
            </Popper>
    );
}

export { TailoringPopper, TailoringItem };