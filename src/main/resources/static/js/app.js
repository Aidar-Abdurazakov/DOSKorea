document.head.insertAdjacentHTML(
    'beforeend',

    `<style>

    .nav a{
        display:inline-flex;
        align-items:center;
        gap:7px;
    }

    .nav-icon{
        width:18px;
        height:18px;
        display:inline-flex;
        align-items:center;
        justify-content:center;
    }

    .nav-icon svg{
        width:18px;
        height:18px;
        fill:none;
        stroke:currentColor;
        stroke-width:1.7;
        stroke-linecap:round;
        stroke-linejoin:round;
    }

    .card{
        position:relative;
    }

    .card-link{
        color:inherit;
        text-decoration:none;
        display:flex;
        flex-direction:column;
        height:100%;
    }

    .like-btn{
        position:absolute;
        top:14px;
        left:14px;
        width:42px;
        height:42px;
        border:0;
        border-radius:50%;
        background:rgba(255,255,255,.96);
        color:var(--blue-deep);
        font-size:25px;
        line-height:1;
        cursor:pointer;
        box-shadow:0 8px 22px rgba(16,23,51,.15);
        z-index:2;
    }

    .like-btn.liked{
        color:var(--red);
    }

    .auth-card{
        max-width:470px;
        margin:64px auto;
        background:var(--card);
        padding:32px;
        border-radius:var(--radius-lg);
        box-shadow:var(--shadow);
        display:grid;
        gap:16px;
    }

    .auth-card h1{
        margin:0;
        font:700 28px var(--font-display);
    }

    .auth-card p{
        margin:0 0 4px;
        color:var(--ink-soft);
        line-height:1.5;
    }

    .auth-switch{
        text-align:center;
        color:var(--ink-soft);
        font-weight:600;
    }

    .block{
        width:100%;
        justify-content:center;
    }

    .account{
        padding-top:38px;
        padding-bottom:60px;
    }

    .account-head{
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:20px;
        margin-bottom:28px;
    }

    .account-head h1{
        margin:4px 0;
        font:700 32px var(--font-display);
    }

    .account-head p{
        margin:0;
        color:var(--ink-soft);
    }

    .eyebrow{
        color:var(--red);
        text-transform:uppercase;
        font-size:12px;
        font-weight:800;
        letter-spacing:.08em;
    }

    .account-section{
        background:var(--card);
        border-radius:var(--radius-lg);
        box-shadow:var(--shadow);
        padding:24px;
        margin-bottom:22px;
    }

    .account-section h2{
        margin:0 0 18px;
        font:700 22px var(--font-display);
    }

    .account-section h2 small{
        font:600 14px var(--font-body);
        color:var(--ink-soft);
    }

    .account-section h3{
        margin:22px 0 12px;
    }

    .account-data{
        display:grid;
        grid-template-columns:repeat(3,1fr);
        gap:12px;
    }

    .account-data div{
        padding:15px;
        background:var(--paper);
        border-radius:12px;
        display:grid;
        gap:5px;
    }

    .account-data span{
        color:var(--ink-soft);
        font-size:13px;
    }

    .account-data b{
        font-size:16px;
    }

    .orders{
        display:grid;
        gap:10px;
    }

    .order-card{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:15px;
        padding:16px;
        border:1px solid var(--line);
        border-radius:14px;
    }

    .order-card p{
        margin:5px 0 0;
        color:var(--ink-soft);
        font-size:13px;
    }

    .status{
        display:inline-flex;
        align-items:center;
        padding:7px 10px;
        border-radius:999px;
        background:#e7eefc;
        color:var(--blue-deep);
        font-size:12px;
        font-weight:800;
        white-space:nowrap;
    }

    .status.reserved{
        background:#fff0d7;
        color:#9a6100;
    }

    .status.purchased{
        background:#e2f5e8;
        color:#16713b;
    }

    .status.cancelled{
        background:#fbe3e6;
        color:var(--red-dark);
    }

    .status-chip{
        background:#eef2fb;
    }

    .product-actions{
        display:grid;
        gap:10px;
    }

    .like-big{
        min-height:48px;
        border:1px solid var(--line);
        border-radius:12px;
        background:#fff;
        color:var(--ink);
        font-weight:800;
        cursor:pointer;
    }

    .like-big.liked{
        color:var(--red);
        border-color:#f1b3bb;
    }

    .admin-status,
    .list select{
        padding:7px 9px;
        border:1px solid var(--line);
        border-radius:8px;
        background:#fff;
        color:var(--ink);
        font-weight:700;
    }

    @media(max-width:640px){

        .account-data{
            grid-template-columns:1fr;
        }

        .account-head{
            align-items:stretch;
            flex-direction:column;
        }

        .order-card{
            align-items:flex-start;
            flex-direction:column;
        }

        .auth-card{
            margin:35px auto;
            padding:24px;
        }

        .nav a{
            padding:7px 8px;
        }

        .nav-icon{
            display:none;
        }
    }

    </style>`
);


const app =
    document.getElementById(
        'app'
    );


let CFG = {
    whatsapp: ''
};


let CATALOG = {};


let navId = 0;


let ME = {
    authenticated: false,
    user: null
};


let lastPath = null;


const waLink = text =>

    `https://wa.me/${CFG.whatsapp}` +
    (
        text
            ? `?text=${encodeURIComponent(text)}`
            : ''
    );


function parseHash() {

    const raw =
        location.hash.slice(1) ||
        '/';

    const [
        path,
        query = ''
    ] =
        raw.split('?');

    return {
        path,

        params:
            Object.fromEntries(
                new URLSearchParams(
                    query
                )
            )
    };
}


