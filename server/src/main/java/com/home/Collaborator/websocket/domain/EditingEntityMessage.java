package com.home.Collaborator.websocket.domain;

import java.util.List;

import lombok.Getter;
import lombok.ToString;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class EditingEntityMessage {

    private String type;
    private String id;
    private String nick;

    private List<Field> fields;

}
