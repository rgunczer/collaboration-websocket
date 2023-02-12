package com.home.Collaborator.websocket.config;

import java.util.Map;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.home.Collaborator.websocket.domain.Client;
import com.home.Collaborator.websocket.domain.ClientRepository;

import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.Message;


@Component
public class WebSocketSessionListener {

    @Autowired
    public ClientRepository clientRepository;

    @Autowired
    public SimpMessagingTemplate messagingTemplate;


    @EventListener
    public void handleSessionConnected(SessionConnectEvent event) {
        SimpMessageHeaderAccessor headers = SimpMessageHeaderAccessor.wrap(event.getMessage());
        // String username = headers.getUser().getName();
        // MessageHeaders headers = message.getHeaders();
        String sessionId = headers.getSessionId();
        String username = getUsername(event.getMessage());
        String nickName = "";
        String color = "#0000ff";

        var nativeHeaders = headers.getMessageHeaders().get("nativeHeaders");
        if (nativeHeaders instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, ArrayList<String>> map = (Map<String, ArrayList<String>>) nativeHeaders;

            // var value1 = (String)map.get("zlatan").get(0);
            // var value2 = (String)map.get("milos").get(0);
            nickName = (String)map.get("nick").get(0);
            color = (String)map.get("color").get(0);

            System.out.println(nickName);
        }

        var client = new Client(nickName, sessionId, color);

        System.out.println("CONNECT: " + client);

        messagingTemplate.convertAndSend("/topic/login", client);

        clientRepository.add(sessionId, client);
    }


    @EventListener
    public void connectionEstablished(SessionConnectedEvent event) {
        // System.out.println("connectionEstablished");

        // String username = getUsername(event.getMessage());
        // System.out.println(username + " connected");

        // StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(sce.getMessage());
        // String username = (String)headerAccessor.getSessionAttributes().get("username");

        // String message = "User " + username + " has connected";

        // simpleMessagingTemplate.convertAndSend("/topic/public", message);
    }

    @EventListener
    public void webSockectDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();

		var client = clientRepository.getClientBy(sessionId);
		if (client != null) {
            System.out.println("DISCONNECT: " + client);

            messagingTemplate.convertAndSend("/topic/logout", client);

			clientRepository.removeBy(event.getSessionId());
        }
    }

    private String getUsername(Message<?> message) {
        SimpMessageHeaderAccessor headers = SimpMessageHeaderAccessor.wrap(message);
        var principal = headers.getUser();
        if (principal != null) {
            String username = principal.getName();
            return username;
        }
        return "";
    }

}
