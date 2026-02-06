import { Box, FormControl, IconButton, InputLabel, List, ListItemButton, MenuItem, Paper, Select, SelectChangeEvent } from "@mui/material"
import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import OptionManager from "../services/option_manager";
import { useSessions, useShowSessionBox } from "../services/option_manager_hooks";
import SessionManager, { SessionProps, SnapshotProps } from "../services/session_manager";



type SessionBoxProps = {
    optionManager?: OptionManager;
    sessionManager?: SessionManager;
    onClose: () => void;
}

function SessionBox(props: SessionBoxProps) {
    const { optionManager, sessionManager, onClose } = props;
    
    const sessions = useSessions(sessionManager!);
    const showSessionBox = useShowSessionBox(optionManager!);

    const [selectedSession, setSelectedSession] = useState<SessionProps | null>(null);

    const handleChange = (event: SelectChangeEvent<number>) => {
        const session = sessions?.find(
            s => s.id === Number(event.target.value)
        );
        if (session) {
            setSelectedSession(session);
            optionManager?.setSelectedSessionId(session?.id ?? undefined);
            optionManager?.setSessionModeEnabled(true);
        }
    };

    const handleSnapshotPressed = (snapshot: SnapshotProps) => {
        if (!selectedSession) return;
        sessionManager?.setSnapshotToPopulate(snapshot);
    };

    useEffect(() => {
        if (!optionManager) return;

        const shouldEnableSessionMode = showSessionBox && selectedSession !== null;

        optionManager.setSessionModeEnabled(shouldEnableSessionMode);
    }, [showSessionBox, selectedSession, optionManager]);


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
        <FormControl fullWidth>
            <InputLabel id="sessions-dropdown-label">Sessions</InputLabel>
            <Select
                labelId="sessions-dropdown-label"
                id="sessions-dropdown"
                value={selectedSession?.id || ""}
                label="Sessions"
                onChange={handleChange}
                fullWidth
            >
                {sessions?.map(session => (
                    <MenuItem key={session.id} value={session.id}>{session.name}</MenuItem>
                ))}
            </Select>
        </FormControl>
        {/* snapshots here */}
        <List>
            {selectedSession?.snapshots.map((snapshot, index) => (
                <ListItemButton key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start' }} onClick={() => handleSnapshotPressed(snapshot)}>
                    <Box sx={{ fontSize: "0.8em", color: "#666" }}>{new Date(snapshot.datetime).toLocaleString()}</Box>
                </ListItemButton>
            ))}
        </List>
    </Paper>);
}

export default SessionBox;