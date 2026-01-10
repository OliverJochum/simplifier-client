import Simplifier from '../components/simplifier';
import OptionVBar from '../components/optionvbar';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

function MainView() {
    return (
        <Box sx={{ flexGrow: 1, padding: 2 }}>
            <Grid container spacing={1}>
                <Grid size={6}>
                    <Simplifier />
                </Grid>
                <Grid size={6}>
                    <OptionVBar />
                </Grid>
            </Grid>
        </Box>
    );
}

export default MainView;