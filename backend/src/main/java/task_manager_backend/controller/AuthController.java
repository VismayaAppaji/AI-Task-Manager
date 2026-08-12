package task_manager_backend.controller;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import task_manager_backend.dto.LoginRequest;
import task_manager_backend.dto.LoginResponse;
import task_manager_backend.dto.RegisterRequest;
import task_manager_backend.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5174")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // REGISTER
    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody RegisterRequest request) {

        String message = authService.register(request);

        if (message.equals("Email already registered")) {
            return ResponseEntity.badRequest().body(message);
        }

        return ResponseEntity.ok(message);
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }
}