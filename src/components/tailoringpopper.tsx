import Popper from "@mui/material/Popper";
import type { VirtualAnchor } from "./iotextbox"
import { ListItemButton, ListItemText } from "@mui/material";

type TailoringItemProps = {
    value: string;
    onClick?: (value: string) => void;
}

type TailoringPopperProps = {
    values: string[];
    hidden?: boolean;
    anchorEl?: HTMLElement | VirtualAnchor | null;
    onValueClick?: (value: string) => void;
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

function TailoringPopper({ values, hidden, anchorEl, onValueClick }: TailoringPopperProps) {
    return (
        <Popper open={!!anchorEl && !hidden} anchorEl={anchorEl} placement="bottom-start" sx={{maxWidth: 400, fontSize: 12, backgroundColor: 'background.paper', boxShadow: 3, zIndex: 1300}}>
            <p style={{padding: "10px", fontWeight: "bold"}}>Here are some alternative options:</p>
            {values.map((value, idx) => (
                <TailoringItem key={idx} value={value} onClick={onValueClick} />
            ))}
        </Popper>
    );
}

export { TailoringPopper, TailoringItem };