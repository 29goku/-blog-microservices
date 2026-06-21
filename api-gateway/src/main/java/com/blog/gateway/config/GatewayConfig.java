package com.blog.gateway.config;

import com.blog.gateway.filter.RequestTrackingFilter;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {
    private final RequestTrackingFilter requestTrackingFilter;

    public GatewayConfig(RequestTrackingFilter requestTrackingFilter) {
        this.requestTrackingFilter = requestTrackingFilter;
    }

    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {
        GatewayFilter trackingFilter = requestTrackingFilter.apply(new Object());
        return builder.routes()
                .route("user-service", r -> r.path("/api/users/**")
                        .filters(f -> f.filter(trackingFilter))
                        .uri("lb://user-service"))
                .route("post-service", r -> r.path("/api/posts/**")
                        .filters(f -> f.filter(trackingFilter))
                        .uri("lb://post-service"))
                .route("comment-service", r -> r.path("/api/comments/**")
                        .filters(f -> f.filter(trackingFilter))
                        .uri("lb://comment-service"))
                .route("like-dislike-service", r -> r.path("/api/likedislike/**")
                        .filters(f -> f.filter(trackingFilter))
                        .uri("lb://like-dislike-service"))
                .build();
    }

}
