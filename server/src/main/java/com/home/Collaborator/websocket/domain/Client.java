package com.home.Collaborator.websocket.domain;

import java.time.LocalDateTime;


public class Client {

	private String nick;
	private String sessionId;
	private LocalDateTime time;
	private String color;


	public Client(String nick, String sessionId, String color) {
		this.nick = nick;
		this.sessionId = sessionId;
		this.time = LocalDateTime.now();
		this.color = color;
	}

	public String getSessionId() {
		return sessionId;
	}

	public LocalDateTime getTime() {
		return time;
	}

	public String getNick() {
		return nick;
	}

	public String getColor() {
		return color;
	}

	@Override
	public String toString() {
		return "Client [nick=" + nick + ", sessionId=" + sessionId + ", time=" + time + ", color=" + color + "]";
	}

}
