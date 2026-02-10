package com.communityhub.repository;

import com.communityhub.model.ChannelMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChannelMessageRepository extends JpaRepository<ChannelMessage, Long> {
    Page<ChannelMessage> findByChannelIdAndIsDeletedFalse(Long channelId, Pageable pageable);
    
    @Query("SELECT COUNT(cm) FROM ChannelMessage cm WHERE cm.channel.community.id = :communityId")
    long countByCommunityId(@Param("communityId") Long communityId);
}
