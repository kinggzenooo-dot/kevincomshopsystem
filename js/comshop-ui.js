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
    let mobileUserWidget = '';
    if (user) {
      const roleBadge = user.role ? user.role : (user.rank || 'Gamer');
      userWidget = `
        <div class="switcher-user-box" style="display:flex; align-items:center; gap:8px;">
          <span style="font-size: 0.8rem; color: var(--text-secondary); display:flex; align-items:center; gap:5px;">
            <span>👤</span> <strong style="color:#fff;" class="user-display-name">${user.name}</strong> 
            <span class="cyber-badge ${user.role === 'Administrator' ? 'badge-vip' : 'badge-active'}" style="font-size:0.65rem; padding:2px 6px;">${roleBadge}</span>
          </span>
          <button class="btn-cyber btn-cyber-secondary" id="global-logout-btn" style="padding:4px 8px; font-size:0.75rem;" title="Log out">
            🚪 Logout
          </button>
        </div>
      `;
      mobileUserWidget = `
        <div style="padding: 12px; background: rgba(0, 240, 255, 0.05); border: 1px solid var(--border-cyber); border-radius: var(--radius-sm); margin-bottom: 8px;">
          <div style="font-size:0.75rem; color:var(--text-muted);">SIGNED IN AS</div>
          <div style="font-weight:bold; color:#fff; font-size:0.95rem;">${user.name}</div>
          <div style="font-size:0.75rem; color:var(--cyan);">${roleBadge}</div>
          <button class="btn-cyber btn-cyber-secondary" id="global-logout-btn-mobile" style="width:100%; margin-top:8px; font-size:0.8rem;">
            🚪 Log Out of Session
          </button>
        </div>
      `;
    } else {
      userWidget = `
        <a href="login.html" class="switcher-link ${isLogin ? 'active' : ''}" style="color: var(--cyan); border-color: rgba(0, 240, 255, 0.4); background: rgba(0, 240, 255, 0.1);">
          🔐 Sign In
        </a>
      `;
      mobileUserWidget = `
        <a href="login.html" class="btn-cyber btn-cyber-primary" style="width: 100%; margin-bottom: 10px; font-size: 0.9rem;">
          🔐 Sign In / Register Account
        </a>
      `;
    }

    const switcherHTML = `
      <!-- Desktop & Mobile Top Bar -->
      <header class="cyber-switcher-bar">
        <a href="index.html" class="switcher-brand">
          <span class="brand-logo-icon"></span>
          VENS <span>COMSHOP</span>
        </a>
        
        <nav class="switcher-links-desktop">
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
          <button class="switcher-hamburger-btn" id="mobile-menu-toggle" aria-label="Toggle navigation menu">
            ☰
          </button>
        </div>
      </header>

      <!-- Mobile Swipeable Horizontal Quick Rail -->
      <nav class="switcher-mobile-strip">
        <a href="index.html" class="switcher-link ${isHub ? 'active' : ''}">
          🏠 Hub
        </a>
        <a href="customer.html" class="switcher-link ${isCustomer ? 'active' : ''}">
          🌐 Customer
        </a>
        <a href="StationStaffInterface.html" class="switcher-link ${isStation ? 'active' : ''}">
          🖥️ Staff
        </a>
        <a href="Cashier.html" class="switcher-link ${isCashier ? 'active' : ''}">
          💳 Cashier
        </a>
        <a href="admin.html" class="switcher-link ${isAdmin ? 'active' : ''}">
          ⚡ Admin
        </a>
      </nav>

      <!-- Mobile Full Navigation Drawer -->
      <div class="switcher-mobile-drawer" id="mobile-drawer">
        ${mobileUserWidget}
        <a href="index.html" class="switcher-mobile-nav-link ${isHub ? 'active' : ''}">
          <span>🏠</span> System Portal Hub
        </a>
        <a href="customer.html" class="switcher-mobile-nav-link ${isCustomer ? 'active' : ''}">
          <span>🌐</span> Customer Gaming Lounge
        </a>
        <a href="StationStaffInterface.html" class="switcher-mobile-nav-link ${isStation ? 'active' : ''}">
          <span>🖥️</span> Station Floor Staff Console
        </a>
        <a href="Cashier.html" class="switcher-mobile-nav-link ${isCashier ? 'active' : ''}">
          <span>💳</span> Cashier POS Terminal
        </a>
        <a href="admin.html" class="switcher-mobile-nav-link ${isAdmin ? 'active' : ''}">
          <span>⚡</span> Administrator Command Center
        </a>
        <a href="login.html" class="switcher-mobile-nav-link ${isLogin ? 'active' : ''}">
          <span>🔐</span> Authentication & Accounts
        </a>
        <button class="btn-reset-demo" id="global-reset-btn-mobile" style="margin-top: 10px; padding: 10px; width: 100%;">
          🔄 Reset Demo Data
        </button>
      </div>

      <div id="cyber-toast-container"></div>
    `;

    document.body.insertAdjacentHTML('afterbegin', switcherHTML);

    // Hamburger toggle
    const hamburgerBtn = document.getElementById('mobile-menu-toggle');
    const drawer = document.getElementById('mobile-drawer');
    if (hamburgerBtn && drawer) {
      hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = drawer.classList.toggle('active');
        hamburgerBtn.innerHTML = isOpen ? '✕' : '☰';
      });

      // Close drawer when clicking outside
      document.addEventListener('click', (e) => {
        if (!drawer.contains(e.target) && !hamburgerBtn.contains(e.target) && drawer.classList.contains('active')) {
          drawer.classList.remove('active');
          hamburgerBtn.innerHTML = '☰';
        }
      });
    }

    // Logout handlers
    const handleLogout = () => {
      if (confirm("Log out of current Vens ComShop session?")) {
        if (window.VensStore) window.VensStore.logout();
        else {
          localStorage.removeItem('vens_current_user');
          localStorage.removeItem('vens_auth_token');
          window.location.href = 'login.html';
        }
      }
    };

    const logoutBtn = document.getElementById('global-logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    const logoutBtnMobile = document.getElementById('global-logout-btn-mobile');
    if (logoutBtnMobile) logoutBtnMobile.addEventListener('click', handleLogout);

    // Reset handlers
    const handleReset = () => {
      if (confirm("Reset Vens ComShop to default demo dataset? All temporary sessions, orders, and reservations will reload.")) {
        if (window.VensStore) {
          window.VensStore.resetDemoData();
          window.showToast("Demo Data Successfully Reset!", "success");
          setTimeout(() => location.reload(), 600);
        }
      }
    };

    const resetBtnMobile = document.getElementById('global-reset-btn-mobile');
    if (resetBtnMobile) resetBtnMobile.addEventListener('click', handleReset);
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
