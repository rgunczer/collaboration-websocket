package com.home.Collaborator.websocket.config;

import org.springframework.lang.Nullable;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;

public class SessionChannelInterceptor implements ChannelInterceptor {

    @Override
    @Nullable
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        StompCommand command = accessor.getCommand();

        if (command != null) {
            System.out.println("pre-send");
        //     if (command.ordinal() == StompCommand.CONNECT.ordinal()) {
        //         ++numberOfConnectedClients;

        //         Greeting gr = (Greeting)message.getPayload();
        //         gr.setUserCount(numberOfConnectedClients);
        //     }

        //     if (command.ordinal() == StompCommand.DISCONNECT.ordinal()) {
        //         --numberOfConnectedClients;

        //         Greeting gr = (Greeting)message.getPayload();
        //         gr.setUserCount(numberOfConnectedClients);
        //     }
        }
        return message; // + numberOfConnectedClients;
    }

}
