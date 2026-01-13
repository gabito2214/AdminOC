/**
 * Multimedia Module
 * Handles Audio/Video operations: Transcription, Conversion, Extraction
 */

const MediaModule = {
    apiKey: localStorage.getItem('openai_key') || '',
    baseUrl: localStorage.getItem('openai_base_url') || 'https://api.openai.com/v1',
    ffmpeg: null,
    ffmpegLoaded: false,
    utilLib: null,
    selectedFile: null,

    init() {
        console.log('Media Module Initialized');
        this.checkApiKey();
    },

    checkApiKey() {
        if (this.apiKey) return;
        // Logic to prompt for key could go here, or just inline in the tool
    },

    getTemplate() {
        return `
            <div class="flex flex-col gap-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-xl font-bold">Multimedia</h2>
                        <p class="text-muted">Herramientas de Audio y Video.</p>
                    </div>
                    <button onclick="MediaModule.setApiKey()" class="btn btn-outline text-xs">
                        <i class="fas fa-key mr-1"></i> ${this.apiKey ? 'API Key Configurada' : 'Configurar API Key'}
                    </button>
                </div>

                <div class="tools-grid">
                    ${this.createToolCard('transcription', 'Transcripción Pro', 'fa-microphone-lines', 'Audio a Texto con IA (Whisper).', 'icon-amber')}
                    ${this.createToolCard('audio-conv', 'Convertir Audio', 'fa-music', 'Formatos mp3, wav, m4a.', 'icon-teal')}
                    ${this.createToolCard('video-conv', 'Convertir Video', 'fa-video', 'Cambiar formato y resolución.', 'icon-indigo')}
                    ${this.createToolCard('audio-extract', 'Extraer Audio', 'fa-file-audio', 'Sacar sonido de videos.', 'icon-rose')}
                </div>

                <div id="media-tool-workspace" class="hidden card p-6">
                    <div class="flex items-center justify-between mb-4 pb-4 border-b border-color">
                        <h3 id="media-workspace-title" class="text-lg font-bold">Herramienta</h3>
                        <button onclick="MediaModule.closeTool()" class="text-muted hover:text-main">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <div id="media-workspace-content"></div>
                </div>
            </div>
        `;
    },

    createToolCard(id, title, icon, desc, colorClass) {
        return `
            <div onclick="MediaModule.openTool('${id}', '${title}')" class="card cursor-pointer group hover:shadow-md transition-all">
                <div class="flex items-center gap-4 mb-2">
                    <div class="card-icon ${colorClass} w-10 h-10 text-lg mb-0">
                        <i class="fas ${icon}"></i>
                    </div>
                    <h3 class="font-bold text-sm">${title}</h3>
                </div>
                <p class="text-xs text-muted">${desc}</p>
            </div>
        `;
    },

    openTool(toolId, title) {
        const workspace = document.getElementById('media-tool-workspace');
        workspace.classList.remove('hidden');
        document.getElementById('media-workspace-title').textContent = title;
        workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.renderToolUI(toolId, document.getElementById('media-workspace-content'));
    },

    closeTool() {
        document.getElementById('media-tool-workspace').classList.add('hidden');
    },

    setApiKey() {
        this.openTool('api-config', 'Configuración de API');
    },

    saveConfig() {
        const key = document.getElementById('config-api-key').value.trim();
        const url = document.getElementById('config-base-url').value.trim() || 'https://api.openai.com/v1';

        this.apiKey = key;
        this.baseUrl = url;
        localStorage.setItem('openai_key', key);
        localStorage.setItem('openai_base_url', url);

        alert('Configuración guardada correctamente.');

        // Update header button if exists
        const headerBtn = document.querySelector('[onclick="MediaModule.setApiKey()"]');
        if (headerBtn) {
            headerBtn.innerHTML = `<i class="fas fa-key mr-1"></i> ${this.apiKey ? 'API Key Configurada' : 'Configurar API Key'}`;
        }

        this.closeTool();
    },

    renderToolUI(toolId, container) {
        container.innerHTML = `<div class="p-8 text-center"><i class="fas fa-circle-notch fa-spin text-3xl text-primary-500 mb-4"></i><p>Cargando...</p></div>`;

        setTimeout(() => {
            switch (toolId) {
                case 'transcription':
                    container.innerHTML = this.getTranscriptionUI();
                    break;
                case 'api-config':
                    container.innerHTML = this.getApiConfigUI();
                    break;
                case 'audio-conv':
                case 'video-conv':
                case 'audio-extract':
                    container.innerHTML = this.getConverterUI(toolId);
                    break;
                default:
                    container.innerHTML = 'En construcción';
            }
        }, 300);
    },

    getTranscriptionUI() {
        return `
            <div class="max-w-xl mx-auto space-y-6">
                ${!this.apiKey ? '<div class="bg-amber-50 text-amber-700 p-4 rounded-lg text-sm mb-4"><i class="fas fa-exclamation-triangle mr-2"></i> Necesitas configurar tu API Key de OpenAI arriba.</div>' : ''}
                
                <div class="border-2 border-dashed border-color rounded-xl p-8 text-center cursor-pointer relative hover:bg-slate-50">
                    <input type="file" id="audio-input" accept="audio/*,video/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onchange="MediaModule.handleAudioSelect(this)">
                    <i class="fas fa-microphone-lines text-3xl text-muted mb-3"></i>
                    <p class="font-medium">Sube audio o video</p>
                    <p class="text-xs text-muted mt-2">MP3, MP4, MPEG, M4A, WAV, WEBM</p>
                </div>

                <div id="audio-file-info" class="hidden flex items-center gap-3 p-3 bg-slate-100 rounded-lg">
                    <i class="fas fa-file-audio text-primary-500"></i>
                    <span id="audio-name" class="text-sm font-medium">archivo.mp3</span>
                </div>

                <button onclick="MediaModule.startTranscription()" id="btn-transcribe" class="btn btn-primary w-full py-3" disabled>
                    Transcribir con Whisper
                </button>

                <div id="transcribe-result-area" class="hidden space-y-2">
                    <label class="input-label">Transcripción</label>
                    <textarea id="transcribe-text" class="form-input h-48 resize-none"></textarea>
                </div>
            </div>
        `;
    },

    handleAudioSelect(input) {
        if (input.files && input.files[0]) {
            document.getElementById('audio-file-info').classList.remove('hidden');
            document.getElementById('audio-file-info').classList.add('flex');
            document.getElementById('audio-name').textContent = input.files[0].name;
            document.getElementById('btn-transcribe').disabled = false;
        }
    },

    async startTranscription() {
        if (!this.apiKey) {
            alert('Configura tu API Key primero.');
            return;
        }

        const input = document.getElementById('audio-input');
        if (!input.files || !input.files[0]) {
            alert('Selecciona un archivo.');
            return;
        }

        const file = input.files[0];
        const btn = document.getElementById('btn-transcribe');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Transcribiendo...';

        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', 'whisper-1');

        try {
            const url = this.baseUrl.endsWith('/') ? this.baseUrl + 'audio/transcriptions' : this.baseUrl + '/audio/transcriptions';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error.message);

            document.getElementById('transcribe-result-area').classList.remove('hidden');
            document.getElementById('transcribe-text').value = data.text;

            btn.innerHTML = '¡Completado!';
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = 'Transcribir con Whisper';
            }, 3000);

        } catch (error) {
            console.error(error);
            alert('Error: ' + error.message);
            btn.innerHTML = 'Transcribir con Whisper';
            btn.disabled = false;
        }
    },

    getConverterUI(toolId) {
        let title = '';
        let icon = '';
        let targetFormats = [];
        let accept = '';

        switch (toolId) {
            case 'audio-conv':
                title = 'Convertir Audio';
                icon = 'fa-music';
                targetFormats = ['mp3', 'wav', 'aac', 'm4a', 'ogg'];
                accept = 'audio/*';
                break;
            case 'video-conv':
                title = 'Convertir Video';
                icon = 'fa-video';
                targetFormats = ['mp4', 'webm', 'avi', 'mov'];
                accept = 'video/*';
                break;
            case 'audio-extract':
                title = 'Extraer Audio';
                icon = 'fa-file-audio';
                targetFormats = ['mp3', 'wav', 'm4a'];
                accept = 'video/*';
                break;
        }

        return `
            <div class="max-w-2xl mx-auto space-y-6">
                <!-- Library Loader Status -->
                <div id="ffmpeg-loader-status" class="${this.ffmpegLoaded ? 'hidden' : ''} bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 text-center">
                    <p class="text-sm text-blue-700 dark:text-blue-300 mb-3">
                        <i class="fas fa-info-circle mr-2"></i> Esta herramienta requiere cargar el motor de procesamiento (25MB).
                    </p>
                    <button onclick="MediaModule.loadFFmpeg()" id="btn-load-ffmpeg" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-md">
                        Cargar Motor FFmpeg
                    </button>
                </div>

                <!-- Main Converter UI (initially disabled/grayed) -->
                <div id="converter-workspace" class="${!this.ffmpegLoaded ? 'opacity-40 pointer-events-none' : ''} space-y-6 transition-opacity">
                    <div class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center cursor-pointer relative hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <input type="file" id="conv-file-input" accept="${accept}" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onchange="MediaModule.handleFileSelect(this)">
                        <i class="fas ${icon} text-3xl text-slate-400 mb-3"></i>
                        <p class="font-medium">Sube tu archivo</p>
                        <p class="text-xs text-slate-400 mt-2">${accept.replace('/*', '')} formats supported</p>
                    </div>

                    <div id="conv-file-info" class="hidden items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div class="flex items-center gap-3">
                            <i class="fas fa-file text-blue-500"></i>
                            <div>
                                <p id="conv-filename" class="text-sm font-bold truncate max-w-[200px]">archivo.mp4</p>
                                <p id="conv-filesize" class="text-[10px] text-slate-500">0 MB</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-xs font-bold text-slate-400">Convertir a:</span>
                            <select id="conv-target-format" class="p-1.5 rounded-lg border dark:bg-slate-800 dark:border-slate-600 outline-none text-xs font-bold">
                                ${targetFormats.map(fmt => `<option value="${fmt}">${fmt.toUpperCase()}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <button onclick="MediaModule.runConversion('${toolId}')" id="btn-run-conv" class="hidden w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]">
                        Comenzar Procesamiento
                    </button>

                    <!-- Progress Area -->
                    <div id="conv-progress-area" class="hidden space-y-3">
                        <div class="flex justify-between items-center text-xs">
                            <span id="conv-status-text" class="font-medium text-slate-600 dark:text-slate-400">Procesando...</span>
                            <span id="conv-pct-text" class="font-bold text-indigo-600">0%</span>
                        </div>
                        <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                            <div id="conv-progress-bar" class="bg-indigo-600 h-full rounded-full transition-all duration-300" style="width: 0%"></div>
                        </div>
                    </div>

                    <div id="conv-result-area" class="hidden p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl text-center">
                        <p class="text-emerald-700 dark:text-emerald-400 font-bold mb-3">¡Procesamiento Completado!</p>
                        <a id="conv-download-btn" href="#" class="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2 rounded-lg font-bold transition-all shadow-md">
                            Descargar Resultado
                        </a>
                    </div>
                </div>
            </div>
        `;
    },

    async loadFFmpeg() {
        const btn = document.getElementById('btn-load-ffmpeg');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i> Cargando motor...';

        try {
            // Use LOCAL files to avoid CORS/COEP chunk issues from CDN
            const ffmpegSrc = 'js/vendor/ffmpeg/ffmpeg.js';
            const utilSrc = 'js/vendor/ffmpeg/util.js';

            await this.loadScript(ffmpegSrc);
            await this.loadScript(utilSrc);

            // Small delay for DOM/Window updates
            await new Promise(r => setTimeout(r, 600));

            // EXTREME DETECTION: Try every known global pattern for v0.12
            let FFmpegClass = null;

            // Standardize library objects
            const ffmpegGlobal = window.FFmpegWasm || window.FFmpegWASM || window.FFmpeg;

            // 1. Check for FFmpeg class within the global object
            if (ffmpegGlobal && ffmpegGlobal.FFmpeg) {
                FFmpegClass = ffmpegGlobal.FFmpeg;
            }
            // 2. Maybe the global IS the class (v0.11 style or standalone UMD)
            else if (typeof window.FFmpeg === 'function') {
                FFmpegClass = window.FFmpeg;
            }
            else if (typeof ffmpegGlobal === 'function') {
                FFmpegClass = ffmpegGlobal;
            }

            // Detect Util Lib (Essential for loading core)
            this.utilLib = window.FFmpegUtil || window.ffmpegUtil || (ffmpegGlobal ? ffmpegGlobal.Util : null);

            if (!FFmpegClass || !this.utilLib) {
                const found = Object.keys(window).filter(k => k.toLowerCase().includes('ffmpeg'));
                throw new Error(`No se encontró la clase (${!!FFmpegClass}) o Util (${!!this.utilLib}). Detectados en window: ${found.join(', ') || 'ninguno'}.`);
            }

            this.ffmpeg = new FFmpegClass();

            this.ffmpeg.on('log', ({ message }) => {
                console.log('FFmpeg:', message);
            });

            this.ffmpeg.on('progress', ({ progress }) => {
                this.updateProgress(Math.round(progress * 100));
            });

            // Using LOCAL files for core as well
            const localBaseURL = window.location.origin + '/js/vendor/ffmpeg';

            await this.ffmpeg.load({
                coreURL: await this.utilLib.toBlobURL(`${localBaseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await this.utilLib.toBlobURL(`${localBaseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });

            this.ffmpegLoaded = true;
            document.getElementById('ffmpeg-loader-status').classList.add('hidden');
            document.getElementById('converter-workspace').classList.remove('opacity-40', 'pointer-events-none');

        } catch (error) {
            console.error('FFmpeg Critical Load Error:', error);

            let extraMsg = '';
            if (window.location.protocol === 'file:') {
                extraMsg = '\n\nNOTA: Estás ejecutando la app desde un archivo local (file://). ' +
                    'Por seguridad, los navegadores bloquean el motor de procesamiento en este modo. ' +
                    'Debes abrir la aplicación usando un servidor local (ej: Live Server de VS Code o npm start).';
            }

            alert('Error Crítico FFmpeg: ' + error.message + extraMsg);
            btn.disabled = false;
            btn.innerHTML = 'Reintentar Carga';
        }
    },

    loadScript(url) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${url}"]`)) return resolve();
            const s = document.createElement('script');
            s.src = url;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    },

    handleFileSelect(input) {
        if (!input.files || !input.files[0]) return;
        this.selectedFile = input.files[0];

        document.getElementById('conv-file-info').classList.remove('hidden');
        document.getElementById('conv-file-info').classList.add('flex');
        document.getElementById('btn-run-conv').classList.remove('hidden');
        document.getElementById('conv-filename').textContent = this.selectedFile.name;
        document.getElementById('conv-filesize').textContent = (this.selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB';
    },

    updateProgress(pct) {
        const bar = document.getElementById('conv-progress-bar');
        const text = document.getElementById('conv-pct-text');
        if (bar) bar.style.width = pct + '%';
        if (text) text.textContent = pct + '%';
    },

    async runConversion(toolId) {
        if (!this.selectedFile || !this.ffmpeg) return;

        const btn = document.getElementById('btn-run-conv');
        const progressArea = document.getElementById('conv-progress-area');
        const statusText = document.getElementById('conv-status-text');
        const resultArea = document.getElementById('conv-result-area');
        const targetFormat = document.getElementById('conv-target-format').value;

        btn.disabled = true;
        btn.classList.add('opacity-50');
        progressArea.classList.remove('hidden');
        resultArea.classList.add('hidden');
        this.updateProgress(0);

        try {
            const { fetchFile, toBlobURL } = this.utilLib;
            const inputName = 'input' + this.selectedFile.name.substring(this.selectedFile.name.lastIndexOf('.'));
            const outputName = `output.${targetFormat}`;

            statusText.textContent = 'Leyendo archivo...';
            await this.ffmpeg.writeFile(inputName, await fetchFile(this.selectedFile));

            statusText.textContent = 'Procesando...';

            let args = [];
            if (toolId === 'audio-extract') {
                args = ['-i', inputName, '-vn', '-ab', '192k', '-ar', '44100', '-y', outputName];
            } else if (toolId === 'audio-conv') {
                args = ['-i', inputName, '-y', outputName];
            } else if (toolId === 'video-conv') {
                args = ['-i', inputName, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '28', '-c:a', 'aac', '-y', outputName];
                if (targetFormat === 'webm') {
                    args = ['-i', inputName, '-c:v', 'libvpx', '-b:v', '1M', '-c:a', 'libvorbis', '-y', outputName];
                }
            }

            await this.ffmpeg.exec(args);

            statusText.textContent = 'Finalizando...';
            const data = await this.ffmpeg.readFile(outputName);
            const blob = new Blob([data.buffer], { type: toolId.includes('video') ? 'video/' + targetFormat : 'audio/' + targetFormat });
            const url = URL.createObjectURL(blob);

            const downloadBtn = document.getElementById('conv-download-btn');
            downloadBtn.href = url;
            downloadBtn.download = `jachal_admin_${Date.now()}.${targetFormat}`;

            resultArea.classList.remove('hidden');
            statusText.textContent = '¡Listo!';

        } catch (error) {
            console.error('Processing Error:', error);
            alert('Error en el procesamiento: ' + error.message);
        } finally {
            btn.disabled = false;
            btn.classList.remove('opacity-50');
        }
    },

    getApiConfigUI() {
        return `
            <div class="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="space-y-6">
                    <div class="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h4 class="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <i class="fas fa-cog text-blue-500"></i> Ajustes de Conexión
                        </h4>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium mb-1">OpenAI API Key (u otra compatible)</label>
                                <div class="relative">
                                    <input type="password" id="config-api-key" value="${this.apiKey}" class="w-full p-3 pl-10 border rounded-lg dark:bg-slate-900 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500" placeholder="sk-...">
                                    <i class="fas fa-key absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium mb-1">Base URL (Endpoint)</label>
                                <input type="text" id="config-base-url" value="${this.baseUrl}" class="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://api.openai.com/v1">
                                <p class="text-[10px] text-slate-500 mt-1 italic">Por defecto: https://api.openai.com/v1</p>
                            </div>

                            <button onclick="MediaModule.saveConfig()" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all shadow-lg shadow-blue-600/20 mt-2">
                                Guardar Configuración
                            </button>
                        </div>
                    </div>
                </div>

                <div class="space-y-6">
                    <div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-6">
                        <h4 class="font-bold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
                            <i class="fas fa-gift"></i> Opciones Gratuitas
                        </h4>
                        
                        <div class="space-y-4 text-sm text-emerald-700 dark:text-emerald-400 leading-relaxed">
                            <div class="p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                                <p class="font-bold mb-1 underline">1. Créditos de Prueba de OpenAI</p>
                                <p>Las cuentas nuevas suelen recibir $5-$18 gratis por 3 meses. Revisa en: <a href="https://platform.openai.com/usage" target="_blank" class="font-bold">Usage Dashboard</a>.</p>
                            </div>

                            <div class="p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                                <p class="font-bold mb-1 underline">2. Groq (Ultra rápido y Gratis)</p>
                                <p>Ofrece una API compatible con OpenAI con capa gratuita generosa y el modelo Whisper más rápido del mundo.</p>
                                <ul class="list-disc list-inside mt-2 text-xs space-y-1">
                                    <li>Obtén tu key en <a href="https://console.groq.com/keys" target="_blank" class="font-bold">Groq Console</a></li>
                                    <li>Usa Base URL: <code class="bg-emerald-100 dark:bg-emerald-800 px-1 rounded text-[10px]">https://api.groq.com/openai/v1</code></li>
                                </ul>
                            </div>

                            <div class="p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                                <p class="font-bold mb-1 underline">3. OpenRouter</p>
                                <p>Agrupa muchos modelos. Hay modelos gratuitos (como Llama 3) disponibles permanentemente.</p>
                                <ul class="list-disc list-inside mt-2 text-xs">
                                    <li>Base URL: <code class="bg-emerald-100 dark:bg-emerald-800 px-1 rounded text-[10px]">https://openrouter.ai/api/v1</code></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

window.MediaModule = MediaModule;
