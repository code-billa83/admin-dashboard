document.addEventListener('DOMContentLoaded', () => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const sidebar = $('#sidebar');
  const toast = $('#toast');
  let toastTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  $('#mobileMenu').addEventListener('click', () => sidebar.classList.toggle('open'));
  $('#sidebarToggle').addEventListener('click', () => sidebar.classList.toggle('open'));
  document.addEventListener('click', event => {
    if (window.innerWidth <= 1020 && sidebar.classList.contains('open') &&
      !sidebar.contains(event.target) && !event.target.closest('#mobileMenu')) sidebar.classList.remove('open');
  });
  $$('.nav-link').forEach(link => link.addEventListener('click', () => {
    $$('.nav-link').forEach(item => item.classList.remove('active'));
    link.classList.add('active');
    if (window.innerWidth <= 1020) sidebar.classList.remove('open');
    const target = link.getAttribute('href');
    if (target && target !== '#dashboard') showToast(`${link.textContent.trim()} section selected`);
  }));

  // Search filters dashboard cards and transaction rows as you type.
  const searchInput = $('#searchInput');
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    $$('[data-search]').forEach(item => {
      const text = `${item.dataset.search || ''} ${item.textContent}`.toLowerCase();
      item.classList.toggle('is-hidden', query && !text.includes(query));
    });
    $$('#transactionRows tr').forEach(row => row.classList.toggle('is-hidden', query && !row.textContent.toLowerCase().includes(query)));
  });
  // On phones, tap the magnifying glass to reveal the search field.
  const searchBox = $('.search-box');
  $('.search-box span').addEventListener('click', () => {
    if (window.innerWidth <= 700) {
      searchBox.classList.toggle('open');
      if (searchBox.classList.contains('open')) searchInput.focus();
    } else searchInput.focus();
  });

  $('#reportButton').addEventListener('click', () => {
    const rows = [['Transaction', 'Date', 'Amount', 'Status'], ...$$('#transactionRows tr').map(row => [...row.querySelectorAll('td')].map(cell => cell.innerText.trim()))];
    const csv = rows.map(row => row.map(value => `"${value.replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'admin-dashboard-report.csv';
    document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
    showToast('Report downloaded as CSV');
  });

  const cardStates = [
    { balance: '$824,571.93', label: 'Wallet Balance', note: '↗ +0.8% than last week' },
    { balance: '$795,210.40', label: 'Savings Balance', note: '↗ +2.3% than last week' },
    { balance: '$832,804.15', label: 'Business Balance', note: '↗ +1.2% than last week' }
  ];
  let cardIndex = 0;
  $('#changeCard').addEventListener('click', () => {
    cardIndex = (cardIndex + 1) % cardStates.length;
    const state = cardStates[cardIndex];
    $('.card-balance strong').textContent = state.balance;
    $('.card-balance span').textContent = state.label;
    $('.card-balance small').textContent = state.note;
    showToast(`${state.label} displayed`);
  });

  $$('.contact').forEach(button => button.addEventListener('click', () => {
    $$('.contact').forEach(contact => contact.classList.remove('selected'));
    button.classList.add('selected');
    $('#recipient').value = button.dataset.name;
  }));
  $('#transferForm').addEventListener('submit', event => {
    event.preventDefault();
    const recipient = $('#recipient').value.trim();
    const amount = Number($('#amount').value);
    const message = $('#transferMessage');
    if (!recipient || !Number.isFinite(amount) || amount <= 0) {
      message.style.color = '#d3465d';
      message.textContent = 'Enter a recipient and an amount greater than zero.';
      return;
    }
    message.style.color = '#24a36b';
    message.textContent = `Demo transfer of $${amount.toFixed(2)} to ${recipient} is ready. No real money was sent.`;
    showToast('Demo transfer validated');
  });
  $('#viewAllButton').addEventListener('click', () => showToast('Showing all transactions currently available in this demo.'));

  // Charts are enhanced by Chart.js when the CDN is reachable; CSS layout remains usable without it.
  if (window.Chart) {
    Chart.defaults.font.family = 'Inter, Arial, sans-serif';
    Chart.defaults.color = '#969da7';
    const overviewCtx = $('#overviewChart');
    new Chart(overviewCtx, {
      type: 'pie',
      data: { labels: ['Account', 'Services', 'Restaurant', 'Others'], datasets: [{ data: [20, 40, 15, 25], backgroundColor: ['#4c72cf', '#5bd95d', '#f5a34e', '#c9cdd1'], borderColor: '#eef1f4', borderWidth: 3, hoverOffset: 6 }] },
      options: { responsive: true, plugins: { legend: { display: false }, tooltip: { enabled: true } } }
    });
    new Chart($('#activityChart'), {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], datasets: [
          { label: 'Income', data: [18, 26, 22, 38, 29, 42, 35], backgroundColor: '#c20de4', borderRadius: 6, maxBarThickness: 13 },
          { label: 'Outcome', data: [12, 18, 15, 24, 20, 28, 22], backgroundColor: '#6215e6', borderRadius: 6, maxBarThickness: 13 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10 } } },
          y: { beginAtZero: true, grid: { color: '#e3e7eb' }, border: { display: false }, ticks: { maxTicksLimit: 5, font: { size: 10 } } }
        }
      }
    });
  } else {
    $('#overviewChart').insertAdjacentHTML('afterend', '<p class="muted">Chart library is offline.</p>');
    $('#activityChart').insertAdjacentHTML('afterend', '<p class="muted">Chart library is offline.</p>');
  }
});
