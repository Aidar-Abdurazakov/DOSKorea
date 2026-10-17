/* Админка DOSKorea: вход, список товаров, добавление/изменение/удаление, загрузка фото */

const root = document.getElementById('root');
const dlg = document.getElementById('dlg');
const logoutBtn = document.getElementById('logout');

// Справочник марок и моделей для подсказок в форме (static/data/catalog.json)
let CATALOG = {};
fetch('/data/catalog.json').then(r => r.json()).then(j => { CATALOG = j; }).catch(() => { /* без подсказок тоже работает */ });

// Логин и пароль хранятся только в sessionStorage (до закрытия вкладки)
let AUTH = sessionStorage.getItem('dk_auth') || '';
const b64 = s => btoa(unescape(encodeURIComponent(s)));

async function admin(path, opts = {}) {
  const headers = { ...(opts.headers || {}), Authorization: 'Basic ' + AUTH };
  try {
    return await api('/admin' + path, { ...opts, headers });
  } catch (e) {
    if (e.status === 401) { logout(); throw new Error('Сессия истекла. Войдите снова.'); }
    throw e;
  }
}

function toast(text) {
  const t = document.createElement('div');
  t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = text;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

function logout() {
  AUTH = ''; sessionStorage.removeItem('dk_auth');
  logoutBtn.hidden = true;
  loginView();
}
logoutBtn.addEventListener('click', logout);

/* ---------- Вход ---------- */
function loginView(err = '') {
  document.title = 'Вход — DOSKorea';
  root.innerHTML = `
  <form class="login" id="login">
    <h1>Вход для администратора</h1>
    <label class="field">Логин<input type="text" name="u" autocomplete="username" required autofocus></label>
    <label class="field">Пароль<input type="password" name="p" autocomplete="current-password" required></label>
    <div class="msg-err" role="alert">${esc(err)}</div>
    <button class="btn" type="submit">Войти</button>
  </form>`;
  document.getElementById('login').addEventListener('submit', async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    AUTH = b64(f.get('u') + ':' + f.get('p'));
    const btn = e.target.querySelector('button'); btn.disabled = true;
    try {
      await api('/admin/me', { headers: { Authorization: 'Basic ' + AUTH } });
      sessionStorage.setItem('dk_auth', AUTH);
      listView();
    } catch (ex) {
      AUTH = '';
      loginView(ex.status === 401 ? 'Неверный логин или пароль' : ex.message);
    }
  });
}

