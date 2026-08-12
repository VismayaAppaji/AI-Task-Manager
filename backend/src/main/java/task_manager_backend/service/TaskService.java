package task_manager_backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import task_manager_backend.dto.TaskRequest;
import task_manager_backend.entity.Task;
import task_manager_backend.entity.User;
import task_manager_backend.exception.ResourceNotFoundException;
import task_manager_backend.repository.TaskRepository;
import task_manager_backend.repository.UserRepository;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(
            TaskRepository taskRepository,
            UserRepository userRepository) {

        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    // CREATE TASK
    public Task createTask(TaskRequest request, String email) {

        User user = getUser(email);

        Task task = new Task();

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setStatus(request.getStatus());
        task.setCreatedAt(LocalDateTime.now());
        task.setUser(user);

        return taskRepository.save(task);
    }

    // GET ALL TASKS FOR USER
    public List<Task> getTasks(String email) {

        User user = getUser(email);

        return taskRepository.findByUser(user);
    }

    // GET ONE TASK
    public Task getTask(Long id, String email) {

        User user = getUser(email);

        return taskRepository.findById(id)
                .filter(task ->
                    task.getUser().getId().equals(user.getId())
                )
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Task not found with id: " + id
                    ));
    }

    // UPDATE TASK
    public Task updateTask(
            Long id,
            TaskRequest request,
            String email) {

        Task task = getTask(id, email);

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setStatus(request.getStatus());

        return taskRepository.save(task);
    }

    // DELETE TASK
    public void deleteTask(Long id, String email) {

        Task task = getTask(id, email);

        taskRepository.delete(task);
    }

    // CHANGE STATUS
    public Task updateStatus(
            Long id,
            Task.Status status,
            String email) {

        Task task = getTask(id, email);

        task.setStatus(status);

        return taskRepository.save(task);
    }

    private User getUser(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "User not found with email: " + email
                    ));
    }
}