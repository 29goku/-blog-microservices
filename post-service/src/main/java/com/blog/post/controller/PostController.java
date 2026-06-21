package com.blog.post.controller;

import com.blog.post.dto.PostDTO;
import com.blog.post.service.PostService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private static final Logger log = LoggerFactory.getLogger(PostController.class);
    private final PostService postService;

    // Constructor
    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    public ResponseEntity<PostDTO> createPost(@Valid @RequestBody PostDTO postDTO) {
        log.info("REST call: POST /api/posts - Create post");
        PostDTO createdPost = postService.createPost(postDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> getPostById(@PathVariable Long id) {
        log.info("REST call: GET /api/posts/{} - Get post by id", id);
        PostDTO post = postService.getPostById(id);
        return ResponseEntity.ok(post);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostDTO>> getPostsByUserId(@PathVariable Long userId) {
        log.info("REST call: GET /api/posts/user/{} - Get posts by userId", userId);
        List<PostDTO> posts = postService.getPostsByUserId(userId);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/search")
    public ResponseEntity<List<PostDTO>> searchPostsByTitle(@RequestParam String title) {
        log.info("REST call: GET /api/posts/search?title={} - Search posts", title);
        List<PostDTO> posts = postService.searchPostsByTitle(title);
        return ResponseEntity.ok(posts);
    }

    @GetMapping
    public ResponseEntity<List<PostDTO>> getAllPosts() {
        log.info("REST call: GET /api/posts - Get all posts");
        List<PostDTO> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostDTO> updatePost(@PathVariable Long id, @Valid @RequestBody PostDTO postDTO) {
        log.info("REST call: PUT /api/posts/{} - Update post", id);
        PostDTO updatedPost = postService.updatePost(id, postDTO);
        return ResponseEntity.ok(updatedPost);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        log.info("REST call: DELETE /api/posts/{} - Delete post", id);
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }
}