function setNav(path) {

    document
        .querySelectorAll(
            '[data-nav]'
        )
        .forEach(a => {

            const key =
                a.dataset.nav;

            let on =
                key === 'home'
                    ? path === '/'
                    : path.startsWith(
                        '/' + key
                    );

            if (
                key === 'account'
            ) {

                on =
                    path === '/login' ||
                    path === '/register' ||
                    path === '/account';
            }

            a.classList.toggle(
                'active',
                on
            );

            if (on) {

                a.setAttribute(
                    'aria-current',
                    'page'
                );

            } else {

                a.removeAttribute(
                    'aria-current'
                );
            }
        });
}


async function refreshHeader() {

    try {

        ME =
            await api(
                '/auth/me'
            );

    } catch {

        ME = {
            authenticated: false,
            user: null
        };
    }

    /* Валюта из личного кабинета и актуальные курсы */
    DK.currency =
        ME.authenticated && ME.user && ME.user.currency
            ? ME.user.currency
            : 'USD';

    try {

        DK.rates =
            (
                await api('/currency')
            ).rates;

    } catch {
        /* без курсов цены остаются в долларах */
    }

    const label =
        document.getElementById(
            'account-label'
        );

    const account =
        document.getElementById(
            'account-nav'
        );

    if (label) {

        label.textContent =
            ME.authenticated
                ? `Кабинет (${ME.user.name})`
                : 'Войти';
    }

    if (account) {

        account.href =
            ME.authenticated
                ? '#/account'
                : '#/login';
    }
}


function requireAuth() {

    if (!ME.authenticated) {

        location.hash =
            '#/login';

        return false;
    }

    return true;
}


async function route() {

    const my =
        ++navId;

    const {
        path,
        params
    } =
        parseHash();

    await refreshHeader();

    setNav(path);

    if (
        path !== lastPath
    ) {

        window.scrollTo(
            0,
            0
        );

        lastPath =
            path;
    }

    try {

        if (path === '/') {

            await homeView(my);

        }

        else if (
            path === '/cars'
        ) {

            await catalogView(
                my,
                'cars',
                params
            );

        }

        else if (
            path === '/gadgets'
        ) {

            await catalogView(
                my,
                'gadgets',
                params
            );

        }

        else if (
            path === '/login'
        ) {

            await authView(
                my,
                false
            );

        }

        else if (
            path === '/register'
        ) {

            await authView(
                my,
                true
            );

        }

        else if (
            path === '/privacy'
        ) {
            privacyView();
        }

        else if (
            path === '/account'
        ) {

            await accountView(my);

        }

        else if (
            path.startsWith(
                '/product/'
            )
        ) {

            await productView(
                my,
                path.split('/')[2]
            );

        }

        else {

            notFound();
        }

    } catch (e) {

        if (
            my !== navId
        ) {
            return;
        }

        app.innerHTML = `

            <div class="wrap">

                <div
                    class="error"
                    style="margin-top:32px"
                >

                    <h3>
                        Не удалось загрузить страницу
                    </h3>

                    <p>
                        ${esc(e.message)}
                    </p>

                    <button
                        class="btn"
                        onclick="route()"
                    >
                        Повторить
                    </button>

                </div>

            </div>

        `;
    }
}


function privacyView() {
    document.title = 'Политика конфиденциальности — DOSKorea';
    app.innerHTML = `
      <main class="wrap" style="max-width:820px;padding:36px 20px 64px">
        <h1>Политика конфиденциальности</h1>
        <p>При регистрации DOSKorea получает имя, номер телефона и пароль (пароль хранится в виде криптографического хеша).</p>
        <h2>Для чего используются данные</h2>
        <p>Имя и номер телефона используются для создания аккаунта, связи с покупателем по заказу и информирования о статусе заказа. Мы не публикуем номер телефона в открытом каталоге.</p>
        <h2>Хранение и защита</h2>
        <p>Данные хранятся в базе сайта и доступны уполномоченному администратору для обработки заказов. Мы применяем разумные технические меры защиты, но передача данных через интернет не может быть гарантированно безопасной на 100%.</p>
        <h2>Ваши запросы</h2>
        <p>Чтобы уточнить, исправить или удалить данные аккаунта, обратитесь к администрации DOSKorea через контактный номер, указанный на сайте.</p>
        <p><strong>Важно:</strong> перед публичным запуском владелец сайта должен указать юридическое лицо/контакт оператора данных и проверить текст на соответствие законодательству страны работы.</p>
        <a class="btn ghost" href="#/register">Вернуться к регистрации</a>
      </main>`;
}

function notFound() {

    document.title =
        'Страница не найдена — DOSKorea';

    app.innerHTML = `

        <div class="wrap">

            <div
                class="empty"
                style="margin-top:32px"
            >

                <h3>
                    Такой страницы нет
                </h3>

                <p>
                    Возможно, ссылка устарела.
                </p>

                <a
                    class="btn"
                    href="#/"
                >
                    На главную
                </a>

            </div>

        </div>

    `;
}


/* Надпись в правом верхнем углу фото: «Бронь» или «Продано» */
function statusBadge(p) {

    if (p.status === 'RESERVED') {

        return '<span class="status-corner reserved">Бронь</span>';
    }

    if (p.status === 'SOLD') {

        return '<span class="status-corner sold">Продано</span>';
    }

    return '';
}


