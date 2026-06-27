package com.blog.tag.repository;

import com.blog.tag.entity.PostTag;
import  org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface  PostTagRepository extends JpaRepository<PostTag, Long> {
    List<PostTag> findByPostId(Long postId);
    boolean existsByPostIdAndTagId(Long postId, Long tagId);
    @Transactional
    void deleteByPostIdAndTagId(Long postId, Long tagId);
    @Transactional
    void deleteByTagId(Long tagId);

}
