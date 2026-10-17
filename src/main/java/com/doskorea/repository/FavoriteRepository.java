// package com.doskorea.repository;

// import com.doskorea.model.Favorite;
// import org.springframework.data.jpa.repository.JpaRepository;

// import java.util.List;
// import java.util.Optional;

// public interface FavoriteRepository
//         extends JpaRepository<Favorite, Long> {

//     boolean existsByUserIdAndProductId(
//             Long userId,
//             Long productId
//     );

//     Optional<Favorite> findByUserIdAndProductId(
//             Long userId,
//             Long productId
//     );

//     List<Favorite> findByUserIdOrderByCreatedAtDesc(
//             Long userId
//     );
// }




package com.doskorea.repository;

import com.doskorea.model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    // Получить избранное пользователя, начиная с новых записей.
    List<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Проверить, добавлен ли товар в избранное пользователя.
    boolean existsByUserIdAndProductId(Long userId, Long productId);

    // Найти конкретную запись избранного.
    Optional<Favorite> findByUserIdAndProductId(Long userId, Long productId);

    // Удалить все записи избранного, связанные с товаром.
    @Modifying
    @Query("DELETE FROM Favorite f WHERE f.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);
}


