package com.home.Collaborator.websocket.domain;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class CollaboratorRepository {

	private Map<String, Collaborator> clients = new ConcurrentHashMap<>();


	public void add(String sessionId, Collaborator event) {
		clients.put(sessionId, event);
	}

	public Collaborator getClientBy(String sessionId) {
		return clients.get(sessionId);
	}

	public void removeBy(String sessionId) {
		clients.remove(sessionId);
	}

	public Map<String, Collaborator> getClients() {
		return clients;
	}

}
