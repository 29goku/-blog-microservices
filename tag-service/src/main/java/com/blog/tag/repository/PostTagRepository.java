package com.blog.tag.repository;

import com.blog.tag.entity.PostTag;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface PostTagRepository extends JpaRepository<PostTag, Long> {
  List<PostTag> findByPostId(Long postId);

  boolean existsByPostIdAndTagId(Long postId, Long tagId);

  @Transactional
  void deleteByPostIdAndTagId(Long postId, Long tagId);

  @Transactional
  void deleteByTagId(Long tagId);
}
