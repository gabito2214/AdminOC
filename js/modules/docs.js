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
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-800 dark:text-white">Gestión Documental</h2>
                        <p class="text-slate-500 dark:text-slate-400">Herramientas para procesar archivos PDF y Office.</p>
                    </div>
                </div>

                <!-- Tools Grid -->
                <div id="tools-grid" class="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all">
                    ${this.createToolCard('pdf-to-word', 'PDF a Word', 'fa-file-word', 'Convertir documentos PDF a Word editable.', 'bg-blue-50 text-blue-600')}
                    ${this.createToolCard('img-to-pdf', 'Imagen a PDF', 'fa-images', 'Crear PDF desde imágenes escaneadas.', 'bg-green-50 text-green-600')}
                    ${this.createToolCard('split-pdf', 'Dividir PDF', 'fa-cut', 'Extraer páginas o dividir documento.', 'bg-pink-50 text-pink-600')}
                    ${this.createToolCard('merge-pdf', 'Combinar PDF', 'fa-layer-group', 'Unir varios archivos PDF en uno solo.', 'bg-purple-50 text-purple-600')}
                    ${this.createToolCard('protect-pdf', 'Seguridad PDF', 'fa-user-shield', 'Encriptar o quitar contraseñas.', 'bg-red-50 text-red-600')}
                    ${this.createToolCard('sign-pdf', 'Firma Digital', 'fa-signature', 'Firmar documentos digitalmente.', 'bg-amber-50 text-amber-600')}
                </div>

                <!-- Active Tool Area (Hidden by default) -->
                <div id="tool-workspace" class="hidden h-screen fixed inset-0 z-50 bg-slate-50 dark:bg-slate-900 overflow-y-auto">
                    <div class="max-w-5xl mx-auto px-4 py-8">
                        <div class="flex items-center justify-between mb-8">
                             <button onclick="DocsModule.closeTool()" class="flex items-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                                <i class="fas fa-arrow-left mr-2"></i> Volver a Herramientas
                            </button>
                            <h3 id="workspace-title" class="text-2xl font-bold text-slate-800 dark:text-white">Herramienta</h3>
                            <div class="w-8"></div> <!-- Spacer for centering -->
                        </div>
                        
                        <div id="workspace-content" class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 min-h-[500px]">
                            <!-- Dynamic Content -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    createToolCard(id, title, icon, desc, colorClass) {
        return `
            <div onclick="DocsModule.openTool('${id}', '${title}')" class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group">
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
    getSplitUI() {
        return `
            <div class="max-w-xl mx-auto space-y-6">
                 <div class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center cursor-pointer relative hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <input type="file" id="split-input" accept=".pdf" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                    <i class="fas fa-cut text-3xl text-pink-400 mb-3"></i>
                    <p class="text-sm font-medium" id="split-filename">Sube PDF para dividir</p>
                </div>

                <div>
                    <label class="block text-sm font-medium mb-1">Rango de páginas a extraer</label>
                    <input type="text" id="split-range" class="w-full p-3 border rounded-lg dark:bg-slate-800 dark:border-slate-600 outline-none focus:border-pink-500" placeholder="Ej: 1-3, 5, 7-9">
                    <p class="text-xs text-slate-500 mt-1">Usa comas para separar y guiones para rangos.</p>
                </div>
                
                <button onclick="DocsModule.splitPDF()" id="btn-split" class="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    Dividir PDF
                </button>
            </div>
        `;
    },

    async splitPDF() {
        if (!this.splitFile) {
            alert('Sube un PDF primero.');
            return;
        }

        const rangeStr = document.getElementById('split-range').value;
        if (!rangeStr) {
            alert('Indica qué páginas extraer.');
            return;
        }

        const btn = document.getElementById('btn-split');
        btn.innerHTML = 'Procesando...';
        btn.disabled = true;

        try {
            const arrayBuffer = await this.splitFile.arrayBuffer();
            const PDFDocument = window.PDFLib.PDFDocument;
            const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const newPdf = await PDFDocument.create();

            const totalPages = srcPdf.getPageCount();
            const pagesToCopy = this.parsePageRange(rangeStr, totalPages);

            if (pagesToCopy.length === 0) throw new Error('Rango inválido o fuera de límites.');

            const copiedPages = await newPdf.copyPages(srcPdf, pagesToCopy);
            copiedPages.forEach((page) => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            this.downloadBlob(pdfBytes, `extraido_${rangeStr}.pdf`, 'application/pdf');

            btn.innerHTML = '¡Completado!';
            setTimeout(() => { btn.innerHTML = 'Dividir PDF'; btn.disabled = false; }, 2000);

        } catch (e) {
            console.error(e);
            alert('Error: ' + e.message);
            btn.innerHTML = 'Dividir PDF';
            btn.disabled = false;
        }
    },

    parsePageRange(rangeStr, totalPages) {
        // "1-3, 5" -> [0, 1, 2, 4] (0-indexed)
        const pages = new Set();
        const parts = rangeStr.split(',');

        parts.forEach(part => {
            const trimmed = part.trim();
            if (trimmed.includes('-')) {
                const [start, end] = trimmed.split('-').map(Number);
                if (!isNaN(start) && !isNaN(end)) {
                    for (let i = start; i <= end; i++) {
                        if (i > 0 && i <= totalPages) pages.add(i - 1);
                    }
                }
            } else {
                const num = Number(trimmed);
                if (!isNaN(num) && num > 0 && num <= totalPages) {
                    pages.add(num - 1);
                }
            }
        });
        return Array.from(pages).sort((a, b) => a - b);
    },

    // --- Merge PDF Logic ---
    getMergeUI() {
        this.mergeFiles = []; // Reset
        return `
            <div class="max-w-2xl mx-auto">
                <div id="drop-zone-merge" class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-10 text-center hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer relative">
                    <input type="file" id="file-input-merge" multiple accept=".pdf" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                    <i class="fas fa-cloud-upload-alt text-4xl text-slate-400 mb-4"></i>
                    <p class="text-lg font-medium text-slate-700 dark:text-slate-200">Arrastra tus archivos PDF aquí</p>
                    <p class="text-sm text-slate-500 mt-2">o haz clic para seleccionar</p>
                </div>
                
                <div id="file-list-merge" class="mt-6 space-y-2"></div>
                
                <button onclick="DocsModule.mergePDFs()" id="btn-merge" class="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    Combinar Archivos
                </button>
            </div>
        `;
    },

    async mergePDFs() {
        const btn = document.getElementById('btn-merge');

        if (this.mergeFiles.length < 2) {
            alert('Por favor selecciona al menos 2 archivos PDF.');
            return;
        }

        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Procesando...';
        btn.disabled = true;

        try {
            const PDFDocument = window.PDFLib.PDFDocument;
            const mergedPdf = await PDFDocument.create();

            for (const file of this.mergeFiles) {
                const arrayBuffer = await file.arrayBuffer();
                try {
                    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
                    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                    copiedPages.forEach((page) => mergedPdf.addPage(page));
                } catch (e) {
                    console.warn('Skipping file due to load error:', file.name, e);
                    alert('No se pudo procesar ' + file.name + '. Puede estar protegido con contraseÃ±a.');
                }
            }

            const pdfBytes = await mergedPdf.save();
            this.downloadBlob(pdfBytes, 'documento_unido.pdf', 'application/pdf');

            btn.innerHTML = '¡Completado!';
            setTimeout(() => {
                btn.innerHTML = 'Combinar Archivos';
                btn.disabled = false;
            }, 2000);

        } catch (error) {
            console.error(error);
            alert('Error al unir PDFs: ' + error.message);
            btn.innerHTML = 'Combinar Archivos';
            btn.disabled = false;
        }
    },

    // --- Image to PDF Logic ---
    getImgToPdfUI() {
        this.imgFiles = [];
        return `
             <div class="max-w-2xl mx-auto">
                <div id="drop-zone-img" class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-10 text-center hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer relative">
                    <input type="file" multiple accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                    <i class="fas fa-image text-4xl text-slate-400 mb-4"></i>
                    <p class="text-lg font-medium text-slate-700 dark:text-slate-200">Arrastra imágenes aquí</p>
                    <p class="text-sm text-slate-500 mt-2">JPG, PNG soportados</p>
                </div>
                 <div id="file-list-img" class="mt-6 space-y-2"></div>
                 
                 <button onclick="DocsModule.convertImgToPdf()" id="btn-img-pdf" class="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    Crear PDF
                </button>
            </div>
        `;
    },

    async convertImgToPdf() {
        const btn = document.getElementById('btn-img-pdf');

        if (this.imgFiles.length < 1) {
            alert('Por favor selecciona al menos 1 imagen.');
            return;
        }

        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Procesando...';
        btn.disabled = true;

        try {
            const PDFDocument = window.PDFLib.PDFDocument;
            const pdfDoc = await PDFDocument.create();

            for (const file of this.imgFiles) {
                const arrayBuffer = await file.arrayBuffer();
                let image;
                if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                    image = await pdfDoc.embedJpg(arrayBuffer);
                } else if (file.type === 'image/png') {
                    image = await pdfDoc.embedPng(arrayBuffer);
                } else {
                    continue; // Skip unsupported
                }

                const page = pdfDoc.addPage([image.width, image.height]);
                page.drawImage(image, {
                    x: 0,
                    y: 0,
                    width: image.width,
                    height: image.height,
                });
            }

            const pdfBytes = await pdfDoc.save();
            this.downloadBlob(pdfBytes, 'imagenes.pdf', 'application/pdf');

            btn.innerHTML = '¡Completado!';
            setTimeout(() => {
                btn.innerHTML = 'Crear PDF';
                btn.disabled = false;
            }, 2000);

        } catch (error) {
            console.error(error);
            alert('Error al crear PDF: ' + error.message);
            btn.innerHTML = 'Crear PDF';
            btn.disabled = false;
        }
    },

    // --- Signature Logic ---
    getSignUI() {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <h4 class="font-medium mb-4">1. Sube el PDF</h4>
                    <div class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center cursor-pointer relative hover:bg-slate-50 dark:hover:bg-slate-700/30 mb-4">
                        <input type="file" id="sign-input" accept=".pdf" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                        <i class="fas fa-file-pdf text-3xl text-red-500 mb-3"></i>
                        <p class="text-sm font-medium" id="sign-filename">Haz clic para subir PDF</p>
                    </div>
                 </div>

                <div>
                    <h4 class="font-medium mb-4">2. Dibuja tu Firma</h4>
                    <div class="border rounded-xl p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                        <canvas id="signature-pad" class="w-full h-48 border border-slate-300 rounded-lg cursor-crosshair bg-white"></canvas>
                        <div class="flex justify-between mt-4">
                            <button onclick="DocsModule.clearSignature()" class="text-sm text-red-500 hover:text-red-700">Borrar</button>
                        </div>
                    </div>
                </div>

                <div class="md:col-span-2">
                     <button onclick="DocsModule.applySignature()" id="btn-sign" class="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        Firmar y Descargar
                    </button>
                </div>
            </div>
        `;
    },

    initSignaturePad() {
        const canvas = document.getElementById('signature-pad');
        // Simple resizing
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        let drawing = false;

        canvas.addEventListener('mousedown', (e) => {
            drawing = true;
            ctx.beginPath();
            ctx.moveTo(e.offsetX, e.offsetY);
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!drawing) return;
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        });

        canvas.addEventListener('mouseup', () => drawing = false);
        canvas.addEventListener('mouseleave', () => drawing = false);

        // Touch support
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            drawing = true;
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            ctx.beginPath();
            ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
        });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!drawing) return;
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
            ctx.stroke();
        });

        canvas.addEventListener('touchend', () => drawing = false);

        this.signaturePadCtx = ctx;
        this.signaturePadCanvas = canvas;
    },

    clearSignature() {
        if (this.signaturePadCtx) {
            this.signaturePadCtx.clearRect(0, 0, this.signaturePadCanvas.width, this.signaturePadCanvas.height);
        }
    },

    async applySignature() {
        if (!this.signFile) {
            alert('Sube un PDF primero.');
            return;
        }

        const btn = document.getElementById('btn-sign');
        btn.innerHTML = 'Procesando...';
        btn.disabled = true;

        try {
            // Get Image from Canvas
            const pngImageBytes = await new Promise(resolve => this.signaturePadCanvas.toBlob(blob => blob.arrayBuffer().then(resolve)));

            const pdfBytes = await this.signFile.arrayBuffer();
            const PDFDocument = window.PDFLib.PDFDocument;
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

            const pngImage = await pdfDoc.embedPng(pngImageBytes);

            const pages = pdfDoc.getPages();
            const lastPage = pages[pages.length - 1]; // Sign on last page by default
            const { width, height } = lastPage.getSize();

            lastPage.drawImage(pngImage, {
                x: 50,
                y: 50, // Bottom left corner
                width: 150,
                height: 150 * (pngImage.height / pngImage.width),
            });

            const signedPdfBytes = await pdfDoc.save();
            this.downloadBlob(signedPdfBytes, 'firmado.pdf', 'application/pdf');

            btn.innerHTML = '¡Completado!';
            setTimeout(() => { btn.innerHTML = 'Firmar y Descargar'; btn.disabled = false; }, 2000);

        } catch (e) {
            console.error(e);
            alert('Error al firmar: ' + e.message);
            btn.innerHTML = 'Firmar y Descargar';
            btn.disabled = false;
        }
    },


    // --- Security Logic ---
    getSecurityUI() {
        return `
            <div class="max-w-xl mx-auto space-y-6">
                 <div class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center cursor-pointer relative hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <input type="file" id="security-input" accept=".pdf" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                    <i class="fas fa-lock text-3xl text-slate-400 mb-3"></i>
                    <p class="text-sm font-medium" id="security-filename">Sube PDF para proteger</p>
                </div>

                <div>
                    <label class="block text-sm font-medium mb-1">Contraseña</label>
                    <input type="password" id="pdf-password" class="w-full p-3 border rounded-lg dark:bg-slate-800 dark:border-slate-600 outline-none focus:border-red-500" placeholder="Escribe la contraseña">
                </div>
                
                <button onclick="DocsModule.encryptPDF()" id="btn-encrypt" class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    Proteger PDF
                </button>
            </div>
        `;
    },

    async encryptPDF() {
        if (!this.securityFile) {
            alert('Sube un PDF primero.');
            return;
        }

        const password = document.getElementById('pdf-password').value;
        if (!password) {
            alert('Introduce una contraseña.');
            return;
        }

        const btn = document.getElementById('btn-encrypt');
        btn.innerHTML = 'Procesando...';
        btn.disabled = true;

        try {
            const pdfBytes = await this.securityFile.arrayBuffer();
            const PDFDocument = window.PDFLib.PDFDocument;
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

            const StandardFonts = window.PDFLib.StandardFonts;
            // Encryption logic
            pdfDoc.encrypt({
                userPassword: password,
                ownerPassword: password,
                permissions: {
                    printing: 'highResolution',
                    modifying: false,
                    copying: false,
                    annotating: false,
                    fillingForms: false,
                    contentAccessibility: false,
                    documentAssembly: false,
                }
            });

            const encryptedBytes = await pdfDoc.save();
            this.downloadBlob(encryptedBytes, 'protegido.pdf', 'application/pdf');

            btn.innerHTML = '¡Completado!';
            setTimeout(() => { btn.innerHTML = 'Proteger PDF'; btn.disabled = false; }, 2000);

        } catch (e) {
            console.error(e);
            alert('Error al proteger: ' + e.message);
            btn.innerHTML = 'Proteger PDF';
            btn.disabled = false;
        }
    },

    // --- PDF to Word Logic (Simple Text Extraction) ---
    getPdfToWordUI() {
        return `
            <div class="max-w-xl mx-auto space-y-6">
                 <div class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center cursor-pointer relative hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <input type="file" id="pdf-word-input" accept=".pdf, .jpg, .jpeg, .png" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                    <i class="fas fa-file-word text-3xl text-blue-400 mb-3"></i>
                    <p class="text-sm font-medium" id="pdf-word-filename">Sube PDF o Imagen para convertir</p>
                </div>
                
                <div class="flex items-center justify-center space-x-3 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                    <input type="checkbox" id="pdf-word-mode" class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300">
                    <label for="pdf-word-mode" class="text-sm text-slate-700 dark:text-slate-300">
                        <strong>Mantener diseño exacto</strong> (convierte páginas a imágenes)
                    </label>
                </div>

                <button onclick="DocsModule.convertPdfToWord()" id="btn-pdf-word" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    Convertir a Word
                </button>
            </div>
        `;
    },

    async convertPdfToWord() {
        if (!this.pdfToWordFile) {
            alert('Sube un elemento primero.');
            return;
        }

        const btn = document.getElementById('btn-pdf-word');
        const originalText = btn.innerHTML;
        btn.disabled = true;

        try {
            const file = this.pdfToWordFile;

            // --- IMAGE ONLY MODE ---
            if (file.type.startsWith('image/')) {
                btn.innerHTML = '<i class="fas fa-eye"></i> Escaneando...';
                if (!window.Tesseract) throw new Error('Tesseract no cargado. Copiando imagen simple...');

                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    const imgData = reader.result;
                    this.createWordFromHtml(`<img src="${imgData}" style="width:100%">`, file.name);
                    btn.innerHTML = '¡Completado!';
                    setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; }, 2000);
                };
                return;
            }

            // --- PDF MODE ---
            btn.innerHTML = 'Analizando estructura...';
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument(arrayBuffer);
            const pdf = await loadingTask.promise;

            let docBody = '';
            // SCALE: 72pt (PDF) -> 96px (Screen/HTML).
            const SCALE = 1.33;

            for (let i = 1; i <= pdf.numPages; i++) {
                btn.innerHTML = `Procesando pág ${i}/${pdf.numPages}...`;
                const page = await pdf.getPage(i);

                // 1. Get Text Items
                const textContent = await page.getTextContent();
                let items = textContent.items.map(item => {
                    const tx = item.transform;
                    return {
                        type: 'text',
                        str: item.str,
                        x: tx[4],
                        y: tx[5],
                        h: item.height || Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]),
                        w: item.width
                    };
                });

                // 2. Get Image Items (Advanced: Parse Operators)
                // We need to fetch the OperatorList to find images and their transforms
                try {
                    btn.innerHTML = `Extrayendo imágenes pág ${i}...`;
                    const ops = await page.getOperatorList();
                    const extractedImages = [];

                    // Matrix helper
                    const multiply = (m1, m2) => {
                        return [
                            m1[0] * m2[0] + m1[1] * m2[2],
                            m1[0] * m2[1] + m1[1] * m2[3],
                            m1[2] * m2[0] + m1[3] * m2[2],
                            m1[2] * m2[1] + m1[3] * m2[3],
                            m1[4] * m2[0] + m1[5] * m2[2] + m2[4],
                            m1[4] * m2[1] + m1[5] * m2[3] + m2[5]
                        ];
                    };

                    let ctm = [1, 0, 0, 1, 0, 0]; // Current Transform Matrix
                    const transformStack = [];

                    for (let opIdx = 0; opIdx < ops.fnArray.length; opIdx++) {
                        const fn = ops.fnArray[opIdx];
                        const args = ops.argsArray[opIdx];

                        // OPS.save
                        if (fn === pdfjsLib.OPS.save) {
                            transformStack.push([...ctm]);
                        }
                        // OPS.restore
                        else if (fn === pdfjsLib.OPS.restore) {
                            if (transformStack.length > 0) ctm = transformStack.pop();
                        }
                        // OPS.transform
                        else if (fn === pdfjsLib.OPS.transform) {
                            ctm = multiply(ctm, args);
                        }
                        // OPS.paintImageXObject
                        else if (fn === pdfjsLib.OPS.paintImageXObject) {
                            const imgName = args[0];
                            try {
                                const imgObj = await page.objs.get(imgName);
                                if (imgObj) {
                                    // Calculate position from CTM
                                    // Image is unit square (0,0) to (1,1) transformed by CTM
                                    // So [0,0] -> [x,y] is ctm[4], ctm[5]
                                    // Width/Height are scaled by ctm[0], ctm[3] approx (ignoring rotation for simplicity)
                                    const w = Math.sqrt(ctm[0] * ctm[0] + ctm[1] * ctm[1]);
                                    const h = Math.sqrt(ctm[2] * ctm[2] + ctm[3] * ctm[3]);

                                    // Convert bitmap to DataURL
                                    // imgObj can be an ImageBitmap or HTMLImageElement or data
                                    let imgUrl = '';

                                    // Create a temporary canvas to draw the image and export to base64
                                    const canvas = document.createElement('canvas');
                                    canvas.width = imgObj.width;
                                    canvas.height = imgObj.height;
                                    const ctx = canvas.getContext('2d');

                                    if (imgObj instanceof ImageBitmap || imgObj instanceof HTMLImageElement || imgObj instanceof HTMLCanvasElement) {
                                        ctx.drawImage(imgObj, 0, 0);
                                        imgUrl = canvas.toDataURL('image/png');
                                    } else if (imgObj.data) {
                                        // Raw RGBA data
                                        const imageData = new ImageData(new Uint8ClampedArray(imgObj.data), imgObj.width, imgObj.height);
                                        ctx.putImageData(imageData, 0, 0);
                                        imgUrl = canvas.toDataURL('image/png');
                                    }

                                    if (imgUrl) {
                                        extractedImages.push({
                                            type: 'image',
                                            src: imgUrl,
                                            x: ctm[4],
                                            y: ctm[5],
                                            w: w,
                                            h: h
                                        });
                                    }
                                }
                            } catch (err) {
                                console.warn('Could not extract image', imgName, err);
                            }
                        }
                    }
                    // Merge images into items
                    items = items.concat(extractedImages);

                } catch (err) {
                    console.error('Error parsing images:', err);
                }


                // 3. CHECK FOR EMPTY PAGE (SCANNED PDF FALLBACK).
                if (items.length === 0) {
                    // ... (Fallback logic) ...
                    btn.innerHTML = `Detectado PDF escaneado (pág ${i})...`;
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    await page.render({ canvasContext: ctx, viewport: viewport }).promise;
                    const fullPageImg = canvas.toDataURL('image/jpeg', 0.8);
                    const wPt = viewport.width * 0.75;
                    items.push({ type: 'image', src: fullPageImg, x: 0, y: viewport.height, w: wPt, h: viewport.height * 0.75 });

                    if (window.Tesseract) {
                        try {
                            const { data: { text } } = await Tesseract.recognize(fullPageImg, 'spa');
                            if (text.trim()) items.push({ type: 'text', str: text, x: 0, y: viewport.height - 20, h: 12, w: wPt });
                        } catch (e) { console.warn('OCR Failed', e); }
                    }
                } else {
                    // --- HYBRID HEADER STRATEGY ---
                    // If we have text, we still might be missing vector logos in the header.
                    // We will snapshot the top 15-20% of the page and use it as a static header image.
                    // And we will REMOVE text items from that area so they don't duplicate.

                    try {
                        const HEADER_RATIO = 0.20; // Type 20% of page
                        const viewport = page.getViewport({ scale: 1.5 }); // High res for image
                        const headerHeightPx = viewport.height * HEADER_RATIO;

                        // Render ONLY the header slice? 
                        // Canvas doesn't support partial render easily, we render full and crop.
                        const canvas = document.createElement('canvas');
                        canvas.width = viewport.width;
                        canvas.height = headerHeightPx;
                        const ctx = canvas.getContext('2d');

                        // We use the render task but clip or just draw the full page offset?
                        // actually page.render draws the whole thing. We need a temp canvas.
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = viewport.width;
                        tempCanvas.height = viewport.height;

                        // Render full page to temp (expensive but necessary for vector fidelity)
                        // Optimization: We could perhaps use a viewport transform to only render top? 
                        // transform: [1, 0, 0, 1, 0, 0] -> standard.
                        // Let's stick to full render for safety.
                        await page.render({ canvasContext: tempCanvas.getContext('2d'), viewport: viewport }).promise;

                        // Draw cropped top to actual canvas
                        ctx.drawImage(tempCanvas, 0, 0, viewport.width, headerHeightPx, 0, 0, viewport.width, headerHeightPx);

                        const headerImgData = canvas.toDataURL('image/png');

                        // PDF Y coordinates: 0 is bottom, height is top.
                        // So Header area is Y > (height * (1 - HEADER_RATIO))
                        const pdfHeaderCutoff = viewport.height * (1 - HEADER_RATIO) / 1.5; // Scale back to PDF units (approx)
                        // Actually easier: items use PDF coordinates. 
                        // page.getViewport({scale:1.0}).height is the PDF height base.
                        const pdfHeight = page.getViewport({ scale: 1.0 }).height;
                        const headerYThreshold = pdfHeight * (1 - HEADER_RATIO);

                        // Add Header Image Item
                        // It goes at the very top (highest Y)
                        const wPt = pdfHeight * (viewport.width / viewport.height); // Estimate width in PDF units

                        // We filter OUT text that is inside the header to prevent duplication
                        items = items.filter(item => {
                            if (item.type === 'image') return true; // Keep extracted images generally
                            if (item.y > headerYThreshold) return false; // Remove text in header
                            return true;
                        });

                        // Insert Header Image at top
                        items.push({
                            type: 'image',
                            src: headerImgData,
                            x: 0,
                            y: pdfHeight + 100, // Ensure it sorts first
                            w: wPt, // Full width
                            h: pdfHeight * HEADER_RATIO
                        });

                    } catch (e) {
                        console.warn('Header snapshot failed', e);
                    }
                }

                // 4. Sort Items Spatially (Y Desc, X Asc)
                items.sort((a, b) => {
                    const yDiff = b.y - a.y;
                    if (Math.abs(yDiff) > 5) return yDiff; // Different lines
                    return a.x - b.x; // Same line (L->R)
                });

                // 5. Group into Lines
                const lines = [];
                let currentLine = null;

                for (const item of items) {
                    if (item.type === 'text' && !item.str.trim()) continue; // Skip empty text

                    if (!currentLine) {
                        currentLine = { y: item.y, items: [item] };
                    } else {
                        // Check tolerance (increased for mixed content)
                        if (Math.abs(item.y - currentLine.y) < 15) {
                            currentLine.items.push(item);
                        } else {
                            lines.push(currentLine);
                            currentLine = { y: item.y, items: [item] };
                        }
                    }
                }
                if (currentLine) lines.push(currentLine);

                let pageHtml = `<div style="margin-bottom: 20pt; page-break-after: always; position:relative;">`;

                // 6. Render to HTML with Styles
                const commonObjs = page.commonObjs; // Access font objects if needed later, but items usually have fontName

                for (const line of lines) {
                    const firstItem = line.items[0];
                    const leftMargin = firstItem.x;

                    let lineHtml = '';

                    // We need to calculate the dominant style for the paragraph or use spans
                    // Word prefers standard paragraphs. We'll use spans for mixed styles.

                    for (const item of line.items) {
                        if (item.type === 'image') {
                            const wPt = item.w;
                            // Ensure images are block if they are large (like header)
                            // or inline if small.
                            if (item.w > 200) {
                                // Block image (Header) - Reset margin for full bleed
                                lineHtml = `<img src="${item.src}" style="width:100%; height:auto; display:block;">`;
                                // We might want to break the paragraph for this
                            } else {
                                lineHtml += `<img src="${item.src}" style="width:${wPt}pt; height:auto; vertical-align:middle;">`;
                            }
                        } else {
                            // Extract Styles
                            let fontWeight = 'normal';
                            let fontStyle = 'normal';
                            let fontFamily = 'Arial, sans-serif'; // Default

                            // Try to deduce style from font name internal property if available
                            // item.fontName is often like "g_d0_f1"
                            // We need to look it up in page.commonObjs or similar, but simplified:
                            // We use simplistic detection if we can't access full font tables easily in this context.
                            // Actually, pdf.js textContent usually just gives basic info.
                            // But let's assume standard sans.

                            // If we want high fidelity, we need to inspect the 'fontName' in 'commonObjs'
                            // This is async and complex in the minimal loop. 
                            // Standard fallback:

                            const fontSize = item.h || 11;

                            // Check if standard system fonts might apply (hacky but works for some PDFs)
                            // If not, we just use the size.

                            // Clean content
                            const content = item.str.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');

                            lineHtml += `<span style="font-size:${fontSize}pt; font-family:${fontFamily};">${content}</span>`;
                        }
                    }

                    // Special case for Header Image line? 
                    // If line has ONLY 1 image and it's wide, remove margins?
                    const isHeaderLine = line.items.length === 1 && line.items[0].type === 'image' && line.items[0].w > 200;

                    pageHtml += `
                        <p style="
                            margin-left: ${isHeaderLine ? 0 : leftMargin}pt; 
                            margin-top: 2pt; 
                            margin-bottom: 2pt;
                            line-height: 1.2;
                            text-align: left;
                        ">${lineHtml}</p>
                    `;
                }

                pageHtml += `</div>`;
                docBody += pageHtml;
            }

            this.createWordFromHtml(docBody, file.name); // Using helper which wraps again? 
            // Wait, createWordFromHtml WRAPS the body. So we should pass docBody directly.
            // My previous createWordFromHtml already adds the html/head tags.
            // So in the loop above I should NOT have created 'fullHtml'. I should just pass docBody.

            // Correction: I should update createWordFromHtml to accept the full body style or just pass body.
            // Current createWordFromHtml does the wrapping. So I will just use that.

            // Re-verified createWordFromHtml:
            /*
            createWordFromHtml(bodyContent, filename) {
                const fullHtml = ... <body>${bodyContent}</body> ...
            */
            // So passing docBody is correct.

            btn.innerHTML = '¡Completado!';
            setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; }, 2000);

        } catch (e) {
            console.error(e);
            alert('Error al convertir: ' + e.message);
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
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
