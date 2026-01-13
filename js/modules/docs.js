/**
 * Document Management Module
 * Handles PDF operations: Conversion, Merging, Security, Signing
 */

const DocsModule = {
    // State
    mergeFiles: [],
    imgFiles: [],
    securityFile: null,
    signFile: null,
    pdfToWordFile: null,
    signaturePad: null,

    init() {
        console.log('Docs Module Initialized');
        // Load dependencies if needed
        if (!window.PDFLib) {
            this.loadPDFLib();
        }
    },

    loadPDFLib() {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
        script.onload = () => {
            console.log('PDF-Lib loaded');
            window.PDFLib = PDFLib;
        };
        document.head.appendChild(script);

        // Also load PDF.js for rendering/OCR if needed later
        const script2 = document.createElement('script');
        script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        document.head.appendChild(script2);
        script2.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        };

        // Load Tesseract for OCR
        if (!window.Tesseract) {
            const script3 = document.createElement('script');
            script3.src = 'https://unpkg.com/tesseract.js@v4.1.1/dist/tesseract.min.js';
            document.head.appendChild(script3);
        }
    },

    getTemplate() {
        return `
            <div class="flex flex-col gap-6">
                <!-- Header -->
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-xl font-bold">Gestión Documental</h2>
                        <p class="text-muted">Herramientas para procesar archivos PDF y Office.</p>
                    </div>
                </div>

                <!-- Tools Grid -->
                <div id="tools-grid" class="tools-grid-3 transition-all">
                    ${this.createToolCard('pdf-to-word', 'PDF a Word', 'fa-file-word', 'Convertir documentos PDF a Word editable.', 'icon-blue')}
                    ${this.createToolCard('img-to-pdf', 'Imagen a PDF', 'fa-images', 'Crear PDF desde imágenes escaneadas.', 'icon-teal')}
                    ${this.createToolCard('split-pdf', 'Dividir PDF', 'fa-cut', 'Extraer páginas o dividir documento.', 'icon-pink')}
                    ${this.createToolCard('merge-pdf', 'Combinar PDF', 'fa-layer-group', 'Unir varios archivos PDF en uno solo.', 'icon-purple')}
                    ${this.createToolCard('protect-pdf', 'Seguridad PDF', 'fa-user-shield', 'Encriptar o quitar contraseñas.', 'icon-red')}
                    ${this.createToolCard('sign-pdf', 'Firma Digital', 'fa-signature', 'Firmar documentos digitalmente.', 'icon-amber')}
                </div>

                <!-- Active Tool Area (Hidden by default) -->
                <div id="tool-workspace" class="hidden h-screen fixed inset-0 z-50 bg-white dark:bg-slate-900 overflow-y-auto">
                    <div class="max-w-5xl mx-auto px-4 py-8">
                        <div class="flex items-center justify-between mb-8">
                             <button onclick="DocsModule.closeTool()" class="flex items-center text-muted hover:text-main transition-colors">
                                <i class="fas fa-arrow-left mr-2"></i> Volver a Herramientas
                            </button>
                            <h3 id="workspace-title" class="text-2xl font-bold">Herramienta</h3>
                            <div class="w-8"></div> <!-- Spacer for centering -->
                        </div>
                        
                        <div id="workspace-content" class="card p-8 min-h-[500px]">
                            <!-- Dynamic Content -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    createToolCard(id, title, icon, desc, colorClass) {
        return `
            <div onclick="DocsModule.openTool('${id}', '${title}')" class="card cursor-pointer group hover:shadow-md transition-all">
                <div class="flex items-center gap-4 mb-3">
                    <div class="card-icon ${colorClass} w-10 h-10 text-lg mb-0 text-white">
                        <i class="fas ${icon}"></i>
                    </div>
                    <h3 class="font-bold text-sm">${title}</h3>
                </div>
                <p class="text-xs text-muted">${desc}</p>
            </div>
        `;
    },

    openTool(toolId, title) {
        const workspace = document.getElementById('tool-workspace');
        const workspaceTitle = document.getElementById('workspace-title');
        const workspaceContent = document.getElementById('workspace-content');

        workspace.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Lock scroll
        workspaceTitle.textContent = title;

        this.renderToolUI(toolId, workspaceContent);
    },

    closeTool() {
        const workspace = document.getElementById('tool-workspace');
        workspace.classList.add('hidden');
        document.body.style.overflow = ''; // Unlock scroll
        document.getElementById('workspace-content').innerHTML = ''; // Clean up
    },

    renderToolUI(toolId, container) {
        container.innerHTML = `<div class="p-8 text-center"><i class="fas fa-circle-notch fa-spin text-3xl text-blue-500 mb-4"></i><p>Cargando interfaz para ${toolId}...</p></div>`;

        // Simulate loading
        setTimeout(() => {
            switch (toolId) {
                case 'split-pdf':
                    container.innerHTML = this.getSplitUI();
                    this.initFileListener('split-input', 'split');
                    break;
                case 'merge-pdf':
                    container.innerHTML = this.getMergeUI();
                    this.initDragAndDrop('drop-zone-merge', 'pdf');
                    break;
                case 'img-to-pdf':
                    container.innerHTML = this.getImgToPdfUI();
                    this.initDragAndDrop('drop-zone-img', 'img');
                    break;
                case 'sign-pdf':
                    container.innerHTML = this.getSignUI();
                    this.initSignaturePad();
                    this.initFileListener('sign-input', 'sign');
                    break;
                case 'protect-pdf':
                    container.innerHTML = this.getSecurityUI();
                    this.initFileListener('security-input', 'security');
                    break;
                case 'pdf-to-word':
                    container.innerHTML = this.getPdfToWordUI();
                    this.initFileListener('pdf-word-input', 'pdf-word');
                    break;
                default:
                    container.innerHTML = `<div class="p-4 bg-slate-50 rounded-lg text-center dark:bg-slate-700/30">Interfaz para <strong>${toolId}</strong> en construcción.</div>`;
            }
        }, 500);
    },

    // --- Split PDF Logic ---
    // --- Split PDF Logic ---
    getSplitUI() {
        return `
            <div class="max-w-xl mx-auto space-y-6">
                 <div class="border-2 border-dashed border-color rounded-xl p-6 text-center cursor-pointer relative hover:bg-slate-50">
                    <input type="file" id="split-input" accept=".pdf" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                    <i class="fas fa-cut text-3xl text-pink-400 mb-3"></i>
                    <p class="text-sm font-medium" id="split-filename">Sube PDF para dividir</p>
                </div>

                <div>
                    <label class="input-label">Rango de páginas a extraer</label>
                    <input type="text" id="split-range" class="form-input" placeholder="Ej: 1-3, 5, 7-9">
                    <p class="text-xs text-muted mt-1">Usa comas para separar y guiones para rangos.</p>
                </div>
                
                <button onclick="DocsModule.splitPDF()" id="btn-split" class="btn btn-primary w-full py-3" style="background-color: var(--pink-600);">
                    Dividir PDF
                </button>
            </div>
        `;
    },

    // ... (splitPDF Fn) ...

    // --- Merge PDF Logic ---
    getMergeUI() {
        this.mergeFiles = []; // Reset
        return `
            <div class="max-w-2xl mx-auto">
                <div id="drop-zone-merge" class="border-2 border-dashed border-color rounded-xl p-10 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                    <input type="file" id="file-input-merge" multiple accept=".pdf" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                    <i class="fas fa-cloud-upload-alt text-4xl text-muted mb-4"></i>
                    <p class="text-lg font-medium">Arrastra tus archivos PDF aquí</p>
                    <p class="text-sm text-muted mt-2">o haz clic para seleccionar</p>
                </div>
                
                <div id="file-list-merge" class="mt-6 space-y-2"></div>
                
                <button onclick="DocsModule.mergePDFs()" id="btn-merge" class="btn btn-primary w-full mt-6 py-3">
                    Combinar Archivos
                </button>
            </div>
        `;
    },

    // ... (mergePDFs Fn) ...

    // --- Image to PDF Logic ---
    getImgToPdfUI() {
        this.imgFiles = [];
        return `
             <div class="max-w-2xl mx-auto">
                <div id="drop-zone-img" class="border-2 border-dashed border-color rounded-xl p-10 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                    <input type="file" multiple accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                    <i class="fas fa-image text-4xl text-muted mb-4"></i>
                    <p class="text-lg font-medium">Arrastra imágenes aquí</p>
                    <p class="text-sm text-muted mt-2">JPG, PNG soportados</p>
                </div>
                 <div id="file-list-img" class="mt-6 space-y-2"></div>
                 
                 <button onclick="DocsModule.convertImgToPdf()" id="btn-img-pdf" class="btn btn-primary w-full mt-6 py-3" style="background-color: var(--teal-600);">
                    Crear PDF
                </button>
            </div>
        `;
    },

    // ... (convertImgToPdf Fn) ...

    // --- Signature Logic ---
    getSignUI() {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <h4 class="font-medium mb-4">1. Sube el PDF</h4>
                    <div class="border-2 border-dashed border-color rounded-xl p-6 text-center cursor-pointer relative hover:bg-slate-50 mb-4">
                        <input type="file" id="sign-input" accept=".pdf" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                        <i class="fas fa-file-pdf text-3xl text-red-500 mb-3"></i>
                        <p class="text-sm font-medium" id="sign-filename">Haz clic para subir PDF</p>
                    </div>
                 </div>

                <div>
                    <h4 class="font-medium mb-4">2. Dibuja tu Firma</h4>
                    <div class="border rounded-xl p-4 bg-white dark:bg-slate-900 border-color">
                        <canvas id="signature-pad" class="w-full h-48 border border-slate-300 rounded-lg cursor-crosshair bg-white"></canvas>
                        <div class="flex justify-between mt-4">
                            <button onclick="DocsModule.clearSignature()" class="text-sm text-red-500 hover:text-red-700">Borrar</button>
                        </div>
                    </div>
                </div>

                <div class="md:col-span-2">
                     <button onclick="DocsModule.applySignature()" id="btn-sign" class="btn btn-primary w-full py-3" style="background-color: var(--amber-600);">
                        Firmar y Descargar
                    </button>
                </div>
            </div>
        `;
    },

    // ... (Signature Fn) ...

    // --- Security Logic ---
    getSecurityUI() {
        return `
            <div class="max-w-xl mx-auto space-y-6">
                 <div class="border-2 border-dashed border-color rounded-xl p-6 text-center cursor-pointer relative hover:bg-slate-50">
                    <input type="file" id="security-input" accept=".pdf" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                    <i class="fas fa-lock text-3xl text-muted mb-3"></i>
                    <p class="text-sm font-medium" id="security-filename">Sube PDF para proteger</p>
                </div>

                <div>
                    <label class="input-label">Contraseña</label>
                    <input type="password" id="pdf-password" class="form-input" placeholder="Escribe la contraseña">
                </div>
                
                <button onclick="DocsModule.encryptPDF()" id="btn-encrypt" class="btn btn-primary w-full py-3" style="background-color: var(--red-600);">
                    Proteger PDF
                </button>
            </div>
        `;
    },

    // ... (Encrypt Fn) ...

    // --- PDF Editor & Extract Logic ---

    getPdfToWordUI() {
        return `
            <div id="pdf-upload-view" class="max-w-xl mx-auto space-y-6">
                 <div class="border-2 border-dashed border-color rounded-xl p-6 text-center cursor-pointer relative hover:bg-slate-50">
                    <input type="file" id="pdf-word-input" accept=".pdf" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                    <i class="fas fa-file-word text-3xl text-blue-400 mb-3"></i>
                    <p class="text-sm font-medium" id="pdf-word-filename">Sube PDF para editar y convertir</p>
                </div>
                <button onclick="DocsModule.analyzeAndLoadEditor()" id="btn-analyze" class="btn btn-primary w-full py-3">
                    Analizar y Abrir Editor
                </button>
            </div>

            <!-- EDITOR VIEW (Hidden initially) -->
            <div id="pdf-editor-view" class="hidden flex h-[calc(100vh-200px)]">
                <!-- Sidebar -->
                <div class="w-64 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 p-4 flex flex-col gap-4">
                    <h3 class="font-bold text-sm uppercase text-muted">Capas y Elementos</h3>
                    
                    <div class="space-y-2">
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" checked onchange="DocsModule.toggleLayer('text', this.checked)" class="rounded text-blue-600">
                            <span class="text-sm"><i class="fas fa-font w-5 text-center"></i> Texto</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" checked onchange="DocsModule.toggleLayer('images', this.checked)" class="rounded text-green-600">
                            <span class="text-sm"><i class="fas fa-image w-5 text-center"></i> Imágenes</span>
                        </label>
                    </div>

                    <div class="border-t border-slate-200 my-2"></div>

                    <div id="selection-controls" class="hidden">
                        <p class="text-xs text-muted mb-2 font-bold">Seleccionado:</p>
                        <button onclick="DocsModule.deleteSelected()" class="btn btn-sm bg-red-100 text-red-600 hover:bg-red-200 w-full mb-2">
                            <i class="fas fa-trash mr-1"></i> Eliminar
                        </button>
                         <p class="text-xs text-muted italic">Click en una imagen para seleccionar.</p>
                    </div>

                    <div class="mt-auto">
                        <button onclick="DocsModule.exportDocx()" class="btn btn-primary w-full shadow-lg">
                            <i class="fas fa-file-export mr-2"></i> Exportar a Word
                        </button>
                        <button onclick="DocsModule.closeEditor()" class="btn btn-ghost w-full mt-2 text-sm text-muted">
                            Cancelar
                        </button>
                    </div>
                </div>

                <!-- Main Canvas -->
                <div class="flex-1 bg-slate-200 overflow-auto p-8 relative flex justify-center">
                    <div id="editor-pages" class="shadow-2xl">
                        <!-- Pages will be rendered here -->
                    </div>
                </div>
            </div>
        `;
    },

    activeSelection: null,

    async analyzeAndLoadEditor() {
        if (!this.pdfToWordFile) { alert('Sube un archivo primero'); return; }

        const btn = document.getElementById('btn-analyze');
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Analizando...';
        btn.disabled = true;

        try {
            const file = this.pdfToWordFile;
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument(arrayBuffer);
            const pdf = await loadingTask.promise;

            const editorContainer = document.getElementById('editor-pages');
            editorContainer.innerHTML = ''; // Clear

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);

                // --- SVG DECONSTRUCTION STRATEGY (High Fidelity Vectors) ---

                // 1. Render Vectors (Background)
                const opList = await page.getOperatorList();
                const svgGfx = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs);
                const svg = await svgGfx.getSVG(opList, viewport);

                // 2. Clean SVG (Remove Text and Images, keep Paths/Shapes/Colors)
                const svgTextItems = svg.querySelectorAll('text, tspan');
                svgTextItems.forEach(el => el.remove());
                const svgImages = svg.querySelectorAll('image');
                svgImages.forEach(el => el.remove());

                // Serialize SVG to Data URL
                const serializer = new XMLSerializer();
                let svgStr = serializer.serializeToString(svg);
                const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
                const svgUrl = URL.createObjectURL(svgBlob);

                // 3. Extract Images (Existing Logic)
                const extractedImages = [];
                // Ops are already loaded
                const ops = opList;
                const multiply = (m1, m2) => [
                    m1[0] * m2[0] + m1[1] * m2[2], m1[0] * m2[1] + m1[1] * m2[3],
                    m1[2] * m2[0] + m1[3] * m2[2], m1[2] * m2[1] + m1[3] * m2[3],
                    m1[4] * m2[0] + m1[5] * m2[2] + m2[4], m1[4] * m2[1] + m1[5] * m2[3] + m2[5]
                ];
                let ctm = [1, 0, 0, 1, 0, 0];
                const transformStack = [];

                for (let opIdx = 0; opIdx < ops.fnArray.length; opIdx++) {
                    const fn = ops.fnArray[opIdx];
                    const args = ops.argsArray[opIdx];
                    if (fn === pdfjsLib.OPS.save) transformStack.push([...ctm]);
                    else if (fn === pdfjsLib.OPS.restore) { if (transformStack.length > 0) ctm = transformStack.pop(); }
                    else if (fn === pdfjsLib.OPS.transform) ctm = multiply(ctm, args);
                    else if (fn === pdfjsLib.OPS.paintImageXObject) {
                        const imgName = args[0];
                        try {
                            const imgObj = await page.objs.get(imgName);
                            if (imgObj) {
                                const x = ctm[4]; const y = ctm[5];
                                const w = Math.sqrt(ctm[0] * ctm[0] + ctm[1] * ctm[1]);
                                const h = Math.sqrt(ctm[2] * ctm[2] + ctm[3] * ctm[3]);

                                const tCanvas = document.createElement('canvas');
                                tCanvas.width = imgObj.width; tCanvas.height = imgObj.height;
                                const tCtx = tCanvas.getContext('2d');
                                if (imgObj.data) {
                                    tCtx.putImageData(new ImageData(new Uint8ClampedArray(imgObj.data), imgObj.width, imgObj.height), 0, 0);
                                } else {
                                    tCtx.drawImage(imgObj, 0, 0);
                                }
                                extractedImages.push({ src: tCanvas.toDataURL('image/png'), x, y, w, h });
                            }
                        } catch (e) { }
                    }
                }

                // Note: No need to "erase" images from SVG background, we removed <image> tags!
                // No need to "erase" text, we removed <text> tags!

                const textContent = await page.getTextContent();
                const items = textContent.items;

                const pdfVP = page.getViewport({ scale: 1.0 });

                // --- RENDER DOM PAGE ---
                const pageDiv = document.createElement('div');
                pageDiv.className = 'editor-page relative bg-white shadow-lg mb-8';
                pageDiv.style.width = `${pdfVP.width}pt`;
                pageDiv.style.height = `${pdfVP.height}pt`;

                // 1. Background (SVG Vectors)
                const bgImg = document.createElement('img');
                bgImg.src = svgUrl;
                bgImg.style.cssText = 'position:absolute; left:0; top:0; width:100%; height:100%; z-index:0; user-select:none; pointer-events:none;';
                pageDiv.appendChild(bgImg);

                // 2. Images
                extractedImages.forEach((img, idx) => {
                    const imgEl = document.createElement('img');
                    imgEl.src = img.src;
                    const top = pdfVP.height - (img.y + img.h);
                    imgEl.style.cssText = `position:absolute; left:${img.x}pt; top:${top}pt; width:${img.w}pt; height:${img.h}pt; z-index:1; cursor:pointer; padding:2px;`;
                    imgEl.className = 'layer-image hover:ring-2 hover:ring-blue-400';
                    imgEl.onclick = (e) => this.selectElement(e.target);
                    pageDiv.appendChild(imgEl);
                });

                // 3. Text
                items.forEach(item => {
                    if (!item.str.trim()) return;
                    const tx = item.transform;
                    const h = item.height || Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]);
                    // const w = item.width;
                    const x = tx[4]; const y = tx[5];

                    const el = document.createElement('div');
                    const top = pdfVP.height - y - (h * 0.8);

                    el.contentEditable = true;
                    el.className = 'layer-text outline-none hover:bg-yellow-50 focus:bg-white focus:ring-1 focus:ring-blue-300';
                    el.style.cssText = `
                        position:absolute; left:${x}pt; top:${top}pt; 
                        font-size:${h}pt; font-family:sans-serif; 
                        white-space:nowrap; z-index:2; line-height:1; color:black;
                    `;
                    el.innerText = item.str;
                    pageDiv.appendChild(el);
                });

                editorContainer.appendChild(pageDiv);
            }

            // Switch Views
            document.getElementById('pdf-upload-view').classList.add('hidden');
            document.getElementById('pdf-editor-view').classList.remove('hidden');

        } catch (e) {
            console.error(e);
            alert('Error al analizar PDF: ' + e.message);
        } finally {
            btn.innerHTML = 'Analizar y Abrir Editor';
            btn.disabled = false;
        }
    },

    selectElement(el) {
        if (this.activeSelection) {
            this.activeSelection.classList.remove('ring-4', 'ring-red-500');
        }
        this.activeSelection = el;
        el.classList.add('ring-4', 'ring-red-500');
        document.getElementById('selection-controls').classList.remove('hidden');
    },

    deleteSelected() {
        if (this.activeSelection) {
            this.activeSelection.remove();
            this.activeSelection = null;
            document.getElementById('selection-controls').classList.add('hidden');
        }
    },

    toggleLayer(type, visible) {
        const cls = type === 'text' ? '.layer-text' : '.layer-image';
        const els = document.querySelectorAll(cls);
        els.forEach(el => el.style.display = visible ? 'block' : 'none');
    },

    closeEditor() {
        document.getElementById('pdf-editor-view').classList.add('hidden');
        document.getElementById('pdf-upload-view').classList.remove('hidden');
        document.getElementById('editor-pages').innerHTML = '';
    },

    exportDocx() {
        // Collect HTML from Editor Pages
        const pages = document.querySelectorAll('.editor-page');
        let fullBody = '';

        pages.forEach(page => {
            // Clone to avoid modifying editor directly during export processing?
            // Actually we can just serialize the outerHTML but we need to ensure styles are inline.
            // DOM properties usually serialize nicely.

            // We need to wrap in relative wrapper for Word
            fullBody += `
                <div style="position:relative; width:${page.style.width}; height:${page.style.height}; page-break-after:always; margin-bottom:20px; overflow:hidden;">
                    ${page.innerHTML} 
                </div>
            `;
        });

        this.createWordFromHtml(fullBody, this.pdfToWordFile ? this.pdfToWordFile.name : 'documento');
    },

    createWordFromHtml(bodyContent, filename) {
        const fullHtml = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>Document</title>
                <!-- Word-specific styles -->
                <style>
                    body { font-family: Arial; }
                    p { margin: 0; }
                </style>
            </head>
            <body>
                ${bodyContent}
            </body>
            </html>
        `;

        const blob = new Blob(['\ufeff', fullHtml], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = (filename ? filename.split('.')[0] : 'documento') + '.doc';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // --- Helpers ---

    initDragAndDrop(id, type) {
        const zone = document.getElementById(id);
        const input = zone.querySelector('input');

        input.addEventListener('change', (e) => {
            this.handleFiles(e.target.files, type);
        });
    },

    initFileListener(id, stateKey) {
        document.getElementById(id).addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (stateKey === 'sign') {
                this.signFile = file;
                document.getElementById('sign-filename').innerText = file.name;
            }
            else if (stateKey === 'security') {
                this.securityFile = file;
                document.getElementById('security-filename').innerText = file.name;
            }
            else if (stateKey === 'pdf-word') {
                this.pdfToWordFile = file;
                document.getElementById('pdf-word-filename').innerText = file.name;
            }
            else if (stateKey === 'split') {
                this.splitFile = file;
                document.getElementById('split-filename').innerText = file.name;
            }
        });
    },

    handleFiles(files, type) {
        console.log('Files selected:', files);

        if (type === 'pdf') {
            Array.from(files).forEach(file => {
                if (file.type === 'application/pdf') {
                    this.mergeFiles.push(file);
                }
            });
            this.renderFileList('file-list-merge', this.mergeFiles, 'pdf');
        } else if (type === 'img') {
            Array.from(files).forEach(file => {
                if (file.type.startsWith('image/')) {
                    this.imgFiles.push(file);
                }
            });
            this.renderFileList('file-list-img', this.imgFiles, 'img');
        }
    },

    renderFileList(elementId, fileArray, type) {
        const list = document.getElementById(elementId);
        if (!list) return;

        list.innerHTML = '';
        fileArray.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600';
            let iconColor = type === 'pdf' ? 'text-red-500' : 'text-blue-500';
            let iconClass = type === 'pdf' ? 'fa-file-pdf' : 'fa-image';

            item.innerHTML = `
                <div class="flex items-center gap-3">
                    <i class="fas ${iconClass} ${iconColor}"></i>
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-200">${file.name}</span>
                    <span class="text-xs text-slate-400">(${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <!-- Pass type so we know which array to splice from -->
                <button onclick="DocsModule.removeFile(${index}, '${type}')" class="text-slate-400 hover:text-red-500"><i class="fas fa-trash"></i></button>
            `;
            list.appendChild(item);
        });
    },

    removeFile(index, type) {
        if (type === 'pdf') {
            this.mergeFiles.splice(index, 1);
            this.renderFileList('file-list-merge', this.mergeFiles, 'pdf');
        } else if (type === 'img') {
            this.imgFiles.splice(index, 1);
            this.renderFileList('file-list-img', this.imgFiles, 'img');
        }
    },

    downloadBlob(data, fileName, mimeType) {
        const blob = new Blob([data], { type: mimeType });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
    }
};

window.DocsModule = DocsModule;
