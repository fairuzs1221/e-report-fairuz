/* =====================================================
   E-REPORT ENTERPRISE — ANIMATED & RESPONSIVE ENGINE v4.0
===================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'ereport_pro_data_v4';
    const THEME_KEY = 'ereport_pro_theme_v4';

    const defaultReports = [
        {
            id: 'ERP-9021',
            pelapor: 'Andi Wijaya (IT)',
            kategori: 'Internet',
            lokasi: 'Gedung Utama Lt. 2',
            urgensi: 'Tinggi',
            judul: 'Bandwidth Utama Server Fluktuatif',
            deskripsi: 'Koneksi backbone server mengalami drop paket sejak pukul 08:00 WIB dan menghambat akses sistem internal.',
            status: 'Diproses',
            waktu: 'Hari ini, 08:30'
        },
        {
            id: 'ERP-9020',
            pelapor: 'Siti Aminah (HR)',
            kategori: 'Fasilitas',
            lokasi: 'Gedung B Lt. 3',
            urgensi: 'Normal',
            judul: 'Lampu LED Ruang Rapat Redup',
            deskripsi: 'Dua titik lampu downlight di ruang rapat utama kedap-kedip saat digunakan presentasi.',
            status: 'Menunggu',
            waktu: 'Hari ini, 09:10'
        },
        {
            id: 'ERP-9019',
            pelapor: 'Rizky Pratama (Ops)',
            kategori: 'Keamanan',
            lokasi: 'Gerbang Timur',
            urgensi: 'Kritis',
            judul: 'Gate Access RFID Rusak Total',
            deskripsi: 'Pintu gerbang otomatis tidak merespon kartu akses karyawan sehingga antrean kendaraan menumpuk.',
            status: 'Selesai',
            waktu: 'Kemarin, 16:45'
        }
    ];

    let reports = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultReports;
    let myReportChart = null;
    let currentChartType = 'bar';
    let activeModalTicketId = null;

    // DOM Elements
    const dynamicIsland = document.getElementById('dynamicIsland');
    const islandText = document.getElementById('islandText');
    const btnNavHome = document.getElementById('btnNavHome');
    const btnNavGuide = document.getElementById('btnNavGuide');
    const pageHome = document.getElementById('pageHome');
    const pageGuide = document.getElementById('pageGuide');
    const btnDarkMode = document.getElementById('btnDarkMode');
    const themeIcon = document.getElementById('themeIcon');

    const btnScrollForm = document.getElementById('btnScrollForm');
    const btnScrollStats = document.getElementById('btnScrollStats');
    const statCards = document.querySelectorAll('.stat-card');

    const reportForm = document.getElementById('reportForm');
    const btnSubmitForm = document.getElementById('btnSubmitForm');
    const deskripsiInput = document.getElementById('deskripsi');
    const charCounter = document.getElementById('charCounter');
    const notifBox = document.getElementById('notifBox');

    const btnToggleChartType = document.getElementById('btnToggleChartType');
    const searchBox = document.getElementById('searchBox');
    const statusFilter = document.getElementById('statusFilter');
    const reportTableBody = document.getElementById('reportTableBody');

    const btnExportCSV = document.getElementById('btnExportCSV');
    const btnPrintPDF = document.getElementById('btnPrintPDF');
    const btnDeleteLast = document.getElementById('btnDeleteLast');
    const btnClearDone = document.getElementById('btnClearDone');

    const totalCount = document.getElementById('totalCount');
    const waitCount = document.getElementById('waitCount');
    const procCount = document.getElementById('procCount');
    const doneCount = document.getElementById('doneCount');

    // Modal Elements
    const ticketModal = document.getElementById('ticketModal');
    const modalTicketId = document.getElementById('modalTicketId');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnModalCloseFooter = document.getElementById('btnModalCloseFooter');
    const btnModalCycleStatus = document.getElementById('btnModalCycleStatus');

    // Helper: Refresh Lucide Icons
    function refreshIcons() {
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    // =====================================================
    // SCROLL ANIMATION OBSERVER (MUNCUL SAAT SCROLL)
    // =====================================================
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px'
    });

    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal-element');
        revealElements.forEach(el => revealObserver.observe(el));
    }

    // Dynamic Island Notifier
    let islandTimeout;
    function triggerIsland(message) {
        islandText.textContent = message;
        dynamicIsland.classList.add('expanded');
        clearTimeout(islandTimeout);
        islandTimeout = setTimeout(() => {
            dynamicIsland.classList.remove('expanded');
            islandText.textContent = 'System Core v4.0 Active';
        }, 3200);
    }

    dynamicIsland.addEventListener('click', () => {
        dynamicIsland.classList.toggle('expanded');
    });

    // Alert Banner
    let alertTimeout;
    function showAlert(message, type = 'success') {
        notifBox.className = `notification show ${type}`;
        notifBox.innerHTML = `<span>${message}</span><button type="button" style="background:none;border:none;color:inherit;font-weight:800;cursor:pointer;font-size:1rem;" onclick="this.parentElement.classList.remove('show')">✕</button>`;
        clearTimeout(alertTimeout);
        alertTimeout = setTimeout(() => notifBox.classList.remove('show'), 4500);
    }

    // Smooth Scroll Buttons
    btnScrollForm.addEventListener('click', () => {
        document.getElementById('reportCardForm').scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => document.getElementById('pelapor').focus(), 400);
    });

    btnScrollStats.addEventListener('click', () => {
        document.getElementById('monitoringSection').scrollIntoView({ behavior: 'smooth' });
    });

    // Klik Kartu Statistik untuk Filter Cepat
    statCards.forEach(card => {
        card.addEventListener('click', () => {
            const filterValue = card.getAttribute('data-filter');
            statusFilter.value = filterValue;
            renderTable();
            document.getElementById('monitoringSection').scrollIntoView({ behavior: 'smooth' });
            triggerIsland(`Filter Status: ${filterValue}`);
        });
    });

    // Navigation Tabs
    function switchPage(target) {
        if (target === 'home') {
            pageHome.classList.add('active');
            pageGuide.classList.remove('active');
            btnNavHome.classList.add('active');
            btnNavGuide.classList.remove('active');
            triggerIsland('Dasbor Utama Aktif');
        } else {
            pageGuide.classList.add('active');
            pageHome.classList.remove('active');
            btnNavGuide.classList.add('active');
            btnNavHome.classList.remove('active');
            triggerIsland('Membuka Panduan SOP');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(initScrollReveal, 100);
    }

    btnNavHome.addEventListener('click', () => switchPage('home'));
    btnNavGuide.addEventListener('click', () => switchPage('guide'));

    // Theme Toggle
    if (localStorage.getItem(THEME_KEY) === 'light') {
        document.body.classList.add('light-mode');
        themeIcon.setAttribute('data-lucide', 'moon');
    } else {
        themeIcon.setAttribute('data-lucide', 'sun');
    }
    refreshIcons();

    btnDarkMode.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-mode');
        themeIcon.setAttribute('data-lucide', isLight ? 'moon' : 'sun');
        refreshIcons();
        localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
        triggerIsland(isLight ? 'Tema Terang Aktif' : 'Tema Gelap Aktif');
        initChart();
    });

    // Character Counter
    deskripsiInput.addEventListener('input', () => {
        const len = deskripsiInput.value.length;
        charCounter.textContent = `${len} karakter`;
        charCounter.style.color = len >= 10 ? '#10b981' : '';
    });

    // Chart.js Engine
    btnToggleChartType.addEventListener('click', () => {
        currentChartType = currentChartType === 'bar' ? 'doughnut' : 'bar';
        initChart();
        triggerIsland(`Model Grafik: ${currentChartType.toUpperCase()}`);
    });

    function initChart() {
        const canvas = document.getElementById('reportChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const categories = ['Internet', 'Fasilitas', 'Kebersihan', 'Keamanan', 'Lainnya'];
        const dataCounts = categories.map(cat => reports.filter(r => r.kategori === cat).length);

        const isLight = document.body.classList.contains('light-mode');
        const textColor = isLight ? '#475569' : '#94a3b8';
        const gridColor = isLight ? 'rgba(226, 232, 240, 0.8)' : 'rgba(51, 65, 85, 0.4)';

        if (myReportChart) {
            myReportChart.destroy();
        }

        myReportChart = new Chart(ctx, {
            type: currentChartType,
            data: {
                labels: categories,
                datasets: [{
                    label: 'Jumlah Tiket',
                    data: dataCounts,
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.85)',
                        'rgba(2, 132, 199, 0.85)',
                        'rgba(245, 158, 11, 0.85)',
                        'rgba(139, 92, 246, 0.85)',
                        'rgba(239, 68, 68, 0.85)'
                    ],
                    borderColor: ['#10b981', '#0284c7', '#d97706', '#7c3aed', '#ef4444'],
                    borderWidth: 2,
                    borderRadius: currentChartType === 'bar' ? 8 : 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: currentChartType === 'doughnut',
                        labels: { color: textColor }
                    }
                },
                scales: currentChartType === 'bar' ? {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, color: textColor },
                        grid: { color: gridColor }
                    },
                    x: {
                        ticks: { color: textColor },
                        grid: { display: false }
                    }
                } : {}
            }
        });
    }

    // Pipeline Data
    function saveReports() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
        updateStats();
        renderTable();
        initChart();
    }

    function updateStats() {
        totalCount.textContent = reports.length;
        waitCount.textContent = reports.filter(r => r.status === 'Menunggu').length;
        procCount.textContent = reports.filter(r => r.status === 'Diproses').length;
        doneCount.textContent = reports.filter(r => r.status === 'Selesai').length;
    }

    function escapeHTML(str) {
        return String(str).replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[m]));
    }

    function renderTable() {
        const keyword = searchBox.value.toLowerCase().trim();
        const filter = statusFilter.value;

        const filtered = reports.filter(item => {
            const matchKeyword =
                item.judul.toLowerCase().includes(keyword) ||
                item.pelapor.toLowerCase().includes(keyword) ||
                item.lokasi.toLowerCase().includes(keyword) ||
                item.id.toLowerCase().includes(keyword);
            const matchStatus = filter === 'Semua' || item.status === filter;
            return matchKeyword && matchStatus;
        });

        if (filtered.length === 0) {
            reportTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; padding: 36px; color: var(--text-muted);">
                        Tidak ada data pengaduan yang sesuai dengan filter saat ini.
                    </td>
                </tr>`;
            return;
        }

        reportTableBody.innerHTML = filtered.map(item => {
            const statusClass =
                item.status === 'Menunggu' ? 'status-menunggu' :
                item.status === 'Diproses' ? 'status-diproses' : 'status-selesai';

            const urgensiClass =
                item.urgensi === 'Kritis' ? 'urgensi-kritis' :
                item.urgensi === 'Tinggi' ? 'urgensi-tinggi' : 'urgensi-normal';

            const statusIcon =
                item.status === 'Menunggu' ? '⏳' :
                item.status === 'Diproses' ? '⚙️' : '✓';

            return `
                <tr>
                    <td><span class="ticket-id">${escapeHTML(item.id)}</span></td>
                    <td>
                        <span class="report-title" onclick="openTicketModal('${item.id}')">${escapeHTML(item.judul)}</span>
                        <span class="report-desc">${escapeHTML(item.deskripsi)}</span>
                        <span class="cat-pill">${escapeHTML(item.kategori)}</span>
                        <span class="urgensi-pill ${urgensiClass}">${escapeHTML(item.urgensi)}</span>
                    </td>
                    <td>
                        <strong>${escapeHTML(item.pelapor)}</strong><br>
                        <small style="color: var(--text-secondary)">📍 ${escapeHTML(item.lokasi)}</small><br>
                        <small style="color: var(--text-muted); font-size: 0.72rem;">🕒 ${escapeHTML(item.waktu)}</small>
                    </td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            ${statusIcon} ${escapeHTML(item.status)}
                        </span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button type="button" class="btn-table" onclick="openTicketModal('${item.id}')" title="Lihat Detail">
                                👁 Detail
                            </button>
                            <button type="button" class="btn-table" onclick="cycleStatus('${item.id}')" title="Ubah Status">
                                🔄 Status
                            </button>
                            <button type="button" class="btn-table del" onclick="deleteReport('${item.id}')" title="Hapus Tiket">
                                🗑
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Form Submission dengan Efek Loading Responsif
    reportForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const originalBtnHTML = btnSubmitForm.innerHTML;
        btnSubmitForm.disabled = true;
        btnSubmitForm.style.opacity = '0.8';
        btnSubmitForm.innerHTML = `<span>⏳ Memproses Tiket...</span>`;

        setTimeout(() => {
            const newReport = {
                id: 'ERP-' + Math.floor(1000 + Math.random() * 9000),
                pelapor: document.getElementById('pelapor').value.trim(),
                kategori: document.getElementById('kategori').value,
                lokasi: document.getElementById('lokasi').value.trim(),
                urgensi: document.getElementById('urgensi').value,
                judul: document.getElementById('judul').value.trim(),
                deskripsi: deskripsiInput.value.trim(),
                status: 'Menunggu',
                waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
            };

            reports.unshift(newReport);
            saveReports();

            reportForm.reset();
            charCounter.textContent = '0 karakter';
            charCounter.style.color = '';

            btnSubmitForm.disabled = false;
            btnSubmitForm.style.opacity = '1';
            btnSubmitForm.innerHTML = originalBtnHTML;
            refreshIcons();

            showAlert(`✅ Tiket ${newReport.id} berhasil dikirim ke sistem antrean!`, 'success');
            triggerIsland(`Tiket Baru: ${newReport.id}`);
        }, 400);
    });

    // Modal Detail Tiket
    window.openTicketModal = function(id) {
        const item = reports.find(r => r.id === id);
        if (!item) return;

        activeModalTicketId = id;
        modalTicketId.textContent = item.id;
        modalTitle.textContent = item.judul;
        modalBody.innerHTML = `
            <div class="modal-detail-grid">
                <div class="modal-detail-item">
                    <small>Pelapor</small>
                    <strong>${escapeHTML(item.pelapor)}</strong>
                </div>
                <div class="modal-detail-item">
                    <small>Lokasi</small>
                    <strong>${escapeHTML(item.lokasi)}</strong>
                </div>
                <div class="modal-detail-item">
                    <small>Kategori & Urgensi</small>
                    <strong>${escapeHTML(item.kategori)} • ${escapeHTML(item.urgensi)}</strong>
                </div>
                <div class="modal-detail-item">
                    <small>Status & Waktu</small>
                    <strong>${escapeHTML(item.status)} (${escapeHTML(item.waktu)})</strong>
                </div>
            </div>
            <div>
                <small style="display:block; font-weight:700; color:var(--text-muted); margin-bottom:6px; text-transform:uppercase; font-size:0.72rem;">Kronologi Masalah</small>
                <div class="modal-desc-box">${escapeHTML(item.deskripsi)}</div>
            </div>
        `;
        ticketModal.classList.add('open');
        ticketModal.setAttribute('aria-hidden', 'false');
        refreshIcons();
    };

    function closeTicketModal() {
        ticketModal.classList.remove('open');
        ticketModal.setAttribute('aria-hidden', 'true');
        activeModalTicketId = null;
    }

    btnCloseModal.addEventListener('click', closeTicketModal);
    btnModalCloseFooter.addEventListener('click', closeTicketModal);
    ticketModal.addEventListener('click', (e) => {
        if (e.target === ticketModal) closeTicketModal();
    });

    btnModalCycleStatus.addEventListener('click', () => {
        if (activeModalTicketId) {
            window.cycleStatus(activeModalTicketId);
            window.openTicketModal(activeModalTicketId);
        }
    });

    // Global Row Actions
    window.cycleStatus = function(id) {
        const order = ['Menunggu', 'Diproses', 'Selesai'];
        const target = reports.find(r => r.id === id);
        if (!target) return;

        const nextIndex = (order.indexOf(target.status) + 1) % order.length;
        target.status = order[nextIndex];
        saveReports();
        triggerIsland(`${id} → ${target.status}`);
    };

    window.deleteReport = function(id) {
        reports = reports.filter(r => r.id !== id);
        saveReports();
        showAlert(`🗑 Tiket ${id} telah dihapus dari sistem.`, 'warning');
        triggerIsland(`Tiket ${id} Dihapus`);
    };

    // Export CSV
    btnExportCSV.addEventListener('click', () => {
        if (reports.length === 0) {
            showAlert('Tidak ada data untuk diekspor.', 'warning');
            return;
        }
        const headers = ['ID Tiket', 'Pelapor', 'Kategori', 'Lokasi', 'Urgensi', 'Judul', 'Status', 'Waktu'];
        const rows = reports.map(r => [
            r.id, `"${r.pelapor}"`, r.kategori, `"${r.lokasi}"`, r.urgensi, `"${r.judul}"`, r.status, `"${r.waktu}"`
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `E-Report-Rekap-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showAlert('📊 File CSV berhasil diunduh!', 'success');
        triggerIsland('Ekspor CSV Berhasil');
    });

    // Print / Save PDF
    btnPrintPDF.addEventListener('click', () => {
        triggerIsland('Membuka Dialog Cetak / PDF...');
        setTimeout(() => window.print(), 200);
    });

    // Delete Last Ticket
    btnDeleteLast.addEventListener('click', () => {
        if (reports.length === 0) {
            showAlert('Tidak ada tiket untuk dibatalkan.', 'warning');
            return;
        }
        const removed = reports.shift();
        saveReports();
        showAlert(`↩ Tiket terbaru (${removed.id}) dibatalkan.`, 'warning');
        triggerIsland(`Membatalkan ${removed.id}`);
    });

    // Clear Done Tickets
    btnClearDone.addEventListener('click', () => {
        const doneTotal = reports.filter(r => r.status === 'Selesai').length;
        if (doneTotal === 0) {
            showAlert('Tidak ada tiket berstatus Selesai.', 'warning');
            return;
        }
        reports = reports.filter(r => r.status !== 'Selesai');
        saveReports();
        showAlert(`🧹 ${doneTotal} tiket selesai berhasil dibersihkan.`, 'success');
        triggerIsland(`${doneTotal} Tiket Dibersihkan`);
    });

    searchBox.addEventListener('input', renderTable);
    statusFilter.addEventListener('change', renderTable);

    // Initial Boot
    saveReports();
    refreshIcons();
    initScrollReveal();
});