/* ---------- Курсы валют ---------- */
async function ratesDialog() {
  let data;
  try { data = await api('/currency'); } catch (ex) { toast(ex.message); return; }

  const names = { KGS: 'Сом', RUB: 'Рубль', KZT: 'Тенге', EUR: 'Евро' };
  const when = data.updatedAt ? new Date(data.updatedAt).toLocaleString('ru-RU') : '—';

  dlg.innerHTML = `
  <form class="dlg" id="rform" novalidate>
    <h2>Курсы валют</h2>
    <p class="note">Цены на сайте хранятся в долларах. Укажите, сколько единиц каждой валюты стоит 1 доллар:
      по этим курсам цены пересчитываются для покупателей, выбравших валюту в личном кабинете.
      Последнее обновление: ${esc(when)}.</p>
    ${Object.entries(names).map(([code, n]) => `
    <label class="field">${n} за 1 $ (${code})
      <input type="number" name="${code}" step="any" min="0.0001" value="${esc(data.rates[code])}" required>
    </label>`).join('')}
    <div class="msg-err" id="rerr" role="alert"></div>
    <div class="foot-actions">
      <button type="button" class="btn ghost" id="rcancel">Отмена</button>
      <button type="submit" class="btn" id="rsave">Сохранить</button>
    </div>
  </form>`;

  const form = dlg.querySelector('#rform'), err = form.querySelector('#rerr');
  form.querySelector('#rcancel').onclick = () => dlg.close();
  form.addEventListener('submit', async e => {
    e.preventDefault();
    err.textContent = '';
    const body = {};
    for (const code of Object.keys(names)) {
      const v = Number(form.elements[code].value);
      if (!(v > 0)) { err.textContent = 'Курс ' + names[code].toLowerCase() + ' должен быть больше нуля'; return; }
      body[code] = v;
    }
    const save = form.querySelector('#rsave'); save.disabled = true;
    try {
      await admin('/currency', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      dlg.close(); toast('Курсы сохранены');
    } catch (ex) { err.textContent = ex.message; save.disabled = false; }
  });
  dlg.showModal();
}

/* ---------- Бронь / продано ---------- */
const STATUS_LABEL = { AVAILABLE: 'В наличии', RESERVED: 'Бронь', SOLD: 'Продано' };
const statusOptions = cur => Object.entries(STATUS_LABEL)
  .map(([k, l]) => `<option value="${k}"${(cur || 'AVAILABLE') === k ? ' selected' : ''}>${l}</option>`).join('');


/* ---------- Заказы покупателей ---------- */
const ORDER_LABEL = { NEW: 'Новый', RESERVED: 'Забронировано', PURCHASED: 'Куплено', CANCELLED: 'Отменено' };
const ORDER_STATUSES = ['NEW', 'RESERVED', 'PURCHASED', 'CANCELLED'];

async function ordersView() {
  logoutBtn.hidden = false;
  document.title = 'Заказы — админка DOSKorea';
  root.innerHTML = `
    <div class="bar">
      <h1>Заказы</h1>
      <button class="btn ghost" id="show-products">К товарам</button>
      <button class="btn ghost" id="refresh-orders">Обновить</button>
    </div>
    <p class="note">Изменение статуса заказа автоматически обновляет статус товара и отображается покупателю в личном кабинете.</p>
    <div class="table-wrap"><table class="list">
      <thead><tr><th>№</th><th>Покупатель</th><th>Телефон</th><th>Товар</th><th>Дата</th><th>Статус заказа</th><th></th></tr></thead>
      <tbody id="order-rows"><tr><td colspan="7">Загружаем заказы…</td></tr></tbody>
    </table></div>`;
  document.getElementById('show-products').onclick = listView;
  document.getElementById('refresh-orders').onclick = loadOrders;
  await loadOrders();
}

async function loadOrders() {
  const rows = document.getElementById('order-rows');
  if (!rows) return;
  rows.innerHTML = '<tr><td colspan="7">Загружаем…</td></tr>';
  try {
    const data = await admin('/orders');
    if (!data.length) {
      rows.innerHTML = '<tr><td colspan="7">Заказов пока нет.</td></tr>';
      return;
    }
    rows.innerHTML = data.map(o => `
      <tr>
        <td>#${o.id}</td>
        <td><strong>${esc(o.userName || '—')}</strong></td>
        <td><a href="tel:${esc(o.userPhone || '')}">${esc(o.userPhone || '—')}</a></td>
        <td><a href="/#/product/${o.productId}">${esc(o.productTitle || 'Товар удалён')}</a></td>
        <td>${o.createdAt ? new Date(o.createdAt).toLocaleString('ru-RU') : '—'}</td>
        <td><select class="order-status" data-order-status="${o.id}" aria-label="Статус заказа ${o.id}">
          ${ORDER_STATUSES.map(st => `<option value="${st}"${o.status === st ? ' selected' : ''}>${ORDER_LABEL[st]}</option>`).join('')}
        </select></td>
        <td><button class="btn small" data-save-order="${o.id}">Сохранить</button></td>
      </tr>`).join('');
    rows.querySelectorAll('[data-save-order]').forEach(btn => btn.onclick = async () => {
      const id = btn.dataset.saveOrder;
      const select = rows.querySelector(`[data-order-status="${id}"]`);
      btn.disabled = true;
      try {
        await admin(`/orders/${id}/status?status=${encodeURIComponent(select.value)}`, { method: 'PATCH' });
        toast('Статус заказа обновлён');
        await loadOrders();
      } catch (e) { toast(e.message); btn.disabled = false; }
    });
  } catch (e) {
    rows.innerHTML = `<tr><td colspan="7" class="msg-err">${esc(e.message)}</td></tr>`;
  }
}

/* ---------- Список товаров ---------- */
let listState = { q: '', page: 0 };

async function listView() {
  logoutBtn.hidden = false;
  document.title = 'Товары — админка DOSKorea';
  root.innerHTML = `
  <div class="bar">
    <h1>Товары</h1>
    <button class="btn ghost" id="show-orders">Заказы</button>
    <input type="search" id="q" placeholder="Поиск по названию, марке, модели" aria-label="Поиск" value="${esc(listState.q)}">
    <button class="btn ghost" id="rates">Курсы валют</button>
    <button class="btn red" id="add">Добавить товар</button>
  </div>
  <div class="table-wrap"><table class="list">
    <thead><tr><th>Фото</th><th>Название</th><th>Тип</th><th>Год</th><th>Цена</th><th>На сайте</th><th>Бронь / продано</th><th></th></tr></thead>
    <tbody id="rows"><tr><td colspan="8">Загружаем…</td></tr></tbody>
  </table></div>
  <div class="more" id="pager"></div>`;

  let timer;
  document.getElementById('q').addEventListener('input', e => {
    clearTimeout(timer);
    timer = setTimeout(() => { listState = { q: e.target.value, page: 0 }; loadRows(); }, 300);
  });
  document.getElementById('add').addEventListener('click', () => formDialog());
  document.getElementById('rates').addEventListener('click', ratesDialog);
  document.getElementById('show-orders').addEventListener('click', ordersView);
  loadRows();
}

async function loadRows() {
  const rows = document.getElementById('rows'), pager = document.getElementById('pager');
  try {
    const d = await admin('/products?' + qs({ q: listState.q, page: listState.page, size: 20 }));
    if (!d.items.length) {
      rows.innerHTML = `<tr><td colspan="8">Ничего не найдено. Нажмите «Добавить товар», чтобы создать первую карточку.</td></tr>`;
      pager.innerHTML = ''; return;
    }
    rows.innerHTML = d.items.map(p => `<tr>
      <td>${p.images.length ? `<img src="${esc(p.images[0])}" alt="">` : '<div class="thumb"></div>'}</td>
      <td><strong>${esc(p.title)}</strong><br><small>${esc(p.brand)} ${esc(p.model)}</small></td>
      <td>${esc(TYPE_LABEL[p.type])}</td><td>${p.releaseYear}</td><td>${money(p.price)}</td>
      <td><span class="tag${p.available ? '' : ' off'}">${p.available ? 'На сайте' : 'Скрыт'}</span></td>
      <td><select class="st-select st-${p.status || 'AVAILABLE'}" data-status="${p.id}" aria-label="Бронь или продано: ${esc(p.title)}">${statusOptions(p.status)}</select></td>
      <td><div class="acts">
        <button class="btn ghost small" data-edit="${p.id}">Изменить</button>
        <button class="btn ghost small" data-del="${p.id}" data-title="${esc(p.title)}">Удалить</button>
      </div></td></tr>`).join('');
    pager.innerHTML = `${d.page > 0 ? '<button class="btn ghost small" id="prev">Назад</button>' : ''}
      <span style="margin:0 12px;align-self:center">Страница ${d.page + 1} из ${d.totalPages}</span>
      ${d.page + 1 < d.totalPages ? '<button class="btn ghost small" id="next">Дальше</button>' : ''}`;
    const prev = document.getElementById('prev'), next = document.getElementById('next');
    if (prev) prev.onclick = () => { listState.page--; loadRows(); };
    if (next) next.onclick = () => { listState.page++; loadRows(); };
  } catch (e) {
    rows.innerHTML = `<tr><td colspan="8" class="msg-err">${esc(e.message)}</td></tr>`;
  }
}

root.addEventListener('click', async e => {
  const edit = e.target.closest('[data-edit]'), del = e.target.closest('[data-del]');
  if (edit) {
    try { formDialog(await admin('/products/' + edit.dataset.edit)); } catch (ex) { toast(ex.message); }
  } else if (del) {
    if (!confirm(`Удалить «${del.dataset.title}»? Это действие нельзя отменить.`)) return;
    try { await admin('/products/' + del.dataset.del, { method: 'DELETE' }); toast('Товар удалён'); loadRows(); }
    catch (ex) { toast(ex.message); }
  }
});

// Быстрая смена статуса прямо в таблице
root.addEventListener('change', async e => {
  const sel = e.target.closest('select[data-status]');
  if (!sel) return;
  sel.disabled = true;
  try {
    await admin('/products/' + sel.dataset.status + '/status?status=' + encodeURIComponent(sel.value), { method: 'PATCH' });
    sel.className = 'st-select st-' + sel.value;
    toast('Статус: ' + STATUS_LABEL[sel.value]);
  } catch (ex) {
    toast(ex.message);
    loadRows();
  }
  sel.disabled = false;
});

/* ---------- Форма товара ---------- */
const SPEC_TEMPLATES = {
  CAR: ['Пробег', 'Двигатель', 'Коробка', 'Привод', 'Топливо', 'Кузов', 'Цвет'],
  PHONE: ['Память', 'Оперативная память', 'Экран', 'Камера', 'Аккумулятор', 'Цвет'],
  LAPTOP: ['Процессор', 'Оперативная память', 'Накопитель', 'Экран', 'Видеокарта', 'Вес']
};

function formDialog(p) {
  const editing = !!p;
  let images = p ? [...p.images] : [];
  let specs = p && p.specs.length ? p.specs.map(s => ({ ...s })) : [];
  const v = (x, d = '') => esc(x ?? d);

  dlg.innerHTML = `
  <form class="dlg" id="pform" novalidate>
    <h2>${editing ? 'Изменить товар' : 'Новый товар'}</h2>
    <div class="cols2">
      <label class="field">Тип
        <select name="type" required>${Object.entries(TYPE_LABEL).map(([k, l]) => opt(k, l, p?.type === k)).join('')}</select>
      </label>
      <label class="field">Год выпуска<input type="number" name="releaseYear" min="1980" max="2100" value="${v(p?.releaseYear, new Date().getFullYear())}" required></label>
      <label class="field">Марка<input type="text" name="brand" maxlength="80" value="${v(p?.brand)}" placeholder="Начните вводить: Hyundai" list="dl-brand" autocomplete="off" required></label>
      <label class="field">Модель<input type="text" name="model" maxlength="120" value="${v(p?.model)}" placeholder="Сначала выберите марку" list="dl-model" autocomplete="off" required></label>
    </div>
    <datalist id="dl-brand"></datalist><datalist id="dl-model"></datalist>
    <label class="field">Название на карточке<input type="text" name="title" maxlength="200" value="${v(p?.title)}" placeholder="Hyundai Sonata DN8 2.0 LPG" required></label>
    <div class="cols2">
      <label class="field">Цена, $<input type="number" name="price" min="1" step="1" value="${v(p?.price != null ? Math.round(p.price) : '')}" required></label>
      <label class="field">Бронь / продано<select name="status">${statusOptions(p?.status)}</select></label>
    </div>
    <label class="field">Описание<textarea name="description" rows="5" maxlength="5000" placeholder="Состояние, комплектация, особенности">${v(p?.description)}</textarea></label>

    <div>
      <strong>Характеристики</strong>
      <div id="specs" style="margin-top:8px"></div>
      <button type="button" class="btn ghost small" id="spec-add">Добавить строку</button>
      <button type="button" class="btn ghost small" id="spec-tpl">Подставить шаблон для типа</button>
    </div>

    <div>
      <strong>Фото</strong> <small>(первое фото показывается на карточке)</small>
      <div class="pics" id="pics" style="margin:8px 0"></div>
      <label class="drop" id="drop">
        <input type="file" id="files" accept="image/jpeg,image/png,image/webp" multiple hidden>
        <strong>Перетащите фото сюда</strong> или нажмите, чтобы выбрать<br>
        <small>Можно выбрать сразу несколько: в окне выбора зажмите ⌘ или Shift</small>
      </label>
    </div>

    <label class="check"><input type="checkbox" name="available" ${p && !p.available ? '' : 'checked'}> Показывать на сайте</label>
    <div class="msg-err" id="ferr" role="alert"></div>
    <div class="foot-actions">
      <button type="button" class="btn ghost" id="cancel">Отмена</button>
      <button type="submit" class="btn" id="save">Сохранить</button>
    </div>
  </form>`;

  const form = dlg.querySelector('#pform');
  const specsBox = form.querySelector('#specs'), picsBox = form.querySelector('#pics'), ferr = form.querySelector('#ferr');

  function drawSpecs() {
    specsBox.innerHTML = specs.map((s, i) => `<div class="spec-row">
      <input type="text" data-k="${i}" value="${esc(s.name)}" placeholder="Название" aria-label="Название характеристики" maxlength="80">
      <input type="text" data-v="${i}" value="${esc(s.value)}" placeholder="Значение" aria-label="Значение" maxlength="300">
      <button type="button" class="btn ghost small" data-rm="${i}" aria-label="Удалить строку">×</button></div>`).join('');
  }
  function drawPics() {
    picsBox.innerHTML = images.map((u, i) => `<div class="pic"><img src="${esc(u)}" alt="">
      <button type="button" class="x" data-rm="${i}" aria-label="Удалить фото">×</button>
      ${i === 0 ? '<span class="cover">Обложка</span>' : `<button type="button" class="mk" data-mk="${i}">Сделать обложкой</button>`}</div>`).join('');
  }
  drawSpecs(); drawPics();

  // ----- Подсказки марок и моделей из справочника -----
  const typeSel = form.elements.type, brandIn = form.elements.brand, modelIn = form.elements.model;
  const titleIn = form.elements.title, yearIn = form.elements.releaseYear;
  const dlBrand = form.querySelector('#dl-brand'), dlModel = form.querySelector('#dl-model');
  const brandsOf = () => CATALOG[typeSel.value] || {};
  const canon = (list, value) => { const t = value.trim().toLowerCase(); return list.find(x => x.toLowerCase() === t); };
  const modelsOfBrand = () => { const b = canon(Object.keys(brandsOf()), brandIn.value); return b ? brandsOf()[b] : []; };
  const options = list => list.map(x => `<option value="${esc(x)}"></option>`).join('');

  function fillBrands() { dlBrand.innerHTML = options(Object.keys(brandsOf())); }
  function fillModels() { dlModel.innerHTML = options(modelsOfBrand()); }
  fillBrands(); fillModels();

  typeSel.addEventListener('change', () => { fillBrands(); fillModels(); });
  brandIn.addEventListener('input', fillModels);
  // Если вписали «hyundai», приводим к «Hyundai», чтобы в фильтрах сайта не было дублей
  brandIn.addEventListener('change', () => {
    const b = canon(Object.keys(brandsOf()), brandIn.value);
    if (b) brandIn.value = b;
    fillModels();
  });
  modelIn.addEventListener('change', () => {
    const m = canon(modelsOfBrand(), modelIn.value);
    if (m) modelIn.value = m;
  });

  // Название на карточке собирается само («Hyundai Palisade 2020»), пока вы не напишете своё
  let titleTouched = editing && !!p.title;
  titleIn.addEventListener('input', () => { titleTouched = titleIn.value.trim() !== ''; });
  const autoTitle = () => {
    if (titleTouched) return;
    titleIn.value = [brandIn.value, modelIn.value, yearIn.value].map(x => x.trim()).filter(Boolean).join(' ');
  };
  [brandIn, modelIn, yearIn].forEach(el => el.addEventListener('input', autoTitle));
  [brandIn, modelIn].forEach(el => el.addEventListener('change', autoTitle));

  specsBox.addEventListener('input', e => {
    if (e.target.dataset.k != null) specs[+e.target.dataset.k].name = e.target.value;
    if (e.target.dataset.v != null) specs[+e.target.dataset.v].value = e.target.value;
  });
  specsBox.addEventListener('click', e => {
    const b = e.target.closest('[data-rm]'); if (!b) return;
    specs.splice(+b.dataset.rm, 1); drawSpecs();
  });
  form.querySelector('#spec-add').onclick = () => { specs.push({ name: '', value: '' }); drawSpecs(); };
  form.querySelector('#spec-tpl').onclick = () => {
    const have = new Set(specs.map(s => s.name));
    SPEC_TEMPLATES[form.type.value].filter(n => !have.has(n)).forEach(n => specs.push({ name: n, value: '' }));
    drawSpecs();
  };
  picsBox.addEventListener('click', e => {
    const rm = e.target.closest('[data-rm]'), mk = e.target.closest('[data-mk]');
    if (rm) images.splice(+rm.dataset.rm, 1);
    if (mk) images.unshift(images.splice(+mk.dataset.mk, 1)[0]);
    drawPics();
  });

  const dropEl = form.querySelector('#drop'), fileInput = form.querySelector('#files');

  // Загружает сразу несколько фото параллельно; ошибки показывает по каждому файлу
  async function compressImage(file) {
    if (!file.type.startsWith('image/') || file.size < 500 * 1024) return file;
    try {
      const bitmap = await createImageBitmap(file);
      const maxSide = 1920;
      const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.82));
      if (!blob || blob.size >= file.size) return file;
      return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
    } catch (_) { return file; }
  }

  async function uploadFiles(fileList) {
    const files = [...fileList].filter(f => f.type.startsWith('image/'));
    if (!files.length) return;
    ferr.style.color = 'var(--ink-soft)';
    ferr.textContent = `Оптимизируем и загружаем фото: ${files.length}…`;
    const results = await Promise.allSettled(files.map(async file => {
      const optimized = await compressImage(file);
      const fd = new FormData(); fd.append('file', optimized);
      return admin('/upload', { method: 'POST', body: fd });
    }));
    const failed = [];
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') images.push(r.value.url);
      else failed.push(`${files[i].name}: ${r.reason.message}`);
    });
    drawPics();
    ferr.style.color = '';
    ferr.textContent = failed.join('; ');
  }

  fileInput.addEventListener('change', e => { uploadFiles(e.target.files); e.target.value = ''; });
  ['dragenter', 'dragover'].forEach(ev => dropEl.addEventListener(ev, e => { e.preventDefault(); dropEl.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => dropEl.addEventListener(ev, e => { e.preventDefault(); dropEl.classList.remove('over'); }));
  dropEl.addEventListener('drop', e => uploadFiles(e.dataTransfer.files));

  form.querySelector('#cancel').onclick = () => dlg.close();
  form.addEventListener('submit', async e => {
    e.preventDefault();
    ferr.style.color = ''; ferr.textContent = '';
    const f = form.elements;
    const body = {
      type: f.type.value, brand: f.brand.value.trim(), model: f.model.value.trim(),
      releaseYear: Number(f.releaseYear.value), price: Number(f.price.value),
      title: f.title.value.trim(), description: f.description.value.trim(),
      specs: specs.filter(s => s.name.trim() && s.value.trim()), images, available: f.available.checked, status: f.status.value
    };
    if (!body.brand || !body.model || !body.title) { ferr.textContent = 'Заполните марку, модель и название'; return; }
    if (!(body.price > 0)) { ferr.textContent = 'Укажите цену больше нуля'; return; }
    const save = form.querySelector('#save'); save.disabled = true;
    try {
      await admin(editing ? '/products/' + p.id : '/products', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      dlg.close(); toast(editing ? 'Изменения сохранены' : 'Товар добавлен'); loadRows();
    } catch (ex) { ferr.textContent = ex.message; save.disabled = false; }
  });

  dlg.showModal();
}

const opt = (v, label, sel) => `<option value="${esc(v)}"${sel ? ' selected' : ''}>${esc(label)}</option>`;

/* ---------- Старт ---------- */
(async function init() {
  if (!AUTH) return loginView();
  try {
    await api('/admin/me', { headers: { Authorization: 'Basic ' + AUTH } });
    listView();
  } catch { logout(); }
})();