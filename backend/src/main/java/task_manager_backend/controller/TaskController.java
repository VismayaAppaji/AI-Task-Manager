package task_manager_backend.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import task_manager_backend.dto.TaskRequest;
import task_manager_backend.entity.Task;
import task_manager_backend.service.TaskService;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5174")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // CREATE
    @PostMapping
    public ResponseEntity<Task> createTask(
            @Valid @RequestBody TaskRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                taskService.createTask(request, email)
        );
    }

    // GET ALL
    @GetMapping
    public ResponseEntity<List<Task>> getTasks(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                taskService.getTasks(email)
        );
    }

    // GET ONE
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTask(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                taskService.getTask(id, email)
        );
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                taskService.updateTask(id, request, email)
        );
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTask(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();

        taskService.deleteTask(id, email);

        return ResponseEntity.ok("Task deleted successfully");
    }

    // CHANGE STATUS
    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateStatus(
            @PathVariable Long id,
            @RequestParam Task.Status status,
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                taskService.updateStatus(id, status, email)
        );
    }
}