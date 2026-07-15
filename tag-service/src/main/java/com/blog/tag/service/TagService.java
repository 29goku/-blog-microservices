package com.blog.tag.service;

import com.blog.tag.entity.PostTag;
import com.blog.tag.entity.Tag;
import com.blog.tag.exception.TagAlreadyAssignedException;
import com.blog.tag.exception.TagAlreadyExistsException;
import com.blog.tag.exception.TagNotFoundException;
import com.blog.tag.repository.PostTagRepository;
import com.blog.tag.repository.TagRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class TagService {
  public final TagRepository tagRepository;
  public final PostTagRepository postTagRepository;

  public TagService(TagRepository tagRepository, PostTagRepository postTagRepository) {
    this.tagRepository = tagRepository;
    this.postTagRepository = postTagRepository;
  }

  public void deleteTagById(Long id) {
    if (tagRepository.existsById(id)) {
      tagRepository.deleteById(id);

    } else {
      throw new TagNotFoundException("Tag with id " + id + " does not exist.");
    }
  }

  public Tag findTagById(Long id) {
    return tagRepository
        .findById(id)
        .orElseThrow(() -> new TagNotFoundException("Tag with id " + id + " does not exist."));
  }

  public Tag findTagByName(String name) {
    return tagRepository
        .findByName(name)
        .orElseThrow(() -> new TagNotFoundException("Tag with name " + name + " does not exist."));
  }

  public PostTag assignTagToPost(Long postId, Long tagId) {
    if (tagRepository.findById(tagId).isEmpty()) {
      throw new TagNotFoundException("Tag with tagId " + tagId + " not exist.");
    }
    if (postTagRepository.existsByPostIdAndTagId(postId, tagId)) {
      throw new TagAlreadyAssignedException(
          "Tag with tagId " + tagId + " already assigned to post with postId " + postId);
    } else {
      PostTag tag = new PostTag();
      tag.setPostId(postId);
      tag.setTagId(tagId);
      postTagRepository.save(tag);
      return tag;
    }
  }

  public Tag createTag(Tag tag) {
    if (tagRepository.findByName(tag.getName()).isPresent()) {
      throw new TagAlreadyExistsException("Tag with name " + tag.getName() + " already exist.");
    }
    return tagRepository.save(tag);
  }

  public void removeTagFromPost(Long postId, Long tagId) {
    if (!postTagRepository.existsByPostIdAndTagId(postId, tagId)) {
      throw new TagNotFoundException("Tag with id " + tagId + " does not exist.");
    }
    postTagRepository.deleteByPostIdAndTagId(postId, tagId);
  }

  public List<Tag> getTagsByPostId(Long postId) {
    return postTagRepository.findByPostId(postId).stream()
        .map(postTag -> findTagById(postTag.getTagId()))
        .toList();
  }

  public Tag updateTag(Long id, Tag updated) {
    Tag existing =
        tagRepository
            .findById(id)
            .orElseThrow(() -> new TagNotFoundException("Tag with id " + id + " does not exist."));
    existing.setName(updated.getName());
    existing.setDescription(updated.getDescription());
    existing.setColor(updated.getColor());
    return tagRepository.save(existing);
  }

  public List<Tag> getAllTags() {
    return tagRepository.findAll();
  }
}
