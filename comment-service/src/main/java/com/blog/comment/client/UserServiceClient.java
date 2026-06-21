package com.blog.comment.client;

import com.blog.comment.dto.UserDTO;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", url = "${user-service.url:}", path = "/api/users")
public interface UserServiceClient {

    @GetMapping("/{id}")
    @CircuitBreaker(name = "user-service", fallbackMethod = "getUserByIdFallback")
    UserDTO getUserById(@PathVariable("id") Long id);

    default UserDTO getUserByIdFallback(Long id, Exception ex) {
        return new UserDTO(id, "Unknown", "fallback@example.com", "Fallback User");
    }
}
