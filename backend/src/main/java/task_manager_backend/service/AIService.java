package task_manager_backend.service;

import org.springframework.stereotype.Service;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;

import task_manager_backend.dto.AIResponse;

@Service
public class AIService {

    private final Client client;

    public AIService() {
        this.client = new Client();
    }

    public AIResponse generateTaskDetails(String title) {

        String prompt = """
                You are an AI task management assistant.

                Analyze the following task title:

                "%s"

                Return exactly in this format:

                Description: <short useful task description>
                Priority: <LOW, MEDIUM, or HIGH>
                Estimated Time: <estimated completion time>

                Do not add anything else.
                """.formatted(title);

        try {

            GenerateContentResponse response =
                    client.models.generateContent(
                            "gemini-3.6-flash",
                            prompt,
                            null
                    );

            String result = response.text();

            return parseResponse(result);

        } catch (Exception e) {

            System.err.println(
                    "Gemini AI failed: " + e.getMessage()
            );

            // Safe fallback when Gemini is unavailable
            return new AIResponse(
                    "Please complete the task: " + title,
                    "MEDIUM",
                    "30 minutes"
            );
        }
    }

    private AIResponse parseResponse(String result) {

        String description = "";
        String priority = "MEDIUM";
        String estimatedTime = "";

        String[] lines = result.split("\\n");

        for (String line : lines) {

            line = line.trim();

            if (line.startsWith("Description:")) {

                description =
                        line.substring(
                                "Description:".length()
                        ).trim();

            } else if (line.startsWith("Priority:")) {

                priority =
                        line.substring(
                                "Priority:".length()
                        ).trim();

            } else if (line.startsWith("Estimated Time:")) {

                estimatedTime =
                        line.substring(
                                "Estimated Time:".length()
                        ).trim();
            }
        }

        return new AIResponse(
                description,
                priority,
                estimatedTime
        );
    }
}