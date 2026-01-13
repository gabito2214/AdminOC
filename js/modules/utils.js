/**
 * Utilities Module
 * General admin tools: Text Cleaner, QR Generator, Tax Calc
 */

const UtilsModule = {
    init() {
        console.log('Utils Module Initialized');
    },

    getTemplate() {
        return `
            <div class="flex flex-col gap-6">
                <!-- Header -->
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-xl font-bold">Imprescindibles</h2>
                        <p class="text-muted">Herramientas de uso diario.</p>
                    </div>
                </div>

                <!-- Tools Grid -->
                <div class="tools-grid">
                    ${this.createToolCard('text-cleaner', 'Limpiador de Texto', 'fa-broom', 'Eliminar formatos y saltos.', 'icon-emerald')}
                    ${this.createToolCard('qr-gen', 'Generador QR', 'fa-qrcode', 'Crear códigos para inventario o links.', 'icon-slate')}
                    ${this.createToolCard('tax-calc', 'Calculadora Fiscal', 'fa-percent', 'IVA, IRPF y descuentos.', 'icon-yellow')}
                    ${this.createToolCard('forms-gen', 'Generador de Google Forms', 'fa-clipboard-list', 'Crear formularios mediante Apps Script.', 'icon-purple')}
                </div>

                <!-- Active Tool Area (Hidden by default) -->
                <div id="util-tool-workspace" class="hidden card p-6">
                    <div class="flex items-center justify-between mb-4 pb-4 border-b border-color">
                        <h3 id="util-workspace-title" class="text-lg font-bold">Herramienta</h3>
                        <button onclick="UtilsModule.closeTool()" class="text-muted hover:text-main">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <div id="util-workspace-content"></div>
                </div>
            </div>
        `;
    },

    createToolCard(id, title, icon, desc, colorClass) {
        return `
            <div onclick="UtilsModule.openTool('${id}', '${title}')" class="card cursor-pointer group hover:shadow-md transition-all">
                <div class="flex items-center gap-4 mb-2">
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
        const workspace = document.getElementById('util-tool-workspace');
        workspace.classList.remove('hidden');
        document.getElementById('util-workspace-title').textContent = title;
        workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.renderToolUI(toolId, document.getElementById('util-workspace-content'));
    },

    closeTool() {
        document.getElementById('util-tool-workspace').classList.add('hidden');
    },

    renderToolUI(toolId, container) {
        container.innerHTML = 'Cargando...';
        setTimeout(() => {
            switch (toolId) {
                case 'text-cleaner':
                    container.innerHTML = this.getTextCleanerUI();
                    break;
                case 'qr-gen':
                    container.innerHTML = this.getQRUI();
                    break;
                case 'tax-calc':
                    container.innerHTML = this.getTaxUI();
                    break;
                case 'forms-gen':
                    container.innerHTML = this.getFormsGenUI();
                    break;
                default:
                    container.innerHTML = 'En construcción';
            }
        }, 200);
    },

    // --- Text Cleaner ---
    // --- Text Cleaner ---
    getTextCleanerUI() {
        return `
            <div class="max-w-3xl mx-auto space-y-4">
                <div class="flex gap-2 mb-2 overflow-x-auto pb-2">
                    <button onclick="UtilsModule.cleanText('uppercase')" class="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200">MAYÚSCULAS</button>
                    <button onclick="UtilsModule.cleanText('lowercase')" class="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200">minúsculas</button>
                    <button onclick="UtilsModule.cleanText('capitalize')" class="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200">Capitalizar</button>
                    <button onclick="UtilsModule.cleanText('spaces')" class="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200">Quitar Espacios Extra</button>
                    <button onclick="UtilsModule.cleanText('lines')" class="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200">Quitar Saltos</button>
                </div>
                
                <textarea id="text-input" class="form-input h-64 font-mono text-sm resize-none outline-none" placeholder="Pega tu texto aquí..."></textarea>
                
                <div class="flex justify-between items-center text-sm text-muted">
                    <span id="char-count">0 caracteres</span>
                    <button onclick="UtilsModule.copyText()" class="text-emerald-600 font-medium hover:text-emerald-700">Copiar Resultado</button>
                </div>
            </div>
        `;
    },

    // ... (logic) ...

    // --- QR Generator ---
    getQRUI() {
        return `
            <div class="max-w-xl mx-auto text-center space-y-6">
                <input type="text" id="qr-text" placeholder="https://ejemplo.com o Texto" class="form-input">
                <button onclick="UtilsModule.generateQR()" class="btn btn-primary px-6 py-2" style="background-color: var(--indigo-600);">Generar QR</button>
                
                <div id="qr-container" class="flex justify-center p-6 bg-white rounded-lg border border-color min-h-[200px] items-center">
                    <p class="text-muted text-sm">El código QR aparecerá aquí</p>
                </div>
            </div>
        `;
    },

    // ... (logic) ...

    // --- Tax Calculator ---
    getTaxUI() {
        return `
            <div class="max-w-2xl mx-auto bg-slate-50 dark:bg-slate-800 p-6 rounded-xl">
               <div class="grid grid-cols-2 gap-4 mb-4">
                   <div>
                       <label class="input-label">Importe Base</label>
                       <input type="number" id="tax-base" class="form-input" placeholder="0.00" oninput="UtilsModule.calcTax()">
                   </div>
                   <div>
                       <label class="input-label">IVA (%)</label>
                        <select id="tax-iva" class="form-input" onchange="UtilsModule.calcTax()">
                            <option value="21">21% (General)</option>
                            <option value="10">10% (Reducido)</option>
                            <option value="4">4% (Superreducido)</option>
                            <option value="0">0% (Exento)</option>
                        </select>
                   </div>
               </div>
               
               <div class="grid grid-cols-2 gap-4 mb-6">
                    <div>
                       <label class="input-label">IRPF/Retención (%)</label>
                       <input type="number" id="tax-irpf" class="form-input" placeholder="0" value="0" oninput="UtilsModule.calcTax()">
                   </div>
                   <div>
                       <label class="input-label">Cantidad</label>
                       <input type="number" id="tax-qty" class="form-input" value="1" oninput="UtilsModule.calcTax()">
                   </div>
               </div>

               <div class="border-t border-color pt-4 space-y-2">
                   <div class="flex justify-between text-sm">
                       <span>Subtotal:</span>
                       <span id="res-subtotal" class="font-mono">0.00 €</span>
                   </div>
                   <div class="flex justify-between text-sm text-red-500">
                       <span>Cuota IVA:</span>
                       <span id="res-iva" class="font-mono">+0.00 €</span>
                   </div>
                   <div class="flex justify-between text-sm text-blue-500">
                       <span>Retención:</span>
                       <span id="res-irpf" class="font-mono">-0.00 €</span>
                   </div>
                   <div class="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-color">
                       <span>Total:</span>
                       <span id="res-total">0.00 €</span>
                   </div>
               </div>
            </div>
        `;
    },

    // ... (logic) ...

    // --- Google Forms Generator ---
    getFormsGenUI() {
        return `
            <div class="max-w-4xl mx-auto space-y-8">
                <div class="bg-indigo-50 text-indigo-700 p-4 rounded-lg border border-indigo-100 flex gap-4">
                    <div class="pt-1 text-xl">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="text-sm">
                        <p class="font-bold mb-1">Cómo funciona:</p>
                        <p>Diseña tu formulario abajo y haz clic en "Generar Script". Se generará un código que puedes copiar y pegar en <a href="https://script.google.com" target="_blank" class="underline font-bold">Google Apps Script</a> para crear el formulario automáticamente en tu cuenta de Google.</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="space-y-6">
                        <div>
                            <label class="input-label">Título del Formulario</label>
                            <input type="text" id="form-title" class="form-input" placeholder="Ej: Encuesta de Satisfacción" value="Nuevo Formulario">
                        </div>

                        <div id="form-fields" class="space-y-4">
                            <!-- Field inputs will appear here -->
                        </div>

                        <div class="flex flex-wrap gap-2">
                            <button onclick="UtilsModule.addFormField('TEXT')" class="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                                <i class="fas fa-font mr-2"></i> Texto Corto
                            </button>
                            <button onclick="UtilsModule.addFormField('PARAGRAPH')" class="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                                <i class="fas fa-align-left mr-2"></i> Párrafo
                            </button>
                            <button onclick="UtilsModule.addFormField('MULTIPLE_CHOICE')" class="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                                <i class="fas fa-list-ul mr-2"></i> Opción Múltiple
                            </button>
                        </div>

                        <button onclick="UtilsModule.generateFormsScript()" class="btn btn-primary w-full py-3" style="background-color: var(--purple-600);">
                            <i class="fas fa-code mr-2"></i> Generar Script
                        </button>
                    </div>

                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <h4 class="font-semibold">Apps Script Generado</h4>
                            <button onclick="UtilsModule.copyFormsScript()" id="btn-copy-script" class="text-purple-600 text-sm font-bold hover:underline hidden">
                                <i class="fas fa-copy mr-1"></i> Copiar Código
                            </button>
                        </div>
                        <div class="relative bg-slate-900 rounded-xl p-4 overflow-hidden border border-slate-800">
                            <pre id="forms-script-output" class="text-emerald-400 text-xs font-mono h-[400px] overflow-auto leading-relaxed">
// Diseña tu formulario y haz clic en Generar Script...
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    addFormField(type) {
        const fieldsList = document.getElementById('form-fields');
        const fieldId = 'field-' + Date.now();
        const fieldDiv = document.createElement('div');
        fieldDiv.id = fieldId;
        fieldDiv.className = 'field-item p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-color group transition-all animate-in slide-in-from-left-2';

        let typeName = '';
        let optionsHtml = '';

        switch (type) {
            case 'TEXT': typeName = 'Texto Corto'; break;
            case 'PARAGRAPH': typeName = 'Párrafo'; break;
            case 'MULTIPLE_CHOICE':
                typeName = 'Opción Múltiple';
                optionsHtml = `
                    <div class="mt-3 space-y-2">
                        <label class="text-[10px] uppercase font-bold text-muted">Opciones (separadas por comas)</label>
                        <input type="text" class="field-options form-input text-sm" placeholder="Opción 1, Opción 2, Opción 3">
                    </div>
                `;
                break;
        }

        fieldDiv.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-bold px-2 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-slate-600 dark:text-slate-300">${typeName}</span>
                <button onclick="document.getElementById('${fieldId}').remove()" class="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            <input type="hidden" class="field-type" value="${type}">
            <input type="text" class="field-label form-input text-sm" placeholder="Pregunta / Título del campo">
            ${optionsHtml}
        `;

        fieldsList.appendChild(fieldDiv);
    },

    generateFormsScript() {
        const title = document.getElementById('form-title').value || 'Sin Título';
        const fieldElements = document.querySelectorAll('.field-item');
        const output = document.getElementById('forms-script-output');
        const copyBtn = document.getElementById('btn-copy-script');

        let script = `/**
 * Google Apps Script para generar un formulario automáticamente.
 * 1. Ve a https://script.google.com
 * 2. Haz clic en 'Nuevo proyecto'
 * 3. Pega este código y haz clic en el icono de 'Ejecutar' (play)
 */

function createGoogleForm() {
  const formName = '${title.replace(/'/g, "\\'")}';
  const form = FormApp.create(formName);
  
  Logger.log('Formulario creado: ' + form.getEditUrl());
  
  // Agregar campos\n`;

        fieldElements.forEach(item => {
            const type = item.querySelector('.field-type').value;
            const label = item.querySelector('.field-label').value || 'Pregunta sin título';
            const cleanLabel = label.replace(/'/g, "\\'");

            script += `  // Campo: ${label}\n`;

            if (type === 'TEXT') {
                script += `  form.addTextItem().setTitle('${cleanLabel}');\n`;
            } else if (type === 'PARAGRAPH') {
                script += `  form.addParagraphTextItem().setTitle('${cleanLabel}');\n`;
            } else if (type === 'MULTIPLE_CHOICE') {
                const optionsInput = item.querySelector('.field-options');
                const options = optionsInput.value.split(',').map(s => s.trim()).filter(s => s !== '');

                if (options.length > 0) {
                    const optionsString = options.map(o => `'${o.replace(/'/g, "\\'")}'`).join(', ');
                    script += `  form.addMultipleChoiceItem().setTitle('${cleanLabel}').setChoiceValues([${optionsString}]);\n`;
                } else {
                    script += `  form.addMultipleChoiceItem().setTitle('${cleanLabel}');\n`;
                }
            }
            script += `\n`;
        });

        script += `  SpreadsheetApp.getUi().alert('¡Formulario "' + formName + '" creado con éxito! URL de edición: ' + form.getEditUrl());\n}`;

        output.textContent = script;
        copyBtn.classList.remove('hidden');
    },

    copyFormsScript() {
        const text = document.getElementById('forms-script-output').textContent;
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById('btn-copy-script');
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> ¡Copiado!';
            setTimeout(() => btn.innerHTML = original, 2000);
        });
    }
};

window.UtilsModule = UtilsModule;
