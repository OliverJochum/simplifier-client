export type ScoreProps = {
    name: string;
    value: number;
    label: string;
}

function Score({ name, value, label }: ScoreProps) {

    return (
        <div style={{ textAlign: 'center' }}>
            {name}
            <p>{value + label}</p>
        </div>
);
}

export default Score;