package com.blog.likedislike.service;

import com.blog.likedislike.client.PostServiceClient;
import com.blog.likedislike.client.UserServiceClient;
import com.blog.likedislike.dto.LikeDislikeCountDTO;
import com.blog.likedislike.dto.LikeDislikeDTO;
import com.blog.likedislike.entity.LikeDislike;
import com.blog.likedislike.enums.LikeDislikeType;
import com.blog.likedislike.repository.LikeDislikeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LikeDislikeService {

    private final PostServiceClient postServiceClient;
    private final UserServiceClient userServiceClient;
    private final LikeDislikeRepository likeDislikeRepository;

    public LikeDislikeService(PostServiceClient postServiceClient, UserServiceClient userServiceClient, LikeDislikeRepository likeDislikeRepository) {
        this.postServiceClient = postServiceClient;
        this.userServiceClient = userServiceClient;
        this.likeDislikeRepository = likeDislikeRepository;

    }

    public LikeDislikeDTO createOrToggleLikeDislike(LikeDislikeDTO likeDislikeDTO) {
        // Validate post exists
        try {
            postServiceClient.getPostById(likeDislikeDTO.getPostId());
            userServiceClient.getUserById(likeDislikeDTO.getUserId());
        } catch (Exception e) {
            throw new RuntimeException("Post or User not found");
        }
        Optional<LikeDislike> existing = likeDislikeRepository.findByUserIdAndPostId(likeDislikeDTO.getUserId(), likeDislikeDTO.getPostId());
        if(existing.isPresent()){
            LikeDislike likeDislike = existing.get();
            if(likeDislike.getLikeDislikeType()==likeDislikeDTO.getLikeDislikeType()){
                likeDislikeRepository.deleteById(likeDislike.getId());
           return null;
            }else {
                likeDislike.setLikeDislikeType(likeDislikeDTO.getLikeDislikeType());
                LikeDislike updated =likeDislikeRepository.save(likeDislike);
                return mapToDTO(updated);
            }
        }
        else {
            LikeDislike newLikeDislike=new LikeDislike(likeDislikeDTO.getUserId(),likeDislikeDTO.getPostId(),likeDislikeDTO.getLikeDislikeType());
            LikeDislike saved = likeDislikeRepository.save(newLikeDislike);
            return mapToDTO(saved);
        }
    }
    private LikeDislikeDTO mapToDTO(LikeDislike likeDislike) {
        return new LikeDislikeDTO(likeDislike.getUserId(), likeDislike.getPostId(), likeDislike.getLikeDislikeType());
    }

    public LikeDislikeCountDTO getLikeDislikeCount(Long postId) {

        long likeCount=likeDislikeRepository.countByPostIdAndLikeDislikeType(postId, LikeDislikeType.LIKE);
        long dislikeCount =likeDislikeRepository.countByPostIdAndLikeDislikeType(postId, LikeDislikeType.DISLIKE);
        LikeDislikeCountDTO countDTO = new LikeDislikeCountDTO();
        countDTO.setPostId(postId);
        countDTO.setLikeCount(likeCount);
        countDTO.setDislikeCount(dislikeCount);
        return countDTO;
    }

    public List<LikeDislikeDTO> getLikeDislikesByPostId(long postId) {
        return likeDislikeRepository.findByPostId(postId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    public void deleteLikeDislike(Long id) {
        if(!likeDislikeRepository.existsById(id)){
            throw new RuntimeException("Like Dislike not found");
        }
        likeDislikeRepository.deleteById(id);
    }
}
