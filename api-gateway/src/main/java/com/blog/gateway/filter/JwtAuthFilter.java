package com.blog.gateway.filter;
import org.springframework.cloud.gateway.filter.GatewayFilter;

import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.stereotype.Component;

@Component
public class JwtAuthFilter extends AbstractGatewayFilterFactory<Object> {

  @Override
  public GatewayFilter apply(Object config) {
    return (exchange, chain) -> {
      // Implement JWT authentication logic here
      // For example, you can extract the JWT token from the Authorization header,
      // validate it, and set the authentication in the SecurityContext if valid.

      return chain.filter(exchange);
    };
  }

}
