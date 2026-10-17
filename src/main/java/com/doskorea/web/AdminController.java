package com.doskorea.web;

import com.doskorea.model.*;
import com.doskorea.repository.OrderRepository;
import com.doskorea.service.ProductFilter;
import com.doskorea.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ProductService service;
    private final Path uploadDir;
    private final OrderRepository orders;

    public AdminController(
            ProductService service,
            @Value("${app.upload-dir}") String uploadDir,
            OrderRepository orders
    ) {
        this.service = service;

        this.uploadDir = Path.of(uploadDir)
                .toAbsolutePath()
                .normalize();

        this.orders = orders;
    }

    @GetMapping("/me")
    public Map<String, String> me(Authentication auth) {
        return Map.of(
                "username",
                auth.getName()
        );
    }

    @GetMapping("/products")
    public PageResponse<Product> list(
            @RequestParam(required = false)
            List<ProductType> types,

            @RequestParam(required = false)
            String q,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size
    ) {
        var filter = new ProductFilter(
                types,
                null,
                null,
                null,
                null,
                null,
                null,
                q,
                false
        );

        return service.search(
                filter,
                page,
                size,
                "newest"
        );
    }

    @GetMapping("/products/{id}")
    public Product one(
            @PathVariable Long id
    ) {
        return service.get(
                id,
                false
        );
    }

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    public Product create(
            @Valid
            @RequestBody
            ProductRequest request
    ) {
        return service.create(
                request
        );
    }

    @PutMapping("/products/{id}")
    public Product update(
            @PathVariable Long id,

            @Valid
            @RequestBody
            ProductRequest request
    ) {
        return service.update(
                id,
                request
        );
    }

    @DeleteMapping("/products/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id
    ) {
        service.delete(id);
    }

    /*
     * Изменение статуса товара.
     */
    @PatchMapping("/products/{id}/status")
    public Product status(
            @PathVariable Long id,

            @RequestParam
            ProductStatus status
    ) {
        return service.updateStatus(
                id,
                status
        );
    }

    /*
     * Все пользовательские заказы.
     */
    @GetMapping("/orders")
    public List<Map<String, Object>> orders() {

        List<Map<String, Object>> result =
                new ArrayList<>();

        orders
                .findAllByOrderByCreatedAtDesc()
                .forEach(order -> {

                    Map<String, Object> item =
                            new java.util.LinkedHashMap<>();

                    item.put(
                            "id",
                            order.getId()
                    );

                    item.put(
                            "userName",
                            order.getUser().getName()
                    );

                    item.put(
                            "userPhone",
                            order.getUser().getPhone()
                    );

                    item.put(
                            "productTitle",
                            order.getProduct().getTitle()
                    );

                    item.put(
                            "productId",
                            order.getProduct().getId()
                    );

                    item.put(
                            "status",
                            order.getStatus()
                    );

                    item.put(
                            "createdAt",
                            order.getCreatedAt()
                    );

                    result.add(item);
                });

        return result;
    }

    /*
     * Админ меняет статус заказа.
     */
    @PatchMapping("/orders/{id}/status")
    public Map<String, Object> orderStatus(
            @PathVariable Long id,

            @RequestParam
            OrderStatus status
    ) {

        Order order =
                orders
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Заказ не найден"
                                        )
                        );

        order.setStatus(status);

        Long productId =
                order.getProduct().getId();

        /*
         * Статус товара меняем через сервис (в транзакции),
         * иначе изменение товара не сохранится в базе.
         */
        if (status == OrderStatus.RESERVED) {

            service.updateStatus(
                    productId,
                    ProductStatus.RESERVED
            );

        } else if (status == OrderStatus.PURCHASED) {

            service.updateStatus(
                    productId,
                    ProductStatus.SOLD
            );

        } else if (
                status == OrderStatus.CANCELLED &&
                order.getProduct().getStatus()
                        != ProductStatus.SOLD
        ) {

            service.updateStatus(
                    productId,
                    ProductStatus.AVAILABLE
            );
        }

        orders.save(order);

        Map<String, Object> response =
                new java.util.LinkedHashMap<>();

        response.put(
                "id",
                order.getId()
        );

        response.put(
                "status",
                order.getStatus()
        );

        return response;
    }

    @PostMapping("/upload")
    public Map<String, String> upload(
            @RequestParam("file")
            MultipartFile file
    ) throws IOException {

        String ext =
                switch (
                        file.getContentType() == null
                                ? ""
                                : file.getContentType()
                ) {

                    case "image/jpeg" ->
                            "jpg";

                    case "image/png" ->
                            "png";

                    case "image/webp" ->
                            "webp";

                    default ->
                            throw new ResponseStatusException(
                                    HttpStatus.BAD_REQUEST,
                                    "Допустимы только JPG, PNG и WebP"
                            );
                };

        Files.createDirectories(
                uploadDir
        );

        String name =
                UUID.randomUUID()
                        + "."
                        + ext;

        file.transferTo(
                uploadDir.resolve(name)
        );

        return Map.of(
                "url",
                "/uploads/" + name
        );
    }
}