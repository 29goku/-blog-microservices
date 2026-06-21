package com.blog.likedislike.repository;

import com.blog.likedislike.entity.LikeDislike;
import com.blog.likedislike.enums.LikeDislikeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface LikeDislikeRepository extends JpaRepository<LikeDislike, Long> {
    Optional<LikeDislike> findByUserIdAndPostId(Long userId, Long postId);

    List<LikeDislike> findByPostId(Long postId);

    List<LikeDislike> findByPostIdAndLikeDislikeType(Long postId, LikeDislikeType type);

    Long countByPostIdAndLikeDislikeType(Long postId, LikeDislikeType type);


}
