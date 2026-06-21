package com.blog.gateway.model;

import java.time.LocalDateTime;
import java.util.List;

public class RequestMetadata {
    private String id;
    private String method;
    private String path;
    private String targetService;
    private LocalDateTime timestamp;
    private long duration;
    private int statusCode;
    private List<String> filesInvolved;

    public RequestMetadata() {
    }

    public RequestMetadata(String id, String method, String path, String targetService, LocalDateTime timestamp) {
        this.id = id;
        this.method = method;
        this.path = path;
        this.targetService = targetService;
        this.timestamp = timestamp;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getTargetService() {
        return targetService;
    }

    public void setTargetService(String targetService) {
        this.targetService = targetService;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public long getDuration() {
        return duration;
    }

    public void setDuration(long duration) {
        this.duration = duration;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(int statusCode) {
        this.statusCode = statusCode;
    }

    public List<String> getFilesInvolved() {
        return filesInvolved;
    }

    public void setFilesInvolved(List<String> filesInvolved) {
        this.filesInvolved = filesInvolved;
    }
}
