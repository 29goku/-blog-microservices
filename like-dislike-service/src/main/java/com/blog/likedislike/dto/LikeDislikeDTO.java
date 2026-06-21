package com.blog.likedislike.dto;

import com.blog.likedislike.enums.LikeDislikeType;

public class LikeDislikeDTO {
    private Long userId;
    private Long postId;
    private LikeDislikeType likeDislikeType;

    public LikeDislikeDTO() {
    }

    public LikeDislikeDTO(Long userId, Long postId, LikeDislikeType likeDislikeType) {
        this.userId = userId;
        this.postId = postId;
        this.likeDislikeType = likeDislikeType;

    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;

    }

    public Long getPostId() {
        return postId;

    }

    public void setPostId(Long postId) {
        this.postId = postId;

    }

    public LikeDislikeType getLikeDislikeType() {
        return likeDislikeType;
    }

    public void setLikeDislikeType(LikeDislikeType likeDislikeType) {
        this.likeDislikeType = likeDislikeType;

    }

}
