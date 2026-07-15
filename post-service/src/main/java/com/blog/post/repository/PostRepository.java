package com.blog.post.repository;

import com.blog.post.entity.Post;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
  List<Post> findByUserId(Long userId);

  List<Post> findByTitleContainingIgnoreCase(String title);
}
