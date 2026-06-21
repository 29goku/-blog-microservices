package com.blog.likedislike.client;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "post-service", path = "/api/posts")
public interface PostServiceClient {

    @GetMapping("/{id}")
    Object getPostById(@PathVariable("id") Long id);
    @CircuitBreaker(name = "post-service", fallbackMethod = "getPostByIdFallback")
    default Object getPostByIdFallback(Long id) {
        return null;
    }
}
