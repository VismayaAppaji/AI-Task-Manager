package task_manager_backend.dto;

public class AIResponse {

    private String description;
    private String priority;
    private String estimatedTime;

    public AIResponse(String description, String priority, String estimatedTime) {
        this.description = description;
        this.priority = priority;
        this.estimatedTime = estimatedTime;
    }

    public String getDescription() {
        return description;
    }

    public String getPriority() {
        return priority;
    }

    public String getEstimatedTime() {
        return estimatedTime;
    }
}