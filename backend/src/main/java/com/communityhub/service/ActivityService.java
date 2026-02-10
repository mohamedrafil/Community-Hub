package com.communityhub.service;

import com.communityhub.dto.ActivityDTO;
import com.communityhub.model.Activity;
import com.communityhub.model.Community;
import com.communityhub.model.User;
import com.communityhub.repository.ActivityRepository;
import com.communityhub.repository.CommunityRepository;
import com.communityhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityService {
    
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;
    
    @Transactional
    @SuppressWarnings("null")
    public void logActivity(Long userId, Long communityId, String activityType, String description, String metadata) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new RuntimeException("Community not found"));
        
        Activity activity = new Activity();
        activity.setUser(user);
        activity.setCommunity(community);
        activity.setActivityType(activityType);
        activity.setDescription(description);
        activity.setMetadata(metadata);
        
        activityRepository.save(activity);
    }
    
    public List<ActivityDTO> getUserActivities(Long userId, Long communityId, int limit) {
        List<Activity> activities = activityRepository.findByUserIdAndCommunityIdOrderByTimestampDesc(
                userId, communityId, PageRequest.of(0, limit)
        );
        
        return activities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<ActivityDTO> getCommunityActivities(Long communityId, int limit) {
        List<Activity> activities = activityRepository.findByCommunityIdOrderByTimestampDesc(
                communityId, PageRequest.of(0, limit)
        );
        
        return activities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private ActivityDTO convertToDTO(Activity activity) {
        ActivityDTO dto = new ActivityDTO();
        dto.setId(activity.getId());
        dto.setActivityType(activity.getActivityType());
        dto.setDescription(activity.getDescription());
        dto.setUserId(activity.getUser().getId());
        dto.setUserName(activity.getUser().getFullName());
        dto.setTimestamp(activity.getTimestamp());
        dto.setMetadata(activity.getMetadata());
        return dto;
    }
}
