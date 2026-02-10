package com.communityhub.repository;

import com.communityhub.model.ModeratorPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ModeratorPermissionRepository extends JpaRepository<ModeratorPermission, Long> {
}
