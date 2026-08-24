// ==========================================================================
// VartaPrimeNews - Admin Dashboard Logic
// ==========================================================================

const API_BASE = '/api/admin';
let currentPendingList = [];
let currentApprovedList = [];
let selectedPendingIds = new Set();
let editingArticle = null;
let countdownTimer = null;

// Helpers
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function timeAgo(dateString) {
  if (!dateString) return 'ताज़ा';
  const past = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'अभी-अभी';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} मिनट पहले`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} घंटे पहले`;
  return `${Math.floor(diffSec / 86400)} दिन पहले`;
}

function showToast(msg) {
  const toast = document.getElementById('adminToast');
  if (toast) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }
}

// --------------------------------------------------------------------------
// 1. Stats and Next Fetch Countdown
// --------------------------------------------------------------------------

async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    const json = await res.json();
    if (json.success) {
      const stats = json.data;
      document.getElementById('statPending').textContent = stats.pendingCount || 0;
      document.getElementById('statApproved').textContent = stats.approvedCount || 0;
      document.getElementById('statRejected').textContent = stats.rejectedCount || 0;
      document.getElementById('statFeeds').textContent = `${stats.activeFeedsCount} / ${stats.totalFeedsCount}`;
      
      document.getElementById('tabPendingBadge').textContent = stats.pendingCount || 0;
      document.getElementById('tabApprovedBadge').textContent = stats.approvedCount || 0;

      const autoSwitch = document.getElementById('autoApproveToggle');
      if (autoSwitch) {
        autoSwitch.checked = !!stats.autoApproveEnabled;
        updateAutoApproveLabel(!!stats.autoApproveEnabled);
      }

      if (stats.nextFetchTime) {
        startCountdown(new Date(stats.nextFetchTime));
      }
    }
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

function startCountdown(targetDate) {
  if (countdownTimer) clearInterval(countdownTimer);

  const update = () => {
    const now = new Date();
    const diff = targetDate - now;

    const el = document.getElementById('nextFetchCountdown');
    if (!el) return;

    if (diff <= 0) {
      el.textContent = 'अभी रिफ्रेश हो रहा है...';
      setTimeout(() => {
        loadStats();
        loadPending();
      }, 5000);
      return;
    }

    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    el.textContent = `${mins} मिनट ${secs < 10 ? '0' : ''}${secs} सेकंड`;
  };

  update();
  countdownTimer = setInterval(update, 1000);
}

// Fetch Now Trigger
async function triggerFetchNow() {
  const btn = document.getElementById('fetchNowBtn');
  const icon = btn.querySelector('.btn-icon');
  btn.disabled = true;
  if (icon) icon.classList.add('btn-spin');
  btn.querySelector('.btn-text').textContent = 'फेचिंग जारी है...';

  try {
    const res = await fetch(`${API_BASE}/fetch-now`, { method: 'POST' });
    const json = await res.json();
    if (json.success) {
      showToast(`✅ ${json.addedCount} नई खबरें सफलतापूर्वक जोड़ी गईं!`);
      loadStats();
      loadPending();
      loadApproved();
    } else {
      showToast(`⚠️ ${json.message || 'त्रुटि हुई'}`);
    }
  } catch (err) {
    showToast('❌ फेचिंग में समस्या आई।');
  } finally {
    btn.disabled = false;
    if (icon) icon.classList.remove('btn-spin');
    btn.querySelector('.btn-text').textContent = 'अभी ताज़ा करें (Fetch Now)';
  }
}

// --------------------------------------------------------------------------
// 2. Pending Approvals View
// --------------------------------------------------------------------------

async function loadPending() {
  const cat = document.getElementById('pendingCatFilter')?.value || 'all';
  const dist = document.getElementById('pendingDistrictFilter')?.value || 'all';
  const srcType = document.getElementById('pendingSourceTypeFilter')?.value || 'all';
  const q = document.getElementById('pendingSearchInput')?.value || '';

  try {
    let url = `${API_BASE}/pending?category=${encodeURIComponent(cat)}&search=${encodeURIComponent(q)}`;
    if (dist !== 'all') url += `&district=${encodeURIComponent(dist)}`;

    const res = await fetch(url);
    const json = await res.json();
    if (json.success) {
      let list = json.data || [];

      // Filter by source type if requested
      if (srcType === 'reporter') {
        list = list.filter(item => item.sourceType === 'reporter');
      } else if (srcType === 'citizen') {
        list = list.filter(item => item.sourceType === 'citizen_reporter');
      } else if (srcType === 'wire') {
        list = list.filter(item => item.sourceType === 'news_agency' || String(item.source || '').includes('वायर'));
      } else if (srcType === 'rss') {
        list = list.filter(item => item.sourceType === 'rss' || (!item.sourceType && !item.reporterName));
      }

      currentPendingList = list;
      renderPendingGrid();
    }
  } catch (err) {
    console.error('Error loading pending:', err);
  }
}

