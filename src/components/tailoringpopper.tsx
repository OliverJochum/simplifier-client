import Popper from "@mui/material/Popper";
import type { VirtualAnchor } from "./iotextbox"
import { ClickAwayListener, IconButton, ListItemButton, ListItemText, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

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

function TailoringPopper({ values, hidden, anchorEl, onValueClick, onClose }: TailoringPopperProps) {
    return (
        <ClickAwayListener
            onClickAway={() => {
                onClose?.();
            }}
        >
            <Popper open={!!anchorEl && !hidden} anchorEl={anchorEl} placement="bottom-start" sx={{maxWidth: 400, fontSize: 12, backgroundColor: 'background.paper', boxShadow: 3, zIndex: 1300}}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{padding: "5px 10px", borderBottom: "1px solid #ccc"}}>
                    <p style={{padding: "10px", fontWeight: "bold"}}>Here are some alternative options:</p>
                    <IconButton size="small" onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Stack>
                {values.map((value, idx) => (
                    <TailoringItem key={idx} value={value} onClick={onValueClick} />
                ))}
            </Popper>
        </ClickAwayListener>
    );
}

export { TailoringPopper, TailoringItem };