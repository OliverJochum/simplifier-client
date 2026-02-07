import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, IconButton, InputLabel, List, ListItemButton, ListItemIcon, MenuItem, Paper, Select, SelectChangeEvent, TextField } from "@mui/material"
import { useEffect, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import OptionManager from "../services/option_manager";
import { useOwnerId, useSessions, useShowSessionBox, useSnapshotToPopulate } from "../services/option_manager_hooks";
import SessionManager, { SessionProps, SnapshotProps } from "../services/session_manager";
import { sessionService } from "../services/session_service";
import AddIcon from "@mui/icons-material/Add";



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
    const ownerId = useOwnerId(optionManager!);

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newSessionName, setNewSessionName] = useState("");

    const [selectedSession, setSelectedSession] = useState<SessionProps | null>(null);

    const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const callSessionsForUser = async (userId: number) => {
        sessionManager?.initializeForUser(userId);
    }

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
        callSessionsForUser(ownerId!);
    };

    const handleCreateNewSession = async (name: string) => {
        await sessionService.createSession(ownerId!, name).catch(err => console.error("Error creating session:", err));
        await callSessionsForUser(ownerId!);
    };

    const handleSubmit = async () => {
        if (!newSessionName.trim()) return;

        await handleCreateNewSession(newSessionName.trim());
        setCreateDialogOpen(false);
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
                <MenuItem 
                onClick={() => {setCreateDialogOpen(true); setNewSessionName("");}} 
                sx={{
                    mb: 0.5,
                    borderRadius: 1,
                    backgroundColor: "action.hover",
                    fontWeight: 600,
                }}>
                    <ListItemIcon>
                        <AddIcon />
                    </ListItemIcon>
                    Create new Session
                </MenuItem>
                <Divider />
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
        <Dialog
            open={createDialogOpen}
            onClose={() => setCreateDialogOpen(false)}
            maxWidth="xs"
            fullWidth
            >
            <DialogTitle>Create new session</DialogTitle>

            <DialogContent>
                <TextField
                autoFocus
                margin="dense"
                label="Session name"
                fullWidth
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && newSessionName.trim()) {
                    handleSubmit();
                    }
                }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setCreateDialogOpen(false)}>
                Cancel
                </Button>

                <Button
                variant="contained"
                disabled={!newSessionName.trim()}
                onClick={handleSubmit}
                >
                Create
                </Button>
            </DialogActions>
        </Dialog>
    </Paper>);
}

export default SessionBox;