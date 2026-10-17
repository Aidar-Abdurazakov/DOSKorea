package com.doskorea.web;

import com.doskorea.model.PageResponse;
import com.doskorea.model.Product;
import com.doskorea.model.ProductType;
import com.doskorea.service.ProductFilter;
import com.doskorea.service.ProductService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/** Публичное API: каталог, фильтры, настройки сайта. */
@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductService service;
    private final String whatsapp;

    public ProductController(ProductService service, @Value("${app.whatsapp.number}") String whatsapp) {
        this.service = service;
        this.whatsapp = whatsapp;
    }

    @GetMapping("/config")
    public Map<String, String> config() {
        return Map.of("whatsapp", whatsapp.replaceAll("\\D", ""));
    }

    @GetMapping("/products")
    public PageResponse<Product> list(
            @RequestParam(required = false) List<ProductType> types,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) Integer yearFrom,
            @RequestParam(required = false) Integer yearTo,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        var filter = new ProductFilter(types, brand, model, yearFrom, yearTo, minPrice, maxPrice, q, true);
        return service.search(filter, page, size, sort);
    }

    @GetMapping("/products/{id}")
    public Product one(@PathVariable Long id) {
        return service.get(id, true);
    }

    // ----- Значения для выпадающих списков: марка → модель → год -----

    @GetMapping("/filters/brands")
    public List<String> brands(@RequestParam List<ProductType> types) {
        return service.brands(types);
    }

    @GetMapping("/filters/models")
    public List<String> models(@RequestParam List<ProductType> types, @RequestParam String brand) {
        return service.models(types, brand);
    }

    @GetMapping("/filters/years")
    public List<Integer> years(@RequestParam List<ProductType> types,
                               @RequestParam(required = false) String brand,
                               @RequestParam(required = false) String model) {
        return service.years(types, brand, model);
    }
}