function cardHtml(p) {

    const chips = [

        `<span class="chip">
            ${p.releaseYear}
        </span>`

    ]
        .concat(
            (p.specs || [])
                .slice(0, 2)
                .map(
                    s =>
                        `<span class="chip">
                            ${esc(s.value)}
                        </span>`
                )
        )
        .join('');

    const liked =
        ME.authenticated &&
        p.liked;

    return `

        <article class="card${p.status === 'SOLD' ? ' is-sold' : ''}">

            <a
                class="card-link"
                href="#/product/${p.id}"
            >

                <div class="media">

                    ${cover(p)}

                    ${statusBadge(p)}

                </div>

                <div class="body">

                    <h3>
                        ${esc(p.title)}
                    </h3>

                    <div class="chips">
                        ${chips}
                    </div>

                    <div class="price">
                        ${money(p.price)}
                    </div>

                </div>

            </a>

            <button
                class="like-btn${liked ? ' liked' : ''}"
                data-like="${p.id}"
                type="button"
                aria-label="Добавить в понравившиеся"
            >
                ${liked ? '♥' : '♡'}
            </button>

        </article>

    `;
}


const opt = (
    v,
    label,
    sel
) =>

    `<option
        value="${esc(v)}"
        ${sel ? 'selected' : ''}
    >
        ${esc(label ?? v)}
    </option>`;


const typeList =
    types =>
        String(types)
            .split(',')
            .filter(Boolean);


function catBrands(types) {

    const seen =
        new Set();

    const out = [];

    for (
        const t
        of typeList(types)
    ) {

        for (
            const b
            of Object.keys(
                CATALOG[t] || {}
            )
        ) {

            if (
                !seen.has(
                    b.toLowerCase()
                )
            ) {

                seen.add(
                    b.toLowerCase()
                );

                out.push(b);
            }
        }
    }

    return out;
}


function catModels(
    types,
    brand
) {

    const bl =
        String(brand)
            .toLowerCase();

    const seen =
        new Set();

    const out = [];

    for (
        const t
        of typeList(types)
    ) {

        for (
            const [b, ms]
            of Object.entries(
                CATALOG[t] || {}
            )
        ) {

            if (
                b.toLowerCase() ===
                bl
            ) {

                for (
                    const m
                    of ms
                ) {

                    if (
                        !seen.has(
                            m.toLowerCase()
                        )
                    ) {

                        seen.add(
                            m.toLowerCase()
                        );

                        out.push(m);
                    }
                }
            }
        }
    }

    return out;
}


const sameText = (
    a,
    b
) =>
    String(a || '')
        .toLowerCase() ===
    String(b || '')
        .toLowerCase();


const group = (
    label,
    items,
    current
) =>

    items.length

        ?

        `<optgroup label="${esc(label)}">

            ${items
                .map(
                    x =>
                        opt(
                            x,
                            x,
                            sameText(
                                x,
                                current
                            )
                        )
                )
                .join('')}

        </optgroup>`

        : '';


async function fillBrands(
    sel,
    types,
    current
) {

    const stock =
        await api(
            '/filters/brands?' +
            qs({ types })
        );

    const have =
        new Set(
            stock.map(
                x =>
                    x.toLowerCase()
            )
        );

    const rest =
        catBrands(types)
            .filter(
                x =>
                    !have.has(
                        x.toLowerCase()
                    )
            );

    sel.innerHTML =
        opt(
            '',
            'Любая марка'
        ) +
        group(
            'Есть в наличии',
            stock,
            current
        ) +
        group(
            'Все марки',
            rest,
            current
        );
}


async function fillModels(
    sel,
    types,
    brand,
    current
) {

    if (!brand) {

        sel.innerHTML =
            opt(
                '',
                'Сначала марка'
            );

        sel.disabled = true;

        return;
    }

    const stock =
        await api(
            '/filters/models?' +
            qs({
                types,
                brand
            })
        );

    const have =
        new Set(
            stock.map(
                x =>
                    x.toLowerCase()
            )
        );

    const rest =
        catModels(
            types,
            brand
        ).filter(
            x =>
                !have.has(
                    x.toLowerCase()
                )
        );

    sel.innerHTML =
        opt(
            '',
            'Любая модель'
        ) +
        group(
            'Есть в наличии',
            stock,
            current
        ) +
        group(
            'Все модели',
            rest,
            current
        );

    sel.disabled = false;
}


function emptyHtml(
    section,
    types,
    p
) {

    const name =
        [
            p.brand,
            p.model
        ]
            .filter(Boolean)
            .join(' ');

    const msg =
        `Здравствуйте! Ищу: ${
            name ||
            (
                section === 'cars'
                    ? 'автомобиль'
                    : 'гаджет'
            )
        }. Есть ли такой вариант или можно заказать?`;

    return `

        <div
            class="empty"
            style="grid-column:1/-1"
        >

            <h3>
                ${
                    name
                        ? esc(name)
                        : 'По выбранным условиям ничего нет'
                }
            </h3>

            <p>
                Каталог регулярно пополняется.
                Напишите нам в WhatsApp.
            </p>

            <a
                class="btn wa"
                href="${esc(waLink(msg))}"
                target="_blank"
                rel="noopener"
            >
                Написать в WhatsApp
            </a>

        </div>

    `;
}


