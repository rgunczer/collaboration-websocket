package com.home.Collaborator.websocket.domain;

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
public class Editor {

	private String documentId;
	private Map<String, Field> documentFields = new ConcurrentHashMap<>();
	private List<String> collaboratorNames = new CopyOnWriteArrayList<>();

}
