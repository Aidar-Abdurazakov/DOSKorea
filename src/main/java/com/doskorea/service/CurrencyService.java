package com.doskorea.service;

import com.doskorea.model.CurrencyRate;
import com.doskorea.repository.CurrencyRateRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Курсы валют. Базовая валюта: доллар США (USD = 1).
 * Стартовые значения ориентировочные (по данным Нацбанка КР, сентябрь 2026):
 * админ задаёт актуальные курсы в админке, кнопка «Курсы валют».
 */
@Service
public class CurrencyService {

    public static final List<String> CODES = List.of("USD", "KGS", "RUB", "KZT", "EUR");

    private static final Map<String, BigDecimal> DEFAULTS = Map.of(
            "KGS", new BigDecimal("87.45"),
            "RUB", new BigDecimal("86.04"),
            "KZT", new BigDecimal("457.40"),
            "EUR", new BigDecimal("0.8596")
    );

    private final CurrencyRateRepository repo;

    public CurrencyService(CurrencyRateRepository repo) {
        this.repo = repo;
    }

    /** При первом запуске добавляем стартовые курсы. */
    @EventListener(ApplicationReadyEvent.class)
    public void ensureDefaults() {

        DEFAULTS.forEach((code, rate) -> {
            if (!repo.existsById(code)) {
                repo.save(new CurrencyRate(code, rate));
            }
        });
    }

    @Transactional(readOnly = true)
    public Map<String, Object> view() {

        Map<String, BigDecimal> rates = new LinkedHashMap<>();
        Instant updated = null;

        rates.put("USD", BigDecimal.ONE);

        for (String code : CODES) {

            if (code.equals("USD")) {
                continue;
            }

            CurrencyRate r = repo.findById(code).orElse(null);

            rates.put(code, r != null ? r.getRate() : DEFAULTS.get(code));

            if (r != null && (updated == null || r.getUpdatedAt().isAfter(updated))) {
                updated = r.getUpdatedAt();
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("base", "USD");
        result.put("rates", rates);
        result.put("updatedAt", updated);

        return result;
    }

    @Transactional
    public void update(Map<String, BigDecimal> input) {

        if (input == null || input.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Не переданы курсы");
        }

        for (Map.Entry<String, BigDecimal> e : input.entrySet()) {

            String code = e.getKey() == null ? "" : e.getKey().trim().toUpperCase();
            BigDecimal rate = e.getValue();

            if (code.equals("USD")) {
                continue; // доллар всегда равен 1
            }

            if (!CODES.contains(code)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Неизвестная валюта: " + code);
            }

            if (rate == null
                    || rate.signum() <= 0
                    || rate.compareTo(new BigDecimal("100000000")) > 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Курс " + code + " должен быть больше нуля");
            }

            repo.save(new CurrencyRate(code, rate));
        }
    }
}
