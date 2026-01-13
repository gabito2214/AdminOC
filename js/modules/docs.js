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

    // --- PDF to Word Logic (Simple Text Extraction) ---
    getPdfToWordUI() {
        return `
            <div class="max-w-xl mx-auto space-y-6">
                 <div class="border-2 border-dashed border-color rounded-xl p-6 text-center cursor-pointer relative hover:bg-slate-50">
                    <input type="file" id="pdf-word-input" accept=".pdf, .jpg, .jpeg, .png" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                    <i class="fas fa-file-word text-3xl text-blue-400 mb-3"></i>
                    <p class="text-sm font-medium" id="pdf-word-filename">Sube PDF o Imagen para convertir</p>
                </div>
                
                <div class="flex items-center justify-center space-x-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <input type="checkbox" id="pdf-word-mode" class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300">
                    <label for="pdf-word-mode" class="text-sm">
                        <strong>Mantener diseño exacto</strong> (convierte páginas a imágenes)
                    </label>
                </div>

                <button onclick="DocsModule.convertPdfToWord()" id="btn-pdf-word" class="btn btn-primary w-full py-3">
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

                // --- DECONSTRUCTIVE COMPONENT STRATEGY (Vectors + Images + Text) ---

                // 1. Prepare Background Canvas (High Quality)
                const scale = 2.0;
                const viewport = page.getViewport({ scale: scale });
                const canvas = document.createElement('canvas'); // Background Canvas
                const ctx = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Render Full Page initially
                await page.render({ canvasContext: ctx, viewport: viewport }).promise;

                // 2. Extract Images (To act as separate layers)
                // We need to parse operators to find images and their positions
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

                let ctm = [1, 0, 0, 1, 0, 0];
                const transformStack = [];

                for (let opIdx = 0; opIdx < ops.fnArray.length; opIdx++) {
                    const fn = ops.fnArray[opIdx];
                    const args = ops.argsArray[opIdx];

                    if (fn === pdfjsLib.OPS.save) {
                        transformStack.push([...ctm]);
                    } else if (fn === pdfjsLib.OPS.restore) {
                        if (transformStack.length > 0) ctm = transformStack.pop();
                    } else if (fn === pdfjsLib.OPS.transform) {
                        ctm = multiply(ctm, args);
                    } else if (fn === pdfjsLib.OPS.paintImageXObject) {
                        const imgName = args[0];
                        try {
                            const imgObj = await page.objs.get(imgName);
                            if (imgObj) {
                                // PDF Image Coords
                                const x = ctm[4];
                                const y = ctm[5];
                                const w = Math.sqrt(ctm[0] * ctm[0] + ctm[1] * ctm[1]);
                                const h = Math.sqrt(ctm[2] * ctm[2] + ctm[3] * ctm[3]);

                                // Extract Content
                                const tempCanvas = document.createElement('canvas');
                                tempCanvas.width = imgObj.width;
                                tempCanvas.height = imgObj.height;
                                const tempCtx = tempCanvas.getContext('2d');

                                if (imgObj instanceof ImageBitmap || imgObj instanceof HTMLImageElement || imgObj instanceof HTMLCanvasElement) {
                                    tempCtx.drawImage(imgObj, 0, 0);
                                } else if (imgObj.data) {
                                    const imageData = new ImageData(new Uint8ClampedArray(imgObj.data), imgObj.width, imgObj.height);
                                    tempCtx.putImageData(imageData, 0, 0);
                                }
                                const imgUrl = tempCanvas.toDataURL('image/png');

                                extractedImages.push({ src: imgUrl, x, y, w, h });
                            }
                        } catch (e) {
                            console.warn('Image extraction error', e);
                        }
                    }
                }

                // 3. Process Background: ERASE Images and Text
                // We want the background to ONLY contain vector graphics (lines, bg colors)

                // Erase Images from Background
                extractedImages.forEach(img => {
                    const pdfRect = [img.x, img.y, img.x + img.w, img.y + img.h];
                    const pixelRect = viewport.convertToViewportRectangle(pdfRect);
                    const rx = Math.floor(pixelRect[0]);
                    const ry = Math.floor(pixelRect[1]);
                    const rw = Math.ceil(pixelRect[2] - pixelRect[0]);
                    const rh = Math.ceil(pixelRect[3] - pixelRect[1]);

                    // Clear with a tiny buffer to avoid edge artifacts
                    ctx.clearRect(rx - 1, ry - 1, rw + 2, rh + 2);
                });

                // Erase Text from Background
                items.forEach(item => {
                    if (item.type === 'text' && item.str.trim()) {
                        const pdfRect = [item.x, item.y, item.x + item.w, item.y + item.h];
                        const pixelRect = viewport.convertToViewportRectangle(pdfRect);
                        const rx = Math.floor(pixelRect[0]);
                        const ry = Math.floor(pixelRect[1]);
                        const rw = Math.ceil(pixelRect[2] - pixelRect[0]);
                        const rh = Math.ceil(pixelRect[3] - pixelRect[1]);

                        // Sample background color (simple inpainting)
                        const sampleX = Math.max(0, rx - 5);
                        const sampleY = Math.min(canvas.height - 1, ry + Math.floor(rh / 2));
                        const p = ctx.getImageData(sampleX, sampleY, 1, 1).data;
                        ctx.fillStyle = `rgb(${p[0]},${p[1]},${p[2]})`;
                        ctx.fillRect(rx - 1, ry - 1, rw + 2, rh + 2);
                    }
                });

                const cleanBgData = canvas.toDataURL('image/jpeg', 0.85);
                const pageW = page.getViewport({ scale: 1.0 }).width;
                const pageH = page.getViewport({ scale: 1.0 }).height;

                let pageHtml = `<div style="position:relative; width:${pageW}pt; height:${pageH}pt; page-break-after:always; margin-bottom:20px; overflow:hidden;">`;

                // A. Layer 0: Vector Background (Lines/Colors)
                pageHtml += `
                    <img src="${cleanBgData}" style="
                        position:absolute; left:0; top:0; width:${pageW}pt; height:${pageH}pt; z-index: 0;
                    ">
                `;

                // B. Layer 1: Images (Selectable/Deletable)
                extractedImages.forEach(img => {
                    // Coordinates need to be flipped? 
                    // img.y is bottom-left in PDF.
                    // HTML Top = PageHeight - (y + h) if y is bottom. 
                    // BUT viewport.convertToViewportRectangle handles this usually.
                    // We need HTML Point coordinates.

                    // Let's use the same logic as Text:
                    // Text Top = PageH - y - fontsize.
                    // Image Top = PageH - (y + h) ??
                    // If y is bottom of image.
                    // Let's verify standard PDF coords: (0,0) is bottom-left.
                    // Image drawn at x,y with height h. y is the bottom edge.
                    // So Top edge is y+h.
                    // So HTML Top (from top) = PageH - (y+h).

                    const top = pageH - (img.y + img.h);

                    pageHtml += `
                        <img src="${img.src}" style="
                            position:absolute;
                            left:${img.x}pt;
                            top:${top}pt;
                            width:${img.w}pt;
                            height:${img.h}pt;
                            object-fit:contain;
                            z-index: 1;
                        ">
                    `;
                });

                // C. Layer 2: Text (Editable)
                for (const item of items) {
                    if (item.type === 'text' && item.str.trim()) {
                        let fontSize = item.h || 10;
                        if (fontSize < 4) fontSize = 10;
                        const top = pageH - item.y - (fontSize * 0.8);

                        let content = item.str
                            .replace(/&/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/"/g, '&quot;')
                            .replace(/'/g, '&#039;');

                        // Transparent background now, because we cleaned the base image!
                        pageHtml += `
                            <div style="
                                position:absolute;
                                left:${item.x}pt;
                                top:${top}pt;
                                font-size:${fontSize}pt;
                                font-family: 'Arial', sans-serif;
                                white-space: nowrap;
                                z-index: 2;
                                line-height: 1;
                                color: #000;
                            ">${content}</div>
                        `;
                    }
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