async function homeView(my) {

    document.title =
        'DOSKorea — машины и гаджеты из Кореи';

    app.innerHTML = `

        <section class="hero">

            <div class="wrap">

                <h1>
                    Машины и гаджеты из Кореи
                </h1>

                <p>
                    Выберите марку, модель и год.
                    Подходящий вариант можно добавить
                    в понравившиеся или заказать.
                </p>

            </div>

        </section>


        <div class="wrap">

            <form
                class="console"
                id="console"
            >

                <div
                    class="tabs"
                    role="tablist"
                >

                    <button
                        type="button"
                        class="tab"
                        data-types="CAR"
                        aria-selected="true"
                    >
                        Машины
                    </button>

                    <button
                        type="button"
                        class="tab"
                        data-types="PHONE"
                        aria-selected="false"
                    >
                        Телефоны
                    </button>

                    <button
                        type="button"
                        class="tab"
                        data-types="LAPTOP"
                        aria-selected="false"
                    >
                        Ноутбуки
                    </button>

                </div>


                <div class="console-row">

                    <label class="field">

                        Марка

                        <select
                            id="c-brand"
                        ></select>

                    </label>


                    <label class="field">

                        Модель

                        <select
                            id="c-model"
                            disabled
                        ></select>

                    </label>


                    <label class="field">

                        Год выпуска

                        <select
                            id="c-year"
                        >

                            <option value="">
                                Любой год
                            </option>

                        </select>

                    </label>


                    <button
                        class="btn red"
                        type="submit"
                    >
                        Найти
                    </button>

                </div>

            </form>


            <section class="section">

                <div class="page-head">

                    <h2>
                        Новые публикации
                    </h2>

                    <a href="#/cars">
                        Все машины
                    </a>

                </div>


                <div
                    class="grid"
                    id="latest"
                >

                    ${'<div class="skeleton"></div>'.repeat(6)}

                </div>

            </section>


            <section class="section">

                <div class="tiles">

                    <a
                        class="tile cars"
                        href="#/cars"
                    >

                        <div>

                            <h3>
                                Машины
                            </h3>

                            <p>
                                Hyundai, Kia, Genesis и другие.
                            </p>

                        </div>

                        ${ICONS.CAR}

                    </a>


                    <a
                        class="tile gadgets"
                        href="#/gadgets"
                    >

                        <div>

                            <h3>
                                Гаджеты
                            </h3>

                            <p>
                                Смартфоны и ноутбуки из Кореи.
                            </p>

                        </div>

                        ${ICONS.PHONE}

                    </a>

                </div>

            </section>

        </div>

    `;


    const form =
        document.getElementById(
            'console'
        );

    const tabs =
        [
            ...form.querySelectorAll(
                '[data-types]'
            )
        ];

    const brand =
        document.getElementById(
            'c-brand'
        );

    const model =
        document.getElementById(
            'c-model'
        );

    const year =
        document.getElementById(
            'c-year'
        );

    let types =
        'CAR';


    const resetAll =
        async () => {

            await fillBrands(
                brand,
                types,
                ''
            );

            await fillModels(
                model,
                types,
                brand.value,
                ''
            );

        };


    tabs.forEach(
        t => {

            t.addEventListener(
                'click',
                async () => {

                    tabs.forEach(
                        x =>
                            x.setAttribute(
                                'aria-selected',
                                String(x === t)
                            )
                    );

                    types =
                        t.dataset.types;

                    await resetAll();
                }
            );
        }
    );


    brand.addEventListener(
        'change',
        () =>
            fillModels(
                model,
                types,
                brand.value,
                ''
            )
    );


    form.addEventListener(
        'submit',
        e => {

            e.preventDefault();

            const section =
                types === 'CAR'
                    ? 'cars'
                    : 'gadgets';

            const q =
                qs({
                    types:
                        types === 'CAR'
                            ? ''
                            : types,

                    brand:
                        brand.value,

                    model:
                        model.value,

                    yearFrom:
                        year.value,

                    yearTo:
                        year.value
                });

            location.hash =
                `#/${section}` +
                (
                    q
                        ? '?' + q
                        : ''
                );
        }
    );


    await resetAll();


    const latest =
        await api(
            '/products?size=6'
        );


    if (
        my !== navId
    ) {
        return;
    }


    document.getElementById(
        'latest'
    ).innerHTML =

        latest.items.length

            ?

            latest.items
                .map(cardHtml)
                .join('')

            :

            `
                <div
                    class="empty"
                    style="grid-column:1/-1"
                >
                    <h3>
                        Каталог скоро пополнится
                    </h3>
                </div>
            `;
}


