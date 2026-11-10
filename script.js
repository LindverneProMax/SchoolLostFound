'use strict';

const KEY = 'school-lost-found-v1';
const CATS = {'Áo khoác':'🧥','Bình nước':'🍶','Sách vở':'📚','Cặp, balo':'🎒','Điện thoại':'📱','Chìa khóa':'🔑','Kính':'👓','Khác':'📦'};
const LOCS = ['Lớp học','Sân trường','Thư viện','Căng tin','Nhà thể chất','Hành lang'];
const DAY = 864e5;
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
const opts = (arr, first) => (first ? `<option value="">${first}</option>` : '') + arr.map(v => `<option>${esc(v)}</option>`).join('');

// Dữ liệu mẫu cho lần mở đầu tiên
const seed = () => [
  {id:'s1',title:'Áo khoác xanh navy',cat:'Áo khoác',loc:'Sân trường',hold:'Phòng bảo vệ',desc:'Áo khoác có mũ, khóa kéo màu bạc, túi trong có chữ viết tắt tên.',who:'Minh, lớp 8A2',contact:'Zalo 0900 000 001',img:'',at:Date.now()-3*36e5,done:false},
  {id:'s2',title:'Bình nước màu xanh đen',cat:'Bình nước',loc:'Nhà thể chất',hold:'Mình đang giữ',desc:'Bình giữ nhiệt 500 ml, nắp đen, có vết xước nhỏ ở đáy.',who:'Lan, lớp 9A1',contact:'Zalo 0900 000 002',img:'',at:Date.now()-DAY,done:false},
  {id:'s3',title:'Hai quyển sách bìa vàng và xanh',cat:'Sách vở',loc:'Thư viện',hold:'Quầy thư viện',desc:'Một quyển bìa vàng, một quyển bìa xanh, có kẹp giấy ghi chú bên trong.',who:'Cô thủ thư',contact:'Quầy thư viện, giờ ra chơi',img:'',at:Date.now()-2*DAY,done:false},
  {id:'s4',title:'Kính cận gọng đen',cat:'Kính',loc:'Lớp học',hold:'Bàn giáo viên lớp 7B',desc:'Gọng đen tròn, có hộp kính màu xám.',who:'Huy, lớp 7B',contact:'Zalo 0900 000 004',img:'',at:Date.now()-2*DAY,done:false},
  {id:'s5',title:'Chùm chìa khóa có móc xanh',cat:'Chìa khóa',loc:'Căng tin',hold:'Phòng bảo vệ',desc:'Hai chìa khóa bạc, móc nhựa màu xanh dương.',who:'Anh, lớp 10C',contact:'Zalo 0900 000 005',img:'',at:Date.now()-4*DAY,done:false},
  {id:'s6',title:'Balo xanh dương có thẻ tên',cat:'Cặp, balo',loc:'Hành lang',hold:'Phòng bảo vệ',desc:'Balo hai ngăn, khóa kéo màu đen, treo thẻ tên trắng.',who:'Nam, lớp 6A3',contact:'Zalo 0900 000 006',img:'',at:Date.now()-6*DAY,done:true}
];

let items = load();
let imgData = '';
let toastTimer;

function load() {
  try { const r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch (e) {}
  return seed();
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(items)); }
  catch (e) { toast('Bộ nhớ trình duyệt đã đầy, tin mới có thể không được lưu.'); }
}
function toast(m) {
  const t = $('#toast'); t.textContent = m; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}
function ago(t) {
  const m = Math.floor((Date.now() - t) / 6e4);
  if (m < 1) return 'vừa đăng';
  if (m < 60) return m + ' phút trước';
  const h = Math.floor(m / 60);
  return h < 24 ? h + ' giờ trước' : Math.floor(h / 24) + ' ngày trước';
}

const card = i => `<button class="card${i.done ? ' done' : ''}" data-id="${esc(i.id)}">
  <span class="ph">${i.img ? `<img src="${esc(i.img)}" alt="">` : CATS[i.cat] || '📦'}</span>
  <span class="bd"><strong>${esc(i.title)}</strong><span class="meta">${esc(i.cat)}</span><span class="meta">Nhặt ở ${esc(i.loc)}, ${ago(i.at)}</span></span>
  ${i.done ? '<span class="badge">Đã trả</span>' : ''}</button>`;

function render() {
  const q = norm($('#q').value.trim()), c = $('#fCat').value, l = $('#fLoc').value, all = $('#fAll').checked;
  const list = items
    .filter(i => (all || !i.done) && (!c || i.cat === c) && (!l || i.loc === l) &&
      (!q || norm([i.title, i.desc, i.cat, i.loc, i.hold].join(' ')).includes(q)))
    .sort((a, b) => b.at - a.at);
  $('#grid').innerHTML = list.map(card).join('') ||
    '<p class="empty">Chưa có tin phù hợp. Hãy đổi bộ lọc, hoặc đăng tin nếu bạn nhặt được món đồ này.</p>';
  $('#count').textContent = list.length + ' tin phù hợp';
  $('#nOpen').textContent = items.filter(i => !i.done).length;
  $('#nDone').textContent = items.filter(i => i.done).length;
}

