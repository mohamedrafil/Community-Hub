package com.communityhub.repository;

import com.communityhub.model.GroupChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupChatRepository extends JpaRepository<GroupChat, Long> {
    List<GroupChat> findByCommunityIdAndIsActiveTrue(Long communityId);
    
    @Query("SELECT g FROM GroupChat g JOIN g.members m WHERE m.id = :userId AND g.isActive = true")
    List<GroupChat> findByMemberId(Long userId);
}
