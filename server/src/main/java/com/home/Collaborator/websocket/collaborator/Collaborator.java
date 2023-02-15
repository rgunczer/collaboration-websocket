package com.home.Collaborator.websocket.collaborator;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.ToString;


@Getter
@ToString
public class Collaborator {

    private String nick;
    private String sessionId;
    private LocalDateTime time;
    private String color;


    public Collaborator(String nick, String sessionId, String color) {
        this.nick = nick;
        this.sessionId = sessionId;
        this.time = LocalDateTime.now();
        this.color = color;
    }

}
