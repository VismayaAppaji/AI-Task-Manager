package task_manager_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import task_manager_backend.entity.Task;
import task_manager_backend.entity.User;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUser(User user);
}