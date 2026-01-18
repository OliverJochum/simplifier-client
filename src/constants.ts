const MATCH_WORD_REGEX = /\b[\p{L}\p{N}']+\b/gu;
const MATCH_SENTENCE_REGEX = /[^.!?]+[.!?]*/g;

export { MATCH_WORD_REGEX, MATCH_SENTENCE_REGEX };