package com.blog.tag.service;

import com.blog.tag.entity.PostTag;
import com.blog.tag.entity.Tag;
import com.blog.tag.repository.PostTagRepository;
import com.blog.tag.repository.TagRepository;
import org.springframework.stereotype.Service;

import java.util.List;

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
            throw new RuntimeException("Tag with id " + id + " does not exist.");
        }
    }

    public Tag findTagById(Long id) {
        return tagRepository.findById(id).orElseThrow(() -> new RuntimeException("Tag with id " + id + " does not exist."));
    }

    public Tag findTagByName(String name) {
        return tagRepository.findByName(name).orElseThrow(() -> new RuntimeException("Tag with name " + name + " does not exist."));
    }

    public PostTag assignTagToPost(Long postId, Long tagId) {
        if (tagRepository.findById(tagId).isEmpty()) {
            throw new RuntimeException("Tag with tagId " + tagId + " not exist.");
        }
        if( postTagRepository.existsByPostIdAndTagId(postId,tagId)) {
            throw new RuntimeException("Tag with tagId " + tagId + " already assigned to post with postId " + postId);
        }
        else {
            PostTag tag = new PostTag();
            tag.setPostId(postId);
            tag.setTagId(tagId);
            postTagRepository.save(tag);
            return tag;
        }

    }

    public Tag createTag(Tag tag) {
        if (tagRepository.findByName(tag.getName()).isPresent()) {
            throw new RuntimeException("Tag with name " + tag.getName() + " already exist.");
        }
        return tagRepository.save(tag);
    }

    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }
}