function openDetail(id) {
  const i = items.find(x => x.id === id); if (!i) return;
  const d = $('#detail');
  d.innerHTML = `<div class="dlg">
    <div class="dimg">${i.img ? `<img src="${esc(i.img)}" alt="Ảnh ${esc(i.title)}">` : CATS[i.cat] || '📦'}</div>
    <h2>${esc(i.title)}</h2>
    <dl class="info">
      <dt>Loại đồ</dt><dd>${esc(i.cat)}</dd>
      <dt>Nơi nhặt</dt><dd>${esc(i.loc)}</dd>
      <dt>Đang giữ ở</dt><dd>${esc(i.hold || 'Người nhặt đang giữ')}</dd>
      <dt>Đăng bởi</dt><dd>${esc(i.who)}, ${ago(i.at)}</dd>
    </dl>
    <p>${esc(i.desc)}</p>
    <div id="claim">${i.done ? '<p class="contact">Món đồ này đã về đúng chủ.</p>' : ''}</div>
    <div class="row">
      ${i.done ? '' : '<button class="btn" id="bClaim" type="button">Đây là đồ của tôi</button><button class="btn ghost" id="bDone" type="button" hidden>Đã trả đồ cho chủ</button>'}
      <button class="btn ghost" type="button" data-close>Đóng</button>
    </div></div>`;
  if (!i.done) {
    $('#bClaim').onclick = () => {
      $('#claim').innerHTML = `<div class="contact"><b>Liên hệ người nhặt</b>
        <p>${esc(i.who)}: ${esc(i.contact)}</p>
        <p>Hãy nói đặc điểm riêng của món đồ (màu sắc, nhãn, vật bên trong) để người nhặt xác nhận. Sau đó hẹn nhận đồ ở nơi đông người trong trường, như sân trường, thư viện hoặc phòng bảo vệ.</p></div>`;
      $('#bClaim').hidden = true;
      $('#bDone').hidden = false;
    };
    $('#bDone').onclick = () => {
      if (!confirm('Xác nhận món đồ đã được trả cho đúng chủ?')) return;
      i.done = true; save(); render(); d.close(); toast('Đã trả đồ cho chủ');
    };
  }
  d.showModal();
}

// Thu nhỏ ảnh để lưu gọn trong trình duyệt
function shrink(file) {
  return new Promise((ok, no) => {
    const u = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      const k = Math.min(1, 640 / Math.max(im.width, im.height)), c = document.createElement('canvas');
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      URL.revokeObjectURL(u); ok(c.toDataURL('image/jpeg', .72));
    };
    im.onerror = () => { URL.revokeObjectURL(u); no(); };
    im.src = u;
  });
}

// Khởi tạo
$('#fCat').innerHTML = opts(Object.keys(CATS), 'Tất cả loại đồ');
$('#fLoc').innerHTML = opts(LOCS, 'Tất cả nơi nhặt');
$('#pCat').innerHTML = opts(Object.keys(CATS));
$('#pLoc').innerHTML = opts(LOCS);

$('#filters').addEventListener('input', render);
$('#grid').addEventListener('click', e => { const b = e.target.closest('.card'); if (b) openDetail(b.dataset.id); });
document.querySelectorAll('.js-post').forEach(b => b.onclick = () => $('#postDlg').showModal());
document.addEventListener('click', e => {
  if (e.target.closest('[data-close]')) e.target.closest('dialog').close();
  else if (e.target.tagName === 'DIALOG') e.target.close();
});

$('#pImg').addEventListener('change', async e => {
  const f = e.target.files[0]; imgData = ''; $('#pPrev').innerHTML = '';
  if (!f) return;
  try { imgData = await shrink(f); $('#pPrev').innerHTML = `<img src="${imgData}" alt="Ảnh xem trước">`; }
  catch (_) { toast('Không đọc được ảnh. Hãy chọn file JPG hoặc PNG.'); }
});

$('#postForm').addEventListener('submit', e => {
  e.preventDefault();
  const g = id => $(id).value.trim();
  items.push({id:'i' + Date.now(),title:g('#pTitle'),cat:$('#pCat').value,loc:$('#pLoc').value,hold:g('#pHold'),
    desc:g('#pDesc'),who:g('#pWho'),contact:g('#pContact'),img:imgData,at:Date.now(),done:false});
  save(); e.target.reset(); imgData = ''; $('#pPrev').innerHTML = '';
  $('#postDlg').close(); render(); toast('Đã đăng tin'); location.hash = '#tim';
});

render();
