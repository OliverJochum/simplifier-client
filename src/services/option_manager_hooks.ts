import { useSyncExternalStore } from "react";
import OptionManager from "./option_manager";
import SessionManager from "./session_manager";

// Hooks allow subscribing to specific options/states from option- and session manager so that components can reactively update when they change.

function useSentenceSuggestEnabled(optionManager: OptionManager) {
    return useSyncExternalStore(
        optionManager.subscribe.bind(optionManager),
        () => optionManager.isSentenceSuggestEnabled()
    );
}

function useSynonymModeEnabled(optionManager: OptionManager) {
    return useSyncExternalStore(
        optionManager.subscribe.bind(optionManager),
        () => optionManager.isSynonymModeEnabled()
    );
}

function useShowSessionBox(optionManager: OptionManager) {
    return useSyncExternalStore(
        optionManager.subscribe.bind(optionManager),
        () => optionManager.isShowSessionBox()
    );
}

function useSelectedLegibilityScores(optionManager: OptionManager) {
    return useSyncExternalStore(
        optionManager.subscribe.bind(optionManager),
        () => optionManager.getSelectedLegibilityScores()
    );
}

function useSelectedCtxtRetentionScores(optionManager: OptionManager) {
    return useSyncExternalStore(
        optionManager.subscribe.bind(optionManager),
        () => optionManager.getSelectedCtxtRetentionScores()
    );
}

function useSelectedSessionId(optionManager: OptionManager) {
    return useSyncExternalStore(
        optionManager.subscribe.bind(optionManager),
        () => optionManager.getSelectedSessionId()
    );
}

function useOwnerId(optionManager: OptionManager) {
    return useSyncExternalStore(
        optionManager.subscribe.bind(optionManager),
        () => optionManager.getOwnerId()
    );
}

function useSessions(sessionManager: SessionManager) {
    return useSyncExternalStore(
        sessionManager.subscribe.bind(sessionManager),
        () => sessionManager.getSessions()
    );
}

function useSessionModeEnabled(optionManager: OptionManager) {
    return useSyncExternalStore(
        optionManager.subscribe.bind(optionManager),
        () => optionManager.isSessionModeEnabled()
    );
}

function useSnapshotToPopulate(sessionManager: SessionManager) {
    return useSyncExternalStore(
        sessionManager.subscribe.bind(sessionManager),
        () => sessionManager.getSnapshotToPopulate()
    );
}  

function useShowDiff(sessionManager: SessionManager) {
    return useSyncExternalStore(
        sessionManager.subscribe.bind(sessionManager),
        () => sessionManager.isShowDiff()
    );
}

function useComplexSentencesEnabled(optionManager: OptionManager) {
    return useSyncExternalStore(
        optionManager.subscribe.bind(optionManager),
        () => optionManager.isComplexSentencesEnabled()
    );
}

function useComplexWordsEnabled(optionManager: OptionManager) {
    return useSyncExternalStore(
        optionManager.subscribe.bind(optionManager),
        () => optionManager.isComplexWordsEnabled()
    );
}

function useSelectedModel(optionManager: OptionManager) {
    return useSyncExternalStore(
        optionManager.subscribe.bind(optionManager),
        () => optionManager.getSelectedModel()
    );
}

function useShowSettingsBox(optionManager: OptionManager) {
    return useSyncExternalStore(
        optionManager.subscribe.bind(optionManager),
        () => optionManager.isShowSettingsBox()
    );
}

function useAvailableScores(optionManager: OptionManager) {
    return useSyncExternalStore(
        optionManager.subscribe.bind(optionManager),
        () => optionManager.getAvailableScores()
    );
}

function useSelectedScores(optionManager: OptionManager) {
    return useSyncExternalStore(
        optionManager.subscribe.bind(optionManager),
        () => optionManager.getSelectedScores()
    );
}

export { 
    useSentenceSuggestEnabled,
    useSynonymModeEnabled, 
    useShowSessionBox, useSelectedLegibilityScores, 
    useSelectedCtxtRetentionScores, 
    useSelectedSessionId, 
    useOwnerId, useSessions, 
    useSessionModeEnabled, 
    useSnapshotToPopulate,
    useShowDiff,
    useComplexSentencesEnabled,
    useComplexWordsEnabled,
    useSelectedModel,
    useShowSettingsBox,
    useAvailableScores,
    useSelectedScores
};