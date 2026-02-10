package com.communityhub.controller;

import com.communityhub.dto.CommunityStatsDTO;
import com.communityhub.dto.GlobalStatsDTO;
import com.communityhub.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class StatisticsController {
    
    private final StatisticsService statisticsService;
    
    @GetMapping("/global")
    public ResponseEntity<GlobalStatsDTO> getGlobalStats() {
        GlobalStatsDTO stats = statisticsService.getGlobalStats();
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/communities/{communityId}")
    public ResponseEntity<CommunityStatsDTO> getCommunityStats(@PathVariable Long communityId) {
        CommunityStatsDTO stats = statisticsService.getCommunityStats(communityId);
        return ResponseEntity.ok(stats);
    }
}
