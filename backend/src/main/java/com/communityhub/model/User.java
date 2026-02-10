package com.communityhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users",
    indexes = {
        @Index(name = "idx_user_email", columnList = "email"),
        @Index(name = "idx_user_last_login", columnList = "last_login_at")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    private String department;
    
    private String phoneNumber;
    
    @Column(length = 1000)
    private String bio;
    
    private String profileImageUrl;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @Column(nullable = false)
    private Boolean emailVerified = false;
    
    private String verificationToken;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    private LocalDateTime lastLoginAt;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<Membership> memberships = new HashSet<>();
    
    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL)
    private Set<DMMessage> sentMessages = new HashSet<>();
    
    @OneToMany(mappedBy = "receiver", cascade = CascadeType.ALL)
    private Set<DMMessage> receivedMessages = new HashSet<>();
    
    public String getFullName() {
        return firstName + " " + lastName;
    }
}
