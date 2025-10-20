// ...existing code...
const galleryEl = document.getElementById('gallery');
const photoInput = document.getElementById('photoInput');
const captionInput = document.getElementById('captionInput');
const addBtn = document.getElementById('addBtn');
const clearBtn = document.getElementById('clearBtn');
const sortSelect = document.getElementById('sortSelect');

const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');
const modalCaption = document.getElementById('modalCaption');
const modalDate = document.getElementById('modalDate');
const closeModal = document.getElementById('closeModal');

let items = JSON.parse(localStorage.getItem('chiroAlbum') || '[]');

function formatDate(ts){
  return new Date(ts).toLocaleString();
}

function render(){
  galleryEl.innerHTML = '';
  // ソートした参照リスト（元配列のインデックスを保持）
  const mapped = items.map((it, idx) => ({ it, idx }));
  mapped.sort((a,b) => {
    if(sortSelect.value === 'newest') return b.it.ts - a.it.ts;
    return a.it.ts - b.it.ts;
  });

  mapped.forEach(({ it, idx }) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <button class="delBtn" data-idx="${idx}">🗑</button>
      <img src="${it.data}" alt="photo-${idx}" data-idx="${idx}">
      <div class="meta">
        <div class="caption">${escapeHtml(it.caption || '')}</div>
        <div class="date">${formatDate(it.ts)}</div>
      </div>
    `;
    galleryEl.appendChild(card);
  });
}

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

addBtn.addEventListener('click', async () => {
  const files = photoInput.files;
  const caption = captionInput.value.trim();
  if(!files || files.length === 0) return alert('写真を選んでください');
  for(const file of files){
    const data = await fileToDataURL(file);
    // タイムスタンプを自動追加
    items.push({ data, caption, ts: Date.now() });
  }
  saveAndRender();
  photoInput.value = '';
  captionInput.value = '';
});

galleryEl.addEventListener('click', (e) => {
  const img = e.target.closest('img');
  if(img){
    const idx = Number(img.dataset.idx);
    const it = items[idx];
    modalImg.src = it.data;
    modalCaption.textContent = it.caption || '';
    modalDate.textContent = formatDate(it.ts);
    modal.setAttribute('aria-hidden','false');
    return;
  }
  const del = e.target.closest('.delBtn');
  if(del){
    const idx = Number(del.dataset.idx);
    if(confirm('この写真を削除しますか？')){
      items.splice(idx,1);
      saveAndRender();
    }
  }
});

closeModal.addEventListener('click', () => modal.setAttribute('aria-hidden','true'));
modal.addEventListener('click', (e)=>{ if(e.target===modal) modal.setAttribute('aria-hidden','true'); });

clearBtn.addEventListener('click', ()=>{ if(confirm('全ての写真を削除しますか？')){ items=[]; saveAndRender(); } });

sortSelect.addEventListener('change', () => render());

function saveAndRender(){ localStorage.setItem('chiroAlbum', JSON.stringify(items)); render(); }

function fileToDataURL(file){ return new Promise((res, rej) => {
  const fr = new FileReader();
  fr.onload = ()=>res(fr.result);
  fr.onerror = rej;
  fr.readAsDataURL(file);
}); }

// 初期描画
render();
// ...existing code...