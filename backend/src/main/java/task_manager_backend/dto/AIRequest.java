package task_manager_backend.dto;

import jakarta.validation.constraints.NotBlank;

public class AIRequest {

    @NotBlank(message = "Task title is required")
    private String title;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}
