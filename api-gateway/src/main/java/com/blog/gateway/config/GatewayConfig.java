package com.blog.gateway.config;

import com.blog.gateway.filter.RequestTrackingFilter;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.OrderedGatewayFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

/**
 * Routes themselves are defined in {@code application.yml} so they can be
 * overridden by environment variables (e.g. when deploying to Render where
 * each microservice lives at its own public HTTPS host instead of being
 * resolved via Eureka).  This class only wires up cross-cutting concerns:
 * a global request-tracking filter and CORS.
 */
@Configuration
public class GatewayConfig {

    @Bean
    public GlobalFilter trackingGlobalFilter(RequestTrackingFilter requestTrackingFilter) {
        var delegate = new OrderedGatewayFilter(
                requestTrackingFilter.apply(new Object()),
                Ordered.HIGHEST_PRECEDENCE);
        return delegate::filter;
    }

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowCredentials(true);
        // Allow local dev and any *.vercel.app deployment of the frontend.
        corsConfig.addAllowedOriginPattern("http://localhost:*");
        corsConfig.addAllowedOriginPattern("https://*.vercel.app");
        corsConfig.addAllowedHeader("*");
        corsConfig.addAllowedMethod("*");
        corsConfig.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}


