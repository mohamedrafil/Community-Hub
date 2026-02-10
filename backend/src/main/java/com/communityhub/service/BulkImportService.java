package com.communityhub.service;

import com.communityhub.model.Membership;
import com.communityhub.model.User;
import com.communityhub.repository.UserRepository;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BulkImportService {
    
    private final UserRepository userRepository;
    private final InviteService inviteService;
    
    public static class BulkImportResult {
        public int totalRows;
        public int successCount;
        public int failureCount;
        public List<String> errors = new ArrayList<>();
        
        public void addError(String error) {
            errors.add(error);
            failureCount++;
        }
    }
    
    public BulkImportResult importFromExcel(MultipartFile file, com.communityhub.model.Community community, User invitedBy) throws IOException {
        BulkImportResult result = new BulkImportResult();
        
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
            // Skip header row
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                result.totalRows++;
                
                try {
                    // Extract cell values
                    getCellValue(row.getCell(0)); // firstName
                    getCellValue(row.getCell(1)); // lastName
                    String email = getCellValue(row.getCell(2));
                    getCellValue(row.getCell(3)); // department
                    String roleStr = getCellValue(row.getCell(4));
                    
                    if (email == null || email.isEmpty()) {
                        result.addError("Row " + (i + 1) + ": Email is required");
                        continue;
                    }
                    
                    // Check if user already exists in community
                    if (userRepository.findByEmail(email).isPresent()) {
                        result.addError("Row " + (i + 1) + ": User already registered");
                        continue;
                    }
                    
                    Membership.RoleType roleType = Membership.RoleType.MEMBER;
                    if (roleStr != null && !roleStr.isEmpty()) {
                        try {
                            roleType = Membership.RoleType.valueOf(roleStr.toUpperCase());
                        } catch (IllegalArgumentException e) {
                            result.addError("Row " + (i + 1) + ": Invalid role type");
                            continue;
                        }
                    }
                    
                    // Create invite
                    inviteService.createInvite(community, email, invitedBy, roleType);
                    result.successCount++;
                    
                } catch (Exception e) {
                    result.addError("Row " + (i + 1) + ": " + e.getMessage());
                }
            }
        }
        
        return result;
    }
    
    public BulkImportResult importFromCSV(MultipartFile file, com.communityhub.model.Community community, User invitedBy) throws IOException, CsvException {
        BulkImportResult result = new BulkImportResult();
        
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            List<String[]> rows = reader.readAll();
            
            // Skip header
            for (int i = 1; i < rows.size(); i++) {
                String[] row = rows.get(i);
                result.totalRows++;
                
                try {
                    if (row.length < 3) {
                        result.addError("Row " + (i + 1) + ": Insufficient columns");
                        continue;
                    }
                    
                    // Extract values
                    // firstName = row[0];
                    // lastName = row[1];
                    String email = row[2];
                    // department = row.length > 3 ? row[3] : null;
                    String roleStr = row.length > 4 ? row[4] : "MEMBER";
                    
                    if (email == null || email.isEmpty()) {
                        result.addError("Row " + (i + 1) + ": Email is required");
                        continue;
                    }
                    
                    if (userRepository.findByEmail(email).isPresent()) {
                        result.addError("Row " + (i + 1) + ": User already registered");
                        continue;
                    }
                    
                    Membership.RoleType roleType = Membership.RoleType.MEMBER;
                    try {
                        roleType = Membership.RoleType.valueOf(roleStr.toUpperCase());
                    } catch (IllegalArgumentException e) {
                        result.addError("Row " + (i + 1) + ": Invalid role type");
                        continue;
                    }
                    
                    inviteService.createInvite(community, email, invitedBy, roleType);
                    result.successCount++;
                    
                } catch (Exception e) {
                    result.addError("Row " + (i + 1) + ": " + e.getMessage());
                }
            }
        }
        
        return result;
    }
    
    private String getCellValue(Cell cell) {
        if (cell == null) return null;
        
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> null;
        };
    }
}
