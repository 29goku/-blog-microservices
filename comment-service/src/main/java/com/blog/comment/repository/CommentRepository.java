package com.blog.comment.repository;

import com.blog.comment.entity.Comment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
  List<Comment> findByPostId(Long postId);

  List<Comment> findByUserId(Long userId);

  List<Comment> findByPostIdAndUserId(Long postId, Long userId);
}
