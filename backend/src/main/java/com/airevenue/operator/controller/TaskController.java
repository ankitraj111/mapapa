package com.airevenue.operator.controller;

import com.airevenue.operator.config.JwtPrincipal;
import com.airevenue.operator.domain.enums.TaskPriority;
import com.airevenue.operator.domain.enums.TaskStatus;
import com.airevenue.operator.domain.model.Task;
import com.airevenue.operator.dto.request.CreateTaskRequest;
import com.airevenue.operator.dto.response.TaskResponse;
import com.airevenue.operator.exception.ResourceNotFoundException;
import com.airevenue.operator.repository.LeadRepository;
import com.airevenue.operator.repository.TaskRepository;
import com.airevenue.operator.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskRepository taskRepo;
    private final LeadRepository leadRepo;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasks(
            @AuthenticationPrincipal JwtPrincipal p, @RequestParam(required = false) String status) {
        List<Task> tasks = (status != null && !status.isBlank())
            ? taskRepo.findByTenantIdAndStatus(p.getTenantId(), TaskStatus.valueOf(status))
            : taskRepo.findByTenantIdOrderByCreatedAtDesc(p.getTenantId(), Pageable.unpaged()).getContent();
        return ResponseEntity.ok(ApiResponse.success(tasks.stream().map(this::map).toList()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponse>> create(
            @AuthenticationPrincipal JwtPrincipal p, @RequestBody CreateTaskRequest req) {
        Task.TaskBuilder builder = Task.builder()
            .tenantId(p.getTenantId())
            .title(req.getTitle())
            .description(req.getDescription())
            .type(req.getType())
            .priority(req.getPriority() != null ? TaskPriority.valueOf(req.getPriority()) : TaskPriority.MEDIUM)
            .status(TaskStatus.OPEN)
            .assignedToId(req.getAssignedToId())
            .dueAt(req.getDueAt() != null ? req.getDueAt().atZone(ZoneId.systemDefault()) : null);

        if (req.getLeadId() != null) {
            leadRepo.findById(req.getLeadId()).ifPresent(builder::lead);
        }

        Task saved = taskRepo.save(builder.build());
        return ResponseEntity.ok(ApiResponse.success(map(saved), "Task created"));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<TaskResponse>> complete(
            @AuthenticationPrincipal JwtPrincipal p, @PathVariable UUID id) {
        Task t = taskRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        t.setStatus(TaskStatus.COMPLETED);
        t.setCompletedAt(ZonedDateTime.now());
        return ResponseEntity.ok(ApiResponse.success(map(taskRepo.save(t))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@AuthenticationPrincipal JwtPrincipal p, @PathVariable UUID id) {
        taskRepo.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("OK", "Deleted"));
    }

    private TaskResponse map(Task t) {
        return TaskResponse.builder()
            .id(t.getId())
            .tenantId(t.getTenantId())
            .leadId(t.getLeadId())
            .title(t.getTitle())
            .description(t.getDescription())
            .type(t.getType())
            .priority(t.getPriority() != null ? t.getPriority().name() : null)
            .status(t.getStatus() != null ? t.getStatus().name() : null)
            .assignedToId(t.getAssignedToId())
            .dueAt(t.getDueAt() != null ? t.getDueAt().toLocalDateTime() : null)
            .completedAt(t.getCompletedAt() != null ? t.getCompletedAt().toLocalDateTime() : null)
            .createdAt(t.getCreatedAt() != null ? t.getCreatedAt().toLocalDateTime() : null)
            .build();
    }
}