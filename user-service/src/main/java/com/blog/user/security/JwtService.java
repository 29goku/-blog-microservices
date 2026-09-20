package com.blog.user.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey key;
    private final long expirationsMs;
    public JwtService(@Value("${jwt.secret}") String secret, @Value("${jwt.expiration-ms}") long expirationMs) {
        this.key= Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationsMs=expirationMs;
    }
    public String generateToken(Long userId, String username){
        return Jwts.builder().subject(username)
                .claim("userId",userId).issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationsMs))
                .signWith(key)
                .compact();
    }
}
