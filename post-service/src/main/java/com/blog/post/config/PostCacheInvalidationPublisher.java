package com.blog.post.config;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Component;

@Component
public class PostCacheInvalidationPublisher {
    private final StringRedisTemplate redisTemplate;
    private final ChannelTopic topic;

    public  PostCacheInvalidationPublisher(StringRedisTemplate redisTemplate, ChannelTopic topic) {
        this.redisTemplate = redisTemplate;
        this.topic = topic;
    }
    public void publishPostCacheInvalidation(Long postId) {
        String message = String.format("{\"type\":\"POST\",\"postId\":%d}", postId);
        redisTemplate.convertAndSend(topic.getTopic(), message);
    }
    public  void  publishAllInvalidated(){
        redisTemplate.convertAndSend(topic.getTopic(), "{\"type\":\"ALL\"}");
    }
}
