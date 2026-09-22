package com.replaylab.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ReplayAttackDefenseApplication {
    public static void main(String[] args) {
        SpringApplication.run(ReplayAttackDefenseApplication.class, args);
    }
}
