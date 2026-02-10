package com.communityhub.repository;

import com.communityhub.model.DMMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DMMessageRepository extends JpaRepository<DMMessage, Long> {
    
    @Query("SELECT m FROM DMMessage m WHERE " +
           "((m.sender.id = :userId1 AND m.receiver.id = :userId2) OR " +
           "(m.sender.id = :userId2 AND m.receiver.id = :userId1)) " +
           "AND m.isDeleted = false ORDER BY m.createdAt DESC")
    Page<DMMessage> findConversation(Long userId1, Long userId2, Pageable pageable);
    
    @Query("SELECT DISTINCT CASE " +
           "WHEN m.sender.id = :userId THEN m.receiver " +
           "ELSE m.sender END " +
           "FROM DMMessage m " +
           "WHERE (m.sender.id = :userId OR m.receiver.id = :userId) " +
           "AND m.community.id = :communityId " +
           "AND m.isDeleted = false")
    List<Object> findConversationParticipants(Long userId, Long communityId);
    
    @Query("SELECT m FROM DMMessage m WHERE " +
           "((m.sender.id = :userId1 AND m.receiver.id = :userId2) OR " +
           "(m.sender.id = :userId2 AND m.receiver.id = :userId1)) " +
           "AND m.isDeleted = false ORDER BY m.createdAt DESC")
    List<DMMessage> findTopByUsersOrderByCreatedAtDesc(Long userId1, Long userId2);
    
    Long countByReceiverIdAndIsReadFalseAndIsDeletedFalse(Long receiverId);
    
    Long countBySenderIdAndReceiverIdAndIsReadFalseAndIsDeletedFalse(Long senderId, Long receiverId);
}
