import Simplifier from '../components/simplifier';
import OptionVBar from '../components/optionvbar';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Scorecard from '../components/scorecard';


function MainView() {
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
                    <Simplifier />
                </Grid>
                <Grid size={3}>
                    <OptionVBar />
                </Grid>
            </Grid>
        </Box>
    );
}

export default MainView;