package com.blog.user.event;

public class PostCreatedEvent {
    private Long userId;

    public PostCreatedEvent() {
    }
    public PostCreatedEvent(Long userId) {
        this.userId = userId;
}

    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId= userId;
    }
}
