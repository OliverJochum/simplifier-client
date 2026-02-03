type OptionManagerProps = {
    sentenceSuggestEnabled?: boolean;
    synonymModeEnabled?: boolean;
    selectedLegibilityScores?: string[];
    selectedCtxtRetentionScores?: string[];
    showSessionBox?: boolean;
};

type Listener = () => void;

class OptionManager {
    private sentenceSuggestEnabled = false;
    private synonymModeEnabled = false;
    private showSessionBox = false;
    private selectedLegibilityScores: string[] = [];
    private selectedCtxtRetentionScores: string[] = [];

    private listeners = new Set<Listener>();

    private notify() {
        this.listeners.forEach(listener => listener());
    }

    subscribe(listener: Listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    constructor({
        sentenceSuggestEnabled,
        synonymModeEnabled,
        selectedLegibilityScores,
        selectedCtxtRetentionScores,
        showSessionBox
    }: OptionManagerProps) {
        if (sentenceSuggestEnabled !== undefined) this.sentenceSuggestEnabled = sentenceSuggestEnabled;

        if (synonymModeEnabled !== undefined) this.synonymModeEnabled = synonymModeEnabled;

        if (showSessionBox !== undefined) this.showSessionBox = showSessionBox;

        if (selectedLegibilityScores) this.selectedLegibilityScores = selectedLegibilityScores;

        if (selectedCtxtRetentionScores) this.selectedCtxtRetentionScores = selectedCtxtRetentionScores;
    }

    setSentenceSuggestEnabled(enabled: boolean) {
        if (this.sentenceSuggestEnabled !== enabled) {
            this.sentenceSuggestEnabled = enabled;
            this.notify();
        }
    }

    isSentenceSuggestEnabled(): boolean {
        return this.sentenceSuggestEnabled;
    }

    setSynonymModeEnabled(enabled: boolean) {
        if (this.synonymModeEnabled !== enabled) {
            this.synonymModeEnabled = enabled;
            this.notify();
        }
    }

    isSynonymModeEnabled(): boolean {
        return this.synonymModeEnabled;
    }

    setSelectedLegibilityScores(scores: string[]) {
        if (!arrayEquals(this.selectedLegibilityScores, scores)) {
            this.selectedLegibilityScores = scores;
            this.notify();
        }
    }

    getSelectedLegibilityScores(): string[] {
        return this.selectedLegibilityScores;
    }

    setSelectedCtxtRetentionScores(scores: string[]) {
        if (!arrayEquals(this.selectedCtxtRetentionScores, scores)) {
            this.selectedCtxtRetentionScores = scores;
            this.notify();
        }
    }

    getSelectedCtxtRetentionScores(): string[] {
        return this.selectedCtxtRetentionScores;
    }

    setShowSessionBox(show: boolean) {
        if (this.showSessionBox !== show) {
            this.showSessionBox = show;
            this.notify();
        }
    }

    isShowSessionBox(): boolean {
        return this.showSessionBox;
    }
}

function arrayEquals(a: string[], b: string[]) {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    return a.every((v, i) => v === b[i]);
}

export default OptionManager;