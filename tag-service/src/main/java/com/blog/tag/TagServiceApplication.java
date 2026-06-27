package com.blog.tag;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class TagServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(TagServiceApplication.class, args);
    }
}
