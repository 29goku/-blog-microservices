package com.blog.likedislike.entity;

import com.blog.likedislike.enums.LikeDislikeType;

import jakarta.persistence.*;

@Entity
@Table(name = "like_dislike")
public class LikeDislike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long postId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private LikeDislikeType likeDislikeType;

    @Column(nullable = false)
    private Long createdAt;


    public LikeDislike() {
    }

    public LikeDislike(Long userId, Long postId, LikeDislikeType likeDislikeType) {
        this.createdAt = System.currentTimeMillis();
        this.postId = postId;
        this.userId = userId;
        this.likeDislikeType = likeDislikeType;


    }


    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getPostId() {
        return postId;
    }

    public Long getCreatedAt() {
        return createdAt;
    }

    public LikeDislikeType getLikeDislikeType() {
        return likeDislikeType;
    }


    public void setId(Long id) {
        this.id = id;
    }

    public void setUserId(Long userId) {
        this.userId = userId;

    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public void setCreatedAt(Long createdAt) {
        this.createdAt = createdAt;
    }

    public void setLikeDislikeType(LikeDislikeType likeDislikeType) {
        this.likeDislikeType = likeDislikeType;
    }
}
