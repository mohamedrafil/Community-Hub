package com.communityhub.repository;

import com.communityhub.model.Activity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByUserIdAndCommunityIdOrderByTimestampDesc(Long userId, Long communityId, Pageable pageable);
    List<Activity> findByCommunityIdOrderByTimestampDesc(Long communityId, Pageable pageable);
}
