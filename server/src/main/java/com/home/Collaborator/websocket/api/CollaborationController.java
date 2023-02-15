package com.home.Collaborator.websocket.api;

import java.security.Principal;

import java.util.Map;
import java.util.Collection;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Headers;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.home.Collaborator.websocket.collaborator.Collaborator;
import com.home.Collaborator.websocket.collaborator.CollaboratorRepository;
import com.home.Collaborator.websocket.event.JoinSnapshotEvent;
import com.home.Collaborator.websocket.event.LeaveSnapshotEvent;
import com.home.Collaborator.websocket.event.FieldEvent;
import com.home.Collaborator.websocket.event.MouseMoveEvent;
import com.home.Collaborator.websocket.snapshot.Snapshot;
import com.home.Collaborator.websocket.snapshot.SnapshotRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@RequiredArgsConstructor
@Controller
public class CollaborationController {

    private final ObjectMapper objectMapper;
    private final CollaboratorRepository collaboratorRepository;
    private final SnapshotRepository snapshotRepository;
    private final SimpMessagingTemplate messagingTemplate;


    @SubscribeMapping("/collaborators")
    public Collection<Collaborator> getCollaborators() {
        return collaboratorRepository.getCollaborators().values();
    }

    @SubscribeMapping("/begin/{entityId}")
    public Snapshot getSnapshot(
        @DestinationVariable("entityId") String entityId,
        SimpMessageHeaderAccessor accessor
    ) throws Exception {
        var jsonStr = accessor.getFirstNativeHeader("snapshot");
        var joinEvent = objectMapper.readValue(jsonStr, JoinSnapshotEvent.class);

        var snapshot = snapshotRepository.getBy(entityId);
        if (snapshot == null) {
            log.info("Nobody is editing this entity - adding you as the only collaborator and creating snapshot with received values");

            snapshot = new Snapshot();
            snapshot.getCollaboratorNames().add(joinEvent.getNick());
            snapshot.setEntityId(entityId);
            snapshot.addFields(joinEvent.getFields());

            snapshotRepository.add(entityId, snapshot);
        } else {
            log.info("Entity is already under editing - adding you to list of collaborators and ignoring your values");

            var nick = joinEvent.getNick();
            snapshot.getCollaboratorNames().add(nick);

            messagingTemplate.convertAndSend("/topic/" + entityId + "/joiner", nick);
        }

        return snapshot;
    }

    @MessageMapping("/editing/{entityId}/mouse-moving")
    @SendTo("/topic/editing/{entityId}/mouse-moving")
    public MouseMoveEvent mouseMove(
        @DestinationVariable("entityId") String entityId,
        @Headers Map<String, Object> headers,
        MouseMoveEvent message,
        Principal principal
    ) throws Exception {
        return message;
    }

    @MessageMapping("/editing/{entityId}/leave")
    @SendTo("/topic/editing/{entityId}/leave")
    public LeaveSnapshotEvent editingLeaveAction(
        @DestinationVariable("entityId") String entityId,
        LeaveSnapshotEvent message
    ) {
        var snapshot = snapshotRepository.getBy(entityId);
        if (snapshot != null) {
            var nick = message.getNick();
            snapshot.getCollaboratorNames().remove(nick);

            if (snapshot.getCollaboratorNames().isEmpty()) { // no more collaborators -> purge
                snapshotRepository.remove(snapshot);
            }
        }

        return message;
    }

    @MessageMapping("/editing/{entityId}/field")
    @SendTo("/topic/editing/{entityId}/field")
    public FieldEvent editingFieldAcion(
        @DestinationVariable("entityId") String entityId,
        FieldEvent message
    ) {
        var snapshot = snapshotRepository.getBy(entityId);
        if (snapshot == null) {
            log.info("Editor with entityId [" + entityId + "] NOT found");
            return message;
        }

        var field = snapshot.getFields().get(message.getField());
        if (field == null) {
            log.info("Field [" + message.getField() + "] NOT found");
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
