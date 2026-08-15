package com.blog.post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public class PostDTO {
  private Long id;

  @NotNull(message = "User ID is required")
  private Long userId;

  @NotBlank(message = "Title is required")
  private String title;

  @NotBlank(message = "Content is required")
  private String content;

  private String tags;

  private Integer commentCount;

  private List<TagDTO> tagList;

  private LocalDateTime createdAt;

  private LocalDateTime updatedAt;

  private UserDTO user;

  // Default constructor
  public PostDTO() {}

  // All args constructor
  public PostDTO(
      Long id,
      Long userId,
      String title,
      String content,
      String tags,
      LocalDateTime createdAt,
      LocalDateTime updatedAt,
      UserDTO user) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.content = content;
    this.tags = tags;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.user = user;
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

  public String getTags() {
    return tags;
  }

  public Integer getCommentCount() {
    return commentCount;
  }

  public void setCommentCount(Integer commentCount) {
    this.commentCount = commentCount;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }

  public UserDTO getUser() {
    return user;
  }

  // Setters
  public void setId(Long id) {
    this.id = id;
  }

  public void setUserId(Long userId) {
    this.userId = userId;
  }

  public List<TagDTO> getTagList() {
    return tagList;
  }

  public void setTagList(List<TagDTO> tagList) {
    this.tagList = tagList;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public void setContent(String content) {
    this.content = content;
  }

  public void setTags(String tags) {
    this.tags = tags;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public void setUpdatedAt(LocalDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }

  public void setUser(UserDTO user) {
    this.user = user;
  }
}
