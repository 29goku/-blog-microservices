package com.blog.post.service;

import com.blog.post.client.UserServiceClient;
import com.blog.post.dto.PostDTO;
import com.blog.post.entity.Post;
import com.blog.post.exception.PostNotFoundException;
import com.blog.post.exception.UserNotValidException;
import com.blog.post.repository.PostRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {

    private static final Logger log = LoggerFactory.getLogger(PostService.class);
    private final PostRepository postRepository;
    private final UserServiceClient userServiceClient;

    // Constructor
    public PostService(PostRepository postRepository, UserServiceClient userServiceClient) {
        this.postRepository = postRepository;
        this.userServiceClient = userServiceClient;
    }

    public PostDTO createPost(PostDTO postDTO) {
        log.info("Creating post for userId: {}", postDTO.getUserId());

        // Validate user exists by calling user-service
        try {
            postDTO.setUser(userServiceClient.getUserById(postDTO.getUserId()));
        } catch (Exception e) {
            log.error("User not found with id: {}", postDTO.getUserId());
            throw new UserNotValidException("User not found with id: " + postDTO.getUserId());
        }

        Post post = new Post();
        post.setUserId(postDTO.getUserId());
        post.setTitle(postDTO.getTitle());
        post.setContent(postDTO.getContent());
        post.setTags(postDTO.getTags());

        Post savedPost = postRepository.save(post);
        log.info("Post created successfully with id: {}", savedPost.getId());

        return mapToDTO(savedPost, postDTO.getUser());
    }

    public PostDTO getPostById(Long id) {
        log.info("Fetching post with id: {}", id);
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException("Post not found with id: " + id));

        var user = userServiceClient.getUserById(post.getUserId());
        return mapToDTO(post, user);
    }

    public List<PostDTO> getPostsByUserId(Long userId) {
        log.info("Fetching posts for userId: {}", userId);
        var user = userServiceClient.getUserById(userId);

        List<Post> posts = postRepository.findByUserId(userId);
        return posts.stream()
                .map(post -> mapToDTO(post, user))
                .collect(Collectors.toList());
    }

    public List<PostDTO> searchPostsByTitle(String title) {
        log.info("Searching posts with title containing: {}", title);
        List<Post> posts = postRepository.findByTitleContainingIgnoreCase(title);
        return posts.stream()
                .map(post -> {
                    var user = userServiceClient.getUserById(post.getUserId());
                    return mapToDTO(post, user);
                })
                .collect(Collectors.toList());
    }

    public List<PostDTO> getAllPosts() {
        log.info("Fetching all posts");
        return postRepository.findAll()
                .stream()
                .map(post -> {
                    var user = userServiceClient.getUserById(post.getUserId());
                    return mapToDTO(post, user);
                })
                .collect(Collectors.toList());
    }

    public PostDTO updatePost(Long id, PostDTO postDTO) {
        log.info("Updating post with id: {}", id);
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException("Post not found with id: " + id));

        if (postDTO.getTitle() != null) {
            post.setTitle(postDTO.getTitle());
        }
        if (postDTO.getContent() != null) {
            post.setContent(postDTO.getContent());
        }
        if (postDTO.getTags() != null) {
            post.setTags(postDTO.getTags());
        }

        Post updatedPost = postRepository.save(post);
        var user = userServiceClient.getUserById(updatedPost.getUserId());
        log.info("Post updated successfully with id: {}", id);

        return mapToDTO(updatedPost, user);
    }

    public void deletePost(Long id) {
        log.info("Deleting post with id: {}", id);
        if (!postRepository.existsById(id)) {
            throw new PostNotFoundException("Post not found with id: " + id);
        }
        postRepository.deleteById(id);
        log.info("Post deleted successfully with id: {}", id);
    }

    private PostDTO mapToDTO(Post post, com.blog.post.dto.UserDTO user) {
        PostDTO dto = new PostDTO();
        dto.setId(post.getId());
        dto.setUserId(post.getUserId());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setTags(post.getTags());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());
        dto.setUser(user);
        return dto;
    }
}