function renderPendingGrid() {
  const container = document.getElementById('pendingGrid');
  if (!container) return;

  if (currentPendingList.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;background:var(--admin-card);border:1px dashed var(--admin-border);border-radius:8px;">
        <h3 style="color:#94A3B8;margin-bottom:8px;">🎉 कोई भी खबर लंबित नहीं है!</h3>
        <p style="color:#64748B;font-size:14px;">सभी खबरें स्वीकृत हो चुकी हैं या नया 30-मिनट चक्र आने वाला है।</p>
        <button class="btn btn-outline" style="margin-top:16px;" onclick="triggerFetchNow()">🔄 अभी RSS फीड्स रिफ्रेश करें</button>
      </div>
    `;
    return;
  }

  container.innerHTML = currentPendingList.map(item => {
    const isSelected = selectedPendingIds.has(item.id);
    const thumb = item.imageurl 
      ? `<img src="${escapeHtml(item.imageurl)}" alt="thumbnail" onerror="this.style.display='none'">`
      : '';

    let sourceBadge = '';
    if (item.sourceType === 'reporter') {
      sourceBadge = `<span style="background:#059669;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:12px;margin-right:6px;">🎤 अधिकृत रिपोर्टर: ${escapeHtml(item.reporterName || 'ग्राउंड')}</span>`;
    } else if (item.sourceType === 'citizen_reporter') {
      sourceBadge = `<span style="background:#D97706;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:12px;margin-right:6px;">📱 नागरिक रिपोर्टर: ${escapeHtml(item.reporterName || 'नागरिक')}</span>`;
    } else if (item.sourceType === 'news_agency' || String(item.source || '').includes('वायर')) {
      sourceBadge = `<span style="background:#0284C7;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:12px;margin-right:6px;">📡 एजेंसी वायर: ${escapeHtml(item.source || 'Wire')}</span>`;
    } else if (item.sourceType === 'advt_agency') {
      sourceBadge = `<span style="background:#B45309;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:12px;margin-right:6px;">📢 विज्ञापन बुकिंग: ${escapeHtml(item.source || 'Ad')}</span>`;
    } else {
      sourceBadge = `<span style="background:#475569;color:#fff;font-size:11px;font-weight:600;padding:2px 8px;border-radius:12px;margin-right:6px;">📰 RSS फीड: ${escapeHtml(item.source || 'RSS')}</span>`;
    }

    const districtTag = item.district
      ? `<span style="background:rgba(224,141,60,0.15);color:#E08D3C;font-size:11px;font-weight:600;padding:2px 7px;border-radius:4px;margin-right:6px;">📍 ${escapeHtml(item.district)}</span>`
      : '';

    return `
      <div class="pending-card ${isSelected ? 'selected' : ''}" id="card_${item.id}">
        <input type="checkbox" class="card-select-checkbox" ${isSelected ? 'checked' : ''} onchange="toggleSelect('${item.id}', this.checked)">
        
        <div class="pending-thumb">
          ${thumb}
          <span class="cat-tag">${escapeHtml(item.category)}</span>
        </div>

        <div class="pending-body">
          <div class="pending-source-line">
            ${sourceBadge}
            ${districtTag}
            <span style="color:#10B981;font-size:11px;font-weight:600;">🛡️ कॉपीराइट सुरक्षित</span>
            <span>⏱️ ${timeAgo(item.publishedAt || item.fetchedAt)}</span>
          </div>

          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description || item.content || 'विवरण उपलब्ध नहीं है')}</p>

          <div class="pending-actions">
            <button class="btn btn-success btn-sm" onclick="approveSingle('${item.id}')" title="स्वीकृत करें">
              ✅ स्वीकृत
            </button>
            <button class="btn btn-primary btn-sm" onclick="openEditModal('${item.id}')" title="संपादित करें">
              ✏️ एडिट
            </button>
            <button class="btn btn-danger btn-sm" onclick="rejectSingle('${item.id}')" title="खारिज करें">
              ❌ रिजेक्ट
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  updateBulkButtonState();
}

