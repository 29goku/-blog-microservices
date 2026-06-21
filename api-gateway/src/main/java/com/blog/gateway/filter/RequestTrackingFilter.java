package com.blog.gateway.filter;

import com.blog.gateway.service.RequestTrackingService;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

@Component
public class RequestTrackingFilter extends AbstractGatewayFilterFactory<Object> {
    private final RequestTrackingService trackingService;

    public RequestTrackingFilter(RequestTrackingService trackingService) {
        this.trackingService = trackingService;
    }

    @Override
    public GatewayFilter apply(Object config) {
        return (exchange, chain) -> {
            String method = exchange.getRequest().getMethod().name();
            String rawPath = exchange.getRequest().getPath().value();
            String path = rawPath.split("\\?")[0];

            if (!path.startsWith("/api/tracking")) {
                String requestId = trackingService.recordRequestStart(method, path);
                exchange.getAttributes().put("requestId", requestId);

                return chain.filter(exchange).doFinally(signalType -> {
                    String targetService = resolveTargetService(path);
                    int statusCode = exchange.getResponse().getStatusCode() != null ?
                        exchange.getResponse().getStatusCode().value() : 0;
                    List<String> filesInvolved = getFilesForPath(method, path, targetService);

                    trackingService.recordRequestEnd(requestId, method, path, targetService, statusCode, filesInvolved);
                });
            }

            return chain.filter(exchange);
        };
    }

    private String resolveTargetService(String path) {
        if (path.startsWith("/api/users")) return "user-service (8081)";
        if (path.startsWith("/api/posts")) return "post-service (8082)";
        if (path.startsWith("/api/comments")) return "comment-service (8083)";
        if (path.startsWith("/api/likedislike")) return "like-dislike-service (8084)";
        return "unknown";
    }

    private List<String> getFilesForPath(String method, String path, String targetService) {
        if (path.startsWith("/api/users")) {
            return Arrays.asList(
                "UserController.java",
                "UserService.java",
                "UserRepository.java",
                "User.java"
            );
        }
        if (path.startsWith("/api/posts")) {
            return Arrays.asList(
                "PostController.java",
                "PostService.java",
                "PostRepository.java",
                "Post.java"
            );
        }
        if (path.startsWith("/api/comments")) {
            return Arrays.asList(
                "CommentController.java",
                "CommentService.java",
                "CommentRepository.java",
                "Comment.java"
            );
        }
        if (path.startsWith("/api/likedislike")) {
            return Arrays.asList(
                "LikeDislikeController.java",
                "LikeDislikeService.java",
                "LikeDislikeRepository.java",
                "LikeDislike.java"
            );
        }
        return Arrays.asList();
    }
}
