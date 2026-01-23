import Simplifier from '../components/simplifier';
import OptionVBar from '../components/optionvbar';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Scorecard from '../components/scorecard';
import OptionManager from '../services/option_manager';


function MainView() {
    const optionManager = new OptionManager({ sentenceSuggestEnabled: false, synonymModeEnabled: false , selectedLegibilityScores: ['fre', 'wstf']});

    return (
        <Box sx={{ flexGrow: 1, padding: 2 }}>
            <Grid container spacing={1}>
                <Grid size={9}>
                    <Simplifier optionManager={optionManager} />
                </Grid>
                <Grid size={3}>
                    <OptionVBar optionManager={optionManager} />
                </Grid>
            </Grid>
        </Box>
    );
}

export default MainView;