function toggleSelect(id, checked) {
  if (checked) {
    selectedPendingIds.add(id);
  } else {
    selectedPendingIds.delete(id);
  }
  const card = document.getElementById(`card_${id}`);
  if (card) card.classList.toggle('selected', checked);
  updateBulkButtonState();
}

function toggleSelectAll(checked) {
  selectedPendingIds.clear();
  if (checked) {
    currentPendingList.forEach(item => selectedPendingIds.add(item.id));
  }
  renderPendingGrid();
}

function updateBulkButtonState() {
  const bulkApproveBtn = document.getElementById('bulkApproveBtn');
  const bulkRejectBtn = document.getElementById('bulkRejectBtn');
  const countSpan = document.getElementById('selectedCount');
  
  const count = selectedPendingIds.size;
  if (countSpan) countSpan.textContent = count > 0 ? `(${count} चयनित)` : '';
  
  if (bulkApproveBtn) bulkApproveBtn.disabled = count === 0;
  if (bulkRejectBtn) bulkRejectBtn.disabled = count === 0;
}

// Single Action Handlers
async function approveSingle(id) {
  try {
    const res = await fetch(`${API_BASE}/approve/${id}`, { method: 'POST' });
    const json = await res.json();
    if (json.success) {
      showToast('✅ समाचार स्वीकृत और लाइव कर दिया गया!');
      selectedPendingIds.delete(id);
      loadStats();
      loadPending();
      loadApproved();
    }
  } catch (err) {
    showToast('त्रुटि हुई।');
  }
}

async function rejectSingle(id) {
  try {
    const res = await fetch(`${API_BASE}/reject/${id}`, { method: 'POST' });
    const json = await res.json();
    if (json.success) {
      showToast('❌ समाचार खारिज कर दिया गया।');
      selectedPendingIds.delete(id);
      loadStats();
      loadPending();
    }
  } catch (err) {
    showToast('त्रुटि हुई।');
  }
}

// Bulk Actions
async function bulkApproveSelected() {
  const ids = Array.from(selectedPendingIds);
  if (!ids.length) return;

  if (!confirm(`क्या आप वाकई इन ${ids.length} खबरों को स्वीकृत कर वेबसाइट पर लाइव करना चाहते हैं?`)) return;

  try {
    const res = await fetch(`${API_BASE}/bulk-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    const json = await res.json();
    if (json.success) {
      showToast(`✅ ${json.message}`);
      selectedPendingIds.clear();
      loadStats();
      loadPending();
      loadApproved();
    }
  } catch (err) {
    showToast('बल्क अप्रूवल में त्रुटि हुई।');
  }
}

async function bulkRejectSelected() {
  const ids = Array.from(selectedPendingIds);
  if (!ids.length) return;

  if (!confirm(`क्या आप वाकई इन ${ids.length} खबरों को खारिज (Reject) करना चाहते हैं?`)) return;

  try {
    const res = await fetch(`${API_BASE}/bulk-reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    const json = await res.json();
    if (json.success) {
      showToast(`❌ ${json.message}`);
      selectedPendingIds.clear();
      loadStats();
      loadPending();
    }
  } catch (err) {
    showToast('बल्क रिजेक्ट में त्रुटि हुई।');
  }
}

// --------------------------------------------------------------------------
// 3. Edit & Approve Modal
// --------------------------------------------------------------------------

function openEditModal(id) {
  const article = currentPendingList.find(i => i.id === id) || currentApprovedList.find(i => i.id === id);
  if (!article) return;

  editingArticle = article;

  document.getElementById('editTitle').value = article.title || '';
  document.getElementById('editCategory').value = article.category || 'हरियाणा';
  if (document.getElementById('editDistrict')) {
    document.getElementById('editDistrict').value = article.district || '';
  }
  const imgUrl = article.imageurl || '';
  document.getElementById('editImageUrl').value = imgUrl;
  updateModalImagePreview(imgUrl);

  document.getElementById('editDescription').value = article.description || '';
  document.getElementById('editContent').value = article.content || article.description || '';
  document.getElementById('editIsBreaking').checked = !!article.isBreaking;
  document.getElementById('editIsHero').checked = !!article.isHero;

  const modal = document.getElementById('editModal');
  if (modal) modal.classList.add('active');
}

function closeEditModal() {
  const modal = document.getElementById('editModal');
  if (modal) modal.classList.remove('active');
  editingArticle = null;
}

// Photo Authority Management Functions
function updateModalImagePreview(url) {
  const img = document.getElementById('modalImagePreview');
  const noText = document.getElementById('modalNoImageText');
  if (url && url.trim().length > 5) {
    img.src = url.trim();
    img.style.display = 'block';
    if (noText) noText.style.display = 'none';
  } else {
    img.src = '';
    img.style.display = 'none';
    if (noText) noText.style.display = 'block';
  }
}

function removeModalImage() {
  document.getElementById('editImageUrl').value = '';
  updateModalImagePreview('');
  showToast('🗑️ तस्वीर हटा दी गई (बिना फोटो के प्रकाशित होगी)');
}

async function handleAdminPhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(evt) {
    const base64 = evt.target.result;
    showToast('⏳ तस्वीर अपलोड हो रही है...');
    try {
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: base64 })
      });
      const json = await res.json();
      if (json.success) {
        document.getElementById('editImageUrl').value = json.url;
        updateModalImagePreview(json.url);
        showToast('✅ तस्वीर सफलतापूर्वक अपलोड हो गई!');
      } else {
        showToast('अपलोड में त्रुटि: ' + json.message);
      }
    } catch (err) {
      showToast('अपलोड विफल: ' + err.message);
    }
  };
  reader.readAsDataURL(file);
}

