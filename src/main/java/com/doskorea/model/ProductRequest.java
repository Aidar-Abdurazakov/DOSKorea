package com.doskorea.model;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public record ProductRequest(

        @NotNull(message = "Выберите тип товара")
        ProductType type,

        @NotBlank(message = "Укажите марку")
        @Size(max = 80)
        String brand,

        @NotBlank(message = "Укажите модель")
        @Size(max = 120)
        String model,

        @NotNull(message = "Укажите год выпуска")
        @Min(1980)
        @Max(2100)
        Integer releaseYear,

        @NotNull(message = "Укажите цену")
        @DecimalMin(value = "0.0", inclusive = false)
        BigDecimal price,

        @NotBlank(message = "Укажите название")
        @Size(max = 200)
        String title,

        @Size(max = 5000)
        String description,

        List<Spec> specs,

        List<String> images,

        Boolean available,

        ProductStatus status

) {
}