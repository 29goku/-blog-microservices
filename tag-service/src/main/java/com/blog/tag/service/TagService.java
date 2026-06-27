package com.blog.tag.service;

import com.blog.tag.repository.TagRepository;
import org.springframework.stereotype.Service;

@Service
public class TagService {
    public final TagRepository tagRepository;

    public TagService(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }
}
