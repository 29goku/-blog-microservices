package com.blog.tag.controller;

import com.blog.tag.entity.Tag;
import com.blog.tag.service.TagService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {

        this.tagService =  tagService;

    }

    @GetMapping
    public List<Tag> getTags() {
        return tagService.getAllTags();
    }

    @GetMapping("/{id}")
    public Tag getTagById(@PathVariable Long id) {
        return tagService.findTagById(id);
    }

    @GetMapping("/name/{name}")
    public Tag getTagByName(@PathVariable String name) {
        return tagService.findTagByName(name);
    }
    @GetMapping("/post/{postId}")
    public List<Tag> getTagsByPostId(@PathVariable Long postId) {
        return tagService.getTagsByPostId(postId);
    }

    @DeleteMapping("/{id}")
    public void deleteTagById(@PathVariable Long id) {
        tagService.deleteTagById(id);
    }

    @DeleteMapping("/unassign")
    public void removeTagFromPost(@RequestParam Long id,@RequestParam Long postId) {
        tagService.removeTagFromPost(postId, id);
    }

    @PostMapping
    public Tag saveTag(@RequestBody Tag tag) {
        return tagService.createTag(tag);
    }

    @PostMapping("/assign")
    public String assignTagToPost(@RequestParam Long postId, @RequestParam Long tagId) {
        tagService.assignTagToPost(postId, tagId);
        return "Tag with id " + tagId + " assigned to post with id " + postId;
    }
}
