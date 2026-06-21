package com.blog.post.client;

import com.blog.post.dto.UserDTO;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", url = "${user-service.url:}", path = "/api/users")
public interface UserServiceClient {

    @GetMapping("/{id}")
    @CircuitBreaker(name = "user-service", fallbackMethod = "getUserByIdFallback")
    UserDTO getUserById(@PathVariable("id") Long id);

    @GetMapping("/username/{username}")
    @CircuitBreaker(name = "user-service", fallbackMethod = "getUserByUsernameFallback")
    UserDTO getUserByUsername(@PathVariable("username") String username);

    default UserDTO getUserByIdFallback(Long id, Exception ex) {
        return new UserDTO(id, "Unknown", "fallback@example.com", "Fallback User");
    }

    default UserDTO getUserByUsernameFallback(String username, Exception ex) {
        return new UserDTO(null, username, "fallback@example.com", "Fallback User");
    }
}
