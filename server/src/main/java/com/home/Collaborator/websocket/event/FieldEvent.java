package com.home.Collaborator.websocket.event;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;


@Getter
@Setter
@ToString
public class FieldEvent {

    private String type;
    private String nick;
    private String field;
    private String value;

}
