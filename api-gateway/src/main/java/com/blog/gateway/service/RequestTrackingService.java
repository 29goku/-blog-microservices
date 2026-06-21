package com.blog.gateway.service;

import com.blog.gateway.model.RequestMetadata;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;

@Service
public class RequestTrackingService {
    private static final int MAX_REQUESTS = 100;
    private final Deque<RequestMetadata> requestHistory = new ConcurrentLinkedDeque<>();
    private final Map<String, Long> requestStartTimes = new HashMap<>();

    public String recordRequestStart(String method, String path) {
        String requestId = UUID.randomUUID().toString();
        requestStartTimes.put(requestId, System.currentTimeMillis());
        return requestId;
    }

    public void recordRequestEnd(String requestId, String method, String path, String targetService, int statusCode, List<String> filesInvolved) {
        Long startTime = requestStartTimes.remove(requestId);
        long duration = startTime != null ? System.currentTimeMillis() - startTime : 0;

        RequestMetadata metadata = new RequestMetadata(requestId, method, path, targetService, LocalDateTime.now());
        metadata.setDuration(duration);
        metadata.setStatusCode(statusCode);
        metadata.setFilesInvolved(filesInvolved);

        requestHistory.addFirst(metadata);
        if (requestHistory.size() > MAX_REQUESTS) {
            requestHistory.removeLast();
        }
    }

    public List<RequestMetadata> getRecentRequests(int limit) {
        return requestHistory.stream()
                .limit(limit)
                .toList();
    }

    public List<RequestMetadata> getAllRequests() {
        return new ArrayList<>(requestHistory);
    }

    public void clearHistory() {
        requestHistory.clear();
        requestStartTimes.clear();
    }
}
