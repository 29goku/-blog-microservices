package com.blog.comment.config;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

public class RenderDatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String PROPERTY_SOURCE_NAME = "renderDatabaseUrl";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String raw = firstNonBlank(
                environment.getProperty("DATABASE_URL"),
                environment.getProperty("DB_URL"),
                environment.getProperty("SPRING_DATASOURCE_URL"),
                environment.getProperty("spring.datasource.url"));
        if (raw == null) return;

        String uriStr = raw.startsWith("jdbc:") ? raw.substring("jdbc:".length()) : raw;
        if (!(uriStr.startsWith("postgres://") || uriStr.startsWith("postgresql://"))) return;

        URI uri;
        try { uri = URI.create(uriStr); } catch (IllegalArgumentException ex) { return; }
        if (uri.getHost() == null) return;

        String userInfo = uri.getUserInfo();
        String username = null;
        String password = null;
        if (userInfo != null) {
            int colon = userInfo.indexOf(':');
            if (colon >= 0) { username = userInfo.substring(0, colon); password = userInfo.substring(colon + 1); }
            else { username = userInfo; password = ""; }
        }

        int port = uri.getPort() > 0 ? uri.getPort() : 5432;
        String path = uri.getPath() == null ? "" : uri.getPath();
        String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + path
                + (uri.getRawQuery() != null ? "?" + uri.getRawQuery() : "");

        Map<String, Object> props = new HashMap<>();
        props.put("spring.datasource.url", jdbcUrl);
        if (username != null) {
            props.put("spring.datasource.username", username);
            props.put("spring.datasource.password", password);
        }
        props.put("spring.datasource.driver-class-name", "org.postgresql.Driver");

        environment.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE_NAME, props));
    }

    private static String firstNonBlank(String... values) {
        if (values == null) return null;
        for (String v : values) if (v != null && !v.isBlank()) return v;
        return null;
    }
}

