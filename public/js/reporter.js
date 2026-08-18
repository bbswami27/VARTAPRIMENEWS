// ==========================================================================
// VartaPrimeNews - Mobile Field Reporter Client Logic
// ==========================================================================

let locationsData = {
  haryanaDistricts: [],
  statesData: {}
};

let currentImageDataUrl = '';

function showToast(msg) {
  const toast = document.getElementById('repToast');
  if (toast) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }
}

// Load States & Districts from Server
async function loadLocations() {
  try {
    const res = await fetch('/api/locations');
    const json = await res.json();
    if (json.success) {
      locationsData = json;
      populateStates();
    }
  } catch (err) {
    console.error('Error loading locations:', err);
  }
}

function populateStates() {
  const stateSelect = document.getElementById('repState');
  if (!stateSelect) return;

  stateSelect.innerHTML = Object.keys(locationsData.statesData).map(state => `
    <option value="${state}" ${state === 'हरियाणा' ? 'selected' : ''}>${state}</option>
  `).join('');

  updateDistricts('हरियाणा');
}

function updateDistricts(selectedState) {
  const districtSelect = document.getElementById('repDistrict');
  if (!districtSelect) return;

  const districts = locationsData.statesData[selectedState] || locationsData.haryanaDistricts;
  const savedDistrict = localStorage.getItem('varta_rep_district') || 'पानीपत';

  districtSelect.innerHTML = districts.map(d => `
    <option value="${d}" ${d === savedDistrict ? 'selected' : ''}>${d}</option>
  `).join('');
}

// Image File Selector & Camera Preview
function setupImageHandler() {
  const fileInput = document.getElementById('repImageFile');
  const urlInput = document.getElementById('repImageUrl');
  const previewImg = document.getElementById('repImagePreview');

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          currentImageDataUrl = event.target.result;
          if (previewImg) {
            previewImg.src = currentImageDataUrl;
            previewImg.style.display = 'block';
          }
          if (urlInput) urlInput.value = '';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (urlInput) {
    urlInput.addEventListener('input', () => {
      const u = urlInput.value.trim();
      if (u && previewImg) {
        currentImageDataUrl = u;
        previewImg.src = u;
        previewImg.style.display = 'block';
      }
    });
  }
}

// Load saved reporter profile from localStorage
function loadReporterProfile() {
  const savedName = localStorage.getItem('varta_rep_name');
  const savedPhone = localStorage.getItem('varta_rep_phone');
  const savedState = localStorage.getItem('varta_rep_state') || 'हरियाणा';

  if (savedName) document.getElementById('repName').value = savedName;
  if (savedPhone) document.getElementById('repPhone').value = savedPhone;
  if (savedState) {
    const stateEl = document.getElementById('repState');
    if (stateEl) stateEl.value = savedState;
  }
}

function saveReporterProfile() {
  const name = document.getElementById('repName').value.trim();
  const phone = document.getElementById('repPhone').value.trim();
  const state = document.getElementById('repState').value;
  const district = document.getElementById('repDistrict').value;

  if (name) localStorage.setItem('varta_rep_name', name);
  if (phone) localStorage.setItem('varta_rep_phone', phone);
  if (state) localStorage.setItem('varta_rep_state', state);
  if (district) localStorage.setItem('varta_rep_district', district);
}

// Render Reporter Submissions History
function loadMySubmissions() {
  const container = document.getElementById('mySubmissionsList');
  if (!container) return;

  const history = JSON.parse(localStorage.getItem('varta_rep_history') || '[]');
  if (history.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:20px;color:var(--rep-muted);font-size:13px;">
        आपने अभी तक कोई समाचार नहीं भेजा है।
      </div>
    `;
    return;
  }

  container.innerHTML = history.slice(0, 10).map(item => `
    <div class="submitted-item">
      <img src="${item.imageurl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=120&auto=format&fit=crop&q=80'}" alt="img">
      <div class="submitted-info">
        <h4>${item.title}</h4>
        <div class="submitted-meta">
          <span>📍 ${item.district}</span>
          <span>⏱️ ${new Date(item.time).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          <span class="status-badge pending">⏳ संपादकीय समीक्षा में</span>
        </div>
      </div>
    </div>
  `).join('');
}

// Submit Form Handler
function setupFormHandler() {
  const form = document.getElementById('reporterNewsForm');
  if (!form) return;

  const stateSelect = document.getElementById('repState');
  if (stateSelect) {
    stateSelect.addEventListener('change', (e) => {
      updateDistricts(e.target.value);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('repTitle').value.trim();
    const reporterName = document.getElementById('repName').value.trim();
    const state = document.getElementById('repState').value;
    const district = document.getElementById('repDistrict').value;
    const category = document.getElementById('repCategory').value;
    const content = document.getElementById('repContent').value.trim();
    const description = document.getElementById('repDescription').value.trim() || content.slice(0, 200);
    const isBreaking = document.getElementById('repIsBreaking').checked;

    if (!title || !content || !reporterName) {
      showToast('कृपया शीर्षक, अपना नाम और समाचार विवरण भरें!');
      return;
    }

    saveReporterProfile();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ समाचार भेजा जा रहा है...';

    const payload = {
      title,
      description,
      content,
      category,
      state,
      district,
      reporterName,
      reporterPhone: document.getElementById('repPhone').value.trim(),
      imageurl: currentImageDataUrl || '',
      isBreaking
    };

    try {
      const res = await fetch('/api/reporter/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        showToast('🎉 समाचार सफलतापूर्वक मुख्य संपादक को भेजा गया!');

        // Save to local history
        const history = JSON.parse(localStorage.getItem('varta_rep_history') || '[]');
        history.unshift({
          id: json.data.id,
          title: payload.title,
          district: payload.district,
          imageurl: payload.imageurl,
          time: new Date().toISOString(),
          status: 'pending'
        });
        localStorage.setItem('varta_rep_history', JSON.stringify(history));

        // Reset form except reporter identity
        document.getElementById('repTitle').value = '';
        document.getElementById('repDescription').value = '';
        document.getElementById('repContent').value = '';
        document.getElementById('repImageFile').value = '';
        document.getElementById('repImageUrl').value = '';
        document.getElementById('repIsBreaking').checked = false;
        currentImageDataUrl = '';
        document.getElementById('repImagePreview').style.display = 'none';

        loadMySubmissions();
      } else {
        showToast(`⚠️ ${json.message || 'त्रुटि हुई'}`);
      }
    } catch (err) {
      showToast('❌ समाचार भेजने में समस्या आई। इंटरनेट कनेक्शन जांचें।');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
}

// PWA Service Worker & Install Handler
let deferredPrompt = null;
const installBtn = document.getElementById('pwaInstallBtn');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('SW registration error:', err);
    });
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) {
    installBtn.style.display = 'inline-flex';
    installBtn.onclick = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast('✅ वार्ताप्राइम ऐप आपके फोन पर इंस्टॉल हो गया!');
        }
        deferredPrompt = null;
        installBtn.style.display = 'none';
      }
    };
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  await loadLocations();
  loadReporterProfile();
  setupImageHandler();
  setupFormHandler();
  loadMySubmissions();
});
