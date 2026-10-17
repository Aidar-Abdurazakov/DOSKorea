const ICONS = {

    CAR:
        '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M8 40l4-14c1-3 3-5 7-5h26c4 0 6 2 7 5l4 14"/>' +
        '<rect x="6" y="40" width="52" height="11" rx="4"/>' +
        '<circle cx="18" cy="51" r="4"/>' +
        '<circle cx="46" cy="51" r="4"/>' +
        '</svg>',

    PHONE:
        '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="20" y="6" width="24" height="52" rx="5"/>' +
        '<path d="M28 51h8"/>' +
        '</svg>',

    LAPTOP:
        '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="12" y="14" width="40" height="28" rx="3"/>' +
        '<path d="M5 50h54"/>' +
        '</svg>'
};


const TYPE_LABEL = {

    CAR: 'Машины',

    PHONE: 'Телефоны',

    LAPTOP: 'Ноутбуки'

};


const esc = s =>

    String(s ?? '')
        .replace(
            /[&<>"']/g,

            c =>
                ({
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[c])
        );


/*
 * Валюты. Все цены в базе хранятся в долларах (USD),
 * а на экране пересчитываются в валюту, выбранную в личном кабинете.
 */
const CURRENCIES = {
    USD: { symbol: '$',   before: true,  name: 'Доллары' },
    KGS: { symbol: 'сом', before: false, name: 'Сомы' },
    RUB: { symbol: '₽',   before: false, name: 'Рубли' },
    KZT: { symbol: '₸',   before: false, name: 'Тенге' },
    EUR: { symbol: '€',   before: true,  name: 'Евро' }
};

/* Выбранная валюта и курсы (сколько единиц валюты стоит 1 доллар) */
const DK = {
    currency: 'USD',
    rates: { USD: 1 }
};

/* Валюта, в которой реально показываем цены (если курс не загружен, то доллары) */
const activeCode = () =>
    DK.currency !== 'USD' && Number(DK.rates[DK.currency]) > 0
        ? DK.currency
        : 'USD';

const formatIn = (usd, code) => {

    const c = CURRENCIES[code] || CURRENCIES.USD;

    const rate = code === 'USD'
        ? 1
        : Number(DK.rates[code]) || 1;

    const value = Math.round(Number(usd) * rate)
        .toLocaleString('ru-RU');

    return c.before
        ? c.symbol + value
        : value + '\u00a0' + c.symbol;
};

/* Цена в выбранной валюте */
const money = n => formatIn(n, activeCode());

/* Цена в долларах */
const moneyUsd = n => formatIn(n, 'USD');

/* «$14 700 (≈ 1 285 515 сом)»: для сообщения менеджеру */
const moneyBoth = n =>
    activeCode() === 'USD'
        ? moneyUsd(n)
        : moneyUsd(n) + ' (≈ ' + money(n) + ')';

/* Фильтр цены: в окошках пользователь вводит суммы в своей валюте */
const priceSymbol = () => CURRENCIES[activeCode()].symbol;

const priceToDisplay = usd => {

    if (usd === '' || usd == null) {
        return '';
    }

    const code = activeCode();

    if (code === 'USD') {
        return String(usd);
    }

    const v = Number(usd) * Number(DK.rates[code]);

    if (!(v > 0)) {
        return '';
    }

    /* Округляем до 3 значащих цифр, чтобы не было «1 000 038 сом» */
    const step = Math.pow(10, Math.max(Math.floor(Math.log10(v)) - 2, 0));

    return String(Math.round(v / step) * step);
};

const priceToUsd = shown => {

    const v = Number(shown);

    if (!(v >= 0)) {
        return '';
    }

    const code = activeCode();

    return String(
        code === 'USD'
            ? Math.round(v)
            : Math.round(v / Number(DK.rates[code]))
    );
};


const qs = obj => {

    const p =
        new URLSearchParams();

    for (
        const [k, v]
        of Object.entries(obj)
    ) {

        if (
            v !== '' &&
            v != null
        ) {

            p.set(k, v);
        }
    }

    return p.toString();
};


async function api(
    path,
    opts = {}
) {

    let res;

    try {

        res =
            await fetch(
                '/api' + path,
                {
                    credentials:
                        'same-origin',

                    ...opts
                }
            );

    } catch {

        throw new Error(
            'Нет соединения с сервером.'
        );
    }

    if (!res.ok) {

        let msg =
            'Ошибка ' +
            res.status;

        try {

            msg =
                (
                    await res.json()
                ).message ||
                msg;

        } catch {
        }

        const error =
            new Error(msg);

        error.status =
            res.status;

        throw error;
    }

    return res.status === 204
        ? null
        : res.json();
}


const cover = (
    p,
    cls = ''
) =>

    p.images &&
    p.images.length

        ?

        `<img
            class="${cls}"
            src="${esc(p.images[0])}"
            alt="${esc(p.title)}"
            loading="lazy"
        >`

        :

        `<div
            class="ph ${cls}"
            aria-hidden="true"
        >
            ${ICONS[p.type] || ''}
        </div>`;