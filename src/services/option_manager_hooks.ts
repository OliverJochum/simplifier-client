import { useSyncExternalStore } from "react";
import OptionManager from "./option_manager";
import SessionManager from "./session_manager";

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

export { useSentenceSuggestEnabled, useSynonymModeEnabled, useShowSessionBox, useSelectedLegibilityScores, useSelectedCtxtRetentionScores, useSelectedSessionId, useOwnerId, useSessions, useSessionModeEnabled };