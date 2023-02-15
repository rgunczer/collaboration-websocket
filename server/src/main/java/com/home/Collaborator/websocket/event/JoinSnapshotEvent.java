package com.home.Collaborator.websocket.event;

import java.util.List;

import com.home.Collaborator.websocket.snapshot.Field;

import lombok.Getter;
import lombok.ToString;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class JoinSnapshotEvent {

    private String type;
    private String id;
    private String nick;

    private List<Field> fields;

}
