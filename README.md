# DOSKorea

Сайт-каталог корейских машин и гаджетов (телефоны, ноутбуки). Заказ через WhatsApp.

**Бэкенд:** Java 17, Spring Boot 3 (Web, Data JPA, Security, Validation), база H2 (файл).
**Фронтенд:** чистый JavaScript + CSS, лежит в `src/main/resources/static` и раздаётся самим Spring Boot. Отдельная сборка не нужна.

## Запуск на Mac (M1)

```bash
brew install openjdk@17 maven
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

# обязательно задайте свои значения
export ADMIN_USER=admin
export ADMIN_PASSWORD='придумайте-длинный-пароль'
export WHATSAPP_NUMBER=996XXXXXXXXX     # только цифры, с кодом страны, без +

mvn spring-boot:run
```

- Сайт: http://localhost:8080
- Админка: http://localhost:8080/admin.html

Если `brew install openjdk@17` не добавил Java в PATH, выполните команду, которую brew выведет в конце установки.
Для IntelliJ IDEA установите плагин Lombok (в свежих версиях он уже встроен) и включите Annotation Processing.

## Что умеет сайт

- Разделы «Машины» и «Гаджеты» (телефоны и ноутбуки).
- Поиск: марка → модель → год. Дальше фильтры по цене и году и сортировка.
- Карточка товара: фото, описание, характеристики. Кнопка «Заказать в WhatsApp» открывает чат с готовым сообщением.
- Админка: вход по логину и паролю, добавление, изменение, удаление, загрузка нескольких фото, выбор обложки, скрытие товара («продан»).

## API

Публичное:

| Метод | Адрес | Что делает |
|---|---|---|
| GET | `/api/products` | Список. Параметры: `types`, `brand`, `model`, `yearFrom`, `yearTo`, `minPrice`, `maxPrice`, `q`, `sort`, `page`, `size` |
| GET | `/api/products/{id}` | Один товар |
| GET | `/api/filters/brands?types=CAR` | Марки |
| GET | `/api/filters/models?types=CAR&brand=Kia` | Модели марки |
| GET | `/api/filters/years?types=CAR&brand=Kia&model=K5` | Годы |
| GET | `/api/config` | Номер WhatsApp |

Для администратора (HTTP Basic): `GET /api/admin/me`, `GET|POST /api/admin/products`, `GET|PUT|DELETE /api/admin/products/{id}`, `POST /api/admin/upload`.

## Структура

```
src/main/java/com/doskorea/
  model/       Product, Spec, ProductType, ProductRequest, PageResponse
  repository/  ProductRepository
  service/     ProductService, ProductFilter
  web/         ProductController (публичное), AdminController, ApiExceptionHandler
  config/      SecurityConfig, WebConfig (раздача /uploads), DataSeeder (демо-товары)
src/main/resources/
  application.properties
  static/      index.html, admin.html, css/style.css, js/api.js, js/app.js, js/admin.js
```

## Перед публикацией в интернет

1. Смените `ADMIN_PASSWORD` и подключите HTTPS (Basic-авторизация без HTTPS небезопасна).
2. Замените H2 на PostgreSQL (`spring.datasource.*` в `application.properties` и зависимость драйвера в `pom.xml`).
3. Храните папки `uploads/` и `data/` на постоянном диске и делайте резервные копии.
4. Удалите демо-товары через админку (они добавляются только при пустой базе, см. `DataSeeder`).
5. Закажите свой домен и подключите его к серверу.
# DOSKorea
