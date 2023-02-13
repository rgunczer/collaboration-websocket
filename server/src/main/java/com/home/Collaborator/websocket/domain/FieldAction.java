package com.home.Collaborator.websocket.domain;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;


@Getter
@Setter
@ToString
public class FieldAction {

	private String type;
	private String nick;
	private String field;
	private String value;

}
