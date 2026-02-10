package com.communityhub.repository;

import com.communityhub.model.JoinRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JoinRequestRepository extends JpaRepository<JoinRequest, Long> {
    List<JoinRequest> findByCommunityIdAndStatus(Long communityId, JoinRequest.RequestStatus status);
    Optional<JoinRequest> findByUserIdAndCommunityIdAndStatus(Long userId, Long communityId, JoinRequest.RequestStatus status);
}
