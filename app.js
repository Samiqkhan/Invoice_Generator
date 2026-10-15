/**
 * app.js - ZOEY Invoice Creator Application
 * Designed specifically for ZOEY Web & Software Development Agency
 */

// Default fixed company profile for ZOEY (Streamlined: Name, Tagline, Email, Phone, Signatory)
const DEFAULT_ZOEY_PROFILE = {
  name: "ZOEY",
  tagline: "Web & Software Development",
  email: "contact@zoey.dev",
  phone: "+91 98765 43210",
  signatory: "Samiq khan"
};

// Preset catalog for quick addition of tech services
const SERVICE_PRESETS = {
  "web-dev": {
    desc: "Custom Web Application Development (Frontend React/Next.js & Responsive UI)",
    qty: 1,
    rate: 85000
  },
  "ui-ux": {
    desc: "UI/UX Design System, Wireframes & Interactive Prototyping (Figma)",
    qty: 1,
    rate: 35000
  },
  "api-backend": {
    desc: "Scalable Backend API, PostgreSQL Database & Authentication Engine",
    qty: 1,
    rate: 55000
  },
  "mobile-app": {
    desc: "Cross-Platform Mobile Application Development (iOS & Android via React Native)",
    qty: 1,
    rate: 110000
  },
  "cloud-deploy": {
    desc: "DevOps Setup, AWS/GCP Cloud Architecture, Docker Containerization & CI/CD",
    qty: 1,
    rate: 30000
  },
  "maintenance": {
    desc: "Monthly Retainer: Server Maintenance, Performance Optimization & Bug Fix SLA",
    qty: 1,
    rate: 25000
  },
  "custom": {
    desc: "Enterprise Software Engineering & Custom Integration Sprints",
    qty: 1,
    rate: 65000
  }
};

// Application State
let companyProfile = { ...DEFAULT_ZOEY_PROFILE };
let items = [];
let savedInvoices = [];

// ==========================================
// Initialization & LocalStorage Management
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadCompanyProfile();
  loadSavedInvoices();
  initDefaultDates();
  initEventListeners();
  loadSampleData(); // Pre-populate with clean sample data
  renderAll();
});

function loadCompanyProfile() {
  try {
    const saved = localStorage.getItem('zoey_company_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Keep only current fields
      companyProfile = {
        name: parsed.name || DEFAULT_ZOEY_PROFILE.name,
        tagline: parsed.tagline || DEFAULT_ZOEY_PROFILE.tagline,
        email: parsed.email || DEFAULT_ZOEY_PROFILE.email,
        phone: parsed.phone || DEFAULT_ZOEY_PROFILE.phone,
        signatory: parsed.signatory || DEFAULT_ZOEY_PROFILE.signatory
      };
    } else {
      companyProfile = { ...DEFAULT_ZOEY_PROFILE };
      localStorage.setItem('zoey_company_profile', JSON.stringify(DEFAULT_ZOEY_PROFILE));
    }
  } catch (e) {
    companyProfile = { ...DEFAULT_ZOEY_PROFILE };
  }
}

function saveCompanyProfile(profile) {
  companyProfile = {
    name: profile.name || 'ZOEY',
    tagline: profile.tagline || 'Web & Software Development',
    email: profile.email || '',
    phone: profile.phone || '',
    signatory: profile.signatory || 'Samiq khan'
  };
  localStorage.setItem('zoey_company_profile', JSON.stringify(companyProfile));
  syncCompanyToSheet();
  showToast("ZOEY profile updated successfully!");
}

function loadSavedInvoices() {
  try {
    const saved = localStorage.getItem('zoey_saved_invoices');
    if (saved) {
      savedInvoices = JSON.parse(saved);
    }
  } catch (e) {
    savedInvoices = [];
  }
  updateHistoryBadge();
}

