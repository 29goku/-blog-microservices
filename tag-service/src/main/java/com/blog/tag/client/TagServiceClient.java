package com.blog.tag.client;

import com.blog.tag.dto.TagDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name="tag-service", url="${tag-service.url:}", path="/api/tags")
public interface TagServiceClient {

    @GetMapping("/{id}")
    TagDto getTagById(@PathVariable("id") Long id);

    @GetMapping
    List<TagDto> getAllTags();

}
