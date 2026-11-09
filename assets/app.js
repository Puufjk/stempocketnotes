'use strict';
const $ = id => document.getElementById(id);
const categories = ['全部', '微積分', '程式設計', '化學', '物理'];
let notes = [];
let selectedCategory = '全部';
let searchQuery = '';
const escapeHTML = text => String(text).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function inlineMarkdown(text) {
  return escapeHTML(text).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}
function renderMarkdown(source) {
  let html = '', inCode = false, inList = false;
  for (const line of source.replace(/\r\n/g, '\n').split('\n')) {
    if (line.trim().startsWith('```')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += inCode ? '</code></pre>' : '<pre><code>';
      inCode = !inCode; continue;
    }
    if (inCode) { html += escapeHTML(line) + '\n'; continue; }
    if (/^- /.test(line)) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += '<li>' + inlineMarkdown(line.slice(2)) + '</li>'; continue;
    }
    if (inList) { html += '</ul>'; inList = false; }
    if (!line.trim()) continue;
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) { const level = heading[1].length; html += `<h${level}>${inlineMarkdown(heading[2])}</h${level}>`; }
    else html += `<p>${inlineMarkdown(line)}</p>`;
  }
  if (inList) html += '</ul>';
  if (inCode) html += '</code></pre>';
  return html;
}
function renderFilters() {
  $('filters').replaceChildren();
  categories.forEach(category => {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = category;
    button.className = 'filter' + (category === selectedCategory ? ' active' : '');
    button.setAttribute('aria-pressed', String(category === selectedCategory));
    button.addEventListener('click', () => { selectedCategory = category; renderFilters(); renderCards(); });
    $('filters').append(button);
  });
}
function renderCards() {
  const filtered = notes.filter(note => {
    const matchCategory = selectedCategory === '全部' || note.category === selectedCategory;
    const searchable = [note.title, note.summary, ...note.tags].join(' ').toLowerCase();
    return matchCategory && searchable.includes(searchQuery.toLowerCase());
  });
  $('result-count').textContent = `共 ${filtered.length} 篇`;
  $('cards').replaceChildren();
  if (!filtered.length) { const p = document.createElement('p'); p.className = 'state-message'; p.textContent = '找不到符合條件的筆記，試試其他關鍵字或分類。'; $('cards').append(p); return; }
  for (const note of filtered) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'note-card';
    button.innerHTML = `<div class="card-top"><span class="tag">${escapeHTML(note.category)}</span><span class="date">${escapeHTML(note.updated)}</span></div><h3>${escapeHTML(note.title)}</h3><p>${escapeHTML(note.summary)}</p><div class="card-bottom"><span>${note.tags.map(escapeHTML).join(' · ')}</span><span class="card-arrow">閱讀 ↗</span></div>`;
    button.addEventListener('click', () => { location.hash = encodeURIComponent(note.id); });
    $('cards').append(button);
  }
}
function showList() {
  $('detail-view').hidden = true;
  $('list-view').hidden = false;
  $('result-count').hidden = false;
  $('library-title').textContent = '探索筆記';
}
async function route() {
  const id = decodeURIComponent(location.hash.slice(1));
  const note = notes.find(n => n.id === id);
  if (!id) { showList(); return; }
  $('list-view').hidden = true;
  $('detail-view').hidden = false;
  $('result-count').hidden = true;
  $('library-title').textContent = '筆記內容';
  $('detail-meta').textContent = note ? `${note.category} · 更新於 ${note.updated}` : '';
  $('detail-content').textContent = '載入中…';
  if (!note) { $('detail-content').textContent = '找不到這篇筆記，請返回清單。'; return; }
  try {
    const response = await fetch(note.file);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const markdown = await response.text();
    if (decodeURIComponent(location.hash.slice(1)) === id) $('detail-content').innerHTML = renderMarkdown(markdown);
  } catch (error) { $('detail-content').textContent = '讀取筆記失敗，請稍後重新整理。'; console.error(error); }
  $('library').scrollIntoView({behavior:'smooth',block:'start'});
}
async function init() {
  try {
    const response = await fetch('notes/index.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('索引格式必須是陣列');
    notes = data;
    $('note-count').textContent = String(notes.length).padStart(2,'0');
    $('category-count').textContent = String(new Set(notes.map(n => n.category)).size).padStart(2,'0');
    renderFilters(); renderCards(); route();
  } catch (error) {
    $('cards').innerHTML = '<p class="state-message">無法載入筆記資料。請確認使用 HTTP 伺服器開啟網站。</p>';
    console.error(error);
  }
}
$('search').addEventListener('input', event => { searchQuery = event.target.value.trim(); renderCards(); });
$('back-button').addEventListener('click', () => { location.hash = ''; });
$('home-link').addEventListener('click', event => { event.preventDefault(); location.hash = ''; window.scrollTo({top:0,behavior:'smooth'}); });
const savedTheme = (() => { try { return localStorage.getItem('stem-theme'); } catch { return null; } })();
if (savedTheme === 'dark') document.documentElement.dataset.theme = 'dark';
function syncTheme() { const isDark = document.documentElement.dataset.theme === 'dark'; $('theme-toggle').setAttribute('aria-pressed', String(isDark)); $('theme-toggle').innerHTML = isDark ? '☀ <span>淺色模式</span>' : '☾ <span>深色模式</span>'; }
$('theme-toggle').addEventListener('click', () => { const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = next; try { localStorage.setItem('stem-theme',next); } catch {} syncTheme(); });
window.addEventListener('hashchange', route);
syncTheme(); init();