function updateHistoryBadge() {
  const badge = document.getElementById('history-badge-count');
  if (savedInvoices.length > 0) {
    badge.textContent = savedInvoices.length;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

function initDefaultDates() {
  const today = new Date();
  const dateInput = document.getElementById('input-invoice-date');
  const dueInput = document.getElementById('input-due-date');
  
  dateInput.value = formatDateForInput(today);
  
  // Default due date + 10 days
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 10);
  dueInput.value = formatDateForInput(dueDate);
}

function formatDateForInput(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// ==========================================
// Formatting Utilities
// ==========================================
function formatCurrency(amount, currency = '₹') {
  const num = Number(amount) || 0;
  const formatted = num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${currency}${formatted}`;
}

// ==========================================
// Item Row Management
// ==========================================
function addItem(desc = '', qty = 1, rate = 0) {
  const id = 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
  items.push({ id, desc, qty: Number(qty), rate: Number(rate) });
  renderItemsForm();
  calculateAndRender();
}

function removeItem(id) {
  items = items.filter(it => it.id !== id);
  if (items.length === 0) {
    addItem('', 1, 0);
    return;
  }
  renderItemsForm();
  calculateAndRender();
}

function updateItem(id, field, value) {
  const item = items.find(it => it.id === id);
  if (!item) return;
  if (field === 'desc') {
    item.desc = value;
  } else if (field === 'qty') {
    item.qty = Math.max(0, parseFloat(value) || 0);
  } else if (field === 'rate') {
    item.rate = Math.max(0, parseFloat(value) || 0);
  }
  renderSheetItems();
  calculateAndRender();
}

// ==========================================
// Rendering: Form & Sheet
// ==========================================
function renderItemsForm() {
  const container = document.getElementById('items-container');
  container.innerHTML = '';

  items.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'grid grid-cols-12 gap-2 items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60 transition hover:border-slate-600';
    row.innerHTML = `
      <div class="col-span-12 sm:col-span-6">
        <label class="block text-[10px] text-slate-400 mb-0.5 sm:hidden">Description</label>
        <input type="text" placeholder="Service or Feature Description" value="${escapeHtml(item.desc)}" 
          class="item-desc w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none" 
          data-id="${item.id}" />
      </div>
      <div class="col-span-4 sm:col-span-2">
        <label class="block text-[10px] text-slate-400 mb-0.5 sm:hidden">Qty/Hrs</label>
        <input type="number" min="0" step="any" placeholder="Qty" value="${item.qty}" 
          class="item-qty w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-center focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono" 
          data-id="${item.id}" />
      </div>
      <div class="col-span-4 sm:col-span-3">
        <label class="block text-[10px] text-slate-400 mb-0.5 sm:hidden">Unit Rate</label>
        <input type="number" min="0" step="any" placeholder="Rate" value="${item.rate}" 
          class="item-rate w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-right focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono" 
          data-id="${item.id}" />
      </div>
      <div class="col-span-4 sm:col-span-1 flex justify-end">
        <button type="button" class="btn-remove-item text-slate-500 hover:text-rose-400 p-1.5 transition text-xs" data-id="${item.id}" title="Remove item">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;
    container.appendChild(row);
  });

  // Re-attach event listeners for inputs
  container.querySelectorAll('.item-desc').forEach(input => {
    input.addEventListener('input', (e) => updateItem(e.target.dataset.id, 'desc', e.target.value));
  });
  container.querySelectorAll('.item-qty').forEach(input => {
    input.addEventListener('input', (e) => updateItem(e.target.dataset.id, 'qty', e.target.value));
  });
  container.querySelectorAll('.item-rate').forEach(input => {
    input.addEventListener('input', (e) => updateItem(e.target.dataset.id, 'rate', e.target.value));
  });
  container.querySelectorAll('.btn-remove-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const btnEl = e.target.closest('button');
      if (btnEl) removeItem(btnEl.dataset.id);
    });
  });
}

