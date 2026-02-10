package com.communityhub.repository;

import com.communityhub.model.GroupChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupChatMessageRepository extends JpaRepository<GroupChatMessage, Long> {
    Page<GroupChatMessage> findByGroupChatIdAndIsDeletedFalse(Long groupChatId, Pageable pageable);
    
    @Query("SELECT COUNT(gcm) FROM GroupChatMessage gcm WHERE gcm.groupChat.community.id = :communityId")
    long countByCommunityId(@Param("communityId") Long communityId);
}
