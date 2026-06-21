package com.blog.comment.service;

import com.blog.comment.client.PostServiceClient;
import com.blog.comment.client.UserServiceClient;
import com.blog.comment.dto.CommentDTO;
import com.blog.comment.entity.Comment;
import com.blog.comment.exception.CommentNotFoundException;
import com.blog.comment.exception.InvalidCommentException;
import com.blog.comment.repository.CommentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private static final Logger log = LoggerFactory.getLogger(CommentService.class);
    private final CommentRepository commentRepository;
    private final UserServiceClient userServiceClient;
    private final PostServiceClient postServiceClient;

    public CommentService(CommentRepository commentRepository, UserServiceClient userServiceClient, PostServiceClient postServiceClient) {
        this.commentRepository = commentRepository;
        this.userServiceClient = userServiceClient;
        this.postServiceClient = postServiceClient;
    }

    public CommentDTO createComment(CommentDTO commentDTO) {
        log.info("Creating comment on postId: {} by userId: {}", commentDTO.getPostId(), commentDTO.getUserId());

        // Validate user exists
        try {
            commentDTO.setUser(userServiceClient.getUserById(commentDTO.getUserId()));
        } catch (Exception e) {
            log.error("User not found with id: {}", commentDTO.getUserId());
            throw new InvalidCommentException("User not found with id: " + commentDTO.getUserId());
        }

        // Validate post exists
        try {
            commentDTO.setPost(postServiceClient.getPostById(commentDTO.getPostId()));
        } catch (Exception e) {
            log.error("Post not found with id: {}", commentDTO.getPostId());
            throw new InvalidCommentException("Post not found with id: " + commentDTO.getPostId());
        }

        Comment comment = new Comment();
        comment.setPostId(commentDTO.getPostId());
        comment.setUserId(commentDTO.getUserId());
        comment.setContent(commentDTO.getContent());

        Comment savedComment = commentRepository.save(comment);
        log.info("Comment created successfully with id: {}", savedComment.getId());

        return mapToDTO(savedComment, commentDTO.getUser(), commentDTO.getPost());
    }

    public CommentDTO getCommentById(Long id) {
        log.info("Fetching comment with id: {}", id);
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new CommentNotFoundException("Comment not found with id: " + id));

        var user = userServiceClient.getUserById(comment.getUserId());
        var post = postServiceClient.getPostById(comment.getPostId());

        return mapToDTO(comment, user, post);
    }

    public List<CommentDTO> getCommentsByPostId(Long postId) {
        log.info("Fetching comments for postId: {}", postId);

        // Validate post exists
        try {
            postServiceClient.getPostById(postId);
        } catch (Exception e) {
            log.warn("Post not found with id: {}", postId);
            throw new InvalidCommentException("Post not found with id: " + postId);
        }

        List<Comment> comments = commentRepository.findByPostId(postId);
        return comments.stream()
                .map(comment -> {
                    try {
                        var user = userServiceClient.getUserById(comment.getUserId());
                        var post = postServiceClient.getPostById(comment.getPostId());
                        return mapToDTO(comment, user, post);
                    } catch (Exception e) {
                        log.warn("Failed to load user/post for comment {}: {}", comment.getId(), e.getMessage());
                        return mapToDTO(comment, null, null);
                    }
                })
                .collect(Collectors.toList());
    }

    public List<CommentDTO> getCommentsByUserId(Long userId) {
        log.info("Fetching comments by userId: {}", userId);

        // Validate user exists
        try {
            userServiceClient.getUserById(userId);
        } catch (Exception e) {
            throw new InvalidCommentException("User not found with id: " + userId);
        }

        List<Comment> comments = commentRepository.findByUserId(userId);
        return comments.stream()
                .map(comment -> {
                    var user = userServiceClient.getUserById(comment.getUserId());
                    var post = postServiceClient.getPostById(comment.getPostId());
                    return mapToDTO(comment, user, post);
                })
                .collect(Collectors.toList());
    }

    public List<CommentDTO> getAllComments() {
        log.info("Fetching all comments");
        return commentRepository.findAll()
                .stream()
                .map(comment -> {
                    try {
                        var user = userServiceClient.getUserById(comment.getUserId());
                        var post = postServiceClient.getPostById(comment.getPostId());
                        return mapToDTO(comment, user, post);
                    } catch (Exception e) {
                        log.warn("Failed to load user/post for comment {}: {}", comment.getId(), e.getMessage());
                        return mapToDTO(comment, null, null);
                    }
                })
                .collect(Collectors.toList());
    }

    public CommentDTO updateComment(Long id, CommentDTO commentDTO) {
        log.info("Updating comment with id: {}", id);
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new CommentNotFoundException("Comment not found with id: " + id));

        if (commentDTO.getContent() != null) {
            comment.setContent(commentDTO.getContent());
        }

        Comment updatedComment = commentRepository.save(comment);
        var user = userServiceClient.getUserById(updatedComment.getUserId());
        var post = postServiceClient.getPostById(updatedComment.getPostId());

        log.info("Comment updated successfully with id: {}", id);
        return mapToDTO(updatedComment, user, post);
    }

    public void deleteComment(Long id) {
        log.info("Deleting comment with id: {}", id);
        if (!commentRepository.existsById(id)) {
            throw new CommentNotFoundException("Comment not found with id: " + id);
        }
        commentRepository.deleteById(id);
        log.info("Comment deleted successfully with id: {}", id);
    }

    private CommentDTO mapToDTO(Comment comment, com.blog.comment.dto.UserDTO user, com.blog.comment.dto.PostDTO post) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setPostId(comment.getPostId());
        dto.setUserId(comment.getUserId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        dto.setUser(user);
        dto.setPost(post);
        return dto;
    }
}