async function autoMatchModalImage() {
  const title = document.getElementById('editTitle').value.trim();
  const category = document.getElementById('editCategory').value;

  if (!title) {
    showToast('कृपया पहले समाचार शीर्षक दर्ज करें!');
    return;
  }

  showToast('🔍 AI द्वारा सटीक फोटो पहचानी जा रही है...');
  try {
    const res = await fetch('/api/admin/match-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, category })
    });
    const json = await res.json();
    if (json.success && json.imageUrl) {
      document.getElementById('editImageUrl').value = json.imageUrl;
      updateModalImagePreview(json.imageUrl);
      showToast('🎯 शीर्षक के अनुसार सटीक AI फोटो सेट कर दी गई!');
    }
  } catch (err) {
    showToast('फोटो मैच करने में त्रुटि: ' + err.message);
  }
}

let cachedTopicPhotos = null;
async function applyTopicImage(topicKey) {
  if (!topicKey) return;
  try {
    if (!cachedTopicPhotos) {
      const res = await fetch('/api/admin/topic-photos');
      const json = await res.json();
      if (json.success) cachedTopicPhotos = json.data;
    }
    if (cachedTopicPhotos && cachedTopicPhotos[topicKey] && cachedTopicPhotos[topicKey].length > 0) {
      const pool = cachedTopicPhotos[topicKey];
      const randomIndex = Math.floor(Math.random() * pool.length);
      const url = pool[randomIndex];
      document.getElementById('editImageUrl').value = url;
      updateModalImagePreview(url);
      showToast(`🖼️ ${topicKey} विषय की फोटो सेट की गई!`);
    }
  } catch (e) {
    showToast('फोटो लोड करने में समस्या: ' + e.message);
  }
}

async function triggerFixAllImages() {
  if (!confirm('क्या आप सभी लाइव व लंबित समाचारों की पुरानी/असंबंधित तस्वीरों को नए AI सेमेंटिक मैचिंग सिस्टम से ठीक करना चाहते हैं?')) return;

  showToast('⏳ सभी समाचारों की तस्वीरें AI द्वारा अपडेट की जा रही हैं...');
  try {
    const res = await fetch('/api/admin/fix-all-images', { method: 'POST' });
    const json = await res.json();
    if (json.success) {
      showToast(`🎉 ${json.message}`);
      loadStats();
      loadPending();
      loadApproved();
    } else {
      showToast('त्रुटि: ' + json.message);
    }
  } catch (err) {
    showToast('तस्वीरें अपडेट करने में समस्या: ' + err.message);
  }
}

