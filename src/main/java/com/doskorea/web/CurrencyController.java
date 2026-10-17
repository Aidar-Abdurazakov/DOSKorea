package com.doskorea.web;

import com.doskorea.service.CurrencyService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Map;

@RestController
public class CurrencyController {

    private final CurrencyService service;

    public CurrencyController(CurrencyService service) {
        this.service = service;
    }

    /** Курсы видят все (нужны для пересчёта цен на сайте). */
    @GetMapping("/api/currency")
    public Map<String, Object> rates() {
        return service.view();
    }

    /** Меняет курсы только админ (путь /api/admin/** защищён в SecurityConfig). */
    @PutMapping("/api/admin/currency")
    public Map<String, Object> update(
            @RequestBody Map<String, BigDecimal> body
    ) {
        service.update(body);
        return service.view();
    }
}
