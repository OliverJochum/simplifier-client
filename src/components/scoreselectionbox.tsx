import { Box, Button, Checkbox, FormControlLabel, FormGroup, Typography } from "@mui/material";
import OptionManager from "../services/option_manager";
import { ScoreType } from "../utils/constants";
import { useOwnerId, useSelectedScores } from "../services/option_manager_hooks";
import { use, useEffect, useState } from "react";
import { userService } from "../services/user_service";

type ScoreSelectionBoxProps = {
    optionManager?: OptionManager;
    availableScores?: Map<string, ScoreType>; 
}


/**
 * 
 * Tab within settings for selecting which scores to use from the available ones (provided by server).
 */
function ScoreSelectionBox(props: ScoreSelectionBoxProps) {
    const { optionManager, availableScores } = props;

    const [locallySelectedScores, setLocallySelectedScores] = useState<Map<string, ScoreType>>(new Map());

    const globallySelectedScores = useSelectedScores(optionManager!);
    const userId = useOwnerId(optionManager!);

    useEffect(() => {
        setLocallySelectedScores(new Map(globallySelectedScores));
    }, [globallySelectedScores]);

    const handleScoreBoxChange = (scoreName: string, checked: boolean) => {
        setLocallySelectedScores(prev => {
            const newMap = new Map(prev);
            if (checked) {
                const scoreType = availableScores!.get(scoreName);
                if (scoreType) {
                    newMap.set(scoreName, scoreType);
                }
            } else {
                newMap.delete(scoreName);
            }
            return newMap;
        });
    };

    const handleScoreSubmit = async () => {
        if (!availableScores) return;

        try {
            const result = await userService.callPutScores(userId!, locallySelectedScores);
            console.log("locallySelectedScores:", locallySelectedScores);
            console.log("Scores submitted successfully:", result);

            optionManager!.initializeAvailableScores();
        } catch (err) {
            console.error("Failed to submit scores:", err);
        }
    };

    return (
        <Box>
            <Typography variant="h6">Select Scores</Typography>
            <FormGroup>
                {availableScores && Array.from(availableScores.entries()).map(([scoreName, scoreType]) => (
                    <FormControlLabel control={<Checkbox checked={locallySelectedScores.has(scoreName)} onChange={(e) => handleScoreBoxChange(scoreName, e.target.checked)} />} label={scoreName} key={scoreName} />
                ))}
            </FormGroup>
            <Button onClick={handleScoreSubmit} variant="contained">Save</Button>
        </Box>
    );
}

export default ScoreSelectionBox;