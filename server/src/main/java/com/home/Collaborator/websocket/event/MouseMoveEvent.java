package com.home.Collaborator.websocket.event;

import lombok.Getter;
import lombok.ToString;


@Getter
@ToString
public class MouseMoveEvent {

    private String nick;
    private int x;
    private int y;

}
