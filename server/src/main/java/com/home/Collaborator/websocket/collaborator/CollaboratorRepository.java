package com.home.Collaborator.websocket.collaborator;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;


@Service
public class CollaboratorRepository {

    private Map<String, Collaborator> collaborators = new ConcurrentHashMap<>();


    public void add(String sessionId, Collaborator event) {
        collaborators.put(sessionId, event);
    }

    public Collaborator getBy(String sessionId) {
        return collaborators.get(sessionId);
    }

    public void removeBy(String sessionId) {
        collaborators.remove(sessionId);
    }

    public Map<String, Collaborator> getCollaborators() {
        return collaborators;
    }

}
