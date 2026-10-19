package vn.edu.huongnghiep.modules.quizzes.domain;

import jakarta.validation.constraints.*;

public record QuizQuestion(@Min(1) int id, @NotBlank @Size(max=2000) String text,
                           @NotBlank String type) {}
