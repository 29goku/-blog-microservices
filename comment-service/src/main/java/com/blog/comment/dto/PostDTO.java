package com.blog.comment.dto;

import java.time.LocalDateTime;

public class PostDTO {
  private Long id;
  private Long userId;
  private String title;
  private String content;
  private LocalDateTime createdAt;

  // Constructors
  public PostDTO() {}

  public PostDTO(Long id, Long userId, String title, String content, LocalDateTime createdAt) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.content = content;
    this.createdAt = createdAt;
  }

  // Getters
  public Long getId() {
    return id;
  }

  public Long getUserId() {
    return userId;
  }

  public String getTitle() {
    return title;
  }

  public String getContent() {
    return content;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  // Setters
  public void setId(Long id) {
    this.id = id;
  }

  public void setUserId(Long userId) {
    this.userId = userId;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public void setContent(String content) {
    this.content = content;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }
}
