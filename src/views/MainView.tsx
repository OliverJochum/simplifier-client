import Simplifier from '../components/simplifier';
import OptionVBar from '../components/optionvbar';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Scorecard from '../components/scorecard';
import OptionManager from '../services/option_manager';


function MainView() {
    const optionManager = new OptionManager({ sentenceSuggestEnabled: false, synonymModeEnabled: false });

    return (
        <Box sx={{ flexGrow: 1, padding: 2 }}>
            <Grid container spacing={1} sx={{ marginBottom: 2 }}>
                <Grid size ={3}>
                    <Scorecard label="Legibility" scores={[{name: "FRE", value: 1}, {name: "WSTF", value: 1}]} />
                </Grid>
                <Grid size ={3} />
                <Grid size ={3}>
                    <Scorecard label="Context retention" scores={[]} />
                </Grid>
                <Grid size ={3}>
                    <Scorecard label="Legibility" scores={[]} />
                </Grid>
            </Grid>
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