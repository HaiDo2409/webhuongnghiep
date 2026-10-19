package vn.edu.huongnghiep.modules.quizzes.domain;

import java.util.*;
import vn.edu.huongnghiep.shared.ApiException;

public interface QuizScoringStrategy {
    String type();
    List<String> dimensions();

    default void validate(List<QuizQuestion> questions) {
        if (questions == null || questions.isEmpty() || questions.size() > 200) throw ApiException.invalid("Quiz phải có từ 1 đến 200 câu hỏi.");
        Set<Integer> ids = new HashSet<>();
        Set<String> present = new HashSet<>();
        for (var q : questions) {
            if (q == null || q.id() < 1 || q.text() == null || q.text().isBlank() || q.text().length() > 2000 || !dimensions().contains(q.type()) || !ids.add(q.id()))
                throw ApiException.invalid("Câu hỏi không hợp lệ, sai nhóm hoặc trùng mã.");
            present.add(q.type());
        }
        if (!present.containsAll(dimensions())) throw ApiException.invalid("Bộ câu hỏi phải có đủ các nhóm đánh giá.");
    }

    default ScoredQuiz score(List<QuizQuestion> questions, Map<Integer, Integer> answers) {
        validate(questions);
        if (answers == null || answers.size() != questions.size()) throw ApiException.invalid("Bạn cần trả lời đầy đủ các câu hỏi.");
        Map<String, Integer> raw = new LinkedHashMap<>();
        Map<String, Integer> counts = new HashMap<>();
        dimensions().forEach(d -> raw.put(d, 0));
        for (var q : questions) {
            Integer value = answers.get(q.id());
            if (value == null || value < 1 || value > 5) throw ApiException.invalid("Mỗi câu trả lời phải từ 1 đến 5 và thuộc phiên bản quiz.");
            raw.merge(q.type(), value, Integer::sum);
            counts.merge(q.type(), 1, Integer::sum);
        }
        Map<String, Double> normalized = new LinkedHashMap<>();
        raw.forEach((d, total) -> normalized.put(d, Math.round((total - counts.get(d)) * 10000.0 / (counts.get(d) * 4)) / 100.0));
        List<String> top = dimensions().stream().sorted(Comparator.comparingDouble((String d) -> normalized.get(d)).reversed()).limit(3).toList();
        return new ScoredQuiz(raw, normalized, top);
    }

    record ScoredQuiz(Map<String, Integer> scores, Map<String, Double> normalizedScores, List<String> topCodes) {}
}
