import Simplifier, { SimplifierHandle } from '../components/simplifier';
import OptionVBar from '../components/optionvbar';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import OptionManager from '../services/option_manager';
import SessionBox from '../components/sessionbox';
import SessionManager from '../services/session_manager';
import { useRef } from 'react';
import { useOwnerId } from '../services/option_manager_hooks';
import SettingsBox from '../components/settingsbox';



function MainView() {
    const optionManager = new OptionManager(
        { 
            sentenceSuggestEnabled: false,
            synonymModeEnabled: false ,
            showSessionBox: false,
            selectedLegibilityScores: [],
            selectedCtxtRetentionScores: [],
            selectedSessionId: undefined,
            ownerId: 1,
            sessionModeEnabled: false,
            selectedModel: "openai"
    });
    const ownerId = useOwnerId(optionManager);

    const sessionManager = new SessionManager(ownerId);

    const simplifierRef = useRef<SimplifierHandle>(null);

    const handleCommitSnapshot = () => {
        simplifierRef.current?.commitPreviewChanges();
    };

    const callSessionsForUser = async (userId: number) => {
        await sessionManager?.initializeForUser(userId);
    }

    const handleSessionBoxClose = async () => {
        optionManager.setShowSessionBox(false);
        optionManager.setSessionModeEnabled(false);
        await callSessionsForUser(ownerId!);
    }


    return (
        <Box sx={{ flexGrow: 1, padding: 2 }}>
            <Grid container spacing={1}>
                <Grid size={9}>
                    <Simplifier ref={simplifierRef} optionManager={optionManager} sessionManager={sessionManager} />
                </Grid>
                <Grid size={3}>
                    <OptionVBar optionManager={optionManager} />
                    <SessionBox optionManager={optionManager} sessionManager={sessionManager} onClose={handleSessionBoxClose} onCommit={handleCommitSnapshot}/>
                </Grid>
                <SettingsBox optionManager={optionManager} />
            </Grid>
        </Box>
    );
}

export default MainView;