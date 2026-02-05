import { sessionService } from "./session_service";

export type SnapshotProps = {
    datetime: string,
    input: string,
    output: string,
}

export type SessionProps = {
    name: string,
    id: number,
    snapshots: SnapshotProps[],
};

type Listener = () => void;

class SessionManager {
    private ownerId: number | undefined;
    private sessions: SessionProps[] | undefined;
    private snapshotToPopulate: SnapshotProps | null = null;

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

    constructor(ownerId?: number) {
        this.ownerId = ownerId;
        this.sessions = undefined;
        this.snapshotToPopulate = null;

        if (this.ownerId !== undefined) {
            this.initializeForUser(this.ownerId);
        }
    }

    async initializeForUser(userId: number) {
        this.ownerId = userId;
        this.sessions = await sessionService.getSessionsForUser(userId);
    }

    setSessions(sessions: SessionProps[] | undefined) {
        if (this.sessions !== sessions) {
            this.sessions = sessions;
            this.notify();
        }
    }

    getSessions(): SessionProps[] | undefined {
        return this.sessions;
    }

    getOwnerId(): number | undefined {
        return this.ownerId;
    }

    setOwnerId(ownerId: number | undefined) {
        if (this.ownerId !== ownerId) {
            this.ownerId = ownerId;
            this.notify();
        }
    }

    setSnapshotToPopulate(snapshot: SnapshotProps | null) {
        if (this.snapshotToPopulate !== snapshot) {
            this.snapshotToPopulate = snapshot;
            this.notify();
        }
    }
    
    getSnapshotToPopulate(): SnapshotProps | null {
        return this.snapshotToPopulate;
    }
}

export default SessionManager;