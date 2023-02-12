package com.home.Collaborator.websocket.domain;


public class MouseMoveMessage {

    private String name;
    private int mx;
    private int my;

    public MouseMoveMessage() {
    }

    public MouseMoveMessage(String name, int mx, int my) {
        this.name = name;
        this.mx = mx;
        this.my = my;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getMx() {
        return mx;
    }

    public void setMx(int mx) {
        this.mx = mx;
    }

    public int getMy() {
        return my;
    }

    public void setMy(int my) {
        this.my = my;
    }

    @Override
    public String toString() {
        return "MouseMoveMessage [name=" + name + ", mx=" + mx + ", my=" + my + "]";
    }

}
