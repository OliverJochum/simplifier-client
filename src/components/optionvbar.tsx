import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import Switch from '@mui/material/Switch';
import { useEffect, useState } from 'react';
import OptionManager from '../services/option_manager';

type OptionVBarProps = {
    optionManager?: OptionManager;
}

/**
 * Options vertical bar component
 * 
 */
function OptionVBar ({ optionManager }: OptionVBarProps) {
    const [sentenceSuggestEnabled, setSentenceSuggestEnabled] =  useState(false);

    useEffect(() => {
        if (optionManager) {
            optionManager.setSentenceSuggestEnabled(sentenceSuggestEnabled);
        }
    }, [optionManager, sentenceSuggestEnabled]);
    return (
        <Box component="section" sx={{ border: '1px solid black', borderRadius: 1, width: 200, bgcolor: 'background.paper', padding: 1 }}>
            <FormGroup>
                <FormLabel component="legend">Analysis</FormLabel>
                <FormControlLabel control={<Switch />} label="Complex words" labelPlacement="start" />
                <FormControlLabel control={<Switch />} label="Complex sentences" labelPlacement="start" />
                <Button variant="outlined">Scores</Button>
            </FormGroup>
            <FormGroup>
                <FormLabel component="legend">Tailoring</FormLabel>
                <FormControlLabel control={<Switch />} label="Auto-Glossary" labelPlacement="start" />
                <FormControlLabel control={<Switch />} label="Synonym Mode" labelPlacement="start" />
                <FormControlLabel control={<Switch checked={sentenceSuggestEnabled} onChange={(e) => setSentenceSuggestEnabled(e.target.checked)} />} label="Sentence suggest" labelPlacement="start" />
            </FormGroup>
            <FormGroup>
                <FormLabel component="legend">Version Control</FormLabel>
                <Button variant="outlined">Glossaries</Button>
                <Button variant="outlined">Sessions</Button>
            </FormGroup>

        </Box>
    );
}

export default OptionVBar;