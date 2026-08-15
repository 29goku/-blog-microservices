package com.blog.user.event;

import java.time.LocalDateTime;

public class PostCreatedEvent {
    private Long userId;
    private String title;
    private Long postId;
    private LocalDateTime createdAt;


    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public Long getPostId() {
        return postId;
    }
    public void setPostId(Long postId) {
        this.postId = postId;
    }
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

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
