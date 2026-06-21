package com.blog.likedislike.dto;

public class LikeDislikeCountDTO {
    private Long postId;
    private Long likeCount;
    private Long dislikeCount;

    public LikeDislikeCountDTO(){

    }
    public LikeDislikeCountDTO(Long postId, Long likeCount, Long dislikeCount) {
        this.postId = postId;
        this.likeCount = likeCount;
        this.dislikeCount = dislikeCount;
    }
    public Long getPostId() {
        return postId;
    }
    public void setPostId(Long postId) {
        this.postId = postId;
    }
    public Long getLikeCount() {
        return likeCount;

    }
    public void setLikeCount(Long likeCount) {
        this.likeCount = likeCount;

    }
    public Long getDislikeCount() {
        return dislikeCount;
    }
    public void setDislikeCount(Long dislikeCount) {
        this.dislikeCount = dislikeCount;
    }

}
