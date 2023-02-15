package com.home.Collaborator.websocket.api;

import java.util.Map;
import java.util.ArrayList;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.home.Collaborator.websocket.collaborator.Collaborator;
import com.home.Collaborator.websocket.collaborator.CollaboratorRepository;
import com.home.Collaborator.websocket.snapshot.SnapshotRepository;

import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@RequiredArgsConstructor
@Component
public class SessionListener {

    private final CollaboratorRepository collaboratorRepository;
    private final SnapshotRepository snapshotRepository;
    private final SimpMessagingTemplate messagingTemplate;


    @EventListener
    public void connect(SessionConnectEvent event) {
        log.info("connect");

        SimpMessageHeaderAccessor headers = SimpMessageHeaderAccessor.wrap(event.getMessage());
        String sessionId = headers.getSessionId();
        String nickName = "";
        String color = "#0000ff";

        var nativeHeaders = headers.getMessageHeaders().get("nativeHeaders");
        if (nativeHeaders instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, ArrayList<String>> map = (Map<String, ArrayList<String>>) nativeHeaders;

            nickName = (String)map.get("nick").get(0);
            color = (String)map.get("color").get(0);

            log.info(nickName);
        }

        var client = new Collaborator(nickName, sessionId, color);

        log.info(client.toString());

        messagingTemplate.convertAndSend("/topic/login", client);

        collaboratorRepository.add(sessionId, client);
    }

    @EventListener
    public void disconnect(SessionDisconnectEvent event) {
        log.info("connect");

        var sessionId = event.getSessionId();

        var client = collaboratorRepository.getBy(sessionId);
        if (client != null) {
            log.info("DISCONNECT: " + client);

            messagingTemplate.convertAndSend("/topic/logout", client);

            collaboratorRepository.removeBy(event.getSessionId());
            snapshotRepository.removeBy(client.getNick());
        }
    }

}
