/**
 * Admin Platform Main Script
 */

const App = {
    state: {
        darkMode: localStorage.getItem('theme') === 'dark',
        currentView: 'dashboard'
    },

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.applyTheme();
        this.loadView('dashboard');
        this.checkProtocol();
    },

    checkProtocol() {
        if (window.location.protocol === 'file:') {
            const warning = document.getElementById('protocol-warning');
            if (warning) warning.classList.remove('hidden');
        }
    },

    cacheDOM() {
        this.dom = {
            navItems: document.querySelectorAll('.nav-item'),
            appContent: document.getElementById('app-content'),
            pageTitle: document.getElementById('page-title'),
            themeToggle: document.getElementById('theme-toggle')
        };
    },

    bindEvents() {
        // Navigation
        this.dom.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.currentTarget.dataset.view;
                this.handleNavigation(view, e.currentTarget);
            });
        });

        // Theme Toggle
        this.dom.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
    },

    handleNavigation(view, newActiveEl) {
        // Update Active State
        this.dom.navItems.forEach(el => {
            el.classList.remove('active');
        });

        newActiveEl.classList.add('active');

        this.loadView(view);
    },

    loadView(view) {
        this.state.currentView = view;
        let content = '';
        let title = '';

        switch (view) {
            case 'dashboard':
                title = 'Principal';
                content = this.getDashboardHTML();
                break;
            case 'docs-pdf':
                title = 'Gestión Documental';
                if (window.DocsModule) {
                    content = window.DocsModule.getTemplate();
                    setTimeout(() => window.DocsModule.init(), 100);
                } else {
                    content = '<div class="text-center p-6 text-red-500 card">Módulo Docs no cargado.</div>';
                }
                break;
            case 'visual-img':
                title = 'Inteligencia Visual';
                if (window.VisualModule) {
                    content = window.VisualModule.getTemplate();
                    setTimeout(() => window.VisualModule.init(), 100);
                } else {
                    content = '<div class="text-center p-6 text-red-500 card">Módulo Visual no cargado.</div>';
                }
                break;
            case 'media-tools':
                title = 'Multimedia';
                if (window.MediaModule) {
                    content = window.MediaModule.getTemplate();
                    setTimeout(() => window.MediaModule.init(), 100);
                } else {
                    content = '<div class="text-center p-6 text-red-500 card">Módulo Media no cargado.</div>';
                }
                break;
            case 'utils-general':
                title = 'Utilidades';
                if (window.UtilsModule) {
                    content = window.UtilsModule.getTemplate();
                    setTimeout(() => window.UtilsModule.init(), 100);
                } else {
                    content = '<div class="text-center p-6 text-red-500 card">Módulo Utils no cargado.</div>';
                }
                break;
            default:
                title = '404';
                content = '<div class="text-center p-10 text-red-500 card">Vista no encontrada</div>';
        }

        this.dom.pageTitle.textContent = title;
        this.dom.appContent.innerHTML = content;
    },

    toggleTheme() {
        this.state.darkMode = !this.state.darkMode;
        localStorage.setItem('theme', this.state.darkMode ? 'dark' : 'light');
        this.applyTheme();
    },

    applyTheme() {
        const html = document.documentElement;
        const icon = this.dom.themeToggle.querySelector('i');
        const text = this.dom.themeToggle.querySelector('span');

        if (this.state.darkMode) {
            html.classList.add('dark');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            text.textContent = 'Modo Claro';
        } else {
            html.classList.remove('dark');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            text.textContent = 'Modo Oscuro';
        }
    },

    getDashboardHTML() {
        return `
            <div class="tools-grid">
                <!-- Module Cards -->
                <div onclick="App.handleNavigation('docs-pdf', document.querySelector('[data-view=\\'docs-pdf\\']'))" class="card cursor-pointer group">
                    <div class="card-icon icon-red group-hover:scale-110 transition-transform">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <h3 class="card-title">Gestión Documental</h3>
                    <p class="card-desc">PDF a Word, Unir, Encriptar y Firmar documentos.</p>
                </div>

                <div onclick="App.handleNavigation('visual-img', document.querySelector('[data-view=\\'visual-img\\']'))" class="card cursor-pointer group">
                    <div class="card-icon icon-purple group-hover:scale-110 transition-transform">
                        <i class="fas fa-wand-magic-sparkles"></i>
                    </div>
                    <h3 class="card-title">Inteligencia Visual</h3>
                    <p class="card-desc">Quitar fondos, OCR y compresión de imágenes.</p>
                </div>

                <div onclick="App.handleNavigation('media-tools', document.querySelector('[data-view=\\'media-tools\\']'))" class="card cursor-pointer group">
                    <div class="card-icon icon-pink group-hover:scale-110 transition-transform">
                        <i class="fas fa-video"></i>
                    </div>
                    <h3 class="card-title">Multimedia</h3>
                    <p class="card-desc">Transcripción, convertidores y edición básica.</p>
                </div>

                <div onclick="App.handleNavigation('utils-general', document.querySelector('[data-view=\\'utils-general\\']'))" class="card cursor-pointer group">
                    <div class="card-icon icon-amber group-hover:scale-110 transition-transform">
                        <i class="fas fa-calculator"></i>
                    </div>
                    <h3 class="card-title">Utilidades</h3>
                    <p class="card-desc">Generador QR, Limpiador de texto y Cálculos.</p>
                </div>
            </div>

            <div class="mt-4">
                <h3 class="text-lg font-bold mb-4">Acceso Rápido</h3>
                <div class="card p-6">
                    <div class="text-center text-muted py-8">
                        <i class="fas fa-history text-4xl mb-3 opacity-20"></i>
                        <p>No hay archivos recientes procesados.</p>
                    </div>
                </div>
            </div>
        `;
    }
};

// Start App
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
