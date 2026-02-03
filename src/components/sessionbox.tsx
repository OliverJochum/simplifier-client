import { Box, IconButton, MenuItem, Paper, Select, SelectChangeEvent } from "@mui/material"
import { useEffect, useState, useSyncExternalStore } from "react";
import CloseIcon from "@mui/icons-material/Close";
import OptionManager from "../services/option_manager";
import { useShowSessionBox } from "../services/option_manager_hooks";

type SessionProps = {
    name: string,
    id: number,
}

type SnapshotProps = {
    datetime: string,
    id: number,
}


type SessionBoxProps = {
    sessions?: SessionProps[];
    optionManager?: OptionManager;
    onClose: () => void;
}

function SessionBox(props: SessionBoxProps) {
    const { sessions, optionManager, onClose } = props;
    
    const showSessionBox = useShowSessionBox(optionManager!);

    const [selectedSession, setSelectedSession] = useState<SessionProps | null>(null);

    const handleChange = (event: SelectChangeEvent<number>) => {
        const session = sessions?.find(
            s => s.id === Number(event.target.value)
        );
        setSelectedSession(session ?? null);
    };


    return (
    <Paper hidden={!showSessionBox} elevation={6} sx={{ padding: 1 }} >
        <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mb: 1,
        }}
      >
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
        <Select
            labelId="sessions-dropdown-label"
            id="sessions-dropdown"
            value={selectedSession?.id ?? ""}
            label="Sessions"
            onChange={handleChange}
            fullWidth
        >
            {sessions?.map(session => (
                <MenuItem key={session.id} value={session.id}>{session.name}</MenuItem>
            ))}
        </Select>
    </Paper>);
}

export default SessionBox;