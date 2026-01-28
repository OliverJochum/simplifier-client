type OptionManagerProps = {
    sentenceSuggestEnabled?: boolean;
    synonymModeEnabled?: boolean;
    selectedLegibilityScores?: string[];
    selectedCtxtRetentionScores?: string[];
}

class OptionManager {
    sentenceSuggestEnabled?: boolean;
    synonymModeEnabled?: boolean;
    selectedLegibilityScores?: string[];
    selectedCtxtRetentionScores?: string[];
    constructor({sentenceSuggestEnabled, synonymModeEnabled, selectedLegibilityScores, selectedCtxtRetentionScores}: OptionManagerProps) {
        this.sentenceSuggestEnabled = sentenceSuggestEnabled;
        this.synonymModeEnabled = synonymModeEnabled;
        this.selectedLegibilityScores = selectedLegibilityScores || [];
        this.selectedCtxtRetentionScores = selectedCtxtRetentionScores || [];
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
    setSelectedCtxtRetentionScores(scores: string[]) {
        this.selectedCtxtRetentionScores = scores;
    }
    
    getSelectedCtxtRetentionScores(): string[] {
        return this.selectedCtxtRetentionScores || [];
    }
}

export default OptionManager;