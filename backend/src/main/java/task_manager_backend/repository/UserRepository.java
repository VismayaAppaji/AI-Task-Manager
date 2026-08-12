package task_manager_backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import task_manager_backend.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}