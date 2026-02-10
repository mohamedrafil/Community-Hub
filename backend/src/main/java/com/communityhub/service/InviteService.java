package com.communityhub.service;

import com.communityhub.model.*;
import com.communityhub.repository.InviteRepository;
import com.communityhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InviteService {
    
    private final InviteRepository inviteRepository;
    private final UserRepository userRepository;
    private final MembershipService membershipService;
    private final JavaMailSender mailSender;
    
    @Transactional
    public Invite createInvite(Community community, String email, User invitedBy, Membership.RoleType roleType) {
        // Check if user already exists and is a member
        userRepository.findByEmail(email).ifPresent(existingUser -> {
            if (membershipService.isMember(existingUser.getId(), community.getId())) {
                throw new RuntimeException("User is already a member of this community");
            }
        });
        
        // Check if there's already a pending invite for this email in this community
        List<Invite> existingInvites = inviteRepository.findByEmailAndIsUsedFalseAndIsExpiredFalse(email);
        for (Invite existingInvite : existingInvites) {
            if (existingInvite.getCommunity().getId().equals(community.getId())) {
                throw new RuntimeException("An invitation has already been sent to this email address");
            }
        }
        
        Invite invite = new Invite();
        invite.setCommunity(community);
        invite.setEmail(email);
        invite.setInvitedBy(invitedBy);
        invite.setRoleType(roleType);
        invite.setInviteToken(UUID.randomUUID().toString());
        invite.setExpiresAt(LocalDateTime.now().plusDays(7));
        
        Invite savedInvite = inviteRepository.save(invite);
        
        // Send invitation email
        sendInviteEmail(savedInvite);
        
        return savedInvite;
    }
    
    private void sendInviteEmail(Invite invite) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(invite.getEmail());
            message.setSubject("Invitation to join " + invite.getCommunity().getName());
            message.setText(String.format(
                    "You have been invited to join %s on Community Hub.\n\n" +
                    "Click the link below to accept the invitation:\n" +
                    "http://localhost:3000/register?invite=%s\n\n" +
                    "This invitation will expire in 7 days.",
                    invite.getCommunity().getName(),
                    invite.getInviteToken()
            ));
            
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send invite email: " + e.getMessage());
        }
    }
    
    public List<Invite> getCommunityInvites(Long communityId) {
        return inviteRepository.findByCommunityId(communityId);
    }
    
    public List<Invite> getUserInvites(String email) {
        return inviteRepository.findByEmailAndIsUsedFalseAndIsExpiredFalse(email);
    }
    
    @Transactional
    public void acceptInvite(String token, User user) {
        Invite invite = inviteRepository.findByInviteToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid invitation token"));
        
        if (invite.getIsUsed()) {
            throw new RuntimeException("This invitation has already been used");
        }
        
        if (invite.getIsExpired() || invite.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("This invitation has expired");
        }
        
        if (!invite.getEmail().equalsIgnoreCase(user.getEmail())) {
            throw new RuntimeException("This invitation is not for your email address");
        }
        
        // Check if user is already a member
        if (membershipService.isMember(user.getId(), invite.getCommunity().getId())) {
            throw new RuntimeException("You are already a member of this community");
        }
        
        // Create membership
        membershipService.createMembership(user, invite.getCommunity(), invite.getRoleType());
        
        // Mark invite as used
        invite.setIsUsed(true);
        invite.setUsedAt(LocalDateTime.now());
        inviteRepository.save(invite);
    }
}
