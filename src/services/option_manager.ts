type OptionManagerProps = {
    sentenceSuggestEnabled?: boolean;
    synonymModeEnabled?: boolean;
    selectedLegibilityScores?: string[];
    selectedCtxtRetentionScores?: string[];
    showSessionBox?: boolean;
    selectedSessionId?: number;
    ownerId?: number;
};

type Listener = () => void;

class OptionManager {
    private sentenceSuggestEnabled = false;
    private synonymModeEnabled = false;
    private showSessionBox = false;
    private selectedLegibilityScores: string[] = [];
    private selectedCtxtRetentionScores: string[] = [];
    private selectedSessionId: number | undefined;
    private ownerId: number | undefined;

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
        showSessionBox,
        selectedSessionId,
        ownerId
    }: OptionManagerProps) {
        if (sentenceSuggestEnabled !== undefined) this.sentenceSuggestEnabled = sentenceSuggestEnabled;
        if (synonymModeEnabled !== undefined) this.synonymModeEnabled = synonymModeEnabled;
        if (showSessionBox !== undefined) this.showSessionBox = showSessionBox;
        if (selectedLegibilityScores) this.selectedLegibilityScores = selectedLegibilityScores;
        if (selectedCtxtRetentionScores) this.selectedCtxtRetentionScores = selectedCtxtRetentionScores;
        if (selectedSessionId !== undefined) this.selectedSessionId = selectedSessionId;
        if (ownerId !== undefined) this.ownerId = ownerId;
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

    setSelectedSessionId(sessionId: number | undefined) {
        if (this.selectedSessionId !== sessionId) {
            this.selectedSessionId = sessionId;
            this.notify();
        }
    }

    getSelectedSessionId(): number | undefined {
        return this.selectedSessionId;
    }

    setOwnerId(ownerId: number | undefined) {
        if (this.ownerId !== ownerId) {
            this.ownerId = ownerId;
            this.notify();
        }
    }

    getOwnerId(): number | undefined {
        return this.ownerId;
    }
}

function arrayEquals(a: string[], b: string[]) {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    return a.every((v, i) => v === b[i]);
}

export default OptionManager;