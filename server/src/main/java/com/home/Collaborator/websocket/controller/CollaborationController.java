package com.home.Collaborator.websocket.controller;

import java.security.Principal;

import java.util.Map;
import java.util.Collection;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Headers;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

import com.home.Collaborator.websocket.domain.FieldAction;
import com.home.Collaborator.websocket.domain.Collaborator;
import com.home.Collaborator.websocket.domain.CollaboratorRepository;
import com.home.Collaborator.websocket.domain.EditorRepository;
import com.home.Collaborator.websocket.domain.Editor;
import com.home.Collaborator.websocket.domain.EditingEntityMessage;
import com.home.Collaborator.websocket.domain.MouseMoveMessage;


@Controller
public class CollaborationController {

    @Autowired
    private CollaboratorRepository clientRepository;

    @Autowired
    private EditorRepository editorRepository;


    @MessageMapping("/editing/{entityId}/mouse-moving")
    @SendTo("/topic/editing/{entityId}/mouse-moving")
    public MouseMoveMessage mouseMove(
        @DestinationVariable("entityId") String entityId,
        @Headers Map<String, Object> headers,
        MouseMoveMessage message,
        Principal principal
    ) throws Exception {
        return message;
    }

	@SubscribeMapping("/clients")
	public Collection<Collaborator> getClients() {
		return clientRepository.getClients().values();
	}

	@SubscribeMapping("/editing/{entityId}/editors")
	public Collection<String> getClientsEditing(
        @DestinationVariable("entityId") String entityId
    ) {
		var editor = editorRepository.getEditorBy(entityId);

        if (editor != null) {
            editor.getCollaboratorNames();
        }
        return Collections.emptyList();
	}

    @MessageMapping("/editing/{entityId}/enter")
    @SendTo("/topic/editing/{entityId}/enter")
    public Editor editingEntity(
        @DestinationVariable("entityId") String entityId,
        EditingEntityMessage message
    ) {
        var editor = editorRepository.getEditorBy(entityId);
        if (editor == null) {
            System.out.println("Nobody is editing this entity");

            editor = new Editor();
            editor.setDocumentId(entityId);
            editor.getCollaboratorNames().add(message.getNick());

            for (var field: message.getFields()) {
                editor.getDocumentFields().put(field.getName(), field);
            }

            editorRepository.add(entityId, editor);
        } else {
            editor.getCollaboratorNames().add(message.getNick());
        }

        return editor;
    }

    @MessageMapping("/editing/{entityId}/field")
    @SendTo("/topic/editing/{entityId}/field")
    public FieldAction editingFieldAcion(
        @DestinationVariable("entityId") String entityId,
        FieldAction message
    ) {
        var editor = editorRepository.getEditorBy(entityId);
        if (editor == null) {
            System.out.println("Editor with entityId [" + entityId + "] NOT found");
            return message;
        }

        var field = editor.getDocumentFields().get(message.getField());
        if (field == null) {
            System.out.println("Field [" + message.getField() + "] NOT found");
            return message;
        }

        switch (message.getType()) {
            case "focus":
                field.setOwner(message.getNick());
                break;

            case "blur":
                field.setOwner(null);
                break;

            case "input":
                field.setValue(message.getValue());
                break;
        }

        return message;
    }

}
