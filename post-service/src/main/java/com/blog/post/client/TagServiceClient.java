package com.blog.post.client;

import com.blog.post.dto.TagDTO;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.ArrayList;
import java.util.List;


@FeignClient(name = "tag-service", url = "${tag-service.url:}", path = "/api/tags")
public interface TagServiceClient {

    @GetMapping("{id}")
    @CircuitBreaker(name = "tag-service", fallbackMethod = "getTagByIdFallback")
    TagDTO getTagById(@PathVariable("id") Long id);

    @GetMapping("/post/{postId}")
    @CircuitBreaker(name = "tag-service", fallbackMethod = "getTagByPostIdFallback")
    List<TagDTO> getTagByPostId(@PathVariable("postId") Long postId);

    default List<TagDTO> getTagByPostIdFallback(Long postId, Exception ex) {
        return new ArrayList<>();
    }
    default TagDTO getTagByIdFallback(Long id, Exception ex) {
        return new TagDTO();
    }
}
