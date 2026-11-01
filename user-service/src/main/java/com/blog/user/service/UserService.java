package com.blog.user.service;

import com.blog.user.dto.UserDTO;
import com.blog.user.entity.User;
import com.blog.user.exception.InvalidFileException;
import com.blog.user.exception.UserAlreadyExistsException;
import com.blog.user.exception.UserNotFoundException;
import com.blog.user.repository.UserRepository;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;


@Service
public class UserService {

    private final UserRepository userRepository;
    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    private final S3Client s3Client=S3Client.create();
    private final PasswordEncoder passwordEncoder;

    private static final Set<String> ALLOWED_TYPES = Set.of("image/png", "image/jpeg", "image/gif", "image/webp");
    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

    @Value("${app.avatar.s3-bucket:blog-microservices-avatars-29shobhitsingh}")
    private String avatarS3Bucket;

    public UserDTO storeAvatar(Long id, MultipartFile file) {
        User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new InvalidFileException("Invalid file type. Allowed types are: " + ALLOWED_TYPES);
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidFileException("File size exceeds the maximum limit of 2 MB");
        }

        String ext = switch (file.getContentType()) {
            case "image/png" -> "png";
            case "image/jpeg" -> "jpg";
            case "image/gif" -> "gif";
            case "image/webp" -> "webp";
            default -> throw new InvalidFileException("Unsupported file type: " + file.getContentType());
        };
        try {
            // Upload to S3 bucket
            String key = id + "." + ext;
            for (String e : List.of("jpg", "png", "gif", "webp")) {
                if (!e.equals(ext)) {
                    s3Client.deleteObject(builder -> builder.bucket(avatarS3Bucket).key(id + "." + e).build());
                }
            }
            s3Client.putObject(builder -> builder.bucket(avatarS3Bucket).key(key).build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (IOException e) {
            throw new RuntimeException("Failed to store avatar file", e);
        }
        user.setAvatarUrl("/api/users/" + id + "/avatar");
        User saved = userRepository.save(user);
        log.info("Avatar stored successfully for user id: {}", id);
        return mapToDTO(saved);
    }
  public ResponseInputStream<GetObjectResponse> getAvatarPath(Long id) {
      User user = userRepository.findById(id)
              .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
      if (user.getAvatarUrl() == null) {
          throw new UserNotFoundException("Avatar not found for user with id: " + id);
      }
      for (String ext : List.of("jpg", "png", "gif", "webp")) {
          try {
              return s3Client.getObject(builder -> builder.bucket(avatarS3Bucket).key(id + "." + ext).build());
          } catch (software.amazon.awssdk.services.s3.model.NoSuchKeyException ignored) {

          }
      }
      throw new UserNotFoundException("Avatar file missing for user with id: " + id);
  }

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDTO createUser(UserDTO userDTO) {
        log.info("Creating user with username: {}", userDTO.getUsername());

        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists: " + userDTO.getUsername());
        }

        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists: " + userDTO.getEmail());
        }

        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setFullName(userDTO.getFullName());
        user.setBio(userDTO.getBio());

        User savedUser = userRepository.save(user);
        log.info("User created successfully with id: {}", savedUser.getId());

        return mapToDTO(savedUser);
    }

    public UserDTO getUserById(Long id) {
        log.info("Fetching user with id: {}", id);
        User user =
                userRepository
                        .findById(id)
                        .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        return mapToDTO(user);
    }

    public UserDTO getUserByUsername(String username) {
        log.info("Fetching user with username: {}", username);
        User user =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(
                                () -> new UserNotFoundException("User not found with username: " + username));
        return mapToDTO(user);
    }

    public List<UserDTO> getAllUsers() {
        log.info("Fetching all users");
        return userRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public UserDTO updateUser(Long id, UserDTO userDTO) {
        log.info("Updating user with id: {}", id);
        User user =
                userRepository
                        .findById(id)
                        .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));

        if (userDTO.getFullName() != null) {
            user.setFullName(userDTO.getFullName());
        }
        if (userDTO.getBio() != null) {
            user.setBio(userDTO.getBio());
        }

        User updatedUser = userRepository.save(user);
        log.info("User updated successfully with id: {}", id);

        return mapToDTO(updatedUser);
    }

    public void deleteUser(Long id) {
        log.info("Deleting user with id: {}", id);
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
        log.info("User deleted successfully with id: {}", id);
    }

    private UserDTO mapToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setBio(user.getBio());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setPostCount(user.getPostCount());
        dto.setAvatarUrl(user.getAvatarUrl());
        return dto;
    }
}
