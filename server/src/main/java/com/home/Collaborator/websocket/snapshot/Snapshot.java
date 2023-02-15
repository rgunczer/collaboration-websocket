package com.home.Collaborator.websocket.snapshot;

import java.util.List;
import java.util.Map;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;


@Getter
@Setter
@ToString
public class Snapshot {

    private String entityId;
    private Map<String, Field> fields = new ConcurrentHashMap<>();
    private List<String> collaboratorNames = new CopyOnWriteArrayList<>();

    public void addField(String fieldName, Field field) {
        fields.put(fieldName, field);
    }

    public void addFields(List<Field> fields) {
        for (var field: fields) {
            addField(field.getName(), field);
        }
    }

}
