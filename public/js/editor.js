// ==========================================================================
// VartaPrime News - Editor Desk JavaScript Logic
// ==========================================================================

let pendingArticles = [];
let filteredArticles = [];

document.addEventListener('DOMContentLoaded', () => {
  loadPendingArticles();
  loadStats();
});

async function loadStats() {
  try {
    const res = await fetch('/api/admin/stats');
    const data = await res.json();
    if (data.success && data.data) {
      document.getElementById('pendingCount').textContent = data.data.pendingCount || 0;
      document.getElementById('approvedCount').textContent = data.data.approvedCount || 0;
    }
  } catch (err) {
    console.error('Error fetching stats:', err);
  }
}

async function loadPendingArticles() {
  const container = document.getElementById('newsGrid');
  container.innerHTML = '<div style="text-align:center;padding:40px;color:#64748b;">लंबित समाचार लोड हो रहे हैं...</div>';

  try {
    const res = await fetch('/api/admin/pending');
    const json = await res.json();

    if (json.success) {
      pendingArticles = json.data || [];
      filteredArticles = [...pendingArticles];
      
      // Update reporter count
      const repCount = pendingArticles.filter(a => a.sourceType === 'reporter' || a.reporterName).length;
      const repBadge = document.getElementById('reporterCount');
      if (repBadge) repBadge.textContent = repCount;

      const brkCount = pendingArticles.filter(a => a.isBreaking).length;
      const brkBadge = document.getElementById('breakingCount');
      if (brkBadge) brkBadge.textContent = brkCount;

      document.getElementById('pendingCount').textContent = pendingArticles.length;

      renderArticles();
    } else {
      container.innerHTML = '<div style="text-align:center;padding:40px;color:#ef4444;">डेटा लोड करने में त्रुटि आई।</div>';
    }
  } catch (err) {
    console.error('Fetch error:', err);
    container.innerHTML = '<div style="text-align:center;padding:40px;color:#ef4444;">सर्वर से संपर्क नहीं हो सका।</div>';
  }
}

function filterArticles() {
  const query = (document.getElementById('searchInput').value || '').toLowerCase().trim();
  const cat = document.getElementById('categoryFilter').value;

  filteredArticles = pendingArticles.filter(item => {
    const matchCat = !cat || item.category === cat;
    const matchQuery = !query || 
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.district && item.district.toLowerCase().includes(query)) ||
      (item.reporterName && item.reporterName.toLowerCase().includes(query));
    return matchCat && matchQuery;
  });

  renderArticles();
}

function renderArticles() {
  const container = document.getElementById('newsGrid');

  if (!filteredArticles.length) {
    container.innerHTML = `
      <div style="background:white;padding:48px;text-align:center;border-radius:8px;border:1px solid #e2e8f0;">
        <div style="font-size:36px;margin-bottom:8px;">🎉</div>
        <h3 style="font-family:'Noto Serif Devanagari',serif;font-size:18px;color:#0f172a;margin-bottom:4px;">कोई लंबित समाचार नहीं है</h3>
        <p style="color:#64748b;font-size:14px;">सभी समाचार स्वीकृत एवं लाइव प्रकाशित किए जा चुके हैं।</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredArticles.map(article => {
    const hasImg = !!(article.imageurl && String(article.imageurl).trim().length > 5);
    const thumb = hasImg
      ? `<img src="${article.imageurl}" class="news-thumb" alt="News thumbnail" onerror="this.parentElement.innerHTML='<div class=\\'news-thumb\\' style=\\'background:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:12px;font-weight:600;\\'>📝 टेक्स्ट-ओनली</div>'">`
      : `<div class="news-thumb" style="background:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:12px;font-weight:600;">📝 टेक्स्ट-ओनली</div>`;
    const districtTag = article.district ? `<span class="tag-district">📍 ${article.district}</span>` : '';
    const reporterTag = article.reporterName ? `<span style="color:#059669;font-weight:600;">✍️ ${article.reporterName}</span>` : '';
    const breakingTag = article.isBreaking ? `<span style="background:#fee2e2;color:#dc2626;padding:2px 6px;border-radius:4px;font-weight:700;">⚡ ब्रेकिंग</span>` : '';

    return `
      <div class="news-card" id="card-${article.id}">
        ${thumb}
        <div>
          <div class="news-meta">
            <span class="tag-cat">${article.category || 'सामान्य'}</span>
            ${districtTag}
            ${reporterTag}
            ${breakingTag}
            <span class="tag-source">• ${article.source || 'संवाददाता'}</span>
          </div>
          <h2 class="news-title">${article.title}</h2>
          <p class="news-desc">${article.description || article.content || 'कोई विवरण नहीं उपलब्ध।'}</p>
        </div>
        <div class="card-actions">
          <button class="btn btn-success" onclick="quickApprove('${article.id}')">✅ प्रकाशित करें</button>
          <button class="btn btn-primary" onclick="openEditModal('${article.id}')">✏️ एडिट करें</button>
          <button class="btn btn-danger" onclick="quickReject('${article.id}')">❌ अस्वीकृत</button>
        </div>
      </div>
    `;
  }).join('');
}

async function quickApprove(id) {
  try {
    const res = await fetch(`/api/admin/approve/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const json = await res.json();
    if (json.success) {
      pendingArticles = pendingArticles.filter(a => a.id !== id);
      filterArticles();
      loadStats();
    } else {
      alert('मंज़ूरी में त्रुटि: ' + (json.message || 'अज्ञात समस्या'));
    }
  } catch (err) {
    alert('सर्वर एरर: ' + err.message);
  }
}

