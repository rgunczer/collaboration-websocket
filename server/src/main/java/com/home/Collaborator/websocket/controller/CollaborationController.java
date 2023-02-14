package com.home.Collaborator.websocket.controller;

import java.security.Principal;

import java.util.Map;
import java.util.Collection;
import java.util.Collections;

import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Headers;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

import com.home.Collaborator.websocket.domain.FieldAction;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.home.Collaborator.websocket.domain.Collaborator;
import com.home.Collaborator.websocket.domain.CollaboratorRepository;
import com.home.Collaborator.websocket.domain.EditorRepository;
import com.home.Collaborator.websocket.domain.Editor;
import com.home.Collaborator.websocket.domain.EditingEntityMessage;
import com.home.Collaborator.websocket.domain.MouseMoveMessage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@RequiredArgsConstructor
@Controller
public class CollaborationController {

    private final ObjectMapper objectMapper;
    private final CollaboratorRepository clientRepository;
    private final EditorRepository editorRepository;


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

    @SubscribeMapping("/begin/{entityId}")
    public Editor getEditorWithStatusAndCollaborators(
        @DestinationVariable("entityId") String entityId,
        SimpMessageHeaderAccessor accessor
    ) throws Exception {
        var jsonStr = accessor.getFirstNativeHeader("snapshot");
        var snapshot = objectMapper.readValue(jsonStr, EditingEntityMessage.class);

        var editor = editorRepository.getEditorBy(entityId);
        if (editor == null) {
            // based on snapshot create the editor
            log.info("Nobody is editing this entity - adding you as the only collaborator");
            editor = new Editor();
            editor.getCollaboratorNames().add(snapshot.getNick()); //

            editor.setDocumentId(entityId);

            for (var field: snapshot.getFields()) {
                editor.getDocumentFields().put(field.getName(), field);
            }

            editorRepository.add(entityId, editor);
        } else {
            // ignore received snapshot as entity is already under editing
            log.info("Entity is already under editing - adding you to list of collaborators");
            editor.getCollaboratorNames().add(snapshot.getNick());
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
