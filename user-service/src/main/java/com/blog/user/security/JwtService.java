package com.blog.user.security;

import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Service
public class JwtService {
    private final SecretKey key;
    private final long expirationsMs;
    public JwtService(@Value("${jwt.secret}") String secret, @Value("${jwt.expirationMs}") long expirationMs) {
        this.key= Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationsMs=expirationMs;
    }
}
