package com.blog.post.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.slf4j.Logger;
import org.springframework.stereotype.Component;

@Component
public class PostCacheInvalidationListener implements MessageListener {

    private static final Logger log= LoggerFactory.getLogger(PostCacheInvalidationListener.class);
    private static final ObjectMapper mapper = new ObjectMapper();

    private final CacheManager cacheManager;

    public PostCacheInvalidationListener(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            JsonNode node = mapper.readTree(message.getBody());
            String type = node.get("type").asText();

            if ("ALL".equals(type)) {
                cacheManager.getCache("posts").evict("allPosts");
                log.info("Evicted posts::allPosts cache");
            } else if ("POST".equals(type)) {
                long postId = node.get("postId").asLong();
                cacheManager.getCache("posts").evict("allPosts");
                cacheManager.getCache("posts").evict(postId);
                log.info("Evicted posts cache for postId: {}", postId);
            }
        }catch (Exception e) {
            log.error("Error processing cache invalidation message", e);
        }
    }

}
