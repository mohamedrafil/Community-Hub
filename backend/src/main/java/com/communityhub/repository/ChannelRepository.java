package com.communityhub.repository;

import com.communityhub.model.Channel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChannelRepository extends JpaRepository<Channel, Long> {
    List<Channel> findByCommunityIdAndIsActiveTrue(Long communityId);
}
