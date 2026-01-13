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
            el.classList.remove('bg-blue-50', 'text-blue-700', 'dark:bg-blue-900/30', 'dark:text-blue-400', 'font-medium');
            el.classList.add('text-slate-600', 'dark:text-slate-400', 'hover:bg-slate-100', 'dark:hover:bg-slate-700/50');
        });

        newActiveEl.classList.remove('text-slate-600', 'dark:text-slate-400', 'hover:bg-slate-100', 'dark:hover:bg-slate-700/50');
        newActiveEl.classList.add('bg-blue-50', 'text-blue-700', 'dark:bg-blue-900/30', 'dark:text-blue-400', 'font-medium');

        this.loadView(view);
    },

    loadView(view) {
        this.state.currentView = view;
        let content = '';
        let title = '';

        switch (view) {
            case 'dashboard':
                title = 'Dashboard';
                content = this.getDashboardHTML();
                break;
            case 'docs-pdf':
                title = 'Gestión Documental';
                if (window.DocsModule) {
                    content = window.DocsModule.getTemplate();
                    setTimeout(() => window.DocsModule.init(), 100);
                } else {
                    // Dynamic load if not present (simple version for now assumes script tag or we inject it)
                    // For now, we'll assume it's loaded via script tag in index.html (I need to add it there)
                    content = '<div class="text-center p-10 text-red-500">Módulo no cargado. Refresca la página.</div>';
                }
                break;
            case 'visual-img':
                title = 'Inteligencia Visual';
                if (window.VisualModule) {
                    content = window.VisualModule.getTemplate();
                    setTimeout(() => window.VisualModule.init(), 100);
                } else {
                    content = '<div class="text-center p-10 text-red-500">Módulo no cargado.</div>';
                }
                break;
            case 'media-tools':
                title = 'Multimedia';
                if (window.MediaModule) {
                    content = window.MediaModule.getTemplate();
                    setTimeout(() => window.MediaModule.init(), 100);
                } else {
                    content = '<div class="text-center p-10 text-red-500">Módulo no cargado.</div>';
                }
                break;
            case 'utils-general':
                title = 'Imprescindibles';
                if (window.UtilsModule) {
                    content = window.UtilsModule.getTemplate();
                    setTimeout(() => window.UtilsModule.init(), 100);
                } else {
                    content = '<div class="text-center p-10 text-red-500">Módulo no cargado.</div>';
                }
                break;
            default:
                title = '404';
                content = '<div class="text-center p-10 text-red-500">Vista no encontrada</div>';
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
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Module Cards -->
                <div onclick="App.handleNavigation('docs-pdf', document.querySelector('[data-view=\\'docs-pdf\\']'))" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer border border-slate-200 dark:border-slate-700 group">
                    <div class="w-12 h-12 rounded-lg bg-red-100 text-red-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <i class="fas fa-file-pdf text-xl"></i>
                    </div>
                    <h3 class="font-semibold text-lg mb-1 text-slate-800 dark:text-white">Gestión Documental</h3>
                    <p class="text-slate-500 dark:text-slate-400 text-sm">PDF a Word, Unir, Encriptar y Firmar documentos.</p>
                </div>

                <div onclick="App.handleNavigation('visual-img', document.querySelector('[data-view=\\'visual-img\\']'))" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer border border-slate-200 dark:border-slate-700 group">
                    <div class="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <i class="fas fa-wand-magic-sparkles text-xl"></i>
                    </div>
                    <h3 class="font-semibold text-lg mb-1 text-slate-800 dark:text-white">Inteligencia Visual</h3>
                    <p class="text-slate-500 dark:text-slate-400 text-sm">Quitar fondos, OCR y compresión de imágenes.</p>
                </div>

                <div onclick="App.handleNavigation('media-tools', document.querySelector('[data-view=\\'media-tools\\']'))" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer border border-slate-200 dark:border-slate-700 group">
                    <div class="w-12 h-12 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <i class="fas fa-video text-xl"></i>
                    </div>
                    <h3 class="font-semibold text-lg mb-1 text-slate-800 dark:text-white">Multimedia</h3>
                    <p class="text-slate-500 dark:text-slate-400 text-sm">Transcripción, convertidores y edición básica.</p>
                </div>

                <div onclick="App.handleNavigation('utils-general', document.querySelector('[data-view=\\'utils-general\\']'))" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer border border-slate-200 dark:border-slate-700 group">
                    <div class="w-12 h-12 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <i class="fas fa-calculator text-xl"></i>
                    </div>
                    <h3 class="font-semibold text-lg mb-1 text-slate-800 dark:text-white">Utilidades</h3>
                    <p class="text-slate-500 dark:text-slate-400 text-sm">Generador QR, Limpiador de texto y Cálculos.</p>
                </div>
            </div>

            <div class="mt-8">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Acceso Rápido</h3>
                <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div class="text-center text-slate-500 py-8">
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
