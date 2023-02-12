package com.home.Collaborator.websocket.controller;

import java.security.Principal;

import java.util.Map;
import java.util.Collection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Headers;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

import com.home.Collaborator.websocket.domain.Client;
import com.home.Collaborator.websocket.domain.ClientRepository;
import com.home.Collaborator.websocket.domain.MouseMoveMessage;


@Controller
public class PointerController {

    @Autowired
    private ClientRepository clientRepository;

    @MessageMapping("/hello/{topicName}")
    @SendTo("/topic/greetings/{topicName}")
    public MouseMoveMessage greeting(
        @DestinationVariable("topicName") String topicName,
        @Headers Map<String, Object> headers,
        MouseMoveMessage message,
        Principal principal
    ) throws Exception {
        return message;
    }

	@SubscribeMapping("/clients")
	public Collection<Client> getClients() {
		return clientRepository.getClients().values();
	}

}
