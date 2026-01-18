type OptionManagerProps = {
    sentenceSuggestEnabled?: boolean;
    synonymModeEnabled?: boolean;
}

class OptionManager {
    sentenceSuggestEnabled?: boolean;
    synonymModeEnabled?: boolean;
    constructor({sentenceSuggestEnabled, synonymModeEnabled}: OptionManagerProps) {
        this.sentenceSuggestEnabled = sentenceSuggestEnabled;
        this.synonymModeEnabled = synonymModeEnabled;
    }

    setSentenceSuggestEnabled(enabled: boolean) {
        this.sentenceSuggestEnabled = enabled;
    }
    
    isSentenceSuggestEnabled(): boolean {
        return !!this.sentenceSuggestEnabled;
    }

    setSynonymModeEnabled(enabled: boolean) {
        this.synonymModeEnabled = enabled;
    }
    
    isSynonymModeEnabled(): boolean {
        return !!this.synonymModeEnabled;
    }
}

export default OptionManager;