package com.doskorea.web;

import com.doskorea.model.Favorite;
import com.doskorea.model.Product;
import com.doskorea.model.User;
import com.doskorea.repository.FavoriteRepository;
import com.doskorea.repository.ProductRepository;
import com.doskorea.service.UserSession;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteRepository favorites;
    private final ProductRepository products;
    private final UserSession sessions;

    public FavoriteController(
            FavoriteRepository favorites,
            ProductRepository products,
            UserSession sessions
    ) {

        this.favorites = favorites;
        this.products = products;
        this.sessions = sessions;
    }

    @GetMapping
    public List<Product> list(
            HttpSession session
    ) {

        return favorites
                .findByUserIdOrderByCreatedAtDesc(
                        sessions
                                .require(session)
                                .getId()
                )
                .stream()
                .map(Favorite::getProduct)
                .toList();
    }

    @GetMapping("/{productId}")
    public Map<String, Boolean> check(
            @PathVariable Long productId,
            HttpSession session
    ) {

        User user =
                sessions.current(session);

        return Map.of(
                "liked",
                user != null &&
                        favorites.existsByUserIdAndProductId(
                                user.getId(),
                                productId
                        )
        );
    }

    @PostMapping("/{productId}")
    public Map<String, Boolean> toggle(
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

        var existing =
                favorites.findByUserIdAndProductId(
                        user.getId(),
                        product.getId()
                );

        if (existing.isPresent()) {

            favorites.delete(
                    existing.get()
            );

            return Map.of(
                    "liked",
                    false
            );
        }

        Favorite favorite =
                new Favorite();

        favorite.setUser(user);
        favorite.setProduct(product);

        favorites.save(favorite);

        return Map.of(
                "liked",
                true
        );
    }
}