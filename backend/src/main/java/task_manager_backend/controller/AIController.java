package task_manager_backend.controller;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import task_manager_backend.dto.AIRequest;
import task_manager_backend.dto.AIResponse;
import task_manager_backend.service.AIService;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5174")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/generate-task")
    public ResponseEntity<AIResponse> generateTask(
            @Valid @RequestBody AIRequest request) {

        return ResponseEntity.ok(
                aiService.generateTaskDetails(request.getTitle())
        );
    }
}