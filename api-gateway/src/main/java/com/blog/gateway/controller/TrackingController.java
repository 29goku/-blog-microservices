package com.blog.gateway.controller;

import com.blog.gateway.model.RequestMetadata;
import com.blog.gateway.service.RequestTrackingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tracking")
@CrossOrigin(origins = "*")
public class TrackingController {
    private final RequestTrackingService trackingService;

    public TrackingController(RequestTrackingService trackingService) {
        this.trackingService = trackingService;
    }

    @GetMapping("/requests")
    public ResponseEntity<List<RequestMetadata>> getRecentRequests(
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(trackingService.getRecentRequests(limit));
    }

    @GetMapping("/requests/all")
    public ResponseEntity<List<RequestMetadata>> getAllRequests() {
        return ResponseEntity.ok(trackingService.getAllRequests());
    }

    @DeleteMapping("/history")
    public ResponseEntity<String> clearHistory() {
        trackingService.clearHistory();
        return ResponseEntity.ok("Request history cleared");
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Request tracking service is running");
    }
}
