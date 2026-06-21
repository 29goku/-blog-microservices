package com.blog.post.kafka;

import com.blog.post.event.UserCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.stereotype.Component;

@Component
public class UserEventProducer {
    private static final Logger log = LoggerFactory.getLogger(UserEventProducer.class);
    private final StreamBridge streamBridge;

    public UserEventProducer(StreamBridge streamBridge) {
        this.streamBridge = streamBridge;
    }

    public void publishUserCreatedEvent(UserCreatedEvent event) {
        log.info("Publishing user created event for user: {}", event.getUsername());
        streamBridge.send("user-created-out-0", event);
    }
}
