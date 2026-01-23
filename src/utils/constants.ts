const MATCH_WORD_REGEX = /\b[\p{L}\p{N}']+\b/gu;
const MATCH_SENTENCE_REGEX = /[^.!?]+[.!?]*/g;
const SCORES = [
    {type: "FRE", name: "Flesch Reading Ease"},
    {type: "WSTF", name: "Wiener Sachtextformel"},
];

export { MATCH_WORD_REGEX, MATCH_SENTENCE_REGEX, SCORES };