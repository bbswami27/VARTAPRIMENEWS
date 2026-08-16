// ==========================================================================
// VartaPrime News - Public Portal Client Logic
// ==========================================================================

const API_BASE = '/api';
let allLiveNews = [];
let currentCategory = 'home';
let currentArticle = null;
let appLocationsData = { haryanaDistricts: [], statesData: {} };

async function loadLocationsData() {
  try {
    const res = await fetch('/api/locations');
    const json = await res.json();
    if (json.success) appLocationsData = json;
  } catch (e) {
    console.error('Error loading locations:', e);
  }
}

// Hindi Days and Months + Live Time Clock for Top-Left Header
function initDate() {
  const days = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
  const months = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
  
  function updateClock() {
    const now = new Date();
    const dayName = days[now.getDay()];
    const dateNum = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();
    
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    let period = 'दोपहर';
    if (hours < 12) period = 'सुबह';
    else if (hours >= 16 && hours < 20) period = 'सायं';
    else if (hours >= 20) period = 'रात';

    const displayHours = hours % 12 || 12;
    const timeFormatted = `${period} ${displayHours}:${minutes}:${seconds}`;

    const dateEl = document.getElementById('liveDateText');
    const timeEl = document.getElementById('liveTimeText');
    if (dateEl && timeEl) {
      dateEl.textContent = `${dayName}, ${dateNum} ${monthName} ${year}`;
      timeEl.textContent = timeFormatted;
    } else {
      const fullDateEl = document.getElementById('dateStr');
      if (fullDateEl) {
        fullDateEl.textContent = `${dayName}, ${dateNum} ${monthName} ${year} | ${timeFormatted}`;
      }
    }
  }

  updateClock();
  setInterval(updateClock, 1000);
}

// Relative time in Hindi
function timeAgo(dateString) {
  if (!dateString) return 'ताज़ा';
  const past = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'अभी-अभी';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} मिनट पहले`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} घंटे पहले`;
  if (diffSec < 172800) return 'कल';
  return `${Math.floor(diffSec / 86400)} दिन पहले`;
}

// Escape HTML
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Render Horizontal News Card: Small Pic on Left, Headline (Header Only) on Right
function createCardHTML(item) {
  const imgHtml = item.imageurl
    ? `<img src="${escapeHtml(item.imageurl)}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&auto=format&fit=crop&q=80'">`
    : `<div class="card-thumb-placeholder">वार्ताप्राइम</div>`;

  const districtBadge = item.district && item.district !== 'मुख्य'
    ? `<span class="district-tag-badge">📍 ${escapeHtml(item.district)}</span>`
    : '';

  return `
    <article class="card horizontal-card" onclick="openArticleModal('${item.id}')">
      <div class="card-thumb">
        ${imgHtml}
      </div>
      <div class="card-content-wrap">
        <div class="card-top-meta">
          <span class="cat-badge">${escapeHtml(item.category)}</span>
          ${districtBadge}
        </div>
        <h3 class="card-headline">${escapeHtml(item.title)}</h3>
        <div class="meta card-bottom-meta">
          <span class="source-tag-small">स्रोत: ${escapeHtml(item.source || 'वार्ताप्राइम')}</span>
          <span>⏱️ ${timeAgo(item.publishedAt || item.approvedAt)}</span>
        </div>
      </div>
    </article>
  `;
}

