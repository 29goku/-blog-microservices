package com.blog.comment.controller;

import com.blog.comment.dto.CommentDTO;
import com.blog.comment.service.CommentService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private static final Logger log = LoggerFactory.getLogger(CommentController.class);
    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public ResponseEntity<CommentDTO> createComment(@Valid @RequestBody CommentDTO commentDTO) {
        log.info("REST call: POST /api/comments - Create comment");
        CommentDTO createdComment = commentService.createComment(commentDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
    }

    @GetMapping
    public ResponseEntity<List<CommentDTO>> getAllComments() {
        log.info("REST call: GET /api/comments - Get all comments");
        List<CommentDTO> comments = commentService.getAllComments();
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentDTO>> getCommentsByPostId(@PathVariable Long postId) {
        log.info("REST call: GET /api/comments/post/{} - Get comments by postId", postId);
        List<CommentDTO> comments = commentService.getCommentsByPostId(postId);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CommentDTO>> getCommentsByUserId(@PathVariable Long userId) {
        log.info("REST call: GET /api/comments/user/{} - Get comments by userId", userId);
        List<CommentDTO> comments = commentService.getCommentsByUserId(userId);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommentDTO> getCommentById(@PathVariable Long id) {
        log.info("REST call: GET /api/comments/{} - Get comment by id", id);
        CommentDTO comment = commentService.getCommentById(id);
        return ResponseEntity.ok(comment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommentDTO> updateComment(@PathVariable Long id, @Valid @RequestBody CommentDTO commentDTO) {
        log.info("REST call: PUT /api/comments/{} - Update comment", id);
        CommentDTO updatedComment = commentService.updateComment(id, commentDTO);
        return ResponseEntity.ok(updatedComment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        log.info("REST call: DELETE /api/comments/{} - Delete comment", id);
        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
}
