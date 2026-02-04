import Simplifier from '../components/simplifier';
import OptionVBar from '../components/optionvbar';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import OptionManager from '../services/option_manager';
import SessionBox from '../components/sessionbox';


function MainView() {
    const optionManager = new OptionManager(
        { 
            sentenceSuggestEnabled: false,
            synonymModeEnabled: false ,
            showSessionBox: false,
            selectedLegibilityScores: ['fre', 'wstf'],
            selectedCtxtRetentionScores: ['bertscore'],
            selectedSessionId: 1,
            ownerId: 1,
    });

    return (
        <Box sx={{ flexGrow: 1, padding: 2 }}>
            <Grid container spacing={1}>
                <Grid size={9}>
                    <Simplifier optionManager={optionManager} />
                </Grid>
                <Grid size={3}>
                    <OptionVBar optionManager={optionManager} />
                    <SessionBox optionManager={optionManager} onClose={() => optionManager.setShowSessionBox(false)}/>
                </Grid>
            </Grid>
        </Box>
    );
}

export default MainView;