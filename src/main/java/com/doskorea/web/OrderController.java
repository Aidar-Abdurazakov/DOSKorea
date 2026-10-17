package com.doskorea.web;

import com.doskorea.model.Order;
import com.doskorea.model.OrderStatus;
import com.doskorea.model.Product;
import com.doskorea.model.ProductStatus;
import com.doskorea.model.User;
import com.doskorea.repository.OrderRepository;
import com.doskorea.repository.ProductRepository;
import com.doskorea.service.UserSession;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orders;
    private final ProductRepository products;
    private final UserSession sessions;

    public OrderController(
            OrderRepository orders,
            ProductRepository products,
            UserSession sessions
    ) {

        this.orders = orders;
        this.products = products;
        this.sessions = sessions;
    }

    @PostMapping("/{productId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Order create(
            @PathVariable Long productId,
            HttpSession session
    ) {

        User user =
                sessions.require(session);

        Product product =
                products
                        .findById(productId)
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Товар не найден"
                                        )
                        );

        if (!product.isAvailable()) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Этот товар недоступен"
            );
        }

        if (product.getStatus() == ProductStatus.SOLD) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Этот товар уже продан"
            );
        }

        if (product.getStatus() == ProductStatus.RESERVED) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Этот товар уже забронирован"
            );
        }

        Order order =
                new Order();

        order.setUser(user);
        order.setProduct(product);
        order.setStatus(
                OrderStatus.NEW
        );

        return orders.save(order);
    }

    @GetMapping
    public List<Map<String, Object>> mine(
            HttpSession session
    ) {

        return orders
                .findByUserIdOrderByCreatedAtDesc(
                        sessions
                                .require(session)
                                .getId()
                )
                .stream()
                .map(
                        o ->
                                Map.of(
                                        "id",
                                        o.getId(),

                                        "product",
                                        o.getProduct(),

                                        "status",
                                        o.getStatus(),

                                        "createdAt",
                                        o.getCreatedAt()
                                )
                )
                .toList();
    }
}