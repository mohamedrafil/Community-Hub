package com.communityhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class CommunityHubApplication {
    public static void main(String[] args) {
        SpringApplication.run(CommunityHubApplication.class, args);
    }
}