async function catalogView(
    my,
    section,
    p
) {

    const isCars =
        section === 'cars';

    const types =
        isCars
            ? 'CAR'
            : (
                p.types ||
                'PHONE,LAPTOP'
            );

    document.title =
        `${
            isCars
                ? 'Машины'
                : 'Гаджеты'
        } — DOSKorea`;


    const tabs =
        isCars

            ?

            ''

            :

            `
                <div
                    class="tabs"
                    style="margin-top:14px"
                >

                    ${
                        [
                            [
                                'PHONE,LAPTOP',
                                'Все'
                            ],
                            [
                                'PHONE',
                                'Телефоны'
                            ],
                            [
                                'LAPTOP',
                                'Ноутбуки'
                            ]
                        ]
                            .map(
                                ([v, l]) =>
                                    `
                                    <a
                                        class="tab"
                                        aria-selected="${
                                            types === v
                                        }"
                                        href="#/gadgets${
                                            v === 'PHONE,LAPTOP'
                                                ? ''
                                                : '?types=' + v
                                        }"
                                    >
                                        ${l}
                                    </a>
                                    `
                            )
                            .join('')
                    }

                </div>
            `;


    app.innerHTML = `

        <div class="wrap">

            <div class="page-head">

                <h1>
                    ${
                        isCars
                            ? 'Машины'
                            : 'Гаджеты'
                    }
                </h1>

                <div
                    class="count"
                    id="count"
                >
                    Загружаем…
                </div>

                ${tabs}

            </div>


            <button
                class="btn ghost small filter-toggle"
                id="ftoggle"
            >
                Фильтры
            </button>


            <div class="catalog">

                <form
                    class="filters"
                    id="filters"
                >

                    <h2>
                        Фильтры
                    </h2>


                    <label class="field">

                        Марка

                        <select
                            name="brand"
                            id="f-brand"
                        ></select>

                    </label>


                    <label class="field">

                        Модель

                        <select
                            name="model"
                            id="f-model"
                            disabled
                        ></select>

                    </label>


                    <div class="pair">

                        <label class="field">

                            Год от

                            <input
                                type="number"
                                name="yearFrom"
                                value="${esc(p.yearFrom || '')}"
                            >

                        </label>


                        <label class="field">

                            Год до

                            <input
                                type="number"
                                name="yearTo"
                                value="${esc(p.yearTo || '')}"
                            >

                        </label>

                    </div>


                    <div class="pair">

                        <label class="field">

                            Цена от, ${priceSymbol()}

                            <input
                                type="number"
                                name="minPrice"
                                value="${esc(priceToDisplay(p.minPrice))}"
                            >

                        </label>


                        <label class="field">

                            Цена до, ${priceSymbol()}

                            <input
                                type="number"
                                name="maxPrice"
                                value="${esc(priceToDisplay(p.maxPrice))}"
                            >

                        </label>

                    </div>


                    <label class="field">

                        Сортировка

                        <select name="sort">

                            ${
                                [
                                    [
                                        'newest',
                                        'Сначала новые'
                                    ],
                                    [
                                        'price_asc',
                                        'Сначала дешёвые'
                                    ],
                                    [
                                        'price_desc',
                                        'Сначала дорогие'
                                    ],
                                    [
                                        'year_desc',
                                        'Сначала новее по году'
                                    ],
                                    [
                                        'year_asc',
                                        'Сначала старше по году'
                                    ]
                                ]
                                    .map(
                                        ([v, l]) =>
                                            opt(
                                                v,
                                                l,
                                                (
                                                    p.sort ||
                                                    'newest'
                                                ) === v
                                            )
                                    )
                                    .join('')
                            }

                        </select>

                    </label>


                    <div class="actions">

                        <button
                            class="btn"
                            type="submit"
                        >
                            Показать
                        </button>

                        <a
                            class="btn ghost"
                            href="#/${section}"
                        >
                            Сбросить
                        </a>

                    </div>

                </form>


                <div>

                    <div
                        class="grid"
                        id="results"
                    >
                        ${'<div class="skeleton"></div>'.repeat(6)}
                    </div>

                    <div
                        class="more"
                        id="more"
                    ></div>

                </div>

            </div>

        </div>

    `;


    const form =
        document.getElementById(
            'filters'
        );

    const brand =
        form.querySelector(
            '#f-brand'
        );

    const model =
        form.querySelector(
            '#f-model'
        );


    document.getElementById(
        'ftoggle'
    ).onclick = e => {

        const open =
            form.classList.toggle(
                'open'
            );

        e.currentTarget
            .setAttribute(
                'aria-expanded',
                String(open)
            );
    };


    await fillBrands(
        brand,
        types,
        p.brand
    );


    await fillModels(
        model,
        types,
        p.brand,
        p.model
    );


    if (
        my !== navId
    ) {
        return;
    }


    brand.onchange =
        () =>
            fillModels(
                model,
                types,
                brand.value,
                ''
            );


    form.onsubmit =
        e => {

            e.preventDefault();

            const f =
                Object.fromEntries(
                    new FormData(form)
                );

            /* В адресе цены всегда в долларах, как в базе */
            if (f.minPrice) {
                f.minPrice = priceToUsd(f.minPrice);
            }

            if (f.maxPrice) {
                f.maxPrice = priceToUsd(f.maxPrice);
            }

            if (
                !isCars &&
                p.types
            ) {

                f.types =
                    p.types;
            }

            if (
                f.sort === 'newest'
            ) {

                delete f.sort;
            }

            const q =
                qs(f);

            location.hash =
                `#/${section}` +
                (
                    q
                        ? '?' + q
                        : ''
                );
        };


    const query = {

        types,

        brand:
            p.brand,

        model:
            p.model,

        yearFrom:
            p.yearFrom,

        yearTo:
            p.yearTo,

        minPrice:
            p.minPrice,

        maxPrice:
            p.maxPrice,

        sort:
            p.sort,

        size:
            12
    };


    const results =
        document.getElementById(
            'results'
        );

    const more =
        document.getElementById(
            'more'
        );

    const count =
        document.getElementById(
            'count'
        );


    let page = 0;


    async function load() {

        const data =
            await api(
                '/products?' +
                qs({
                    ...query,
                    page
                })
            );


        if (
            my !== navId
        ) {
            return;
        }


        if (
            page === 0
        ) {

            results.innerHTML =
                '';
        }


        if (
            data.total === 0
        ) {

            count.textContent =
                'Ничего не найдено';

            results.innerHTML =
                emptyHtml(
                    section,
                    types,
                    p
                );

            more.innerHTML =
                '';

            return;
        }


        count.textContent =
            `Найдено: ${data.total}`;


        results.insertAdjacentHTML(
            'beforeend',

            data.items
                .map(cardHtml)
                .join('')
        );


        more.innerHTML =
            data.page + 1 <
            data.totalPages

                ?

                `
                    <button
                        class="btn ghost"
                        id="more-btn"
                    >
                        Показать ещё
                    </button>
                `

                :

                '';


        const btn =
            document.getElementById(
                'more-btn'
            );


        if (btn) {

            btn.onclick =
                async () => {

                    btn.disabled =
                        true;

                    page++;

                    try {

                        await load();

                    } catch {

                        page--;

                        btn.disabled =
                            false;
                    }
                };
        }
    }


    await load();
}


