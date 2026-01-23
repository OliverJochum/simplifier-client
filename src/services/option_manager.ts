type OptionManagerProps = {
    sentenceSuggestEnabled?: boolean;
    synonymModeEnabled?: boolean;
    selectedLegibilityScores?: string[];
}

class OptionManager {
    sentenceSuggestEnabled?: boolean;
    synonymModeEnabled?: boolean;
    selectedLegibilityScores?: string[];
    constructor({sentenceSuggestEnabled, synonymModeEnabled, selectedLegibilityScores}: OptionManagerProps) {
        this.sentenceSuggestEnabled = sentenceSuggestEnabled;
        this.synonymModeEnabled = synonymModeEnabled;
        this.selectedLegibilityScores = selectedLegibilityScores || [];
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
    setSelectedLegibilityScores(scores: string[]) {
        this.selectedLegibilityScores = scores;
    }
    
    getSelectedLegibilityScores(): string[] {
        return this.selectedLegibilityScores || [];
    }
}

export default OptionManager;