import Simplifier, { SimplifierHandle } from '../components/simplifier';
import OptionVBar from '../components/optionvbar';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import OptionManager from '../services/option_manager';
import SessionBox from '../components/sessionbox';
import SessionManager from '../services/session_manager';
import { useRef } from 'react';



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
            sessionModeEnabled: false,
    });

    const sessionManager = new SessionManager(optionManager.getOwnerId());

    const simplifierRef = useRef<SimplifierHandle>(null);

    const handleCommitSnapshot = () => {
        simplifierRef.current?.commitPreviewChanges();
    };


    return (
        <Box sx={{ flexGrow: 1, padding: 2 }}>
            <Grid container spacing={1}>
                <Grid size={9}>
                    <Simplifier ref={simplifierRef} optionManager={optionManager} sessionManager={sessionManager} />
                </Grid>
                <Grid size={3}>
                    <OptionVBar optionManager={optionManager} />
                    <SessionBox optionManager={optionManager} sessionManager={sessionManager} onClose={() => {optionManager.setShowSessionBox(false); optionManager.setSessionModeEnabled(false)}} onCommit={handleCommitSnapshot}/>
                </Grid>
            </Grid>
        </Box>
    );
}

export default MainView;