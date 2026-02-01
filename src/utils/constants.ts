import Papa from "papaparse";

const MATCH_WORD_REGEX = /\b[\p{L}\p{N}']+\b/gu;
const MATCH_SENTENCE_REGEX = /[^.!?]+[.!?]*/g;
const SCORES = [
    { type: "FRE", name: "Flesch Reading Ease" },
    { type: "WSTF", name: "Wiener Sachtextformel" },
];

const ABBREVIATION_MAP: Map<string, string> = new Map();

fetch("/abbreviations.csv")
    .then((res) => res.text())
    .then((csvText) => {
        Papa.parse<Record<string, string>>(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results: Papa.ParseResult<Record<string, string>>) => {
                results.data.forEach((row: Record<string, string>) => {
                    ABBREVIATION_MAP.set(row["abbr"], row["placeholder"]);
                });
            },
        });
    })
    .catch((err) => console.error("Failed to load CSV:", err));

export { MATCH_WORD_REGEX, MATCH_SENTENCE_REGEX, SCORES, ABBREVIATION_MAP };