function renderSheetItems() {
  const tbody = document.getElementById('sheet-items-body');
  const currency = document.getElementById('input-currency').value;
  tbody.innerHTML = '';

  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-slate-400 italic">No items added yet.</td></tr>`;
    return;
  }

  items.forEach((item, index) => {
    const itemTotal = (item.qty || 0) * (item.rate || 0);
    const tr = document.createElement('tr');
    tr.className = index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50';
    tr.innerHTML = `
      <td class="py-3 text-center text-slate-400 font-mono">${index + 1}</td>
      <td class="py-3 pr-2">
        <div class="font-bold text-slate-800">${escapeHtml(item.desc || 'Custom Service')}</div>
      </td>
      <td class="py-3 text-center text-slate-600 font-mono">${item.qty}</td>
      <td class="py-3 text-right text-slate-600 font-mono">${formatCurrency(item.rate, currency)}</td>
      <td class="py-3 text-right font-bold text-slate-900 font-mono">${formatCurrency(itemTotal, currency)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function syncCompanyToSheet() {
  document.getElementById('sheet-company-name').textContent = companyProfile.name || 'ZOEY';
  document.getElementById('sheet-company-tagline').textContent = companyProfile.tagline || 'Web & Software Development';
  document.getElementById('sheet-company-email').textContent = companyProfile.email || '';
  document.getElementById('sheet-company-phone').textContent = companyProfile.phone || '';
  const signatoryEl = document.getElementById('sheet-signatory');
  if (signatoryEl) {
    signatoryEl.textContent = companyProfile.signatory || 'Samiq khan';
  }
}

function calculateAndRender() {
  const currency = document.getElementById('input-currency').value;
  
  // Calculate Subtotal (Full Project Amount)
  let subtotal = 0;
  items.forEach(item => {
    subtotal += (item.qty || 0) * (item.rate || 0);
  });

  const grandTotal = subtotal;

  // Advance Paid
  const advanceAmount = parseFloat(document.getElementById('input-advance-amount').value) || 0;

  // Balance Due (Full Amount minus Advance Paid)
  const balanceDue = Math.max(0, grandTotal - advanceAmount);

  // Auto determine payment status
  const statusSelect = document.getElementById('input-payment-status');
  if (advanceAmount >= grandTotal && grandTotal > 0) {
    statusSelect.value = 'PAID';
  } else if (advanceAmount > 0 && advanceAmount < grandTotal) {
    statusSelect.value = 'PARTIALLY PAID';
  } else if (advanceAmount === 0) {
    if (statusSelect.value === 'PAID' || statusSelect.value === 'PARTIALLY PAID') {
      statusSelect.value = 'UNPAID';
    }
  }

  const paymentStatus = statusSelect.value;

  // Update Left Form Display Indicators
  document.getElementById('form-grand-total-display').textContent = formatCurrency(grandTotal, currency);
  document.getElementById('form-balance-due-display').textContent = formatCurrency(balanceDue, currency);

  // Update Right Invoice Sheet Values
  document.getElementById('sheet-subtotal').textContent = formatCurrency(subtotal, currency);
  document.getElementById('sheet-grand-total').textContent = formatCurrency(grandTotal, currency);
  document.getElementById('sheet-advance-amount').textContent = `-${formatCurrency(advanceAmount, currency)}`;
  document.getElementById('sheet-balance-due').textContent = formatCurrency(balanceDue, currency);

  // Update Payment Status Badge
  const statusBadge = document.getElementById('sheet-status-badge');
  statusBadge.className = 'inline-block px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider border';
  if (paymentStatus === 'PAID') {
    statusBadge.textContent = 'PAID IN FULL';
    statusBadge.classList.add('badge-paid');
  } else if (paymentStatus === 'PARTIALLY PAID') {
    statusBadge.textContent = 'PARTIALLY PAID (ADVANCE)';
    statusBadge.classList.add('badge-partial');
  } else {
    statusBadge.textContent = 'PAYMENT DUE';
    statusBadge.classList.add('badge-unpaid');
  }

  // Update Metadata & Client Details to Sheet
  syncFormToSheet();
}

function syncFormToSheet() {
  document.getElementById('sheet-invoice-number').textContent = document.getElementById('input-invoice-number').value || 'ZOEY-INV-001';
  document.getElementById('sheet-invoice-date').textContent = formatDisplayDate(document.getElementById('input-invoice-date').value);
  document.getElementById('sheet-due-date').textContent = formatDisplayDate(document.getElementById('input-due-date').value);

  // Client
  const clientName = document.getElementById('input-client-name').value.trim() || 'Client / Organization Name';
  const clientCompany = document.getElementById('input-client-company').value.trim();
  const clientEmail = document.getElementById('input-client-email').value.trim();
  const clientPhone = document.getElementById('input-client-phone').value.trim();
  const clientAddress = document.getElementById('input-client-address').value.trim() || 'Client Address';
  const projectTitle = document.getElementById('input-project-title').value.trim() || 'Web & Software Development Services';
  const notes = document.getElementById('input-notes').value.trim();

  document.getElementById('sheet-client-name').textContent = clientName;
  document.getElementById('sheet-client-company').textContent = clientCompany;
  document.getElementById('sheet-client-address').textContent = clientAddress;
  
  const contactParts = [clientEmail, clientPhone].filter(Boolean).join(' | ');
  document.getElementById('sheet-client-contact').textContent = contactParts || '—';

  document.getElementById('sheet-project-title').textContent = projectTitle;
  document.getElementById('sheet-notes').textContent = notes;
}

function renderAll() {
  syncCompanyToSheet();
  renderItemsForm();
  renderSheetItems();
  calculateAndRender();
}

// ==========================================
// Event Listeners Setup
// ==========================================
function initEventListeners() {
  const liveInputs = [
    'input-invoice-number', 'input-invoice-date', 'input-due-date', 
    'input-currency', 'input-client-name', 'input-client-company', 
    'input-client-email', 'input-client-phone', 'input-client-address', 
    'input-project-title', 'input-advance-amount', 'input-payment-status', 
    'input-notes'
  ];

  liveInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', calculateAndRender);
      el.addEventListener('change', calculateAndRender);
    }
  });

  // Currency change
  document.getElementById('input-currency').addEventListener('change', () => {
    renderSheetItems();
    calculateAndRender();
  });

  // Add Item Button
  document.getElementById('btn-add-item').addEventListener('click', () => {
    addItem('', 1, 0);
  });

  // Preset Selector Dropdown
  document.getElementById('select-preset').addEventListener('change', (e) => {
    const key = e.target.value;
    if (key && SERVICE_PRESETS[key]) {
      const preset = SERVICE_PRESETS[key];
      if (items.length === 1 && items[0].desc.trim() === '' && items[0].rate === 0) {
        items[0].desc = preset.desc;
        items[0].qty = preset.qty;
        items[0].rate = preset.rate;
      } else {
        addItem(preset.desc, preset.qty, preset.rate);
      }
      e.target.value = '';
      renderItemsForm();
      renderSheetItems();
      calculateAndRender();
      showToast(`Added: ${preset.desc.substring(0, 35)}...`);
    }
  });

  // 50% Advance quick button
  document.getElementById('btn-advance-50').addEventListener('click', () => {
    let subtotal = 0;
    items.forEach(it => { subtotal += (it.qty || 0) * (it.rate || 0); });
    const half = Math.round((subtotal / 2) * 100) / 100;
    document.getElementById('input-advance-amount').value = half;
    calculateAndRender();
    showToast(`Set Advance to 50% (${formatCurrency(half, document.getElementById('input-currency').value)})`);
  });

  // Load Sample Demo Data Button
  document.getElementById('btn-load-sample').addEventListener('click', () => {
    loadSampleData();
    showToast("Loaded sample invoice data.");
  });

  // Clear / New Invoice Button
  document.getElementById('btn-new-invoice').addEventListener('click', () => {
    if (confirm("Start a new invoice? Current form will be reset.")) {
      createNewInvoice();
    }
  });

  // Save to Local History Button
  document.getElementById('btn-save-invoice').addEventListener('click', saveCurrentInvoiceToHistory);

  // Print Invoice Button
  document.getElementById('btn-print-invoice').addEventListener('click', () => {
    window.print();
  });

  // Download PDF Button
  document.getElementById('btn-download-pdf').addEventListener('click', generatePDF);

  // Company Settings Modal Handlers
  const modalCompany = document.getElementById('modal-company-settings');
  document.getElementById('btn-open-company-settings').addEventListener('click', () => {
    populateCompanyModal();
    modalCompany.classList.remove('hidden');
  });
  document.getElementById('btn-close-company-settings').addEventListener('click', () => {
    modalCompany.classList.add('hidden');
  });
  document.getElementById('btn-cancel-settings').addEventListener('click', () => {
    modalCompany.classList.add('hidden');
  });
  document.getElementById('form-company-settings').addEventListener('submit', (e) => {
    e.preventDefault();
    const updated = {
      name: document.getElementById('setting-company-name').value.trim() || 'ZOEY',
      tagline: document.getElementById('setting-company-tagline').value.trim() || 'Web & Software Development',
      email: document.getElementById('setting-company-email').value.trim(),
      phone: document.getElementById('setting-company-phone').value.trim(),
      signatory: document.getElementById('setting-company-signatory').value.trim() || 'Samiq khan'
    };
    saveCompanyProfile(updated);
    modalCompany.classList.add('hidden');
  });

  // Invoice History Modal Handlers
  const modalHistory = document.getElementById('modal-invoice-history');
  document.getElementById('btn-open-history').addEventListener('click', () => {
    renderHistoryList();
    modalHistory.classList.remove('hidden');
  });
  document.getElementById('btn-close-history').addEventListener('click', () => {
    modalHistory.classList.add('hidden');
  });
  document.getElementById('btn-close-history-footer').addEventListener('click', () => {
    modalHistory.classList.add('hidden');
  });
  document.getElementById('btn-clear-all-history').addEventListener('click', () => {
    if (confirm("Are you sure you want to delete all saved invoices from history?")) {
      savedInvoices = [];
      localStorage.removeItem('zoey_saved_invoices');
      updateHistoryBadge();
      renderHistoryList();
      showToast("Invoice history cleared.");
    }
  });
}

// ==========================================
// Sample Data & New Invoice Creator
// ==========================================
function loadSampleData() {
  document.getElementById('input-invoice-number').value = 'ZOEY-2026-042';
  document.getElementById('input-currency').value = '₹';
  
  const today = new Date();
  document.getElementById('input-invoice-date').value = formatDateForInput(today);
  const due = new Date(today);
  due.setDate(due.getDate() + 14);
  document.getElementById('input-due-date').value = formatDateForInput(due);

  document.getElementById('input-client-name').value = 'Sarah Jenkins';
  document.getElementById('input-client-company').value = 'Apex HealthTech Inc.';
  document.getElementById('input-client-email').value = 's.jenkins@apexhealth.io';
  document.getElementById('input-client-phone').value = '+91 98450 11223';
  document.getElementById('input-client-address').value = 'Brigade Gateway, 12th Floor, Malleshwaram, Bengaluru, KA 560055';
  document.getElementById('input-project-title').value = 'Telemedicine Web Portal & Patient Records System';

  items = [
    {
      id: 'it_1',
      desc: 'Phase 1: Full-Stack Web Application (Next.js 15, Tailwind & Secure DB Architecture)',
      qty: 1,
      rate: 95000
    },
    {
      id: 'it_2',
      desc: 'UI/UX Interactive Patient Journey Wireframing & Design System (Figma)',
      qty: 1,
      rate: 35000
    },
    {
      id: 'it_3',
      desc: 'Doctor Appointment Scheduler, Video Consultation API & Webhooks',
      qty: 1,
      rate: 30000
    }
  ];

  // Full amount = 160,000. Set 80,000 advance
  document.getElementById('input-advance-amount').value = 80000;
  document.getElementById('input-payment-status').value = 'PARTIALLY PAID';

  renderAll();
}

function createNewInvoice() {
  const randomNum = Math.floor(100 + Math.random() * 900);
  document.getElementById('input-invoice-number').value = `ZOEY-2026-${randomNum}`;
  initDefaultDates();

  document.getElementById('input-client-name').value = '';
  document.getElementById('input-client-company').value = '';
  document.getElementById('input-client-email').value = '';
  document.getElementById('input-client-phone').value = '';
  document.getElementById('input-client-address').value = '';
  document.getElementById('input-project-title').value = '';

  items = [
    {
      id: 'it_init_' + Date.now(),
      desc: 'Custom Web & Software Development Services',
      qty: 1,
      rate: 50000
    }
  ];

  document.getElementById('input-advance-amount').value = 0;
  document.getElementById('input-payment-status').value = 'UNPAID';

  renderAll();
  showToast("Ready for new invoice entry!");
}

// ==========================================
// Modal Handlers & Settings Sync
// ==========================================
function populateCompanyModal() {
  document.getElementById('setting-company-name').value = companyProfile.name || '';
  document.getElementById('setting-company-tagline').value = companyProfile.tagline || '';
  document.getElementById('setting-company-email').value = companyProfile.email || '';
  document.getElementById('setting-company-phone').value = companyProfile.phone || '';
  document.getElementById('setting-company-signatory').value = companyProfile.signatory || 'Samiq khan';
}

// ==========================================
// Saved Invoices History
// ==========================================
function saveCurrentInvoiceToHistory() {
  const invoiceNumber = document.getElementById('input-invoice-number').value.trim() || 'ZOEY-INV';
  const clientName = document.getElementById('input-client-name').value.trim() || 'Unnamed Client';
  const currency = document.getElementById('input-currency').value;
  
  let subtotal = 0;
  items.forEach(it => { subtotal += (it.qty || 0) * (it.rate || 0); });
  const grandTotal = subtotal;
  const advanceAmount = parseFloat(document.getElementById('input-advance-amount').value) || 0;
  const balanceDue = Math.max(0, grandTotal - advanceAmount);

  const snapshot = {
    id: 'inv_' + Date.now(),
    savedAt: new Date().toISOString(),
    invoiceNumber,
    invoiceDate: document.getElementById('input-invoice-date').value,
    dueDate: document.getElementById('input-due-date').value,
    currency,
    client: {
      name: clientName,
      company: document.getElementById('input-client-company').value,
      email: document.getElementById('input-client-email').value,
      phone: document.getElementById('input-client-phone').value,
      address: document.getElementById('input-client-address').value,
      projectTitle: document.getElementById('input-project-title').value
    },
    items: JSON.parse(JSON.stringify(items)),
    grandTotal,
    advanceAmount,
    balanceDue,
    paymentStatus: document.getElementById('input-payment-status').value,
    notes: document.getElementById('input-notes').value
  };

  const existingIdx = savedInvoices.findIndex(inv => inv.invoiceNumber === invoiceNumber);
  if (existingIdx >= 0) {
    savedInvoices[existingIdx] = snapshot;
  } else {
    savedInvoices.unshift(snapshot);
  }

  localStorage.setItem('zoey_saved_invoices', JSON.stringify(savedInvoices));
  updateHistoryBadge();
  showToast(`Invoice ${invoiceNumber} saved to history!`);
}

function renderHistoryList() {
  const container = document.getElementById('history-list');
  if (savedInvoices.length === 0) {
    container.innerHTML = `
      <div class="py-12 text-center text-slate-500">
        <i class="fa-solid fa-folder-open text-3xl mb-2 block opacity-40"></i>
        <p>No saved invoices yet.</p>
        <p class="text-[11px] text-slate-600 mt-1">Click "Save" on the top bar to store your generated invoices.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  savedInvoices.forEach(inv => {
    const item = document.createElement('div');
    item.className = 'bg-slate-800/90 border border-slate-700 p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-indigo-500/50 transition';
    
    const formattedDate = formatDisplayDate(inv.invoiceDate);
    const badgeClass = inv.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                       (inv.paymentStatus === 'PARTIALLY PAID' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30');

    item.innerHTML = `
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="font-mono font-bold text-white text-sm">${escapeHtml(inv.invoiceNumber)}</span>
          <span class="text-[10px] px-2 py-0.5 rounded border ${badgeClass} font-bold">${inv.paymentStatus}</span>
        </div>
        <p class="text-xs text-slate-300 font-semibold">${escapeHtml(inv.client.name)} ${inv.client.company ? `<span class="text-slate-400 font-normal">(${escapeHtml(inv.client.company)})</span>` : ''}</p>
        <p class="text-[11px] text-slate-400">${formattedDate} • ${inv.items.length} item(s)</p>
      </div>

      <div class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        <div class="text-right">
          <div class="text-xs text-slate-400">Total: <span class="font-mono font-bold text-white">${formatCurrency(inv.grandTotal, inv.currency)}</span></div>
          <div class="text-xs text-rose-400">Balance: <span class="font-mono font-bold">${formatCurrency(inv.balanceDue, inv.currency)}</span></div>
        </div>

        <div class="flex items-center gap-1.5">
          <button class="btn-load-history px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition" data-id="${inv.id}">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
            <span>Load</span>
          </button>
          <button class="btn-delete-history p-2 text-slate-400 hover:text-rose-400 transition" data-id="${inv.id}" title="Delete">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;
    container.appendChild(item);
  });

  // Attach handlers
  container.querySelectorAll('.btn-load-history').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const invId = e.currentTarget.dataset.id;
      loadInvoiceFromHistory(invId);
    });
  });

  container.querySelectorAll('.btn-delete-history').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const invId = e.currentTarget.dataset.id;
      deleteInvoiceFromHistory(invId);
    });
  });
}

function loadInvoiceFromHistory(invId) {
  const inv = savedInvoices.find(i => i.id === invId);
  if (!inv) return;

  document.getElementById('input-invoice-number').value = inv.invoiceNumber;
  document.getElementById('input-invoice-date').value = inv.invoiceDate;
  document.getElementById('input-due-date').value = inv.dueDate;
  document.getElementById('input-currency').value = inv.currency || '₹';

  document.getElementById('input-client-name').value = inv.client.name || '';
  document.getElementById('input-client-company').value = inv.client.company || '';
  document.getElementById('input-client-email').value = inv.client.email || '';
  document.getElementById('input-client-phone').value = inv.client.phone || '';
  document.getElementById('input-client-address').value = inv.client.address || '';
  document.getElementById('input-project-title').value = inv.client.projectTitle || '';

  items = JSON.parse(JSON.stringify(inv.items || []));
  document.getElementById('input-advance-amount').value = inv.advanceAmount ?? 0;
  document.getElementById('input-payment-status').value = inv.paymentStatus || 'UNPAID';
  document.getElementById('input-notes').value = inv.notes || '';

  renderAll();
  document.getElementById('modal-invoice-history').classList.add('hidden');
  showToast(`Loaded invoice ${inv.invoiceNumber}`);
}

function deleteInvoiceFromHistory(invId) {
  savedInvoices = savedInvoices.filter(i => i.id !== invId);
  localStorage.setItem('zoey_saved_invoices', JSON.stringify(savedInvoices));
  updateHistoryBadge();
  renderHistoryList();
  showToast("Invoice removed from history.");
}

// ==========================================
// High-Resolution PDF Generation (html2pdf)
// ==========================================
function generatePDF() {
  const invoiceEl = document.getElementById('invoice-sheet');
  const invoiceNum = document.getElementById('input-invoice-number').value.trim() || 'ZOEY-INV';
  const clientName = (document.getElementById('input-client-name').value.trim() || 'Client').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${invoiceNum}_${clientName}.pdf`;

  showToast("Preparing high-quality PDF...");

  const opt = {
    margin: [6, 6, 6, 6],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      scrollY: 0
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    }
  };

  if (typeof html2pdf !== 'undefined') {
    html2pdf().set(opt).from(invoiceEl).save().then(() => {
      showToast(`Downloaded: ${filename}`);
    }).catch(err => {
      console.error("PDF generation failed:", err);
      window.print();
    });
  } else {
    window.print();
  }
}

// ==========================================
// Toast Notification
// ==========================================
function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast-enter pointer-events-auto bg-slate-800 text-white border border-slate-700 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold';
  toast.innerHTML = `
    <i class="fa-solid fa-circle-check text-emerald-400"></i>
    <span>${escapeHtml(message)}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
