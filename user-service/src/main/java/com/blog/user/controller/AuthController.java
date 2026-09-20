package com.blog.user.controller;

import com.blog.user.dto.LoginRequest;
import com.blog.user.dto.LoginResponse;
import com.blog.user.entity.User;
import com.blog.user.exception.BadCredentialsException;
import com.blog.user.repository.UserRepository;
import com.blog.user.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final PasswordEncoder passwordEncoder;
  private final UserRepository userRepository;
  private final JwtService jwtService;

  public AuthController(PasswordEncoder passwordEncoder, UserRepository userRepository, JwtService jwtService) {
    this.passwordEncoder = passwordEncoder;
    this.userRepository = userRepository;
    this.jwtService = jwtService;
  }

  @PostMapping("/login")
  public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
    User user = userRepository.findByUsername(req.getUsername())
            .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));
    if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
      throw new BadCredentialsException("Invalid username or password");
    }
    String token = jwtService.generateToken(user.getId(), user.getUsername());
    return ResponseEntity.ok(new LoginResponse(token, user.getId(), user.getUsername()));
  }
}