async function authView(
    my,
    register
) {

    document.title =
        register
            ? 'Регистрация — DOSKorea'
            : 'Вход — DOSKorea';


    if (
        !register &&
        ME.authenticated
    ) {

        location.hash =
            '#/account';

        return;
    }


    app.innerHTML = `

        <div class="wrap">

            <form
                class="auth-card"
                id="auth-form"
            >

                <h1>
                    ${
                        register
                            ? 'Создать аккаунт'
                            : 'Войти в аккаунт'
                    }
                </h1>


                <p>
                    ${
                        register

                            ?

                            'Зарегистрируйтесь, чтобы сохранять понравившиеся товары и видеть свои заказы.'

                            :

                            'Войдите, чтобы увидеть свои данные, избранное и заказы.'
                    }
                </p>


                ${
                    register

                        ?

                        `
                        <label class="field">

                            Имя

                            <input
                                name="name"
                                required
                                maxlength="80"
                            >

                        </label>
                        `

                        :

                        ''
                }


                <label class="field">

                    Номер телефона

                    <input
                        name="phone"
                        type="tel"
                        placeholder="+996 555 123 456"
                        required
                    >

                </label>


                ${register ? `
                  <label class="check" style="align-items:flex-start;gap:10px;margin:12px 0">
                    <input type="checkbox" name="privacyConsent" required style="margin-top:4px">
                    <span>Я согласен(на) с <a href="#/privacy" target="_blank" rel="noopener">Политикой конфиденциальности</a> и обработкой имени и номера телефона для регистрации и обработки заказов.</span>
                  </label>
                ` : ''}

                <label class="field">

                    Пароль

                    <input
                        name="password"
                        type="password"
                        minlength="6"
                        required
                    >

                </label>


                <div
                    class="msg-err"
                    id="auth-error"
                ></div>


                <button
                    class="btn red block"
                    type="submit"
                >
                    ${
                        register
                            ? 'Зарегистрироваться'
                            : 'Войти'
                    }
                </button>


                <a
                    class="auth-switch"
                    href="#/${
                        register
                            ? 'login'
                            : 'register'
                    }"
                >
                    ${
                        register
                            ? 'Уже есть аккаунт? Войти'
                            : 'Нет аккаунта? Зарегистрироваться'
                    }
                </a>

            </form>

        </div>

    `;


    const form =
        document.getElementById(
            'auth-form'
        );

    const error =
        document.getElementById(
            'auth-error'
        );


    form.onsubmit =
        async e => {

            e.preventDefault();

            error.textContent =
                '';

            const body =
                Object.fromEntries(
                    new FormData(form)
                );
            if (register) body.privacyConsent = form.elements.privacyConsent.checked;


            try {

                await api(
                    '/auth/' +
                    (
                        register
                            ? 'register'
                            : 'login'
                    ),

                    {
                        method:
                            'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify(
                                body
                            )
                    }
                );


                await refreshHeader();

                location.hash =
                    '#/account';


            } catch (err) {

                error.textContent =
                    err.message;
            }
        };
}


async function accountView(
    my
) {

    if (
        !ME.authenticated
    ) {

        location.hash =
            '#/login';

        return;
    }


    const [
        orders,
        favorites
    ] =
        await Promise.all(
            [
                api('/orders'),
                api('/favorites')
            ]
        );


    if (
        my !== navId
    ) {
        return;
    }


    document.title =
        'Кабинет — DOSKorea';


    const cars =
        favorites.filter(
            p =>
                p.type === 'CAR'
        );


    const gadgets =
        favorites.filter(
            p =>
                p.type !== 'CAR'
        );


    const orderLabel = {

        NEW:
            'Новая',

        RESERVED:
            'Забронировано',

        PURCHASED:
            'Куплено',

        CANCELLED:
            'Отменено'
    };


    app.innerHTML = `

        <div class="wrap account">

            <div class="account-head">

                <div>

                    <span class="eyebrow">
                        Личный кабинет
                    </span>

                    <h1>
                        ${esc(ME.user.name)}
                    </h1>

                    <p>
                        ${esc(ME.user.phone)}
                    </p>

                </div>


                <button
                    class="btn ghost small"
                    id="logout-user"
                >
                    Выйти
                </button>

            </div>


            <section class="account-section">

                <h2>
                    Мои данные
                </h2>


                <div class="account-data">

                    <div>

                        <span>
                            Имя
                        </span>

                        <b>
                            ${esc(ME.user.name)}
                        </b>

                    </div>


                    <div>

                        <span>
                            Телефон
                        </span>

                        <b>
                            ${esc(ME.user.phone)}
                        </b>

                    </div>


                    <div>

                        <span>
                            Аккаунт создан
                        </span>

                        <b>
                            ${
                                new Date(
                                    ME.user.createdAt
                                )
                                    .toLocaleDateString(
                                        'ru-RU'
                                    )
                            }
                        </b>

                    </div>

                </div>

            </section>


            <section class="account-section">
                <h2>
                    Валюта цен
                </h2>
                <p class="note">
                    Выберите валюту, в которой показывать цены на сайте.
                    Цены пересчитываются по курсу, а точную сумму
                    подтверждает менеджер.
                </p>
                <div
                    class="currency-picker"
                    role="group"
                    aria-label="Валюта цен"
                >
                    ${
                        Object.entries(CURRENCIES)
                            .map(
                                ([code, c]) =>
                                    `<button
                                        type="button"
                                        class="cur-btn${
                                            (ME.user.currency || 'USD') === code
                                                ? ' active'
                                                : ''
                                        }"
                                        data-cur="${code}"
                                        aria-pressed="${
                                            (ME.user.currency || 'USD') === code
                                        }"
                                    >
                                        ${c.symbol} ${c.name}
                                    </button>`
                            )
                            .join('')
                    }
                </div>
            </section>

            <section class="account-section">
                <h2>
                    Мои заказы

                    <small>
                        ${orders.length}
                    </small>
                </h2>


                ${
                    orders.length

                        ?

                        `
                        <div class="orders">

                            ${
                                orders
                                    .map(
                                        o =>
                                            `
                                            <article
                                                class="order-card"
                                            >

                                                <div>

                                                    <b>
                                                        ${esc(
                                                            o.product.title
                                                        )}
                                                    </b>

                                                    <p>
                                                        ${
                                                            money(
                                                                o.product.price
                                                            )
                                                        }

                                                        ·

                                                        ${
                                                            new Date(
                                                                o.createdAt
                                                            )
                                                                .toLocaleString(
                                                                    'ru-RU'
                                                                )
                                                        }
                                                    </p>

                                                </div>


                                                <span
                                                    class="status ${
                                                        String(
                                                            o.status
                                                        ).toLowerCase()
                                                    }"
                                                >
                                                    ${
                                                        orderLabel[
                                                            o.status
                                                        ]
                                                    }
                                                </span>

                                            </article>
                                            `
                                    )
                                    .join('')
                            }

                        </div>
                        `

                        :

                        `
                        <div class="empty">

                            <h3>
                                Заказов пока нет
                            </h3>

                            <p>
                                Когда вы закажете товар,
                                он появится здесь.
                            </p>

                        </div>
                        `
                }

            </section>


            <section class="account-section">

                <h2>

                    Понравилось

                    <small>
                        ${favorites.length}
                    </small>

                </h2>


                ${
                    cars.length

                        ?

                        `
                        <h3>
                            Машины
                        </h3>

                        <div class="grid">
                            ${
                                cars
                                    .map(cardHtml)
                                    .join('')
                            }
                        </div>
                        `

                        :

                        ''
                }


                ${
                    gadgets.length

                        ?

                        `
                        <h3>
                            Гаджеты
                        </h3>

                        <div class="grid">
                            ${
                                gadgets
                                    .map(cardHtml)
                                    .join('')
                            }
                        </div>
                        `

                        :

                        ''
                }


                ${
                    !favorites.length

                        ?

                        `
                        <div class="empty">

                            <h3>
                                Пока ничего не понравилось
                            </h3>

                            <p>
                                Нажимайте ♡
                                на карточках товаров.
                            </p>

                        </div>
                        `

                        :

                        ''
                }

            </section>

        </div>

    `;


    document
        .querySelectorAll('[data-cur]')
        .forEach(
            btn => {

                btn.onclick =
                    async () => {

                        try {

                            ME.user =
                                await api(
                                    '/auth/currency',
                                    {
                                        method: 'PUT',

                                        headers: {
                                            'Content-Type':
                                                'application/json'
                                        },

                                        body: JSON.stringify({
                                            currency:
                                                btn.dataset.cur
                                        })
                                    }
                                );

                            /* Перерисовываем страницу с новыми ценами */
                            route();

                        } catch (e) {

                            alert(e.message);
                        }
                    };
            }
        );


    document.getElementById(
        'logout-user'
    ).onclick =
        async () => {

            await api(
                '/auth/logout',
                {
                    method: 'POST'
                }
            );

            await refreshHeader();

            location.hash =
                '#/';
        };
}


