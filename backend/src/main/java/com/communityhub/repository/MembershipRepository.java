package com.communityhub.repository;

import com.communityhub.model.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, Long> {
    List<Membership> findByUserId(Long userId);
    List<Membership> findByCommunityId(Long communityId);
    Optional<Membership> findByUserIdAndCommunityId(Long userId, Long communityId);
    Boolean existsByUserIdAndCommunityId(Long userId, Long communityId);
}
