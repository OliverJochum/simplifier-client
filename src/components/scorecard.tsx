import Paper from "@mui/material/Paper";
import Score from "./score";
import type { ScoreProps } from "./score";
import Stack from "@mui/material/Stack";

type ScorecardProps = {
    label: string;
    scores: Array<ScoreProps>;
}

function Scorecard({ label, scores }: ScorecardProps) {
    return (
        <div>
            <p style={{ textAlign: 'center' }}>{label}</p>
            <Paper variant="outlined" elevation={2} >
                <Stack direction="row" spacing={2} alignItems="center">
                    {scores.map((score, index) => (
                        <Score key={index} name={score.name} value={score.value}  />
                    ))}
                </Stack>
            </Paper> 
        </div>
    );
}

export default Scorecard;