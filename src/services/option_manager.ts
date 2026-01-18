type OptionManagerProps = {
    sentenceSuggestEnabled?: boolean;
}

class OptionManager {
    sentenceSuggestEnabled?: boolean;
    constructor({sentenceSuggestEnabled}: OptionManagerProps) {
        this.sentenceSuggestEnabled = sentenceSuggestEnabled;
    }

    setSentenceSuggestEnabled(enabled: boolean) {
        this.sentenceSuggestEnabled = enabled;
    }
    
    isSentenceSuggestEnabled(): boolean {
        return !!this.sentenceSuggestEnabled;
    }
}

export default OptionManager;