package vn.edu.huongnghiep.shared;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {
    public final HttpStatus status;
    public ApiException(HttpStatus status, String message) { super(message); this.status = status; }
    public static ApiException invalid(String message) { return new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, message); }
    public static ApiException missing() { return new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy dữ liệu."); }
}
