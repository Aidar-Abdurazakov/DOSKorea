package com.doskorea.service;

import com.doskorea.model.*;
import com.doskorea.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository repo;

    public ProductService(ProductRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public PageResponse<Product> search(
            ProductFilter f,
            int page,
            int size,
            String sort
    ) {

        PageRequest pageable =
                PageRequest.of(
                        Math.max(page, 0),
                        Math.min(
                                Math.max(size, 1),
                                48
                        ),
                        sortFor(sort)
                );

        Page<Product> result =
                repo.findAll(
                        toSpec(f),
                        pageable
                );

        return new PageResponse<>(
                result.getContent(),
                result.getNumber(),
                result.getTotalPages(),
                result.getTotalElements()
        );
    }

    @Transactional(readOnly = true)
    public Product get(
            Long id,
            boolean onlyAvailable
    ) {

        Product p =
                repo.findById(id)
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Товар не найден"
                                        )
                        );

        if (
                onlyAvailable &&
                !p.isAvailable()
        ) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Товар не найден"
            );
        }

        return p;
    }

    @Transactional(readOnly = true)
    public List<String> brands(
            List<ProductType> types
    ) {

        return repo.findBrands(types);
    }

    @Transactional(readOnly = true)
    public List<String> models(
            List<ProductType> types,
            String brand
    ) {

        return repo.findModels(
                types,
                brand
        );
    }

    @Transactional(readOnly = true)
    public List<Integer> years(
            List<ProductType> types,
            String brand,
            String model
    ) {

        return repo.findYears(
                types,
                StringUtils.hasText(brand)
                        ? brand
                        : "%",
                StringUtils.hasText(model)
                        ? model
                        : "%"
        );
    }

    @Transactional
    public Product create(
            ProductRequest r
    ) {

        Product p = new Product();

        apply(p, r);

        return repo.save(p);
    }

    @Transactional
    public Product update(
            Long id,
            ProductRequest r
    ) {

        Product p =
                get(id, false);

        apply(p, r);

        return repo.save(p);
    }

    @Transactional
    public Product updateStatus(
            Long id,
            ProductStatus status
    ) {

        Product p =
                get(id, false);

        /*
         * Статус «бронь / продано» не скрывает товар с сайта:
         * покупатели видят надпись в углу карточки.
         * Скрытие делается отдельной галочкой «Показывать на сайте».
         */
        p.setStatus(status);

        return repo.save(p);
    }

    @Transactional
    public void delete(Long id) {

        if (!repo.existsById(id)) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Товар не найден"
            );
        }

        repo.deleteById(id);
    }

    private void apply(
            Product p,
            ProductRequest r
    ) {

        p.setType(r.type());

        p.setBrand(
                r.brand().trim()
        );

        p.setModel(
                r.model().trim()
        );

        p.setReleaseYear(
                r.releaseYear()
        );

        p.setPrice(
                r.price()
        );

        p.setTitle(
                r.title().trim()
        );

        p.setDescription(
                StringUtils.hasText(
                        r.description()
                )
                        ? r.description().trim()
                        : null
        );

        if (r.available() != null) {

            p.setAvailable(
                    r.available()
            );
        }

        if (r.status() != null) {

            p.setStatus(
                    r.status()
            );
        }

        /*
         * Видимость товара (available) больше не зависит от статуса.
         */

        p.getSpecs().clear();

        if (r.specs() != null) {

            for (Spec s : r.specs()) {

                if (
                        s != null &&
                        StringUtils.hasText(
                                s.getName()
                        ) &&
                        StringUtils.hasText(
                                s.getValue()
                        )
                ) {

                    p.getSpecs().add(
                            new Spec(
                                    clip(
                                            s.getName().trim(),
                                            80
                                    ),
                                    clip(
                                            s.getValue().trim(),
                                            300
                                    )
                            )
                    );
                }
            }
        }

        p.getImages().clear();

        if (r.images() != null) {

            for (String url : r.images()) {

                if (
                        !StringUtils.hasText(url)
                ) {
                    continue;
                }

                String u = url.trim();

                if (
                        !(
                                u.startsWith(
                                        "/uploads/"
                                )
                                ||
                                u.startsWith(
                                        "https://"
                                )
                        )
                        ||
                        u.length() > 500
                ) {

                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Некорректная ссылка на фото"
                    );
                }

                p.getImages().add(u);
            }
        }
    }

    private static String clip(
            String s,
            int max
    ) {

        return s.length() > max
                ? s.substring(0, max)
                : s;
    }

    private static Sort sortFor(
            String sort
    ) {

        Sort byNew =
                Sort.by(
                        Sort.Order.desc(
                                "createdAt"
                        ),
                        Sort.Order.desc("id")
                );

        if (sort == null) {

            return byNew;
        }

        return switch (sort) {

            case "price_asc" ->
                    Sort.by(
                            Sort.Order.asc(
                                    "price"
                            ),
                            Sort.Order.desc("id")
                    );

            case "price_desc" ->
                    Sort.by(
                            Sort.Order.desc(
                                    "price"
                            ),
                            Sort.Order.desc("id")
                    );

            case "year_desc" ->
                    Sort.by(
                            Sort.Order.desc(
                                    "releaseYear"
                            ),
                            Sort.Order.desc("id")
                    );

            case "year_asc" ->
                    Sort.by(
                            Sort.Order.asc(
                                    "releaseYear"
                            ),
                            Sort.Order.desc("id")
                    );

            default -> byNew;
        };
    }

    private static Specification<Product> toSpec(
            ProductFilter f
    ) {

        return (
                root,
                query,
                cb
        ) -> {

            List<Predicate> ps =
                    new ArrayList<>();

            if (f.onlyAvailable()) {

                ps.add(
                        cb.isTrue(
                                root.get(
                                        "available"
                                )
                        )
                );

                /*
                 * Проданные и забронированные товары остаются в каталоге:
                 * у них просто появляется надпись «Продано» или «Бронь».
                 */
            }

            if (
                    f.types() != null &&
                    !f.types().isEmpty()
            ) {

                ps.add(
                        root.get("type")
                                .in(f.types())
                );
            }

            if (
                    StringUtils.hasText(
                            f.brand()
                    )
            ) {

                ps.add(
                        cb.equal(
                                cb.lower(
                                        root.get(
                                                "brand"
                                        )
                                ),
                                f.brand()
                                        .trim()
                                        .toLowerCase()
                        )
                );
            }

            if (
                    StringUtils.hasText(
                            f.model()
                    )
            ) {

                ps.add(
                        cb.equal(
                                cb.lower(
                                        root.get(
                                                "model"
                                        )
                                ),
                                f.model()
                                        .trim()
                                        .toLowerCase()
                        )
                );
            }

            if (f.yearFrom() != null) {

                ps.add(
                        cb.greaterThanOrEqualTo(
                                root.get(
                                        "releaseYear"
                                ),
                                f.yearFrom()
                        )
                );
            }

            if (f.yearTo() != null) {

                ps.add(
                        cb.lessThanOrEqualTo(
                                root.get(
                                        "releaseYear"
                                ),
                                f.yearTo()
                        )
                );
            }

            if (f.minPrice() != null) {

                ps.add(
                        cb.greaterThanOrEqualTo(
                                root.get("price"),
                                f.minPrice()
                        )
                );
            }

            if (f.maxPrice() != null) {

                ps.add(
                        cb.lessThanOrEqualTo(
                                root.get("price"),
                                f.maxPrice()
                        )
                );
            }

            if (
                    StringUtils.hasText(
                            f.q()
                    )
            ) {

                String like =
                        "%" +
                        f.q()
                                .trim()
                                .toLowerCase() +
                        "%";

                ps.add(
                        cb.or(
                                cb.like(
                                        cb.lower(
                                                root.get(
                                                        "title"
                                                )
                                        ),
                                        like
                                ),
                                cb.like(
                                        cb.lower(
                                                root.get(
                                                        "brand"
                                                )
                                        ),
                                        like
                                ),
                                cb.like(
                                        cb.lower(
                                                root.get(
                                                        "model"
                                                )
                                        ),
                                        like
                                )
                        )
                );
            }

            return cb.and(
                    ps.toArray(
                            new Predicate[0]
                    )
            );
        };
    }
}