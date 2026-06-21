package com.blog.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CommentDTO {
    private Long id;

    @NotNull(message = "Post ID is required")
    private Long postId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Content is required")
    private String content;

    private Long createdAt;

    private Long updatedAt;

    private UserDTO user;

    private PostDTO post;

    // Constructors
    public CommentDTO() {
    }

    public CommentDTO(Long id, Long postId, Long userId, String content, Long createdAt, Long updatedAt, UserDTO user, PostDTO post) {
        this.id = id;
        this.postId = postId;
        this.userId = userId;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.user = user;
        this.post = post;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public Long getPostId() {
        return postId;
    }

    public Long getUserId() {
        return userId;
    }

    public String getContent() {
        return content;
    }

    public Long getCreatedAt() {
        return createdAt;
    }

    public Long getUpdatedAt() {
        return updatedAt;
    }

    public UserDTO getUser() {
        return user;
    }

    public PostDTO getPost() {
        return post;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setCreatedAt(Long createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(Long updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public void setPost(PostDTO post) {
        this.post = post;
    }
}
