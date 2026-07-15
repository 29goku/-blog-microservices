package com.blog.tag.repository;

import com.blog.tag.entity.Tag;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
  boolean existsByName(String name);

  Optional<Tag> findByName(String name);
}
