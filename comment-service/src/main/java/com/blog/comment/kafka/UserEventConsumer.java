package com.blog.comment.kafka;

import com.blog.comment.event.UserCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
import java.util.function.Consumer;

@Component
public class UserEventConsumer {
    private static final Logger log = LoggerFactory.getLogger(UserEventConsumer.class);

    @Bean
    public Consumer<UserCreatedEvent> userCreatedEventConsumer() {
        return event -> {
            log.info("Received user created event: userId={}, username={}, email={}",
                    event.getUserId(), event.getUsername(), event.getEmail());
            // Process event - cache user info, update indices, etc.
            log.info("Processing user created event for caching or other async tasks");
        };
    }
}
