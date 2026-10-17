package com.doskorea.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Лечит старую базу: колонка orders.status когда-то была создана как
 * ENUM('CANCELLED','PENDING','PURCHASED','RESERVED'), а в коде статус
 * теперь NEW. Hibernate (ddl-auto=update) такие колонки сам не меняет,
 * поэтому заказ не сохранялся: «Value not permitted ... "NEW"».
 *
 * Превращаем колонку в обычный VARCHAR(20) и меняем PENDING на NEW.
 * Данные сохраняются. Если колонка уже в порядке, ничего не делает.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class DatabaseMigration implements CommandLineRunner {

    private static final Logger log =
            LoggerFactory.getLogger(DatabaseMigration.class);

    private final JdbcTemplate jdbc;

    public DatabaseMigration(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(String... args) {

        log.info("DatabaseMigration: проверяю колонку orders.status");

        try {
            /*
             * Выполняем всегда: если колонка уже VARCHAR,
             * команда ничего не ломает.
             */
            jdbc.execute(
                    "ALTER TABLE orders ALTER COLUMN status " +
                            "SET DATA TYPE VARCHAR(20)"
            );

            int fixed = jdbc.update(
                    "UPDATE orders SET status = 'NEW' WHERE status = 'PENDING'"
            );

            log.info("DatabaseMigration: orders.status = VARCHAR(20), PENDING -> NEW: {}", fixed);

        } catch (Exception e) {
            log.error("DatabaseMigration: НЕ УДАЛОСЬ обновить orders.status", e);
        }
    }
}
