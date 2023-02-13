package com.home.Collaborator.websocket.config;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.lang.Nullable;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import com.home.Collaborator.websocket.domain.StompPrincipal;


public class HandshakeHandler extends DefaultHandshakeHandler {

    @Override
    @Nullable
    protected Principal determineUser(
        ServerHttpRequest request,
        WebSocketHandler wsHandler,
        Map<String, Object> attributes
    ) {

        return new StompPrincipal(UUID.randomUUID().toString());
    }

}
