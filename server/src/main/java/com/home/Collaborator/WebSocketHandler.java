package com.home.Collaborator;

import java.util.concurrent.ConcurrentHashMap;

import org.json.JSONObject;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.ConcurrentWebSocketSessionDecorator;
import org.springframework.web.socket.handler.TextWebSocketHandler;


@Component
public class WebSocketHandler extends TextWebSocketHandler {

    private ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();


    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        System.out.println("got message [" + message + "]");

        String payload = message.getPayload();
        JSONObject jsonObject = new JSONObject(payload);

        sendMessageToAll(jsonObject);
    }

    private void sendMessageToAll(final JSONObject jsonObject) {
        String user = (String)jsonObject.optString("user");
        System.out.println("User: [" + user + "]");

        sessions.values().forEach(session -> {
            try {
                session.sendMessage(new TextMessage(jsonObject.toString()));
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        });
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("new connection: [" + session.getId() + "]");

        var concurrentSession = new ConcurrentWebSocketSessionDecorator(session, 1000, 1024);
        sessions.put(session.getId(), concurrentSession);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        System.out.println("close connection: [" + session.getId() + "], close status: [" + status.getReason() + "]");
        sessions.remove(session.getId());
    }

}