// --------------------------------------------------------------------------
// 4. Manage Approved (Live News) View
// --------------------------------------------------------------------------

async function loadApproved() {
  const cat = document.getElementById('approvedCatFilter').value;
  const q = document.getElementById('approvedSearchInput').value;

  try {
    const res = await fetch(`${API_BASE}/approved?category=${encodeURIComponent(cat)}&search=${encodeURIComponent(q)}`);
    const json = await res.json();
    if (json.success) {
      currentApprovedList = json.data;
      renderApprovedTable();
    }
  } catch (err) {
    console.error('Error loading approved:', err);
  }
}

function renderApprovedTable() {
  const tbody = document.getElementById('approvedTableBody');
  if (!tbody) return;

  if (currentApprovedList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--admin-muted);">कोई लाइव समाचार नहीं मिला।</td></tr>`;
    return;
  }

  tbody.innerHTML = currentApprovedList.map(item => `
    <tr>
      <td style="width:70px;">
        ${item.imageurl ? `<img src="${escapeHtml(item.imageurl)}" style="width:60px;height:42px;object-fit:cover;border-radius:4px;" onerror="this.parentElement.innerHTML='<div style=\\'width:60px;height:42px;background:#334155;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#94a3b8;\\'>तस्वीर नहीं</div>'">` : `<div style="width:60px;height:42px;background:#334155;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#94a3b8;">तस्वीर नहीं</div>`}
      </td>
      <td>
        <div style="font-weight:600;margin-bottom:4px;">${escapeHtml(item.title)}</div>
        <div style="font-size:12px;color:var(--admin-muted);">
          <span>🏷️ ${escapeHtml(item.source)}</span> &nbsp;•&nbsp;
          <span>⏱️ ${timeAgo(item.approvedAt || item.publishedAt)}</span> &nbsp;•&nbsp;
          <span>👁️ ${item.views || 0} व्यूज</span>
        </div>
      </td>
      <td>
        <span class="badge-tag" style="background:#334155;color:#fff;">${escapeHtml(item.category)}</span>
      </td>
      <td>
        ${item.isHero ? '<span class="badge-tag hero">⭐ मुख्य लीड</span> ' : ''}
        ${item.isBreaking ? '<span class="badge-tag breaking">⚡ ब्रेकिंग</span>' : ''}
      </td>
      <td style="white-space:nowrap;">
        <button class="btn btn-outline btn-sm" onclick="toggleBreaking('${item.id}')" title="ब्रेकिंग न्यूज़ टॉगल">
          ${item.isBreaking ? '⚡ ब्रेकिंग हटाएं' : '⚡ ब्रेकिंग बनाएं'}
        </button>
        <button class="btn btn-outline btn-sm" onclick="toggleHero('${item.id}')" title="मुख्य लीड टॉगल">
          ${item.isHero ? '⭐ लीड हटाएं' : '⭐ लीड बनाएं'}
        </button>
      </td>
      <td style="white-space:nowrap;">
        <button class="btn btn-primary btn-sm" onclick="openEditModal('${item.id}')">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="deleteArticle('${item.id}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

async function toggleBreaking(id) {
  try {
    const res = await fetch(`${API_BASE}/toggle-breaking/${id}`, { method: 'POST' });
    const json = await res.json();
    if (json.success) {
      showToast('स्थिति अपडेट हो गई!');
      loadApproved();
    }
  } catch (err) {
    showToast('त्रुटि हुई।');
  }
}

async function toggleHero(id) {
  try {
    const res = await fetch(`${API_BASE}/toggle-hero/${id}`, { method: 'POST' });
    const json = await res.json();
    if (json.success) {
      showToast('मुख्य लीड अपडेट हो गई!');
      loadApproved();
    }
  } catch (err) {
    showToast('त्रुटि हुई।');
  }
}

async function deleteArticle(id) {
  if (!confirm('क्या आप वाकई इस समाचार को हटाना चाहते हैं?')) return;
  try {
    const res = await fetch(`${API_BASE}/news/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      showToast('🗑️ समाचार हटा दिया गया।');
      loadStats();
      loadApproved();
    }
  } catch (err) {
    showToast('त्रुटि हुई।');
  }
}

// --------------------------------------------------------------------------
// 5. Manual News Publisher Form
// --------------------------------------------------------------------------

