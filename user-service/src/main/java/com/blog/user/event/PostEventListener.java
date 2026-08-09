package com.blog.user.event;

import com.blog.user.repository.UserRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class PostEventListener {

    public final UserRepository userRepository;

    public PostEventListener(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @KafkaListener(topics = "post-created", groupId = "user-service-group")
    public void handlePostCreatedEvent(PostCreatedEvent event) {
        // Handle the post created event
        System.out.println("Post created event received: " + event);
        userRepository.findById(event.getUserId()).ifPresent(user -> {
            user.setPostCount(user.getPostCount() + 1);
            userRepository.save(user);
            System.out.println("Updated post count for userId " + user.getId() + ": " + user.getPostCount());
        });
    }
}
