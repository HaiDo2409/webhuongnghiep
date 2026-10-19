package vn.edu.huongnghiep.modules.auth;

import java.time.*;
import java.util.*;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;
import vn.edu.huongnghiep.shared.ApiException;

/** Per-instance bound for local login/registration; use a shared store when running multiple servers. */
@Component
public class AuthAttemptLimiter {
    private record Window(Instant expires,int count) {}
    private final Map<String,Window> windows=new HashMap<>();
    public synchronized void attempt(String key) {
        Instant now=Instant.now();windows.entrySet().removeIf(e->e.getValue().expires().isBefore(now));
        var window=windows.getOrDefault(key,new Window(now.plus(Duration.ofMinutes(15)),0));
        if(window.count()>=10 || windows.size()>=10000) throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,"Bạn đã thử quá nhiều lần. Hãy thử lại sau 15 phút.");
        windows.put(key,new Window(window.expires(),window.count()+1));
    }
    public synchronized void success(String key) { windows.remove(key); }
}
