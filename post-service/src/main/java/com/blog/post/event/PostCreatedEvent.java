package com.blog.post.event;

import java.time.LocalDateTime;

public class PostCreatedEvent {
    private Long postId;
    private String title;
    private Long userId;
    private LocalDateTime createdAt;

    public PostCreatedEvent(Long postId, String title, Long userId, LocalDateTime createdAt) {
        this.postId = postId;
        this.title = title;
        this.userId = userId;
        this.createdAt = createdAt;
    }

    public Long getPostId() {
        return postId;
    }
    public  String getTitle() {
        return title;
    }

    public Long getUserId() {
        return userId;

    }
    public  LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }
    public  void setUserId(Long userId) {
        this.userId = userId;
    }
    public  void setTitle(String title) {
        this.title = title;
    }
    public  void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