// Load Breaking News Ticker
async function loadBreakingNews() {
  try {
    const res = await fetch(`${API_BASE}/breaking`);
    const json = await res.json();
    if (json.success && json.data.length > 0) {
      const track = document.getElementById('tickerTrack');
      if (track) {
        track.innerHTML = json.data.map(item => `
          <span onclick="openArticleModal('${item.id}')">
            ${escapeHtml(item.title)}
          </span>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Error fetching breaking news:', err);
  }
}

// Load Category Counts for Nav Badges
async function loadCategoryCounts() {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    const json = await res.json();
    if (json.success) {
      document.querySelectorAll('nav button.nav-btn').forEach(btn => {
        const cat = btn.dataset.cat;
        if (cat === 'home') return;
        const hindiName = btn.dataset.name || btn.textContent.trim();
        const count = json.counts[hindiName] || 0;
        if (count > 0) {
          btn.setAttribute('title', `${hindiName}: ${count} खबरें`);
        }
      });
    }
  } catch (err) {
    console.error('Error loading category counts:', err);
  }
}

// Fetch and Render Public News
async function loadNews() {
  try {
    const res = await fetch(`${API_BASE}/news`);
    const json = await res.json();
    if (json.success) {
      allLiveNews = json.data;
      renderPortal();
    }
  } catch (err) {
    console.error('Error loading news:', err);
  }
}

// Render the Entire Portal view based on allLiveNews
function renderPortal() {
  if (!allLiveNews || allLiveNews.length === 0) return;

  // 1. Hero Lead Article (Prioritize Positive/National/Haryana/Youth/Development, EXCLUDE CRIME)
  const nonCrimeNews = allLiveNews.filter(n => n.category !== 'क्राइम');
  const heroItem = nonCrimeNews.find(n => n.isHero) || nonCrimeNews[0] || allLiveNews[0];
  const heroLead = document.getElementById('heroLead');
  if (heroLead && heroItem) {
    heroLead.onclick = () => openArticleModal(heroItem.id);
    const imgContainer = heroLead.querySelector('.imgbox');
    if (imgContainer) {
      imgContainer.innerHTML = heroItem.imageurl 
        ? `<img src="${escapeHtml(heroItem.imageurl)}" alt="${escapeHtml(heroItem.title)}" onerror="this.src='https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=900&auto=format&fit=crop&q=80'">`
        : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-family:var(--font-display);font-size:28px;color:#fff;">वार्ताप्राइम विशेष</div>`;
    }
    const h1 = heroLead.querySelector('h1');
    if (h1) h1.textContent = heroItem.title;
    const p = heroLead.querySelector('p');
    if (p) p.style.display = 'none'; // Headline only on front page
    const metaSource = heroLead.querySelector('.meta-source');
    if (metaSource) metaSource.textContent = heroItem.source || 'वार्ताप्राइम';
    const metaTime = heroLead.querySelector('.meta-time');
    if (metaTime) metaTime.textContent = timeAgo(heroItem.publishedAt || heroItem.approvedAt);
  }

  // 2. Hero Side Top Stories (Remaining 4 of 5 Top Stories - EXCLUDE CRIME, Prioritize Knowledge/Youth/Desh)
  const sideItems = (nonCrimeNews.length >= 5 ? nonCrimeNews : allLiveNews)
    .filter(n => n.id !== heroItem.id && n.category !== 'क्राइम')
    .slice(0, 4);
  const heroSide = document.getElementById('heroSide');
  if (heroSide) {
    heroSide.innerHTML = sideItems.map((item, idx) => {
      const sideImg = item.imageurl
        ? `<img src="${escapeHtml(item.imageurl)}" alt="" class="side-thumb" onerror="this.style.display='none'">`
        : '';
      return `
        <div class="side-item horizontal-side-item" onclick="openArticleModal('${item.id}')">
          <span class="num">0${idx + 1}</span>
          ${sideImg}
          <div class="content-box">
            <span class="cat-badge">${escapeHtml(item.category)}</span>
            <h3 class="side-headline">${escapeHtml(item.title)}</h3>
            <div class="side-meta">
              <span>${escapeHtml(item.source || 'संवाद')}</span>
              <span>•</span>
              <span>${timeAgo(item.publishedAt || item.approvedAt)}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 3. Populate Main Dense Grid with Curated News (Total exactly 30 on main page: 5 Hero + 25 Feed)
  const mainDenseGrid = document.getElementById('mainDenseGrid');
  if (mainDenseGrid) {
    const curatedFeedMap = [
      { cat: 'देश', count: 5 },
      { cat: 'युवा', count: 5, aliases: ['युवा', 'करियर'] },
      { cat: 'विदेश', count: 4 },
      { cat: 'बिज़नेस', count: 4 },
      { cat: 'समसामयिकी', count: 4, aliases: ['समसामयिकी', 'शिक्षा'] },
      { cat: 'हरियाणा', count: 3 }
    ];

    const curatedArticles = [];
    const usedIds = new Set([heroItem.id, ...sideItems.map(s => s.id)]);

    curatedFeedMap.forEach(spec => {
      const aliases = spec.aliases || [spec.cat];
      const matchArticles = allLiveNews.filter(n => 
        aliases.includes(n.category) && !usedIds.has(n.id)
      );

      const selected = matchArticles.slice(0, spec.count);
      selected.forEach(art => {
        usedIds.add(art.id);
        curatedArticles.push(art);
      });
    });

    // If any slots remain to make exactly 25 items in feed (total 30 on page), fill from other high-relevance non-crime news
    if (curatedArticles.length < 25) {
      const extra = allLiveNews.filter(n => n.category !== 'क्राइम' && !usedIds.has(n.id));
      for (const item of extra) {
        if (curatedArticles.length >= 25) break;
        usedIds.add(item.id);
        curatedArticles.push(item);
      }
    }

    // Limit feed to exactly 25 news (so 5 Hero + 25 Feed = 30 total news on main page)
    const finalMainFeed = curatedArticles.slice(0, 25);
    mainDenseGrid.innerHTML = finalMainFeed.map(createCardHTML).join('');
  }

  // 4. Trending in Sidebar (top 6 by views - exclude crime)
  const sortedByViews = [...allLiveNews].filter(n => n.category !== 'क्राइम').sort((a, b) => (b.views || 0) - (a.views || 0));
  const trendList = document.getElementById('trendingList');
  if (trendList) {
    trendList.innerHTML = sortedByViews.slice(0, 6).map((item, i) => `
      <div class="trend-item" onclick="openArticleModal('${item.id}')">
        <span class="n">${i + 1}</span>
        <div class="trend-text">${escapeHtml(item.title)}</div>
      </div>
    `).join('');
  }
}

// --------------------------------------------------------------------------
// Haryana District Filter (All 22 Districts)
// --------------------------------------------------------------------------
let selectedHaryanaDistrict = 'all';

function filterHaryanaDistrict(district, btn) {
  selectedHaryanaDistrict = district;

  // Update active pill styling
  const pills = document.querySelectorAll('#haryanaDistrictPills .district-pill');
  pills.forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const haryanaGrid = document.getElementById('haryanaDistrictGrid');
  if (!haryanaGrid) return;

  const haryanaNews = allLiveNews.filter(n => n.category === 'हरियाणा');
  let filtered = haryanaNews;

  if (district !== 'all') {
    filtered = haryanaNews.filter(n => {
      const matchDist = n.district && n.district.toLowerCase().includes(district.toLowerCase());
      const matchText = (n.title + ' ' + (n.description || '')).toLowerCase().includes(district.toLowerCase());
      return matchDist || matchText;
    });
  }

  if (filtered.length > 0) {
    haryanaGrid.innerHTML = filtered.map(createCardHTML).join('');
  } else {
    haryanaGrid.innerHTML = `
      <div style="grid-column: 1/-1; padding: 30px; text-align: center; background: #fff; border: 1px dashed var(--line); border-radius: 4px; color: var(--ink-muted);">
        <h3>📍 ${escapeHtml(district)} जिले से संबंधित कोई समाचार अभी उपलब्ध नहीं है।</h3>
        <p style="margin-top: 6px; font-size: 14px;">रिपोर्टर पोर्टल से इस जिले की ताज़ा ग्राउंड रिपोर्ट भेजें।</p>
      </div>
    `;
  }
}

// --------------------------------------------------------------------------
// Desh (National) State & District Filter
// --------------------------------------------------------------------------
let selectedDeshState = 'all';
let selectedDeshDistrict = 'all';

function onDeshStateChange(state) {
  selectedDeshState = state;
  selectedDeshDistrict = 'all';

  const distSelect = document.getElementById('deshDistrictSelect');
  if (distSelect) {
    if (state === 'all' || !appLocationsData.statesData || !appLocationsData.statesData[state]) {
      distSelect.style.display = 'none';
      distSelect.innerHTML = '<option value="all">🏙️ सभी जिले</option>';
    } else {
      distSelect.style.display = 'inline-block';
      const districts = appLocationsData.statesData[state] || [];
      distSelect.innerHTML = `<option value="all">🏙️ सभी जिले (${state})</option>` +
        districts.map(d => `<option value="${d}">${d}</option>`).join('');
    }
  }

  filterDeshNews();
}

function onDeshDistrictChange(district) {
  selectedDeshDistrict = district;
  filterDeshNews();
}

function filterDeshNews() {
  const deshGrid = document.getElementById('deshDistrictGrid');
  if (!deshGrid) return;

  const deshNews = allLiveNews.filter(n => n.category === 'देश');
  let filtered = deshNews;

  if (selectedDeshState !== 'all') {
    filtered = filtered.filter(n => {
      const matchState = n.state && n.state.toLowerCase().includes(selectedDeshState.toLowerCase());
      const matchText = (n.title + ' ' + (n.description || '')).toLowerCase().includes(selectedDeshState.toLowerCase());
      return matchState || matchText;
    });
  }

  if (selectedDeshDistrict !== 'all') {
    filtered = filtered.filter(n => {
      const matchDist = n.district && n.district.toLowerCase().includes(selectedDeshDistrict.toLowerCase());
      const matchText = (n.title + ' ' + (n.description || '')).toLowerCase().includes(selectedDeshDistrict.toLowerCase());
      return matchDist || matchText;
    });
  }

  if (filtered.length > 0) {
    deshGrid.innerHTML = filtered.map(createCardHTML).join('');
  } else {
    deshGrid.innerHTML = `
      <div style="grid-column: 1/-1; padding: 30px; text-align: center; background: #fff; border: 1px dashed var(--line); border-radius: 4px; color: var(--ink-muted);">
        <h3>📍 ${escapeHtml(selectedDeshState !== 'all' ? selectedDeshState : 'देश')} से संबंधित कोई समाचार अभी उपलब्ध नहीं है।</h3>
      </div>
    `;
  }
}

// Open Full Article Modal
async function openArticleModal(id) {
  const modal = document.getElementById('articleModal');
  if (!modal) return;

  // Find article from cached or fetch
  let article = allLiveNews.find(n => n.id === id);
  if (!article) {
    try {
      const res = await fetch(`${API_BASE}/news/${id}`);
      const json = await res.json();
      if (json.success) article = json.data;
    } catch (e) {
      console.error(e);
    }
  }

  if (!article) return;
  currentArticle = article;

  // Increment view counter locally
  article.views = (article.views || 0) + 1;

  document.getElementById('modalCat').textContent = article.category || 'समाचार';
  document.getElementById('modalTitle').textContent = article.title;
  document.getElementById('modalSource').textContent = article.district && article.district !== 'मुख्य' ? `📍 ${article.district}` : 'वार्ताप्राइम';
  const bottomSource = document.getElementById('modalSourceBottom');
  if (bottomSource) bottomSource.textContent = article.source || 'वार्ताप्राइम डेस्क';
  document.getElementById('modalTime').textContent = `⏱️ ${timeAgo(article.publishedAt || article.approvedAt)}`;
  document.getElementById('modalViews').textContent = `👁️ ${article.views} व्यूज`;

  const modalImg = document.getElementById('modalImg');
  if (article.imageurl) {
    modalImg.src = article.imageurl;
    modalImg.style.display = 'block';
  } else {
    modalImg.style.display = 'none';
  }

  // Format content paragraphs
  const textContainer = document.getElementById('modalContent');
  const fullText = article.content || article.description || '';
  const paragraphs = fullText.split(/\n\n+/).filter(p => p.trim().length > 0);
  if (paragraphs.length > 0) {
    textContainer.innerHTML = paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('');
  } else {
    textContainer.innerHTML = `<p>${escapeHtml(article.description || 'विस्तृत विवरण उपलब्ध नहीं है।')}</p>`;
  }

  const sourceLink = document.getElementById('modalOrigLink');
  if (article.link && article.link !== '#') {
    sourceLink.href = article.link;
    sourceLink.style.display = 'inline';
  } else {
    sourceLink.style.display = 'none';
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeArticleModal() {
  const modal = document.getElementById('articleModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Share helpers
function shareWhatsApp() {
  if (!currentArticle) return;
  const text = encodeURIComponent(`*${currentArticle.title}*\n\nवार्ताप्राइम न्यूज़ पर पूरी खबर पढ़ें: ${window.location.origin}/#news-${currentArticle.id}`);
  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
}

function shareFacebook() {
  if (!currentArticle) return;
  const url = encodeURIComponent(window.location.href);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function copyArticleLink() {
  if (!currentArticle) return;
  const url = `${window.location.origin}/#news-${currentArticle.id}`;
  navigator.clipboard.writeText(url).then(() => {
    showToast('खबर का लिंक कॉपी हो गया!');
  });
}

function showToast(msg) {
  let toast = document.getElementById('toastMsg');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastMsg';
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Setup Navigation switching & Dedicated Category Views
function setupNav() {
  const navButtons = document.querySelectorAll('nav button.nav-btn');
  const homeView = document.getElementById('home-view');
  const haryanaView = document.getElementById('haryana-view');
  const deshView = document.getElementById('desh-view');
  const yuvaView = document.getElementById('yuva-view');
  const currentaffairsView = document.getElementById('currentaffairs-view');
  const genericView = document.getElementById('generic-view');

  const hideAllViews = () => {
    if (homeView) homeView.style.display = 'none';
    if (haryanaView) haryanaView.style.display = 'none';
    if (deshView) deshView.style.display = 'none';
    if (yuvaView) yuvaView.style.display = 'none';
    if (currentaffairsView) currentaffairsView.style.display = 'none';
    if (genericView) genericView.style.display = 'none';
  };

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      const catName = btn.dataset.name || '';
      currentCategory = cat;

      hideAllViews();

      if (cat === 'home') {
        if (homeView) homeView.style.display = 'block';
        renderPortal();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (cat === 'haryana') {
        if (haryanaView) haryanaView.style.display = 'block';
        filterHaryanaDistrict('all');
        haryanaView.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (cat === 'desh') {
        if (deshView) deshView.style.display = 'block';
        filterDeshNews();
        deshView.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (cat === 'yuva') {
        if (yuvaView) yuvaView.style.display = 'block';
        const yuvaArticles = allLiveNews.filter(n => 
          n.category === 'युवा' || 
          n.category === 'करियर' || 
          n.title.includes('स्टार्टअप') || 
          n.title.includes('रोजगार') || 
          n.title.includes('कौशल') ||
          n.title.includes('युवा')
        );
        const yuvaGrid = document.getElementById('yuvaGrid');
        if (yuvaGrid) {
          yuvaGrid.innerHTML = yuvaArticles.length > 0 
            ? yuvaArticles.map(createCardHTML).join('') 
            : `<div style="grid-column:1/-1;padding:40px;text-align:center;color:var(--ink-muted);">युवा व करियर संबंधी समाचार लोड हो रहे हैं...</div>`;
        }
        yuvaView.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (cat === 'currentaffairs') {
        if (currentaffairsView) currentaffairsView.style.display = 'block';
        const caArticles = allLiveNews.filter(n => 
          n.category === 'समसामयिकी' || 
          n.category === 'शिक्षा' || 
          n.title.includes('परीक्षा') || 
          n.title.includes('नीति') || 
          n.title.includes('योजना') ||
          n.title.includes('GK')
        );
        const caGrid = document.getElementById('currentAffairsGrid');
        if (caGrid) {
          caGrid.innerHTML = caArticles.length > 0 
            ? caArticles.map(createCardHTML).join('') 
            : `<div style="grid-column:1/-1;padding:40px;text-align:center;color:var(--ink-muted);">करंट अफेयर्स समाचार लोड हो रहे हैं...</div>`;
        }
        currentaffairsView.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // Generic View for other categories (Videsh, Delhi, Business, Shiksha, Khel, Rajniti, Swasthya, Manoranjan, Dharm)
        if (genericView) {
          genericView.style.display = 'block';
          const titleEl = document.getElementById('genericCatTitle');
          const countEl = document.getElementById('genericCatCount');
          const gridEl = document.getElementById('genericCatGrid');

          if (titleEl) titleEl.textContent = catName || cat;
          const filtered = allLiveNews.filter(n => n.category === catName || n.category === cat);
          if (countEl) countEl.textContent = `${filtered.length} खबरें`;
          if (gridEl) {
            gridEl.innerHTML = filtered.length > 0 
              ? filtered.map(createCardHTML).join('') 
              : `<div style="grid-column:1/-1;padding:40px;text-align:center;color:var(--ink-muted);background:#fff;border:1px dashed var(--line);">${catName} में अभी कोई समाचार उपलब्ध नहीं है।</div>`;
          }
          genericView.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // Search Toggle and Execution
  const searchBtn = document.getElementById('navSearchBtn');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchInput = document.getElementById('searchInput');
  const searchSubmit = document.getElementById('searchSubmit');

  if (searchBtn && searchOverlay) {
    searchBtn.addEventListener('click', () => {
      searchOverlay.classList.toggle('active');
      if (searchOverlay.classList.contains('active') && searchInput) {
        searchInput.focus();
      }
    });
  }

  const performSearch = () => {
    const q = (searchInput ? searchInput.value : '').trim().toLowerCase();
    if (!q) {
      document.querySelector('nav button.nav-btn[data-cat="home"]').click();
      return;
    }

    const filtered = allLiveNews.filter(n => 
      (n.title && n.title.toLowerCase().includes(q)) || 
      (n.description && n.description.toLowerCase().includes(q))
    );

    hideAllViews();
    if (genericView) {
      genericView.style.display = 'block';
      const titleEl = document.getElementById('genericCatTitle');
      const countEl = document.getElementById('genericCatCount');
      const gridEl = document.getElementById('genericCatGrid');

      if (titleEl) titleEl.textContent = `खोज परिणाम: "${q}"`;
      if (countEl) countEl.textContent = `${filtered.length} परिणाम`;
      if (gridEl) {
        gridEl.innerHTML = filtered.length > 0 
          ? filtered.map(createCardHTML).join('') 
          : `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--ink-muted);background:#fff;border:1px dashed var(--line);border-radius:4px;"><h3>"${q}" से संबंधित कोई समाचार नहीं मिला।</h3></div>`;
      }
      genericView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (searchSubmit) searchSubmit.addEventListener('click', performSearch);
  if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') performSearch();
    });
  }
}

// Global category filter helper for footer
window.filterByCategory = function(catName) {
  const targetBtn = Array.from(document.querySelectorAll('nav button.nav-btn')).find(b => b.dataset.name === catName);
  if (targetBtn) {
    targetBtn.click();
  }
};

// --------------------------------------------------------------------------
// Live Weather: Panipat (Top Bar) & 22 Haryana Districts (Sidebar)
// --------------------------------------------------------------------------

let allDistrictsWeather = [];

// 1. Top Bar: Only Panipat Live Weather
async function loadPanipatWeather() {
  const el = document.getElementById('topPanipatWeather');
  if (!el) return;

  try {
    const res = await fetch('/api/weather/panipat');
    const json = await res.json();
    if (json.success && json.data) {
      const w = json.data;
      el.innerHTML = `${w.icon} <strong>पानीपत:</strong> ${w.temp}°C • ${w.condition} | 💧 ${w.humidity}%`;
    }
  } catch (err) {
    el.innerHTML = `🌤️ <strong>पानीपत:</strong> 31°C • साफ़ धूप`;
  }
}

// 2. Right Sidebar: All 22 Haryana Districts Live Weather
async function loadHaryanaWeather(forceRefresh = false) {
  const container = document.getElementById('districtsWeatherGrid');
  if (!container) return;

  if (forceRefresh) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:15px;color:var(--ink-muted);font-size:12px;">मौसम डेटा अपडेट हो रहा है...</div>`;
  }

  try {
    const res = await fetch('/api/weather/haryana');
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      allDistrictsWeather = json.data;
      renderDistrictsWeather(allDistrictsWeather);
    }
  } catch (err) {
    console.error('Error loading Haryana weather:', err);
  }
}

function renderDistrictsWeather(districts) {
  const container = document.getElementById('districtsWeatherGrid');
  if (!container) return;

  if (!districts || districts.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:15px;color:var(--ink-muted);font-size:12px;">कोई जिला नहीं मिला।</div>`;
    return;
  }

  container.innerHTML = districts.map(d => {
    const isPanipat = d.en === 'Panipat' || d.name === 'पानीपत';
    return `
      <div class="district-w-item ${isPanipat ? 'highlight-panipat' : ''}" title="${escapeHtml(d.name)} (${escapeHtml(d.en)}): ${d.temp}°C, ${escapeHtml(d.condition)}, आर्द्रता: ${d.humidity}%, हवा: ${d.wind} km/h">
        <div class="d-w-name">
          <span>${escapeHtml(d.name)}</span>
          <span class="d-w-cond">${escapeHtml(d.condition)}</span>
        </div>
        <div class="d-w-right">
          <span class="d-w-icon">${d.icon}</span>
          <span class="d-w-temp">${d.temp}°</span>
        </div>
      </div>
    `;
  }).join('');
}

function filterDistricts(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) {
    renderDistrictsWeather(allDistrictsWeather);
    return;
  }

  const filtered = allDistrictsWeather.filter(d => 
    d.name.toLowerCase().includes(q) || 
    d.en.toLowerCase().includes(q)
  );

  renderDistrictsWeather(filtered);
}

// Close modal on Escape key or outside click
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeArticleModal();
});

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initDate();
  setupNav();
  loadBreakingNews();
  loadCategoryCounts();
  loadNews();
  loadPanipatWeather();
  loadHaryanaWeather();

  // Auto refresh news every 3 minutes
  setInterval(() => {
    loadNews();
    loadBreakingNews();
    loadCategoryCounts();
  }, 180000);

  // Auto refresh weather every 10 minutes
  setInterval(() => {
    loadPanipatWeather();
    loadHaryanaWeather();
  }, 600000);
});