async function productView(
    my,
    id
) {

    let p;


    try {

        p =
            await api(
                '/products/' +
                encodeURIComponent(id)
            );

    } catch (e) {

        if (
            e.status === 404
        ) {

            notFound();

            return;
        }

        throw e;
    }


    if (
        my !== navId
    ) {
        return;
    }


    document.title =
        `${p.title} — DOSKorea`;


    const section =
        p.type === 'CAR'
            ? 'cars'
            : 'gadgets';


    const imgs =
        p.images || [];


    let liked =
        false;


    if (
        ME.authenticated
    ) {

        try {

            liked =
                (
                    await api(
                        '/favorites/' +
                        id
                    )
                ).liked;

        } catch {
        }
    }


    const statusLabel = {

        AVAILABLE:
            'В наличии',

        RESERVED:
            'Забронировано',

        SOLD:
            'Продано'
    };


    const unavailable =
        p.status === 'SOLD' ||
        p.status === 'RESERVED' ||
        !p.available;


    const msg =
        `Здравствуйте! Хочу заказать: ${
            p.title
        } (${
            p.brand
        } ${
            p.model
        }, ${
            p.releaseYear
        }), ${
            moneyBoth(p.price)
        }.\n${
            location.href
        }`;


    app.innerHTML = `

        <div class="wrap">

            <a
                class="back"
                href="#/${section}"
            >
                Назад в
                «${
                    section === 'cars'
                        ? 'Машины'
                        : 'Гаджеты'
                }»
            </a>


            <div class="product">


                <div class="gallery">

                    ${statusBadge(p)}

                    <div
                        class="main"
                        id="main-pic"
                    >
                        ${cover(p)}
                    </div>


                    ${
                        imgs.length > 1

                            ?

                            `
                            <div
                                class="thumbs"
                                id="thumbs"
                            >

                                ${
                                    imgs
                                        .map(
                                            (u, i) =>
                                                `
                                                <button
                                                    type="button"
                                                    data-i="${i}"
                                                    aria-current="${
                                                        i === 0
                                                    }"
                                                >

                                                    <img
                                                        src="${esc(u)}"
                                                        alt=""
                                                        loading="lazy"
                                                    >

                                                </button>
                                                `
                                        )
                                        .join('')
                                }

                            </div>
                            `

                            :

                            ''
                    }

                </div>


                <aside class="info">

                    <h1>
                        ${esc(p.title)}
                    </h1>


                    <div class="chips">

                        <span class="chip">
                            ${esc(p.brand)}
                        </span>

                        <span class="chip">
                            ${esc(p.model)}
                        </span>

                        <span class="chip">
                            ${p.releaseYear} г.
                        </span>

                        <span class="chip status-chip">
                            ${
                                statusLabel[
                                    p.status ||
                                    'AVAILABLE'
                                ]
                            }
                        </span>

                    </div>


                    <div class="price">
                        ${money(p.price)}
                    </div>

                    ${
                        activeCode() !== 'USD'
                            ? `<p class="note price-note">
                                Цена в долларах: ${moneyUsd(p.price)}.
                                Сумма в выбранной валюте пересчитана
                                по курсу, точную стоимость подтвердит менеджер.
                            </p>`
                            : ''
                    }


                    <div class="product-actions">

                        <button
                            class="like-big${
                                liked
                                    ? ' liked'
                                    : ''
                            }"
                            id="product-like"
                            type="button"
                        >

                            ${
                                liked
                                    ? '♥'
                                    : '♡'
                            }

                            <span>
                                ${
                                    liked
                                        ? 'В понравившихся'
                                        : 'Понравилось'
                                }
                            </span>

                        </button>


                        ${
                            unavailable

                                ?

                                `
                                <button
                                    class="btn ghost block"
                                    disabled
                                >
                                    ${
                                        p.status === 'SOLD'
                                            ? 'Продано'
                                            : p.status === 'RESERVED'
                                                ? 'Забронировано'
                                                : 'Товар недоступен'
                                    }
                                </button>
                                `

                                :

                                `
                                <button
                                    class="btn wa block"
                                    id="order-btn"
                                >
                                    Заказать в WhatsApp
                                </button>
                                `
                        }

                    </div>


                    <p class="note">
                        Заказ сохраняется
                        в вашем личном кабинете.
                        После этого откроется
                        WhatsApp для связи
                        с менеджером.
                    </p>

                </aside>

            </div>


            <section
                class="details"
            >

                <div>

                    <h2>
                        Описание
                    </h2>

                    <p>
                        ${
                            p.description
                                ? esc(
                                    p.description
                                )
                                : 'Описание скоро появится.'
                        }
                    </p>

                </div>


                <div>

                    <h2>
                        Характеристики
                    </h2>


                    ${
                        (p.specs || [])
                            .length

                            ?

                            `
                            <table
                                class="specs"
                            >

                                <tbody>

                                    ${
                                        p.specs
                                            .map(
                                                s =>
                                                    `
                                                    <tr>

                                                        <th>
                                                            ${esc(
                                                                s.name
                                                            )}
                                                        </th>

                                                        <td>
                                                            ${esc(
                                                                s.value
                                                            )}
                                                        </td>

                                                    </tr>
                                                    `
                                            )
                                            .join('')
                                    }

                                </tbody>

                            </table>
                            `

                            :

                            `
                            <p>
                                Характеристики уточняются.
                            </p>
                            `
                    }

                </div>

            </section>

        </div>

    `;


    document.getElementById(
        'product-like'
    ).onclick =
        async () => {

            if (
                !requireAuth()
            ) {
                return;
            }


            const result =
                await api(
                    '/favorites/' +
                    id,
                    {
                        method:
                            'POST'
                    }
                );


            const button =
                document.getElementById(
                    'product-like'
                );


            button.classList.toggle(
                'liked',
                result.liked
            );


            button.innerHTML =
                `${
                    result.liked
                        ? '♥'
                        : '♡'
                }

                <span>
                    ${
                        result.liked
                            ? 'В понравившихся'
                            : 'Понравилось'
                    }
                </span>`;
        };


    const order =
        document.getElementById(
            'order-btn'
        );


    if (order) {

        order.onclick =
            async () => {

                if (
                    !requireAuth()
                ) {
                    return;
                }


                try {

                    await api(
                        '/orders/' +
                        id,
                        {
                            method:
                                'POST'
                        }
                    );


                    window.open(
                        waLink(msg),
                        '_blank',
                        'noopener'
                    );


                } catch (e) {

                    alert(
                        e.message
                    );
                }
            };
    }


    const thumbs =
        document.getElementById(
            'thumbs'
        );


    if (thumbs) {

        thumbs.onclick =
            e => {

                const b =
                    e.target.closest(
                        'button'
                    );

                if (!b) {
                    return;
                }


                document.getElementById(
                    'main-pic'
                ).innerHTML = `

                    <img
                        src="${esc(
                            imgs[
                                +b.dataset.i
                            ]
                        )}"
                        alt="${esc(
                            p.title
                        )}"
                    >

                `;


                thumbs
                    .querySelectorAll(
                        'button'
                    )
                    .forEach(
                        x =>
                            x.setAttribute(
                                'aria-current',
                                String(
                                    x === b
                                )
                            )
                    );
            };
    }
}


