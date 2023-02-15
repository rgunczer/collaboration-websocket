package com.home.Collaborator.websocket.snapshot;

import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class SnapshotRepository {

    private Map<String, Snapshot> snapshots = new ConcurrentHashMap<>();


    public void add(String entityId, Snapshot snapshot) {
        snapshots.put(entityId, snapshot);
    }

    public Snapshot getBy(String entityId) {
        return snapshots.get(entityId);
    }

    public void removeBy(String nickName) {
        List<String> entityIds = new ArrayList<>();

        for (var snapshot: snapshots.values()) {
            snapshot.getCollaboratorNames().remove(nickName);
            if (snapshot.getCollaboratorNames().isEmpty()) {
                entityIds.add(snapshot.getEntityId());
            }
        }

        for (var toPurge: entityIds) {
            snapshots.remove(toPurge);
        }
    }

    public void remove(Snapshot snapshot) {
        snapshots.remove(snapshot.getEntityId());
    }

}
