package com.doskorea.repository;

import com.doskorea.model.Product;
import com.doskorea.model.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    // Списки марок, моделей и годов («есть в наличии») не включают проданные товары.

    @Query("select distinct p.brand from Product p " +
            "where p.available = true " +
            "and (p.status is null or p.status <> com.doskorea.model.ProductStatus.SOLD) " +
            "and p.type in :types order by p.brand")
    List<String> findBrands(@Param("types") Collection<ProductType> types);

    @Query("select distinct p.model from Product p " +
            "where p.available = true " +
            "and (p.status is null or p.status <> com.doskorea.model.ProductStatus.SOLD) " +
            "and p.type in :types and lower(p.brand) = lower(:brand) order by p.model")
    List<String> findModels(@Param("types") Collection<ProductType> types, @Param("brand") String brand);

    /** brand и model: передайте "%" чтобы не фильтровать по ним. */
    @Query("select distinct p.releaseYear from Product p " +
            "where p.available = true " +
            "and (p.status is null or p.status <> com.doskorea.model.ProductStatus.SOLD) " +
            "and p.type in :types " +
            "and lower(p.brand) like lower(:brand) and lower(p.model) like lower(:model) " +
            "order by p.releaseYear desc")
    List<Integer> findYears(@Param("types") Collection<ProductType> types,
                            @Param("brand") String brand,
                            @Param("model") String model);
}