async function quickReject(id) {
  if (!confirm('क्या आप वाकई इस समाचार को अस्वीकृत करना चाहते हैं?')) return;
  try {
    const res = await fetch(`/api/admin/reject/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const json = await res.json();
    if (json.success) {
      pendingArticles = pendingArticles.filter(a => a.id !== id);
      filterArticles();
      loadStats();
    } else {
      alert('अस्वीकृति में त्रुटि: ' + (json.message || 'अज्ञात समस्या'));
    }
  } catch (err) {
    alert('सर्वर एरर: ' + err.message);
  }
}

function openEditModal(id) {
  const article = pendingArticles.find(a => a.id === id);
  if (!article) return;

  document.getElementById('editArticleId').value = article.id;
  document.getElementById('editTitle').value = article.title || '';
  document.getElementById('editCategory').value = article.category || 'हरियाणा';
  document.getElementById('editDistrict').value = article.district || '';
  document.getElementById('editImage').value = article.imageurl || '';
  document.getElementById('editDescription').value = article.description || '';
  document.getElementById('editContent').value = article.content || '';
  document.getElementById('editIsBreaking').checked = !!article.isBreaking;
  document.getElementById('editIsHero').checked = !!article.isHero;

  document.getElementById('editModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('editModal').style.display = 'none';
}

async function saveAndApproveModal() {
  const id = document.getElementById('editArticleId').value;
  if (!id) return;

  const payload = {
    title: document.getElementById('editTitle').value.trim(),
    category: document.getElementById('editCategory').value,
    district: document.getElementById('editDistrict').value.trim(),
    imageurl: document.getElementById('editImage').value.trim(),
    description: document.getElementById('editDescription').value.trim(),
    content: document.getElementById('editContent').value.trim(),
    isBreaking: document.getElementById('editIsBreaking').checked,
    isHero: document.getElementById('editIsHero').checked
  };

  if (!payload.title) {
    alert('शीर्षक अनिवार्य है!');
    return;
  }

  try {
    const res = await fetch(`/api/admin/approve/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.success) {
      closeModal();
      pendingArticles = pendingArticles.filter(a => a.id !== id);
      filterArticles();
      loadStats();
    } else {
      alert('प्रकाशन में त्रुटि: ' + (json.message || 'अज्ञात समस्या'));
    }
  } catch (err) {
    alert('सर्वर एरर: ' + err.message);
  }
}

async function rejectCurrentModal() {
  const id = document.getElementById('editArticleId').value;
  if (!id) return;
  closeModal();
  quickReject(id);
}

async function triggerAiRewrite() {
  const title = document.getElementById('editTitle').value;
  const description = document.getElementById('editDescription').value;
  const content = document.getElementById('editContent').value;
  const category = document.getElementById('editCategory').value;

  try {
    const res = await fetch('/api/admin/rewrite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, content, category })
    });
    const json = await res.json();
    if (json.success && json.data) {
      if (json.data.title) document.getElementById('editTitle').value = json.data.title;
      if (json.data.description) document.getElementById('editDescription').value = json.data.description;
      if (json.data.content) document.getElementById('editContent').value = json.data.content;
      alert('✨ AI द्वारा भाषा और शीर्षक को शुद्ध कर दिया गया है!');
    }
  } catch (err) {
    alert('AI एरर: ' + err.message);
  }
}
