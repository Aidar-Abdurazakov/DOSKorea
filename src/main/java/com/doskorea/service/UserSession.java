package com.doskorea.service;

import com.doskorea.model.User;
import com.doskorea.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class UserSession {

    public static final String USER_ID =
            "DOSKOREA_USER_ID";

    private final UserRepository users;

    public UserSession(UserRepository users) {
        this.users = users;
    }

    public User current(HttpSession session) {

        Object id =
                session.getAttribute(USER_ID);

        if (!(id instanceof Long userId)) {
            return null;
        }

        return users
                .findById(userId)
                .orElse(null);
    }

    public User require(HttpSession session) {

        User user = current(session);

        if (user == null) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Войдите в аккаунт"
            );
        }

        return user;
    }

    public void login(
            HttpSession session,
            User user
    ) {

        session.setAttribute(
                USER_ID,
                user.getId()
        );
    }

    public void logout(HttpSession session) {

        session.invalidate();
    }
}