function setupManualForm() {
  const form = document.getElementById('manualNewsForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('manualTitle').value.trim();
    if (!title) {
      showToast('कृपया शीर्षक भरें!');
      return;
    }

    const payload = {
      title,
      category: document.getElementById('manualCategory').value,
      district: document.getElementById('manualDistrict')?.value || 'पानीपत',
      source: document.getElementById('manualSource').value.trim() || 'वार्ताप्राइम एक्सक्लूसिव',
      imageurl: document.getElementById('manualImageUrl').value.trim(),
      description: document.getElementById('manualDescription').value.trim(),
      content: document.getElementById('manualContent').value.trim(),
      isBreaking: document.getElementById('manualIsBreaking').checked,
      isHero: document.getElementById('manualIsHero').checked
    };

    try {
      const res = await fetch(`${API_BASE}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        showToast('🎉 नया समाचार सफलतापूर्वक प्रकाशित व लाइव हुआ!');
        form.reset();
        loadStats();
        loadApproved();
        // Switch to approved tab
        document.querySelector('.tab-btn[data-tab="approved"]').click();
      }
    } catch (err) {
      showToast('समाचार प्रकाशित करने में त्रुटि हुई।');
    }
  });
}

// --------------------------------------------------------------------------
// 6. RSS Feeds Manager
// --------------------------------------------------------------------------

async function loadFeeds() {
  try {
    const res = await fetch(`${API_BASE}/feeds`);
    const json = await res.json();
    if (json.success) {
      renderFeedsTable(json.data);
    }
  } catch (err) {
    console.error('Error loading feeds:', err);
  }
}

function renderFeedsTable(feeds) {
  const tbody = document.getElementById('feedsTableBody');
  if (!tbody) return;

  tbody.innerHTML = feeds.map(feed => `
    <tr>
      <td><strong>${escapeHtml(feed.name)}</strong></td>
      <td><span class="badge-tag" style="background:#334155;color:#fff;">${escapeHtml(feed.category)}</span></td>
      <td style="font-size:12px;color:var(--admin-muted);max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
        <a href="${escapeHtml(feed.url)}" target="_blank" style="text-decoration:underline;">${escapeHtml(feed.url)}</a>
      </td>
      <td>
        <label style="display:inline-flex;align-items:center;cursor:pointer;">
          <input type="checkbox" ${feed.enabled ? 'checked' : ''} onchange="toggleFeed('${feed.id}')">
          <span style="margin-left:6px;font-size:13px;">${feed.enabled ? 'सक्रिय' : 'बंद'}</span>
        </label>
      </td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteFeed('${feed.id}')">🗑️ हटाएं</button>
      </td>
    </tr>
  `).join('');
}

async function toggleFeed(id) {
  try {
    await fetch(`${API_BASE}/feeds/toggle/${id}`, { method: 'POST' });
    showToast('फीड स्थिति अपडेट हो गई!');
    loadStats();
    loadFeeds();
  } catch (err) {
    showToast('त्रुटि हुई।');
  }
}

async function deleteFeed(id) {
  if (!confirm('क्या आप वाकई इस फीड को हटाना चाहते हैं?')) return;
  try {
    await fetch(`${API_BASE}/feeds/${id}`, { method: 'DELETE' });
    showToast('फीड हटा दी गई!');
    loadStats();
    loadFeeds();
  } catch (err) {
    showToast('त्रुटि हुई।');
  }
}

function setupAddFeedForm() {
  const form = document.getElementById('addFeedForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('newFeedName').value.trim();
    const category = document.getElementById('newFeedCategory').value;
    const url = document.getElementById('newFeedUrl').value.trim();

    if (!name || !url) return;

    try {
      const res = await fetch(`${API_BASE}/feeds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category, url })
      });
      const json = await res.json();
      if (json.success) {
        showToast('✅ नई RSS फीड जुड़ गई!');
        form.reset();
        loadStats();
        loadFeeds();
      }
    } catch (err) {
      showToast('फीड जोड़ने में त्रुटि हुई।');
    }
  });
}

// --------------------------------------------------------------------------
// 7. Auto Approve Toggle
// --------------------------------------------------------------------------

