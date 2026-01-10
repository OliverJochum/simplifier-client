export type ScoreProps = {
    name: string;
    value: number;
}

function Score({ name, value }: ScoreProps) {
    return (
        <div style={{ textAlign: 'center' }}>
            {name}
            <p>{value}</p>
        </div>
);
}

export default Score;