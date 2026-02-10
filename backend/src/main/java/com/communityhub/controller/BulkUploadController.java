package com.communityhub.controller;

import com.communityhub.model.Community;
import com.communityhub.model.User;
import com.communityhub.repository.CommunityRepository;
import com.communityhub.repository.UserRepository;
import com.communityhub.service.BulkImportService;
import com.communityhub.service.MembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/communities/{communityId}/bulk-upload")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class BulkUploadController {
    
    private final BulkImportService bulkImportService;
    private final MembershipService membershipService;
    private final CommunityRepository communityRepository;
    private final UserRepository userRepository;
    
    @PostMapping
    @SuppressWarnings("null")
    public ResponseEntity<Map<String, Object>> uploadBulkFile(
            @PathVariable Long communityId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        // Check if user is administrator or moderator
        if (!membershipService.isAdminOrModerator(user.getId(), communityId)) {
            return ResponseEntity.status(403).body(
                Map.of("message", "Only administrators and moderators can perform bulk uploads")
            );
        }
        
        try {
            Community community = communityRepository.findById(communityId)
                    .orElseThrow(() -> new RuntimeException("Community not found"));
            
            String filename = file.getOriginalFilename();
            BulkImportService.BulkImportResult result;
            
            if (filename != null && filename.endsWith(".csv")) {
                result = bulkImportService.importFromCSV(file, community, user);
            } else if (filename != null && (filename.endsWith(".xlsx") || filename.endsWith(".xls"))) {
                result = bulkImportService.importFromExcel(file, community, user);
            } else {
                return ResponseEntity.badRequest().body(
                    Map.of("message", "Invalid file format. Only CSV and Excel files are supported")
                );
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalRows", result.totalRows);
            response.put("successCount", result.successCount);
            response.put("failureCount", result.failureCount);
            response.put("errors", result.errors);
            response.put("message", String.format("Processed %d rows: %d successful, %d failed", 
                    result.totalRows, result.successCount, result.failureCount));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Failed to process bulk upload: " + e.getMessage())
            );
        }
    }
    
    @GetMapping("/template")
    public ResponseEntity<Resource> downloadTemplate() {
        try {
            // Return the template file from resources or create dynamically
            Resource resource = new ClassPathResource("templates/bulk-upload-template.csv");
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bulk-upload-template.csv")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(resource);
        } catch (Exception e) {
            // Return empty response if template can't be loaded
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getUploadHistory(
            @PathVariable Long communityId,
            Authentication authentication) {
        
        User user = getUserFromAuthentication(authentication);
        
        // Check if user is member of the community
        if (!membershipService.isMember(user.getId(), communityId)) {
            return ResponseEntity.status(403).build();
        }
        
        // TO DO: Implement upload history tracking
        // For now, return empty history
        Map<String, Object> response = new HashMap<>();
        response.put("history", new Object[0]);
        response.put("message", "Upload history not yet implemented");
        
        return ResponseEntity.ok(response);
    }
    
    private User getUserFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
