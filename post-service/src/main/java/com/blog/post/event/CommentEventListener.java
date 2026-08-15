package com.blog.post.event;

import com.blog.post.repository.PostRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class CommentEventListener {

    public final PostRepository postRepository;

    public CommentEventListener(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @KafkaListener(topics = "comment-created", groupId = "post-service-group")
    public void handleCommentCreatedEvent(CommentCreatedEvent event) {
        System.out.println("Comment created event received: " + event);
        postRepository.findById(event.getPostId()).ifPresent(post -> {
            post.setCommentCount(post.getCommentCount() + 1);
            postRepository.save(post);
            System.out.println("Updated comment count for postId " + post.getId() + ": " + post.getCommentCount());
        });
    }
}