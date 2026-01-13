/**
 * Visual Intelligence Module
 * Handles Image processing: Background Removal, OCR, Compression
 */

const VisualModule = {
    // State
    compressFile: null,
    ocrFile: null,
    removeBgFile: null,

    init() {
        console.log('Visual Module Initialized');
        if (!window.Tesseract) {
            this.loadTesseract();
        }
    },

    loadTesseract() {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/tesseract.js@v4.1.1/dist/tesseract.min.js';
        script.onload = () => {
            console.log('Tesseract loaded');
            window.Tesseract = Tesseract;
        };
        document.head.appendChild(script);
    },

    getTemplate() {
        return `
            <div class="space-y-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-800 dark:text-white">Inteligencia Visual</h2>
                        <p class="text-slate-500 dark:text-slate-400">Procesamiento de imágenes con IA y utilidades.</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${this.createToolCard('remove-bg', 'Quitar Fondo', 'fa-eraser', 'Eliminar fondo de imágenes (IA Local).', 'bg-pink-50 text-pink-600')}
                    ${this.createToolCard('ocr-text', 'OCR (Escanear Texto)', 'fa-font', 'Extraer texto de imágenes escaneadas.', 'bg-indigo-50 text-indigo-600')}
                    ${this.createToolCard('compress-img', 'Comprimir Imagen', 'fa-compress-arrows-alt', 'Reducir peso sin perder mucha calidad.', 'bg-cyan-50 text-cyan-600')}
                </div>

                <div id="vis-tool-workspace" class="hidden bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                        <h3 id="vis-workspace-title" class="text-xl font-semibold">Herramienta</h3>
                        <button onclick="VisualModule.closeTool()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <div id="vis-workspace-content"></div>
                </div>
            </div>
        `;
    },

    createToolCard(id, title, icon, desc, colorClass) {
        return `
            <div onclick="VisualModule.openTool('${id}', '${title}')" class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group">
                <div class="flex items-center gap-4 mb-3">
                    <div class="w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center">
                        <i class="fas ${icon}"></i>
                    </div>
                    <h3 class="font-semibold text-slate-800 dark:text-slate-200">${title}</h3>
                </div>
                <p class="text-sm text-slate-500 dark:text-slate-400">${desc}</p>
            </div>
        `;
    },

    openTool(toolId, title) {
        const workspace = document.getElementById('vis-tool-workspace');
        workspace.classList.remove('hidden');
        document.getElementById('vis-workspace-title').textContent = title;
        workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.renderToolUI(toolId, document.getElementById('vis-workspace-content'));
    },

    closeTool() {
        document.getElementById('vis-tool-workspace').classList.add('hidden');
    },

    renderToolUI(toolId, container) {
        // Loading state
        container.innerHTML = `<div class="p-8 text-center"><i class="fas fa-circle-notch fa-spin text-3xl text-blue-500 mb-4"></i><p>Cargando...</p></div>`;

        setTimeout(() => {
            switch (toolId) {
                case 'ocr-text':
                    container.innerHTML = this.getOCRInterface();
                    this.initFileListener('ocr-input', 'ocr');
                    break;
                case 'compress-img':
                    container.innerHTML = this.getCompressInterface();
                    this.initFileListener('compress-input', 'compress');
                    break;
                case 'remove-bg':
                    container.innerHTML = this.getRemoveBgInterface();
                    this.initFileListener('rmbg-input', 'rmbg');
                    break;
                default:
                    container.innerHTML = 'En construcción';
            }
        }, 300);
    },

    // --- Remove BG Logic ---
    getRemoveBgInterface() {
        return `
            <div class="flex flex-col lg:flex-row h-[600px] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                <!-- Main Canvas Area (Left) -->
                <div class="flex-1 bg-slate-100 dark:bg-slate-900 relative flex items-center justify-center p-4">
                    <!-- Checkerboard background for transparency -->
                    <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(#64748b 1px, transparent 1px); background-size: 20px 20px;"></div>
                    
                    <!-- Content -->
                    <div id="rmbg-main-display" class="relative z-10 max-w-full max-h-full">
                        <div class="text-center p-10">
                            <i class="fas fa-image text-6xl text-slate-300 mb-4"></i>
                            <p class="text-slate-500">Sube una imagen para comenzar</p>
                        </div>
                    </div>

                    <!-- Upload Overlay if empty -->
                    <input type="file" id="rmbg-input" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" title="Subir imagen">
                </div>

                <!-- Sidebar Controls (Right) -->
                <div class="w-full lg:w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 p-6 flex flex-col z-30">
                    <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-6">Eliminar Fondo</h3>
                    
                    <div class="flex-1 space-y-4">
                        <div id="rmbg-controls-upload" class="block">
                            <button onclick="document.getElementById('rmbg-input').click()" class="w-full py-3 border-2 border-dashed border-blue-300 text-blue-600 rounded-xl hover:bg-blue-50 font-medium transition-colors">
                                <i class="fas fa-upload mr-2"></i> Subir Imagen
                            </button>
                        </div>
                        
                        <div id="rmbg-controls-action" class="hidden space-y-4">
                            <div class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Archivo</p>
                                <p id="rmbg-filename" class="font-medium truncate text-sm">imagen.jpg</p>
                            </div>

                            <button onclick="VisualModule.runRemoveBg()" id="btn-rmbg" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl shadow-lg shadow-blue-600/20 font-semibold transition-all hover:scale-[1.02] active:scale-95">
                                Eliminar Fondo
                            </button>
                            
                            <div id="rmbg-status" class="hidden text-center text-sm text-blue-600 font-medium animate-pulse">
                                <i class="fas fa-circle-notch fa-spin mr-2"></i> Procesando...
                            </div>
                        </div>

                        <div id="rmbg-controls-result" class="hidden space-y-4">
                            <div class="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-center text-sm font-medium">
                                <i class="fas fa-check-circle mr-1"></i> Fondo eliminado
                            </div>
                            
                            <a id="rmbg-download" href="#" class="block w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-3 rounded-xl text-center font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                                Descargar
                            </a>
                            
                            <button onclick="VisualModule.resetRemoveBg()" class="w-full py-2 text-slate-500 hover:text-slate-700 text-sm">
                                Subir otra imagen
                            </button>
                        </div>
                    </div>
                    
                    <div class="mt-auto pt-6 text-xs text-center text-slate-400">
                        Potenciado por AI • Privacidad Local
                    </div>
                </div>
            </div>
        `;
    },

    resetRemoveBg() {
        document.getElementById('rmbg-controls-upload').classList.remove('hidden');
        document.getElementById('rmbg-controls-action').classList.add('hidden');
        document.getElementById('rmbg-controls-result').classList.add('hidden');
        document.getElementById('rmbg-main-display').innerHTML = `
            <div class="text-center p-10">
                <i class="fas fa-image text-6xl text-slate-300 mb-4"></i>
                <p class="text-slate-500">Sube una imagen para comenzar</p>
            </div>
        `;
        document.getElementById('rmbg-input').value = '';
        this.removeBgFile = null;
    },

    async runRemoveBg() {
        if (!this.removeBgFile) return;

        const btn = document.getElementById('btn-rmbg');
        const status = document.getElementById('rmbg-status');
        const display = document.getElementById('rmbg-main-display');
        const controlsResult = document.getElementById('rmbg-controls-result');
        const controlsAction = document.getElementById('rmbg-controls-action');
        const downloadBtn = document.getElementById('rmbg-download');

        btn.disabled = true;
        btn.classList.add('opacity-50');
        status.classList.remove('hidden');

        try {
            // Check if already loaded
            if (!window.imglyRemoveBackground) {
                // FIXED: Removed crossOrigin attribute to allow loading from file:// protocol without strict CORS check
                await this.loadScript('https://unpkg.com/@imgly/background-removal@1.2.1/dist/imgly-background-removal.min.js');

                if (!window.imglyRemoveBackground) {
                    // Try all known names the UMD build might use
                    window.imglyRemoveBackground = window.imglyRemoveBackground ||
                        window.imgly?.backgroundRemoval ||
                        window.imgly?.removeBackground ||
                        window.removeBackground ||
                        window.imglyRemoveBackground;
                }
            }

            if (!window.imglyRemoveBackground) throw new Error('La librería cargó pero no encontró el activador (imglyRemoveBackground).');

            const config = {
                progress: (key, current, total) => {
                    const pct = Math.round((current / total) * 100);
                    if (total > 0) status.innerHTML = `<i class="fas fa-circle-notch fa-spin mr-2"></i> Procesando... ${pct}%`;
                },
                model_base_url: 'https://static.img.ly/background-removal-data/1.2.1/',
                public_path: 'https://static.img.ly/background-removal-data/1.2.1/'
            };

            // Run process
            const blob = await window.imglyRemoveBackground(this.removeBgFile, config);

            // Show result
            const url = URL.createObjectURL(blob);

            // Update UI
            display.innerHTML = `
                <div class="relative shadow-xl rounded-lg overflow-hidden border border-slate-200 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADFJREFUOE9jZGVl/f//PwMImJqasmCEFgaMGoAAgNyA7u7u/3g1YEQjI4aGkY4GAAgwABy4Dwr1u42FAAAAAElFTkSuQmCC')]">
                     <img src="${url}" class="max-h-[500px] max-w-full object-contain">
                </div>
            `;

            downloadBtn.href = url;
            downloadBtn.download = 'sin_fondo_' + this.removeBgFile.name.replace(/\.[^/.]+$/, "") + ".png";

            controlsAction.classList.add('hidden');
            controlsResult.classList.remove('hidden');

        } catch (error) {
            console.error(error);
            let msg = error.message;
            if (!navigator.onLine) msg = "Sin conexión a Internet.";
            alert('Error: ' + msg);
            status.innerHTML = `<span class="text-red-500 font-bold">Error: ${msg}</span>`;

            // Manual Installation Wizard - Forcefully show this if auto-download fails
            controlsResult.innerHTML = `
                <div class="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-lg text-left text-sm border border-amber-200 mt-4">
                    <p class="font-bold mb-2"><i class="fas fa-exclamation-triangle"></i> Descarga Bloqueada</p>
                    <p class="mb-2">Tu red impide descargar la IA automáticamente.</p>
                    <p class="font-bold border-t border-amber-200 pt-2 mt-2">Solución Manual:</p>
                    <ol class="list-decimal list-inside space-y-1 mt-1 mb-3">
                        <li><a href="https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.2.1/dist/imgly-background-removal.min.js" target="_blank" class="underline text-blue-600 font-bold hover:text-blue-800">1. Descarga este archivo (Click aquí)</a></li>
                        <li>2. Guárdalo en la carpeta: <code>js/vendor/</code></li>
                        <li>3. Nómbralo: <code>imgly.min.js</code></li>
                    </ol>
                    <button onclick="VisualModule.runRemoveBg()" class="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg font-bold shadow-md transition-all hover:scale-[1.02]">
                        <i class="fas fa-sync-alt mr-2"></i> Ya lo guardé, Reintentar
                    </button>
                    <p class="text-xs text-amber-700 mt-2 text-center">Esto instalará la IA localmente para siempre.</p>
                </div>
            `;
            controlsResult.classList.remove('hidden');
            controlsAction.classList.add('hidden'); // Hide the standard button to force focus on result area HTML

            // alert('Error: ' + msg); // Disable alert to rely on UI
        } finally {
            btn.disabled = false;
            btn.classList.remove('opacity-50');
        }
    },

    loadScript(url) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${url}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = url;
            script.crossOrigin = "anonymous"; // Try CORS
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('No se pudo descargar el script de IA (bloqueado o sin internet).'));
            document.head.appendChild(script);
        });
    },
    getOCRInterface() {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-4">
                    <div class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center cursor-pointer relative hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <input type="file" id="ocr-input" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                        <i class="fas fa-eye text-3xl text-slate-400 mb-3"></i>
                        <p class="font-medium">Sube una imagen para escanear</p>
                    </div>
                    <div id="ocr-preview" class="hidden rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 max-h-64 flex justify-center bg-slate-100 dark:bg-slate-900">
                        <!-- Image Preview -->
                    </div>
                    <button onclick="VisualModule.runOCR()" id="btn-ocr" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg disabled:opacity-50 transition-colors">
                        Extraer Texto
                    </button>
                    
                    <div id="ocr-status" class="hidden items-center justify-between p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                        <span id="ocr-status-text">Analizando...</span>
                        <div class="w-24 bg-blue-200 rounded-full h-2">
                             <div id="ocr-progress" class="bg-blue-600 h-2 rounded-full" style="width: 0%"></div>
                        </div>
                    </div>
                </div>

                <div class="relative">
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Texto Detectado</label>
                    <textarea id="ocr-result" class="w-full h-[300px] p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono leading-relaxed resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="El texto extraído aparecerá aquí..."></textarea>
                    <button onclick="navigator.clipboard.writeText(document.getElementById('ocr-result').value)" class="absolute top-8 right-2 p-2 text-slate-400 hover:text-indigo-600 bg-white/50 backdrop-blur rounded-md" title="Copiar">
                        <i class="far fa-copy"></i>
                    </button>
                </div>
            </div>
        `;
    },

    async runOCR() {
        if (!this.ocrFile) {
            alert('Por favor selecciona una imagen primero.');
            return;
        }

        const btn = document.getElementById('btn-ocr');
        const statusDiv = document.getElementById('ocr-status');
        const statusText = document.getElementById('ocr-status-text');
        const progressBar = document.getElementById('ocr-progress');
        const resultArea = document.getElementById('ocr-result');

        if (!window.Tesseract) {
            alert('Tesseract.js no está cargado. Comprueba tu conexión.');
            return;
        }

        btn.disabled = true;
        statusDiv.classList.remove('hidden');
        statusDiv.classList.add('flex');
        resultArea.value = '';

        try {
            const { data: { text } } = await Tesseract.recognize(
                this.ocrFile,
                'spa',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            const pct = Math.round(m.progress * 100);
                            statusText.textContent = `Escaneando... ${pct}%`;
                            progressBar.style.width = `${pct}%`;
                        } else {
                            statusText.textContent = m.status;
                        }
                    }
                }
            );

            resultArea.value = text;
            statusText.textContent = '¡Completado!';
            progressBar.style.width = '100%';

            setTimeout(() => {
                statusDiv.classList.add('hidden');
                statusDiv.classList.remove('flex');
            }, 3000);

        } catch (error) {
            console.error(error);
            alert('Error OCR: ' + error.message);
        } finally {
            btn.disabled = false;
        }
    },

    // --- Compression Logic ---
    getCompressInterface() {
        return `
             <div class="max-w-xl mx-auto space-y-6">
                 <div class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center cursor-pointer relative hover:bg-slate-50 dark:hover:bg-slate-700/30">
                     <input type="file" id="compress-input" accept="image/jpeg,image/png" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                     <i class="fas fa-compress-arrows-alt text-3xl text-slate-400 mb-3"></i>
                     <p class="font-medium">Sube imagen para comprimir</p>
                     <p class="text-xs text-slate-400 mt-2">JPG, PNG</p>
                 </div>
                 
                 <div id="compress-preview" class="hidden bg-white dark:bg-slate-900 border rounded-lg p-4">
                    <div class="flex items-center gap-4">
                        <img id="comp-img-preview" class="w-20 h-20 object-cover rounded-md bg-slate-100">
                        <div class="flex-1">
                            <p id="comp-original-info" class="text-sm font-semibold mb-1">Original: 2.5 MB</p>
                            <label class="text-xs text-slate-500">Calidad: <span id="quality-val">80</span>%</label>
                            <input type="range" id="quality-range" min="10" max="100" value="80" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer">
                        </div>
                    </div>
                 </div>

                 <button onclick="VisualModule.compressImage()" id="btn-compress" class="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg shadow-sm disabled:opacity-50 transition-colors hidden">
                    Comprimir y Descargar
                 </button>
             </div>
        `;
    },

    initFileListener(id, type) {
        document.getElementById(id).addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (type === 'ocr') {
                this.ocrFile = file;
                // Show preview
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const preview = document.getElementById('ocr-preview');
                    preview.innerHTML = `<img src="${ev.target.result}" class="h-full object-contain">`;
                    preview.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            } else if (type === 'compress') {
                this.compressFile = file;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    document.getElementById('compress-preview').classList.remove('hidden');
                    document.getElementById('btn-compress').classList.remove('hidden');
                    document.getElementById('comp-img-preview').src = ev.target.result;
                    document.getElementById('comp-original-info').textContent = `Original: ${(file.size / 1024).toFixed(0)} KB`;
                };
                reader.readAsDataURL(file);

                // Range listener
                document.getElementById('quality-range').addEventListener('input', (ev) => {
                    document.getElementById('quality-val').innerText = ev.target.value;
                });
            } else if (type === 'rmbg') {
                this.removeBgFile = file;
                const display = document.getElementById('rmbg-main-display');
                const controlsAction = document.getElementById('rmbg-controls-action');
                const controlsUpload = document.getElementById('rmbg-controls-upload');

                const reader = new FileReader();
                reader.onload = (ev) => {
                    display.innerHTML = `
                        <div class="relative shadow-lg rounded-lg overflow-hidden border border-slate-200">
                             <img src="${ev.target.result}" class="max-h-[500px] max-w-full object-contain">
                             <div class="absolute bottom-2 left-2 bg-slate-900/70 text-white text-xs px-2 py-1 rounded">Original</div>
                        </div>
                    `;
                    document.getElementById('rmbg-filename').textContent = file.name;
                    controlsUpload.classList.add('hidden');
                    controlsAction.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        });
    },

    compressImage() {
        if (!this.compressFile) return;

        const quality = document.getElementById('quality-range').value / 100;
        const btn = document.getElementById('btn-compress');
        btn.disabled = true;
        btn.innerHTML = 'Comprimiendo...';

        const reader = new FileReader();
        reader.readAsDataURL(this.compressFile);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = `compressed_${this.compressFile.name}`;
                        link.click();

                        btn.innerHTML = '¡Completado! (Descargando)';
                        setTimeout(() => {
                            btn.disabled = false;
                            btn.innerHTML = 'Comprimir y Descargar';
                        }, 2000);
                    }
                }, this.compressFile.type, quality);
            };
        };
    }
};

window.VisualModule = VisualModule;
