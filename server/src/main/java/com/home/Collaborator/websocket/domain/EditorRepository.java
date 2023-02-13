package com.home.Collaborator.websocket.domain;

import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class EditorRepository {

	private Map<String, Editor> editors = new ConcurrentHashMap<>();


	public void add(String entityId, Editor editor) {
		editors.put(entityId, editor);
	}

	public Editor getEditorBy(String entityId) {
		return editors.get(entityId);
	}

	public void removeBy(String nickName) {
		List<String> entityIds = new ArrayList<>();

		for (var editor: editors.values()) {
			editor.getCollaboratorNames().remove(nickName);
			if (editor.getCollaboratorNames().isEmpty()) {
				entityIds.add(editor.getDocumentId());
			}
		}

		for (var toPurge: entityIds) {
			editors.remove(toPurge);
		}
	}

	// public Map<String, Client> getClients() {
	// 	return clients;
	// }

}
