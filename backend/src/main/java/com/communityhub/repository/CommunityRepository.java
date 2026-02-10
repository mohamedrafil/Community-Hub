package com.communityhub.repository;

import com.communityhub.model.Community;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommunityRepository extends JpaRepository<Community, Long> {
    Optional<Community> findByJoinCode(String joinCode);
    
    @Modifying
    @Query(value = "DELETE FROM activities WHERE community_id = :communityId", nativeQuery = true)
    void deleteActivitiesByCommunityId(@Param("communityId") Long communityId);
    
    @Modifying
    @Query(value = "DELETE FROM dm_messages WHERE community_id = :communityId", nativeQuery = true)
    void deleteDmMessagesByCommunityId(@Param("communityId") Long communityId);
    
    @Modifying
    @Query(value = "DELETE FROM invites WHERE community_id = :communityId", nativeQuery = true)
    void deleteInvitesByCommunityId(@Param("communityId") Long communityId);
    
    @Modifying
    @Query(value = "DELETE FROM join_requests WHERE community_id = :communityId", nativeQuery = true)
    void deleteJoinRequestsByCommunityId(@Param("communityId") Long communityId);
    
    @Modifying
    @Query(value = "DELETE FROM announcements WHERE community_id = :communityId", nativeQuery = true)
    void deleteAnnouncementsByCommunityId(@Param("communityId") Long communityId);
    
    @Modifying
    @Query(value = "DELETE FROM group_chats WHERE community_id = :communityId", nativeQuery = true)
    void deleteGroupChatsByCommunityId(@Param("communityId") Long communityId);
    
    @Modifying
    @Query(value = "DELETE FROM channels WHERE community_id = :communityId", nativeQuery = true)
    void deleteChannelsByCommunityId(@Param("communityId") Long communityId);
    
    @Modifying
    @Query(value = "DELETE FROM memberships WHERE community_id = :communityId", nativeQuery = true)
    void deleteMembershipsByCommunityId(@Param("communityId") Long communityId);
}
