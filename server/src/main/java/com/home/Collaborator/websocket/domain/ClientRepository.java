package com.home.Collaborator.websocket.domain;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class ClientRepository {

	private Map<String, Client> clients = new ConcurrentHashMap<>();


	public void add(String sessionId, Client event) {
		clients.put(sessionId, event);
	}

	public Client getClientBy(String sessionId) {
		return clients.get(sessionId);
	}

	public void removeBy(String sessionId) {
		clients.remove(sessionId);
	}

	public Map<String, Client> getClients() {
		return clients;
	}

}
