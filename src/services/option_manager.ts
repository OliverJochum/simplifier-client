import { ScoreType } from "../utils/constants";
import { analyzeService } from "./analyze_service";
import { userService } from "./user_service";

type OptionManagerProps = {
    sentenceSuggestEnabled?: boolean;
    synonymModeEnabled?: boolean;
    selectedLegibilityScores?: string[];
    selectedCtxtRetentionScores?: string[];
    showSessionBox?: boolean;
    selectedSessionId?: number;
    ownerId?: number;
    sessionModeEnabled?: boolean;
    complexSentencesEnabled?: boolean;
    complexWordsEnabled?: boolean;
    selectedModel?: string;
    showSettingsBox?: boolean;
};

type Listener = () => void;

/**
 * Responsible for managing options that transcend across components
 */
class OptionManager {
    private sentenceSuggestEnabled = false;
    private synonymModeEnabled = false;
    private showSessionBox = false;
    private selectedLegibilityScores: string[] = [];
    private selectedCtxtRetentionScores: string[] = [];
    private selectedSessionId: number | undefined;
    private ownerId: number | undefined;
    private sessionModeEnabled = false;
    private complexSentencesEnabled = false;
    private complexWordsEnabled = false;
    private selectedModel: string | undefined;
    private selectedScores: Map<string, ScoreType> = new Map();
    private showSettingsBox = false;
    private availableScores: Map<string, ScoreType> = new Map();


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
        ownerId,
        sessionModeEnabled,
        complexSentencesEnabled,
        complexWordsEnabled,
        selectedModel,
        showSettingsBox,
    }: OptionManagerProps) {
        if (sentenceSuggestEnabled !== undefined) this.sentenceSuggestEnabled = sentenceSuggestEnabled;
        if (synonymModeEnabled !== undefined) this.synonymModeEnabled = synonymModeEnabled;
        if (showSessionBox !== undefined) this.showSessionBox = showSessionBox;
        if (selectedLegibilityScores) this.selectedLegibilityScores = selectedLegibilityScores;
        if (selectedCtxtRetentionScores) this.selectedCtxtRetentionScores = selectedCtxtRetentionScores;
        if (showSettingsBox !== undefined) this.showSettingsBox = showSettingsBox;
        if (selectedSessionId !== undefined) this.selectedSessionId = selectedSessionId;
        if (ownerId !== undefined) this.ownerId = ownerId;
        if (sessionModeEnabled !== undefined) this.sessionModeEnabled = sessionModeEnabled;
        if (complexSentencesEnabled !== undefined) this.complexSentencesEnabled = complexSentencesEnabled;
        if (complexWordsEnabled !== undefined) this.complexWordsEnabled = complexWordsEnabled;
        if (selectedModel !== undefined) this.selectedModel = selectedModel;
        this.initializeAvailableScores();
    }

    async initializeAvailableScores() {
        const availableScores = await analyzeService.callGetAvailableScores() as Record<string, ScoreType>;
        const availableScoreMap = new Map(Object.entries(availableScores));

        await userService.callGetUser(this.ownerId!).then(user => {
            this.selectedScores = new Map(Object.entries(user.selectedScores).filter(([score]) => availableScoreMap.has(score)) as [string, ScoreType][]);
        });
        console.log("Available scores initialized:", this.selectedScores);

        this.selectedLegibilityScores = Array.from(this.selectedScores.entries()).filter(([_, type]) => type === "READABILITY").map(([score, _]) => score);
        this.selectedCtxtRetentionScores = Array.from(this.selectedScores.entries()).filter(([_, type]) => type === "CONTEXT_RETENTION").map(([score, _]) => score);
        this.availableScores = availableScoreMap;
        this.notify();
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

    setShowSettingsBox(show: boolean) {
        if (this.showSettingsBox !== show) {
            this.showSettingsBox = show;
            this.notify();
        }
    }

    isShowSettingsBox(): boolean {
        return this.showSettingsBox;
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

    setSessionModeEnabled(enabled: boolean) {
        if (this.sessionModeEnabled !== enabled) {
            this.sessionModeEnabled = enabled;
            this.notify();
        }
    }
    
    isSessionModeEnabled(): boolean {
        return this.sessionModeEnabled;
    }

    setComplexSentencesEnabled(enabled: boolean) {
        if (this.complexSentencesEnabled !== enabled) {
            this.complexSentencesEnabled = enabled;
            this.notify();
        }
    }
    
    isComplexSentencesEnabled(): boolean {
        return this.complexSentencesEnabled;
    }

    setComplexWordsEnabled(enabled: boolean) {
        if (this.complexWordsEnabled !== enabled) {
            this.complexWordsEnabled = enabled;
            this.notify();
        }
    }
    
    isComplexWordsEnabled(): boolean {
        return this.complexWordsEnabled;
    }

    setSelectedModel(model: string | undefined) {
        if (this.selectedModel !== model) {
            this.selectedModel = model;
            this.notify();
        }
    }

    getSelectedModel(): string | undefined {
        return this.selectedModel;
    }

    setAvailableScores(scores: Map<string, ScoreType>) {
        this.availableScores = scores;
        this.notify();
    }

    getAvailableScores(): Map<string, ScoreType> {
        return this.availableScores;
    }

    setSelectedScores(scores: Map<string, ScoreType>) {
        this.selectedScores = scores;
        this.notify();
    }

    getSelectedScores(): Map<string, ScoreType> {
        return this.selectedScores;
    }
}

function arrayEquals(a: string[], b: string[]) {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    return a.every((v, i) => v === b[i]);
}

export default OptionManager;