document.addEventListener(
    'click',
    async e => {

        const b =
            e.target.closest(
                '[data-like]'
            );

        if (!b) {
            return;
        }


        e.preventDefault();

        e.stopPropagation();


        if (
            !requireAuth()
        ) {
            return;
        }


        try {

            const result =
                await api(
                    '/favorites/' +
                    b.dataset.like,
                    {
                        method:
                            'POST'
                    }
                );


            b.textContent =
                result.liked
                    ? '♥'
                    : '♡';


            b.classList.toggle(
                'liked',
                result.liked
            );


        } catch (err) {

            if (
                err.status === 401
            ) {

                location.hash =
                    '#/login';

            } else {

                alert(
                    err.message
                );
            }
        }
    }
);


window.addEventListener(
    'hashchange',
    route
);


Promise.all(
    [

        api('/config')
            .then(
                c =>
                    CFG = c
            )
            .catch(
                () => {}
            ),

        fetch(
            '/data/catalog.json'
        )
            .then(
                r =>
                    r.json()
            )
            .then(
                j =>
                    CATALOG = j
            )
            .catch(
                () => {}
            )

    ]

).finally(
    async () => {

        const wa =
            document.getElementById(
                'hdr-wa'
            );


        if (wa) {

            wa.href =
                waLink(
                    'Здравствуйте! Интересует заказ на DOSKorea.'
                );
        }


        await refreshHeader();

        route();
    }
);