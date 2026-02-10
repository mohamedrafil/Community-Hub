package com.communityhub.repository;

import com.communityhub.model.Invite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InviteRepository extends JpaRepository<Invite, Long> {
    Optional<Invite> findByInviteToken(String inviteToken);
    List<Invite> findByCommunityId(Long communityId);
    List<Invite> findByEmailAndIsUsedFalseAndIsExpiredFalse(String email);
}
