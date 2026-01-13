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
            <div class="space-y-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-800 dark:text-white">Imprescindibles</h2>
                        <p class="text-slate-500 dark:text-slate-400">Herramientas de uso diario.</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${this.createToolCard('text-cleaner', 'Limpiador de Texto', 'fa-broom', 'Eliminar formatos y saltos.', 'bg-emerald-50 text-emerald-600')}
                    ${this.createToolCard('qr-gen', 'Generador QR', 'fa-qrcode', 'Crear códigos para inventario o links.', 'bg-gray-50 text-gray-600')}
                    ${this.createToolCard('tax-calc', 'Calculadora Fiscal', 'fa-percent', 'IVA, IRPF y descuentos.', 'bg-yellow-50 text-yellow-600')}
                    ${this.createToolCard('forms-gen', 'Generador de Google Forms', 'fa-clipboard-list', 'Crear formularios mediante Apps Script.', 'bg-purple-50 text-purple-600')}
                </div>

                <div id="util-tool-workspace" class="hidden bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                        <h3 id="util-workspace-title" class="text-xl font-semibold">Herramienta</h3>
                        <button onclick="UtilsModule.closeTool()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
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
            <div onclick="UtilsModule.openTool('${id}', '${title}')" class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group">
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
                
                <textarea id="text-input" class="w-full h-64 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Pega tu texto aquí..."></textarea>
                
                <div class="flex justify-between items-center text-sm text-slate-500">
                    <span id="char-count">0 caracteres</span>
                    <button onclick="UtilsModule.copyText()" class="text-emerald-600 font-medium hover:text-emerald-700">Copiar Resultado</button>
                </div>
            </div>
        `;
    },

    cleanText(mode) {
        const area = document.getElementById('text-input');
        let text = area.value;

        switch (mode) {
            case 'uppercase': text = text.toUpperCase(); break;
            case 'lowercase': text = text.toLowerCase(); break;
            case 'capitalize':
                text = text.toLowerCase().replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
                break;
            case 'spaces': text = text.replace(/\\s+/g, ' ').trim(); break;
            case 'lines': text = text.replace(/(\\r\\n|\\n|\\r)/gm, " "); break;
        }

        area.value = text;
        document.getElementById('char-count').textContent = text.length + ' caracteres';
    },

    copyText() {
        const area = document.getElementById('text-input');
        area.select();
        document.execCommand('copy');
        alert('Texto copiado al portapapeles');
    },

    // --- QR Generator ---
    getQRUI() {
        return `
            <div class="max-w-xl mx-auto text-center space-y-6">
                <input type="text" id="qr-text" placeholder="https://ejemplo.com o Texto" class="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 outline-none focus:border-indigo-500">
                <button onclick="UtilsModule.generateQR()" class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">Generar QR</button>
                
                <div id="qr-container" class="flex justify-center p-6 bg-white rounded-lg border border-slate-200 min-h-[200px] items-center">
                    <p class="text-slate-400 text-sm">El código QR aparecerá aquí</p>
                </div>
            </div>
        `;
    },

    generateQR() {
        const text = document.getElementById('qr-text').value;
        const container = document.getElementById('qr-container');

        if (!text) return;

        container.innerHTML = ''; // Clear

        try {
            new QRCode(container, {
                text: text,
                width: 180,
                height: 180,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (e) {
            container.innerHTML = '<p class="text-red-500">Error al generar QR. Librería no cargada.</p>';
        }
    },

    // --- Tax Calculator ---
    getTaxUI() {
        return `
            <div class="max-w-2xl mx-auto bg-slate-50 dark:bg-slate-700/30 p-6 rounded-xl">
               <div class="grid grid-cols-2 gap-4 mb-4">
                   <div>
                       <label class="block text-sm font-medium mb-1">Importe Base</label>
                       <input type="number" id="tax-base" class="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-600" placeholder="0.00" oninput="UtilsModule.calcTax()">
                   </div>
                   <div>
                       <label class="block text-sm font-medium mb-1">IVA (%)</label>
                        <select id="tax-iva" class="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-600" onchange="UtilsModule.calcTax()">
                            <option value="21">21% (General)</option>
                            <option value="10">10% (Reducido)</option>
                            <option value="4">4% (Superreducido)</option>
                            <option value="0">0% (Exento)</option>
                        </select>
                   </div>
               </div>
               
               <div class="grid grid-cols-2 gap-4 mb-6">
                    <div>
                       <label class="block text-sm font-medium mb-1">IRPF/Retención (%)</label>
                       <input type="number" id="tax-irpf" class="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-600" placeholder="0" value="0" oninput="UtilsModule.calcTax()">
                   </div>
                   <div>
                       <label class="block text-sm font-medium mb-1">Cantidad</label>
                       <input type="number" id="tax-qty" class="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-600" value="1" oninput="UtilsModule.calcTax()">
                   </div>
               </div>

               <div class="border-t border-slate-200 dark:border-slate-600 pt-4 space-y-2">
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
                   <div class="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                       <span>Total:</span>
                       <span id="res-total">0.00 €</span>
                   </div>
               </div>
            </div>
        `;
    },

    calcTax() {
        const base = parseFloat(document.getElementById('tax-base').value) || 0;
        const iva = parseFloat(document.getElementById('tax-iva').value) || 0;
        const irpf = parseFloat(document.getElementById('tax-irpf').value) || 0;
        const qty = parseFloat(document.getElementById('tax-qty').value) || 1;

        const subtotal = base * qty;
        const ivaAmount = subtotal * (iva / 100);
        const irpfAmount = subtotal * (irpf / 100);
        const total = subtotal + ivaAmount - irpfAmount;

        document.getElementById('res-subtotal').textContent = subtotal.toFixed(2) + ' €';
        document.getElementById('res-iva').textContent = '+' + ivaAmount.toFixed(2) + ' €';
        document.getElementById('res-irpf').textContent = '-' + irpfAmount.toFixed(2) + ' €';
        document.getElementById('res-total').textContent = total.toFixed(2) + ' €';
    },

    // --- Google Forms Generator ---
    getFormsGenUI() {
        return `
            <div class="max-w-4xl mx-auto space-y-8">
                <div class="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800 flex gap-4">
                    <div class="text-indigo-600 dark:text-indigo-400 pt-1 text-xl">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="text-sm text-indigo-700 dark:text-indigo-300">
                        <p class="font-bold mb-1">Cómo funciona:</p>
                        <p>Diseña tu formulario abajo y haz clic en "Generar Script". Se generará un código que puedes copiar y pegar en <a href="https://script.google.com" target="_blank" class="underline font-bold">Google Apps Script</a> para crear el formulario automáticamente en tu cuenta de Google.</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="space-y-6">
                        <div>
                            <label class="block text-sm font-medium mb-2">Título del Formulario</label>
                            <input type="text" id="form-title" class="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-purple-500" placeholder="Ej: Encuesta de Satisfacción" value="Nuevo Formulario">
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

                        <button onclick="UtilsModule.generateFormsScript()" class="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-purple-600/20 transition-all hover:scale-[1.02]">
                            <i class="fas fa-code mr-2"></i> Generar Script
                        </button>
                    </div>

                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <h4 class="font-semibold text-slate-700 dark:text-slate-300">Apps Script Generado</h4>
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
        fieldDiv.className = 'field-item p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 group transition-all animate-in slide-in-from-left-2';

        let typeName = '';
        let optionsHtml = '';

        switch (type) {
            case 'TEXT': typeName = 'Texto Corto'; break;
            case 'PARAGRAPH': typeName = 'Párrafo'; break;
            case 'MULTIPLE_CHOICE':
                typeName = 'Opción Múltiple';
                optionsHtml = `
                    <div class="mt-3 space-y-2">
                        <label class="text-[10px] uppercase font-bold text-slate-400">Opciones (separadas por comas)</label>
                        <input type="text" class="field-options w-full p-2 bg-white dark:bg-slate-800 border rounded-md text-sm" placeholder="Opción 1, Opción 2, Opción 3">
                    </div>
                `;
                break;
        }

        fieldDiv.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-bold px-2 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-slate-600 dark:text-slate-300">${typeName}</span>
                <button onclick="document.getElementById('${fieldId}').remove()" class="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            <input type="hidden" class="field-type" value="${type}">
            <input type="text" class="field-label w-full p-2 bg-white dark:bg-slate-800 border rounded-md text-sm outline-none focus:ring-1 focus:ring-purple-500" placeholder="Pregunta / Título del campo">
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
