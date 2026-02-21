import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs, Typography } from "@mui/material";
import OptionManager from "../services/option_manager";
import { useAvailableScores, useShowSettingsBox } from "../services/option_manager_hooks";
import { useState } from "react";
import ScoreSelectionBox from "./scoreselectionbox";

type SettingsBoxProps = {
    optionManager?: OptionManager;
    onClose?: () => void;
}

function SettingsBox(props: SettingsBoxProps) {
    const { optionManager, onClose } = props;

    const availableScores = useAvailableScores(optionManager!);

    const [tabIndex, setTabIndex] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    const showSettingsBox = useShowSettingsBox(optionManager!);

    const handleClose = () => {
        optionManager!.setShowSettingsBox(false);
        onClose?.();
    };

    return (
        <Dialog open={showSettingsBox} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Settings</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", height: 300 }}>
                    <Tabs
                        orientation="vertical"
                        value={tabIndex}
                        onChange={handleTabChange}
                        sx={{ borderRight: 1, borderColor: "divider", minWidth: 120 }}
                    >
                        <Tab label="Scores" />
                        <Tab label="Models" />
                    </Tabs>

                    <Box sx={{ flexGrow: 1, p: 2 }}>
                        {tabIndex === 0 && (
                            <ScoreSelectionBox optionManager={optionManager} availableScores={availableScores} />
                        )}
                        {tabIndex === 1 && (
                        <Box>
                            <Typography variant="h6">Models Settings</Typography>
                            <Typography>Configure model preferences and versions here.</Typography>
                        </Box>
                        )}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">Close</Button>
            </DialogActions>
        </Dialog>
    );
}

export default SettingsBox;