function updateAutoApproveLabel(enabled) {
  const lbl = document.getElementById('autoApproveLabel');
  if (lbl) {
    lbl.innerHTML = enabled
      ? '<strong style="color:#10B981;">[ 🟢 ऑन - बिना अप्रूवल सीधे लाइव ]</strong>'
      : '<strong style="color:#F59E0B;">[ 🔴 ऑफ - आपके 1-क्लिक अप्रूवल के लिए रुकेंगी ]</strong>';
  }
}

function toggleAutoApprove(enabled) {
  updateAutoApproveLabel(enabled);
}

function setupAutoApproveToggle() {
  const toggle = document.getElementById('autoApproveToggle');
  if (!toggle) return;

  toggle.addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    updateAutoApproveLabel(enabled);
    try {
      const res = await fetch(`${API_BASE}/auto-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      const json = await res.json();
      if (json.success) {
        showToast(enabled ? '⚡ ऑटो-अप्रूवल ऑन (खबरें बिना अप्रूवल सीधे लाइव होंगी)' : '🛡️ ऑटो-अप्रूवल ऑफ (खबरें आपके 1-क्लिक अप्रूवल के लिए रुकेंगी)');
      }
    } catch (err) {
      showToast('त्रुटि हुई।');
    }
  });
}
      showToast('सेटिंग बदलने में त्रुटि।');
    }
  });
}

// --------------------------------------------------------------------------
// 8. Tab Navigation & Initialization
// --------------------------------------------------------------------------

function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-content-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const tabId = btn.dataset.tab;
      const targetPanel = document.getElementById(`panel-${tabId}`);
      if (targetPanel) targetPanel.classList.add('active');

      if (tabId === 'pending') loadPending();
      if (tabId === 'approved') loadApproved();
      if (tabId === 'feeds') loadFeeds();
    });
  });
}

async function loadAdminLocations() {
  try {
    const res = await fetch('/api/locations');
    const json = await res.json();
    if (json.success && json.haryanaDistricts) {
      const distSelect = document.getElementById('pendingDistrictFilter');
      if (distSelect) {
        distSelect.innerHTML = '<option value="all">📍 सभी जिले</option>' +
          json.haryanaDistricts.map(d => `<option value="${d}">${d}</option>`).join('');
      }
    }
  } catch (e) {
    console.error('Error loading admin locations:', e);
  }
}

async function loadIntegrationStatus() {
  const el = document.getElementById('integrationStatus');
  if (!el) return;
  try {
    const json = await (await fetch('/api/admin/integrations')).json();
    const s = json.data || {};
    const badge = (label, active) => `${active ? '🟢' : '⚪'} ${label}`;
    el.textContent = `वितरण चैनल: ${badge('GitPit', s.gitpit)}  •  ${badge('WhatsApp', s.whatsapp)}  •  ${badge('Telegram', s.telegram)}`;
  } catch (_) { el.textContent = 'वितरण चैनल स्थिति उपलब्ध नहीं है।'; }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupManualForm();
  setupAddFeedForm();
  setupAutoApproveToggle();
  loadAdminLocations();
  
  loadStats();
  loadPending();
  loadApproved();
  loadFeeds();
  loadIntegrationStatus();

  // Search & Filter listeners
  document.getElementById('pendingCatFilter')?.addEventListener('change', loadPending);
  document.getElementById('pendingSearchInput')?.addEventListener('input', loadPending);
  
  document.getElementById('approvedCatFilter')?.addEventListener('change', loadApproved);
  document.getElementById('approvedSearchInput')?.addEventListener('input', loadApproved);

  // Auto refresh admin stats every 60s
  setInterval(loadStats, 60000);
});

// PWA Service Worker & Install Handler for Admin
let adminDeferredPrompt = null;
const adminInstallBtn = document.getElementById('adminPwaInstallBtn');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('SW registration error:', err);
    });
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  adminDeferredPrompt = e;
  if (adminInstallBtn) {
    adminInstallBtn.style.display = 'inline-flex';
    adminInstallBtn.onclick = async () => {
      if (adminDeferredPrompt) {
        adminDeferredPrompt.prompt();
        const { outcome } = await adminDeferredPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast('✅ वार्ताप्राइम एडमिन ऐप इंस्टॉल हो गया!');
        }
        adminDeferredPrompt = null;
        adminInstallBtn.style.display = 'none';
      }
    };
  }
});
