package com.blog.comment.client;

import com.blog.comment.dto.PostDTO;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "post-service", path = "/api/posts")
public interface PostServiceClient {

    @GetMapping("/{id}")
    @CircuitBreaker(name = "post-service", fallbackMethod = "getPostByIdFallback")
    PostDTO getPostById(@PathVariable("id") Long id);

    default PostDTO getPostByIdFallback(Long id, Exception ex) {
        return new PostDTO(id, null, "Service Unavailable", "The post service is currently unavailable", null);
    }
}
