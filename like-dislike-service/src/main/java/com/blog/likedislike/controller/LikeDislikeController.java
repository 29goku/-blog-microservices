package com.blog.likedislike.controller;

import com.blog.likedislike.dto.LikeDislikeCountDTO;
import com.blog.likedislike.dto.LikeDislikeDTO;
import com.blog.likedislike.service.LikeDislikeService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/likedislike")
public class LikeDislikeController {
    private final LikeDislikeService likeDislikeService;

    public LikeDislikeController(LikeDislikeService likeDislikeService) {
        this.likeDislikeService = likeDislikeService;
    }


    @GetMapping("/count/{postId}")
    public LikeDislikeCountDTO countByPostId(@PathVariable Long postId) {
        return likeDislikeService.getLikeDislikeCount(postId);
    }

    @GetMapping("/post/{postId}")
    public List<LikeDislikeDTO> getLikeDislikeByPostId(@PathVariable Long postId) {
        return likeDislikeService.getLikeDislikesByPostId(postId);
    }

    @DeleteMapping("/{id}")
    public void deleteLikeDislikeById(@PathVariable Long id) {
        likeDislikeService.deleteLikeDislike(id);
    }

    @PostMapping
    public LikeDislikeDTO createOrToggleLikeDislike(@RequestBody LikeDislikeDTO likeDislikeDTO) {
        return likeDislikeService.createOrToggleLikeDislike(likeDislikeDTO);
    }


}
