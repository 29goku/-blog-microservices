package com.blog.tag.dto;

import jakarta.validation.constraints.NotBlank;

public class TagDto {
    private Long id;

    @NotBlank
    private String name;

    private String description;

    private String color;

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;

    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public String getColor() {
        return color;

    }
    public void setColor(String color) {

        this.color = color;
    }



}
