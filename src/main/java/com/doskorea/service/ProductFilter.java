package com.doskorea.service;

import com.doskorea.model.ProductType;

import java.math.BigDecimal;
import java.util.List;

/** Параметры поиска по каталогу. Любое поле может быть null. */
public record ProductFilter(
        List<ProductType> types,
        String brand,
        String model,
        Integer yearFrom,
        Integer yearTo,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        String q,
        boolean onlyAvailable
) {
}
