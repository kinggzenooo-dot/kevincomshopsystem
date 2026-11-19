/**
 * VENS COMSHOP — UI Helpers, Universal Navigation Switcher & Toast System
 */

(function () {
  // Inject Universal Cyber Top Bar Navigation Switcher
  function renderGlobalSwitcher() {
    const currentPath = window.location.pathname.toLowerCase();

    const isHub = currentPath.endsWith('index.html') || currentPath === '/' || currentPath === '';
    const isCustomer = currentPath.endsWith('customer.html');
    const isStation = currentPath.endsWith('stationstaffinterface.html') || currentPath.endsWith('station.html');
    const isCashier = currentPath.endsWith('cashier.html');
    const isAdmin = currentPath.endsWith('admin.html');
    const isLogin = currentPath.endsWith('login.html');

    // Check logged in user
    let user = null;
    try {
      const stored = localStorage.getItem('vens_current_user');
      if (stored) user = JSON.parse(stored);
    } catch (e) {}

    let userWidget = '';
    if (user) {
      const roleBadge = user.role ? user.role : (user.rank || 'Gamer');
      userWidget = `
        <div class="switcher-user-box" style="display:flex; align-items:center; gap:8px;">
          <span style="font-size: 0.8rem; color: var(--text-secondary); display:flex; align-items:center; gap:5px;">
            <span>👤</span> <strong style="color:#fff;">${user.name}</strong> 
            <span class="cyber-badge ${user.role === 'Administrator' ? 'badge-vip' : 'badge-active'}" style="font-size:0.65rem; padding:2px 6px;">${roleBadge}</span>
          </span>
          <button class="btn-cyber btn-cyber-secondary" id="global-logout-btn" style="padding:4px 10px; font-size:0.75rem;" title="Log out of current session">
            🚪 Logout
          </button>
        </div>
      `;
    } else {
      userWidget = `
        <a href="login.html" class="switcher-link ${isLogin ? 'active' : ''}" style="color: var(--cyan); border-color: rgba(0, 240, 255, 0.4); background: rgba(0, 240, 255, 0.1);">
          🔐 Sign In / Register
        </a>
      `;
    }

    const switcherHTML = `
      <header class="cyber-switcher-bar">
        <a href="index.html" class="switcher-brand">
          <span class="brand-logo-icon"></span>
          VENS <span>COMSHOP</span>
        </a>
        
        <nav class="switcher-links">
          <a href="index.html" class="switcher-link ${isHub ? 'active' : ''}">
            🏠 Hub
          </a>
          <a href="customer.html" class="switcher-link ${isCustomer ? 'active' : ''}">
            🌐 Customer Lounge
          </a>
          <a href="StationStaffInterface.html" class="switcher-link ${isStation ? 'active' : ''}">
            🖥️ Station Staff
          </a>
          <a href="Cashier.html" class="switcher-link ${isCashier ? 'active' : ''}">
            💳 Cashier POS
          </a>
          <a href="admin.html" class="switcher-link ${isAdmin ? 'active' : ''}">
            ⚡ Admin Center
          </a>
        </nav>

        <div class="switcher-tools">
          ${userWidget}
          <button class="btn-reset-demo" id="global-reset-btn" title="Reset all demo data to default preset">
            🔄 Reset
          </button>
        </div>
      </header>
      <div id="cyber-toast-container"></div>
    `;

    document.body.insertAdjacentHTML('afterbegin', switcherHTML);

    const logoutBtn = document.getElementById('global-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm("Log out of current Vens ComShop session?")) {
          if (window.VensStore) window.VensStore.logout();
          else {
            localStorage.removeItem('vens_current_user');
            localStorage.removeItem('vens_auth_token');
            window.location.href = 'login.html';
          }
        }
      });
    }

    document.getElementById('global-reset-btn').addEventListener('click', () => {
      if (confirm("Reset Vens ComShop to default demo dataset? All temporary sessions, orders, and reservations will reload.")) {
        if (window.VensStore) {
          window.VensStore.resetDemoData();
          window.showToast("Demo Data Successfully Reset!", "success");
          setTimeout(() => location.reload(), 600);
        }
      }
    });
  }

  // Toast Function
  window.showToast = function (message, type = 'info') {
    const container = document.getElementById('cyber-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `cyber-toast toast-${type}`;
    
    let icon = '⚡';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `
      <span style="font-size: 1.1rem">${icon}</span>
      <div style="flex:1;">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = '0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };

  // Helper currency format
  window.formatCurrency = function (num) {
    return '₱' + Number(num || 0).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  // Helper date format
  window.formatDateTime = function (isoString) {
    if (!isoString) return 'N/A';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Universal Modal Toggle Helpers
  window.openCyberModal = function (modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('active');
  };

  window.closeCyberModal = function (modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
  };

  document.addEventListener('DOMContentLoaded', () => {
    renderGlobalSwitcher();

    // Close modals on overlay click or close button
    document.body.addEventListener('click', (e) => {
      if (e.target.classList.contains('cyber-modal-overlay')) {
        e.target.classList.remove('active');
      }
      if (e.target.closest('[data-close-modal]')) {
        const targetId = e.target.closest('[data-close-modal]').getAttribute('data-close-modal');
        if (targetId) closeCyberModal(targetId);
      }
    });
  });
})();
