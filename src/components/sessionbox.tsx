import { Box, Button, FormControl, IconButton, InputLabel, List, ListItemButton, MenuItem, Paper, Select, SelectChangeEvent } from "@mui/material"
import { useEffect, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import OptionManager from "../services/option_manager";
import { useSessions, useShowSessionBox, useSnapshotToPopulate } from "../services/option_manager_hooks";
import SessionManager, { SessionProps, SnapshotProps } from "../services/session_manager";



type SessionBoxProps = {
    optionManager?: OptionManager;
    sessionManager?: SessionManager;
    onClose: () => void;
    onCommit: () => void;
}

function SessionBox(props: SessionBoxProps) {
    const { optionManager, sessionManager, onClose, onCommit } = props;
    
    const sessions = useSessions(sessionManager!);
    const showSessionBox = useShowSessionBox(optionManager!);
    const snapshotToPopulate = useSnapshotToPopulate(sessionManager!);

    const [selectedSession, setSelectedSession] = useState<SessionProps | null>(null);

    const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const handleChange = (event: SelectChangeEvent<number>) => {
        const session = sessions?.find(
            s => s.id === Number(event.target.value)
        );
        if (session) {
            setSelectedSession(session);
            optionManager?.setSelectedSessionId(session?.id ?? undefined);
            optionManager?.setSessionModeEnabled(true);
            sessionManager?.setSnapshotToPopulate(null);
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

    useEffect(() => {
    if (!snapshotToPopulate) return;
        itemRefs.current[snapshotToPopulate.datetime]?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
        });
    }, [snapshotToPopulate]);

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
        <Button variant="contained" size="small" onClick={onCommit} disabled={!selectedSession}>Restore snapshot</Button>
        <List>
            {selectedSession?.snapshots.map((snapshot, index) => {
                const isActive = snapshotToPopulate?.datetime === snapshot.datetime;
                return (
                    <ListItemButton
                        key={index}
                        selected={isActive}
                        ref={(el) => {itemRefs.current[snapshot.datetime] = el;}}
                        onClick={() => handleSnapshotPressed(snapshot)}
                        sx={{
                            flexDirection: "column",
                            alignItems: "flex-start",
                            "&:hover": {
                                backgroundColor: "action.hover",
                            },
                            "&.Mui-selected": {
                                backgroundColor: "action.selected",
                            },
                            "&.Mui-selected:hover": {
                                backgroundColor: "action.selected",
                            },
                        }}
                    >
                        <Box sx={{ fontSize: "0.8em", color: "#666" }}>
                            {new Date(snapshot.datetime).toLocaleString()}
                        </Box>
                    </ListItemButton>
                );
            })}
        </List>
    </Paper>);
}

export default SessionBox;