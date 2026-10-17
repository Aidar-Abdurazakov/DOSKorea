package com.doskorea.config;

import com.doskorea.model.Product;
import com.doskorea.model.ProductType;
import com.doskorea.model.Spec;
import com.doskorea.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/** Если база пустая, добавляет демо-товары, чтобы сайт сразу выглядел живым. Удалите их через админку. */
@Component
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository repo;

    public DataSeeder(ProductRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(String... args) {
        if (repo.count() > 0) return;

        add(ProductType.CAR, "Hyundai", "Sonata", 2021, "17500", "Hyundai Sonata DN8 2.0 LPG",
                "Седан бизнес-класса в отличном состоянии. Один владелец, полное обслуживание, без ДТП.",
                "Пробег", "42 000 км", "Двигатель", "2.0 л, газ (LPG)", "Коробка", "Автомат",
                "Привод", "Передний", "Цвет", "Белый");
        add(ProductType.CAR, "Hyundai", "Sonata", 2019, "13900", "Hyundai Sonata DN8 2.0",
                "Комфортный седан для города и трассы. Салон без потёртостей.",
                "Пробег", "68 000 км", "Двигатель", "2.0 л, бензин", "Коробка", "Автомат",
                "Привод", "Передний", "Цвет", "Чёрный");
        add(ProductType.CAR, "Kia", "K5", 2022, "19800", "Kia K5 DL3 1.6 Turbo",
                "Современный дизайн, турбо-мотор, полный комплект электроники.",
                "Пробег", "28 000 км", "Двигатель", "1.6 л, турбо", "Коробка", "Автомат",
                "Привод", "Передний", "Цвет", "Серый");
        add(ProductType.CAR, "Kia", "Carnival", 2020, "27500", "Kia Carnival 9-местный",
                "Семейный минивэн: 9 мест, электро-двери, камеры кругового обзора.",
                "Пробег", "55 000 км", "Двигатель", "2.2 л, дизель", "Коробка", "Автомат",
                "Привод", "Передний", "Цвет", "Чёрный");
        add(ProductType.CAR, "Genesis", "G80", 2021, "34900", "Genesis G80 2.5T",
                "Премиальный седан. Кожаный салон, вентиляция сидений, адаптивный круиз.",
                "Пробег", "37 000 км", "Двигатель", "2.5 л, турбо", "Коробка", "Автомат",
                "Привод", "Задний", "Цвет", "Синий");

        add(ProductType.PHONE, "Samsung", "Galaxy S24 Ultra", 2024, "980", "Samsung Galaxy S24 Ultra 256 ГБ",
                "Флагман с S Pen и камерой 200 МП. Корейская версия, полный комплект.",
                "Память", "256 ГБ", "Оперативная память", "12 ГБ", "Экран", "6.8\" Dynamic AMOLED 120 Гц",
                "Камера", "200 МП + 50 + 12 + 10", "Аккумулятор", "5000 мА·ч", "Цвет", "Titanium Gray");
        add(ProductType.PHONE, "Samsung", "Galaxy Z Flip6", 2024, "720", "Samsung Galaxy Z Flip6 256 ГБ",
                "Компактный складной смартфон с внешним экраном 3.4\".",
                "Память", "256 ГБ", "Оперативная память", "12 ГБ", "Экран", "6.7\" Dynamic AMOLED 120 Гц",
                "Камера", "50 МП + 12 МП", "Цвет", "Mint");
        add(ProductType.PHONE, "Samsung", "Galaxy A55", 2024, "340", "Samsung Galaxy A55 128 ГБ",
                "Надёжный смартфон среднего класса с яркой AMOLED-матрицей.",
                "Память", "128 ГБ", "Оперативная память", "8 ГБ", "Экран", "6.6\" Super AMOLED 120 Гц",
                "Аккумулятор", "5000 мА·ч", "Цвет", "Awesome Navy");

        add(ProductType.LAPTOP, "Samsung", "Galaxy Book4 Pro", 2024, "1250", "Samsung Galaxy Book4 Pro 16\"",
                "Тонкий ноутбук с AMOLED-экраном 3K для работы и учёбы.",
                "Процессор", "Intel Core Ultra 7 155H", "Оперативная память", "16 ГБ", "Накопитель", "512 ГБ SSD",
                "Экран", "16\" AMOLED 3K 120 Гц", "Вес", "1.56 кг");
        add(ProductType.LAPTOP, "LG", "gram 17", 2023, "1480", "LG gram 17 (17Z90R)",
                "Лёгкий 17-дюймовый ноутбук: большой экран при весе меньше 1.4 кг.",
                "Процессор", "Intel Core i7-1360P", "Оперативная память", "16 ГБ", "Накопитель", "1 ТБ SSD",
                "Экран", "17\" IPS WQXGA", "Вес", "1.35 кг");
    }

    private void add(ProductType type, String brand, String model, int year, String price,
                     String title, String description, String... specPairs) {
        Product p = new Product();
        p.setType(type);
        p.setBrand(brand);
        p.setModel(model);
        p.setReleaseYear(year);
        p.setPrice(new BigDecimal(price));
        p.setTitle(title);
        p.setDescription(description);
        for (int i = 0; i + 1 < specPairs.length; i += 2) {
            p.getSpecs().add(new Spec(specPairs[i], specPairs[i + 1]));
        }
        repo.save(p);
    }
}
