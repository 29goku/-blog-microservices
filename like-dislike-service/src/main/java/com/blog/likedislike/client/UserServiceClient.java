package com.blog.likedislike.client;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", path = "/api/users")
public interface UserServiceClient {

    @GetMapping("/{id}")
    @CircuitBreaker(name = "user-service", fallbackMethod="getUsersByIdFallback")
    Object getUserById(@PathVariable("id") Long id);

    default Object getUsersByIdFallback(Long id) {
        return null;
    }
}
