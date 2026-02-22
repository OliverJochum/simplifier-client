export type ScoreProps = {
    name: string;
    value: number;
    label: string;
}

/**
 * 
 * Renders a calculated score with name and a provided label (e.g. "difficult" for a certain FRE score)
 */
function Score({ name, value, label }: ScoreProps) {

    return (
        <div style={{ textAlign: 'center' }}>
            {name}
            <p>{value + label}</p>
        </div>
);
}

export default Score;