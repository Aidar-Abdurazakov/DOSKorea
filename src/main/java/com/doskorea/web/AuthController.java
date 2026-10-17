package com.doskorea.web;

import com.doskorea.model.User;
import com.doskorea.repository.UserRepository;
import com.doskorea.service.CurrencyService;
import com.doskorea.service.UserSession;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final UserSession sessions;

    public AuthController(
            UserRepository users,
            PasswordEncoder encoder,
            UserSession sessions
    ) {

        this.users = users;
        this.encoder = encoder;
        this.sessions = sessions;
    }

    public record RegisterRequest(

            @NotBlank
            @Size(
                    min = 2,
                    max = 80
            )
            String name,

            @NotBlank
            String phone,

            @NotBlank
            @Size(
                    min = 6,
                    max = 100
            )
            String password,

            Boolean privacyConsent
    ) {
    }

    public record LoginRequest(

            @NotBlank
            String phone,

            @NotBlank
            String password
    ) {
    }

    public record UserResponse(
            Long id,
            String name,
            String phone,
            Instant createdAt,
            String currency
    ) {

        static UserResponse of(
                User user
        ) {

            return new UserResponse(
                    user.getId(),
                    user.getName(),
                    user.getPhone(),
                    user.getCreatedAt(),
                    user.getCurrency()
            );
        }
    }

    @GetMapping("/me")
    public Map<String, Object> me(
            HttpSession session
    ) {

        User user =
                sessions.current(session);

        if (user == null) {

            return Map.of(
                    "authenticated",
                    false
            );
        }

        return Map.of(
                "authenticated",
                true,
                "user",
                UserResponse.of(user)
        );
    }

    public record CurrencyRequest(

            @NotBlank
            String currency
    ) {
    }

    /** Покупатель выбирает валюту, в которой хочет видеть цены. */
    @PutMapping("/currency")
    public UserResponse currency(
            @Valid
            @RequestBody
            CurrencyRequest request,
            HttpSession session
    ) {

        User user =
                sessions.require(session);

        String code =
                request.currency()
                        .trim()
                        .toUpperCase(Locale.ROOT);

        if (!CurrencyService.CODES.contains(code)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Неизвестная валюта"
            );
        }

        user.setCurrency(code);

        return UserResponse.of(
                users.save(user)
        );
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(
            @Valid
            @RequestBody
            RegisterRequest request,

            HttpSession session
    ) {

        if (!Boolean.TRUE.equals(request.privacyConsent())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Для регистрации необходимо согласиться с политикой конфиденциальности"
            );
        }

        String phone =
                normalizePhone(
                        request.phone()
                );

        if (phone.length() < 10) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Введите корректный номер телефона"
            );
        }

        if (
                users.existsByPhone(
                        phone
                )
        ) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Этот номер уже зарегистрирован"
            );
        }

        User user = new User();

        user.setName(
                request.name().trim()
        );

        user.setPhone(phone);

        user.setPasswordHash(
                encoder.encode(
                        request.password()
                )
        );

        users.save(user);

        sessions.login(
                session,
                user
        );

        return UserResponse.of(user);
    }

    @PostMapping("/login")
    public UserResponse login(
            @Valid
            @RequestBody
            LoginRequest request,

            HttpSession session
    ) {

        User user =
                users
                        .findByPhone(
                                normalizePhone(
                                        request.phone()
                                )
                        )
                        .orElse(null);

        if (
                user == null ||
                !encoder.matches(
                        request.password(),
                        user.getPasswordHash()
                )
        ) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Неверный номер телефона или пароль"
            );
        }

        sessions.login(
                session,
                user
        );

        return UserResponse.of(user);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(
            HttpSession session
    ) {

        sessions.logout(session);
    }

    static String normalizePhone(
            String phone
    ) {

        String digits =
                phone == null
                        ? ""
                        : phone.replaceAll(
                                "\\D",
                                ""
                        );

        if (
                digits.startsWith("0") &&
                digits.length() == 10
        ) {

            digits =
                    "996" +
                    digits.substring(1);
        }

        return digits;
    }
}