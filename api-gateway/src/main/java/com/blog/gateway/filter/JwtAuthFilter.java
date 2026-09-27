package com.blog.gateway.filter;

import com.blog.gateway.security.JwtVerifier;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.PriorityOrdered;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;


@Component
public class JwtAuthFilter extends AbstractGatewayFilterFactory<Object> {

    private final PriorityOrdered priorityOrdered;

    public JwtAuthFilter(PriorityOrdered priorityOrdered) {
        this.priorityOrdered = priorityOrdered;
    }

    @Override
    public GatewayFilter apply(Object config) {
        return (exchange, chain) -> {
            // Implement JWT authentication logic here
            // For example, you can extract the JWT token from the Authorization header,
            // validate it, and set the authentication in the SecurityContext if valid.

            ServerHttpRequest request = exchange.getRequest();
            String path = request.getPath().value();
            HttpMethod method = request.getMethod();
            if (isPublic(path, method)) {
                return chain.filter(exchange);
            }
            String authHeader = request.getHeaders().getFirst("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return unautorized(exchange);
            }
            try {
                Claims claims = JwtVerifier.verify(authHeader.substring(7));
                ServerHttpRequest mutatedRequest = request.mutate()
                        .header("X-User-Id", claims.get("userId").toString())
                        .header("X-Username", claims.getSubject())
                        .build();
                return chain.filter(exchange.mutate().request(mutatedRequest).build());
            } catch (JwtException e) {
                return unautorized(exchange);
            }
        };
    }

    private boolean isPublic(String path, HttpMethod method) {
        if (path.startsWith("/api/auth/") || path.startsWith(("/actuators"))) {
            return true;
        }
        boolean isGet = method == HttpMethod.GET;
        return isGet && (path.startsWith("/api/posts") || path.startsWith("/api/tags") || path.startsWith("/api/comments") || path.startsWith("/api/likedislike"));

    }

    private Mono<Void> unautorized(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

}
