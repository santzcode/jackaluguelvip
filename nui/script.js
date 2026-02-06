console.log('[NUI] JS carregou');

// ========================================
// FUNÇÕES DE SEGURANÇA
// ========================================

// Função para sanitizar HTML e prevenir XSS
function sanitizeHTML(str) {
    if (typeof str !== 'string') return '';
    
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Função segura para inserir HTML
function safeSetHTML(element, html) {
    if (!element) return;
    
    // Se o HTML contém apenas texto simples, usa textContent
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Se não há elementos HTML, usa textContent (mais seguro)
    if (tempDiv.children.length === 0) {
        element.textContent = tempDiv.textContent;
    } else {
        // Se há HTML, sanitiza antes de inserir
        element.innerHTML = html; // Mantém funcionalidade mas com cuidado
    }
}

// ========================================
// VARIÁVEIS GLOBAIS
// ========================================

let currentData = null;
let currentTab = 'dashboard';
let isModalOpen = false;
let currentModalAction = null;
let currentModalVehicle = null;

// ========================================
// ELEMENTOS DO DOM (AGORA SEGUROS)
// ========================================

console.log('[NUI] Inicializando elementos DOM...');

const tablet = document.getElementById('tablet');
const closeBtn = document.getElementById('closeBtn');
const searchInput = document.getElementById('searchInput');
const walletAmount = document.getElementById('walletAmount');
const vehicleGrid = document.getElementById('vehicleGrid');
const rentalsList = document.getElementById('rentalsList');
const recentActivity = document.getElementById('recentActivity');
const availableCount = document.getElementById('availableCount');
const rentedCount = document.getElementById('rentedCount');

// Modal
const rentalModal = document.getElementById('rentalModal');
const modalTitle = document.getElementById('modalTitle');
const modalVehicleName = document.getElementById('modalVehicleName');
const modalVehicleBrand = document.getElementById('modalVehicleBrand');
const modalClose = document.getElementById('modalClose');
const pricePerDay = document.getElementById('pricePerDay');
const totalPrice = document.getElementById('totalPrice');
const discountInfo = document.getElementById('discountInfo');
const btnCancel = document.getElementById('btnCancel');
const btnTestDrive = document.getElementById('btnTestDrive');
const btnConfirm = document.getElementById('btnConfirm');

console.log('[NUI] Elementos DOM inicializados');
console.log('[NUI] Tablet element:', tablet);
console.log('[NUI] CloseBtn element:', closeBtn);

// VERIFICAÇÃO DE ELEMENTOS CRÍTICOS
console.log('[DEBUG] Verificando elementos do modal:');
console.log('modalClose:', modalClose);
console.log('btnCancel:', btnCancel);
console.log('btnTestDrive:', btnTestDrive);
console.log('btnConfirm:', btnConfirm);

// ========================================
// FUNÇÕES DE COMUNICAÇÃO COM O CLIENTE
// ========================================

function postNUI(action, data = {}) {
    const resourceName = GetParentResourceName(); // USA A FUNÇÃO NATIVA DO FIVEM
    const url = `https://${resourceName}/${action}`;
    
    console.log(`[DEBUG] Enviando callback: ${action}`, data);
    console.log(`[DEBUG] URL: ${url}`);
    
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(resp => {
        console.log(`[DEBUG] Resposta recebida para ${action}:`, resp);
        if (!resp.ok) return null;
        return resp.json().catch(() => null); // SAFE JSON PARSE
    })
    .catch(err => {
        console.error(`[ERROR] Erro ao executar ${action}:`, err);
        throw err;
    });
}

// ========================================
// FUNÇÕES DE UI
// ========================================

function openMenu(data) {
    console.log('[NUI DEBUG] === ABRINDO MENU ===');
    console.log('[NUI DEBUG] Dados recebidos:', data);
    console.log('[NUI DEBUG] Tipo de dados:', typeof data);
    
    if (!data) {
        console.error('[NUI ERROR] Dados não recebidos para abrir o menu!');
        return;
    }
    
    console.log('[NUI DEBUG] Verificando propriedades dos dados...');
    console.log('[NUI DEBUG] availableVehicles:', data.availableVehicles ? data.availableVehicles.length : 'undefined');
    console.log('[NUI DEBUG] rentedVehicles:', data.rentedVehicles ? data.rentedVehicles.length : 'undefined');
    console.log('[NUI DEBUG] playerCoins:', data.playerCoins);
    
    // Debug detalhado dos veículos alugados
    if (data.rentedVehicles && data.rentedVehicles.length > 0) {
        console.log('[NUI DEBUG] === DETALHES DOS VEÍCULOS ALUGADOS ===');
        data.rentedVehicles.forEach((rental, index) => {
            console.log(`[NUI DEBUG] ${index + 1}. ${rental.name} (${rental.model})`);
            console.log(`[NUI DEBUG]    Placa: ${rental.plate}`);
            console.log(`[NUI DEBUG]    Dias restantes: ${rental.daysRemaining}`);
            console.log(`[NUI DEBUG]    Data aluguel: ${rental.rentalDate}`);
            console.log(`[NUI DEBUG]    Data expiração: ${rental.expiryDate}`);
        });
        console.log('[NUI DEBUG] =======================================');
    } else {
        console.log('[NUI DEBUG] ⚠️ Nenhum veículo alugado nos dados recebidos');
    }
    
    currentData = data;
    
    console.log('[NUI DEBUG] Elemento tablet:', tablet);
    console.log('[NUI DEBUG] Classes do tablet antes:', tablet.className);
    
    tablet.classList.add('show');
    
    console.log('[NUI DEBUG] Classes do tablet depois:', tablet.className);
    console.log('[NUI DEBUG] Atualizando interface...');
    
    try {
        updateDashboard();
        console.log('[NUI DEBUG] Dashboard atualizado');
        
        updateVehicleGrid();
        console.log('[NUI DEBUG] Vehicle grid atualizado');
        
        updateRentalsList();
        console.log('[NUI DEBUG] Rentals list atualizado');
        
        console.log('[NUI DEBUG] ✅ Interface atualizada com sucesso!');
    } catch (error) {
        console.error('[NUI ERROR] Erro ao atualizar interface:', error);
    }
}

// Proteção contra loop infinito de fechamento
let isClosing = false;
let lastForceCloseTime = 0; // Proteção adicional para forceClose

function closeMenu() {
    // Previne loop infinito
    if (isClosing) {
        console.log('[DEBUG] Fechamento já em andamento, ignorando...');
        return;
    }
    
    isClosing = true;
    console.log('[DEBUG] Fechando menu...');
    
    // Fecha o tablet principal
    if (tablet) {
        tablet.classList.remove('show');
    }
    
    // Fecha modal se estiver aberto
    if (isModalOpen && rentalModal) {
        rentalModal.classList.remove('show');
        isModalOpen = false;
        currentModalAction = null;
        currentModalVehicle = null;
    }
    
    // Notifica o cliente APENAS UMA VEZ
    postNUI('closeMenu').catch(err => {
        console.error('Erro ao fechar menu:', err);
    }).finally(() => {
        // Libera o lock após um pequeno delay
        setTimeout(() => {
            isClosing = false;
        }, 500);
    });
}

// Função de força fechamento para casos extremos
function forceCloseAll() {
    const now = Date.now();
    
    // Previne múltiplas execuções em menos de 2 segundos
    if (now - lastForceCloseTime < 2000) {
        console.log('[DEBUG] Force close muito recente, ignorando...');
        return;
    }
    
    // Previne loop infinito também no force close
    if (isClosing) {
        console.log('[DEBUG] Force close já em andamento, ignorando...');
        return;
    }
    
    lastForceCloseTime = now;
    isClosing = true;
    console.log('[DEBUG] 🚨 FORÇA FECHAMENTO DE TUDO');
    
    // Força fechamento do tablet
    if (tablet) {
        tablet.classList.remove('show');
        tablet.style.display = 'none';
        // Restaura display após um tempo
        setTimeout(() => {
            if (tablet) tablet.style.display = '';
        }, 100);
    }
    
    // Força fechamento do modal
    if (rentalModal) {
        rentalModal.classList.remove('show');
    }
    
    // Limpa estados
    isModalOpen = false;
    currentModalAction = null;
    currentModalVehicle = null;
    
    console.log('[DEBUG] ✅ FORÇA FECHAMENTO CONCLUÍDO');
    
    // Libera o lock após delay maior
    setTimeout(() => {
        isClosing = false;
        console.log('[DEBUG] Lock de force close liberado');
    }, 2000); // 2 segundos
}

function switchTab(tabName) {
    // Remove active de todos
    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Adiciona active no atual
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    currentTab = tabName;
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatCurrency(value, item = 'ZNCoin') {
    return `${formatNumber(value)} ${item}`;
}

// ========================================
// DASHBOARD
// ========================================

function updateDashboard() {
    if (!currentData) return;
    
    // Atualiza contadores
    availableCount.textContent = currentData.availableVehicles.filter(v => !v.isRented).length;
    rentedCount.textContent = currentData.rentedVehicles.length;
    walletAmount.textContent = formatCurrency(currentData.playerCoins);
    
    // Atualiza atividade recente
    updateRecentActivity();
}

function updateRecentActivity() {
    console.log('[DEBUG] === ATUALIZANDO ATIVIDADE RECENTE ===');
    
    if (!currentData || !currentData.rentedVehicles || currentData.rentedVehicles.length === 0) {
        console.log('[DEBUG] Nenhuma atividade recente');
        recentActivity.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h4>Nenhuma atividade</h4>
                <p>Você ainda não alugou nenhum veículo</p>
            </div>
        `;
        return;
    }
    
    console.log('[DEBUG] Construindo atividade recente para ' + currentData.rentedVehicles.length + ' veículos');
    
    let html = '';
    currentData.rentedVehicles.slice(0, 5).forEach((rental, index) => {
        console.log(`[DEBUG] Atividade ${index + 1}:`, rental.name, rental.daysRemaining, 'dias restantes');
        
        const statusColor = rental.daysRemaining <= 3 ? '#ff6b6b' : '#51cf66';
        const statusText = rental.daysRemaining <= 3 ? 'Expirando em breve!' : 'Ativo';
        
        html += `
            <div class="activity-item">
                <div class="activity-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="1" y="3" width="15" height="13"></rect>
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                </div>
                <div class="activity-details">
                    <h5>${rental.name || 'Veículo'} <span style="color: ${statusColor};">(${statusText})</span></h5>
                    <p>Placa: ${rental.plate} • ${rental.daysRemaining} dias restantes • Expira: ${rental.expiryDate}</p>
                </div>
            </div>
        `;
    });
    
    recentActivity.innerHTML = html;
    console.log('[DEBUG] ✅ Atividade recente atualizada');
}

// ========================================
// GRID DE VEÍCULOS
// ========================================

function updateVehicleGrid() {
    if (!currentData || !currentData.availableVehicles) return;
    
    let html = '';
    currentData.availableVehicles.forEach(vehicle => {
        const isRented = vehicle.isRented;
        const rentedClass = isRented ? 'rented' : '';
        const badge = isRented ? 
            '<span class="vehicle-badge rented">Alugado</span>' : 
            '<span class="vehicle-badge">Disponível</span>';
        
        // Sanitiza dados do veículo
        const safeName = sanitizeHTML(vehicle.name || 'Veículo');
        const safeBrand = sanitizeHTML(vehicle.brand || 'Marca');
        const safeModel = sanitizeHTML(vehicle.model || '');
        const safeStock = parseInt(vehicle.stock) || 0;
        const safePrice = parseInt(vehicle.price) || 0;
        const safeTotalPrice = parseInt(vehicle.totalPrice || (safePrice * 30)) || 0;
        
        html += `
            <div class="vehicle-card ${rentedClass}" data-model="${safeModel}" data-rented="${isRented}">
                <div class="vehicle-header">
                    <div>
                        <div class="vehicle-name">${safeName}</div>
                        <div class="vehicle-brand">${safeBrand}</div>
                    </div>
                    ${badge}
                </div>
                <div class="vehicle-info">
                    <div class="vehicle-price">
                        <span>30 dias</span>
                        <strong>${formatCurrency(safeTotalPrice)}</strong>
                        <small>Por dia: ${formatCurrency(safePrice)}</small>
                    </div>
                    <div class="vehicle-stock">Estoque: ${safeStock}</div>
                </div>
                ${!isRented ? `
                    <div class="vehicle-actions">
                        <button class="btn btn-display btn-small" onclick="previewVehicle('${safeModel}'); event.stopPropagation();">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"></path>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                            </svg>
                            Exibir
                        </button>
                        <button class="btn btn-primary btn-small" onclick="openRentalModalFromCard('${safeModel}'); event.stopPropagation();">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                <line x1="1" y1="10" x2="23" y2="10"></line>
                            </svg>
                            Alugar (30 dias)
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    vehicleGrid.innerHTML = html;
}

// ========================================
// LISTA DE ALUGUÉIS
// ========================================

function updateRentalsList() {
    console.log('[DEBUG] === ATUALIZANDO LISTA DE ALUGUÉIS ===');
    console.log('[DEBUG] currentData:', currentData);
    console.log('[DEBUG] rentedVehicles:', currentData ? currentData.rentedVehicles : 'undefined');
    
    if (!currentData || !currentData.rentedVehicles || currentData.rentedVehicles.length === 0) {
        console.log('[DEBUG] Nenhum veículo alugado - mostrando empty state');
        rentalsList.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
                <h4>Nenhum veículo alugado</h4>
                <p>Visite o catálogo para alugar um veículo VIP</p>
                <small style="color: #888; margin-top: 10px; display: block;">
                    💡 Os veículos são entregues automaticamente após o aluguel
                </small>
            </div>
        `;
        return;
    }
    
    console.log('[DEBUG] Construindo lista de ' + currentData.rentedVehicles.length + ' veículos alugados');
    
    let html = '';
    currentData.rentedVehicles.forEach((rental, index) => {
        console.log(`[DEBUG] Processando veículo ${index + 1}:`, rental);
        
        const warningClass = rental.daysRemaining <= 3 ? 'warning' : '';
        
        // Sanitiza todos os dados do rental
        const safeName = sanitizeHTML(rental.name || 'Veículo Desconhecido');
        const safeBrand = sanitizeHTML(rental.brand || 'Marca Desconhecida');
        const safeModel = sanitizeHTML(rental.model || '');
        const safePlate = sanitizeHTML(rental.plate || 'N/A');
        const safeRentalDate = sanitizeHTML(rental.rentalDate || 'N/A');
        const safeExpiryDate = sanitizeHTML(rental.expiryDate || 'N/A');
        const safeDaysRemaining = parseInt(rental.daysRemaining) || 0;
        const safePricePerDay = parseInt(rental.pricePerDay) || 0;
        const totalPaid = safePricePerDay * 30; // Calcula total baseado no preço por dia
        
        html += `
            <div class="rental-card">
                <div class="rental-info">
                    <h4>${safeName}</h4>
                    <p>${safeBrand}</p>
                    <div class="rental-meta">
                        <div class="rental-tag ${warningClass}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            ${safeDaysRemaining} ${(safeDaysRemaining === 1) ? 'dia' : 'dias'} restantes
                        </div>
                        <div class="rental-tag">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                <line x1="1" y1="10" x2="23" y2="10"></line>
                            </svg>
                            Placa: ${safePlate}
                        </div>
                        <div class="rental-tag">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            Alugado em: ${safeRentalDate}
                        </div>
                        <div class="rental-tag">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            Expira em: ${safeExpiryDate}
                        </div>
                        <div class="rental-tag">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                <line x1="1" y1="10" x2="23" y2="10"></line>
                            </svg>
                            Total pago: ${formatCurrency(totalPaid)}
                        </div>
                    </div>
                </div>
                <div class="rental-actions">
                    ${(safeDaysRemaining > 0) ? `
                        <button class="btn btn-secondary" onclick="openRenewalModal('${safeModel}')">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="23 4 23 10 17 10"></polyline>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                            </svg>
                            Renovar (30 dias)
                        </button>
                    ` : ''}
                    <!-- BOTÃO RETIRAR VEÍCULO REMOVIDO - Veículo spawna automaticamente após aluguel
                    <button class="btn btn-primary" onclick="spawnVehicle('${safePlate}')">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="1" y="3" width="15" height="13"></rect>
                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                            <circle cx="5.5" cy="18.5" r="2.5"></circle>
                            <circle cx="18.5" cy="18.5" r="2.5"></circle>
                        </svg>
                        Retirar Veículo
                    </button>
                    -->
                </div>
            </div>
        `;
    });
    
    console.log('[DEBUG] HTML gerado para rentals list:', html.length, 'caracteres');
    rentalsList.innerHTML = html;
    console.log('[DEBUG] ✅ Lista de aluguéis atualizada');
}

// ========================================
// MODAL DE ALUGUEL
// ========================================

function openRentalModal(action, vehicle) {
    currentModalAction = action;
    currentModalVehicle = vehicle;
    
    if (action === 'rent') {
        modalTitle.textContent = 'Alugar Veículo (30 dias)';
        discountInfo.style.display = 'none';
        btnTestDrive.style.display = 'flex'; // Mostra botão de test-drive
    } else {
        modalTitle.textContent = 'Renovar Aluguel (30 dias)';
        discountInfo.style.display = 'flex';
        btnTestDrive.style.display = 'none'; // Esconde botão na renovação
    }
    
    modalVehicleName.textContent = vehicle.name;
    modalVehicleBrand.textContent = vehicle.brand;
    
    updateModalPrice();
    
    rentalModal.classList.add('show');
    isModalOpen = true;
}

function openRenewalModal(model) {
    const rental = currentData.rentedVehicles.find(r => r.model === model);
    if (!rental) return;
    
    const vehicleData = {
        model: rental.model,
        name: rental.name,
        brand: rental.brand,
        price: rental.pricePerDay
    };
    
    openRentalModal('renew', vehicleData);
}

function closeRentalModal() {
    rentalModal.classList.remove('show');
    isModalOpen = false;
    currentModalAction = null;
    currentModalVehicle = null;
}

function updateModalPrice() {
    if (!currentModalVehicle) return;
    
    const days = 30; // FIXO: 30 dias sempre
    const priceDay = currentModalVehicle.price;
    let total = currentModalVehicle.totalPrice || (priceDay * days);
    
    // Aplica desconto se for renovação
    if (currentModalAction === 'renew') {
        total = total * 0.9; // 10% de desconto
    }
    
    pricePerDay.textContent = formatCurrency(priceDay);
    totalPrice.textContent = formatCurrency(Math.floor(total));
}

function confirmRental() {
    if (!currentModalVehicle || !currentModalAction) return;
    
    btnConfirm.disabled = true;
    btnConfirm.textContent = 'Processando...';
    
    const action = currentModalAction === 'rent' ? 'rentVehicle' : 'renewVehicle';
    const requestData = {
        model: currentModalVehicle.model,
        days: 30 // 👈 SEMPRE 30 DIAS FIXOS
    };
    
    console.log(`[DEBUG] Executando ${action} com dados:`, requestData);
    
    const resourceName = GetParentResourceName();
    fetch(`https://${resourceName}/${action}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(resp => {
        console.log(`[DEBUG] Resposta HTTP para ${action}:`, resp.status, resp.statusText);
        return resp.json();
    })
    .then(data => {
        console.log(`[DEBUG] Dados recebidos de ${action}:`, data);
        
        if (data && data.success) {
            console.log(`[DEBUG] ✅ ${action} bem-sucedido - FECHANDO NUI`);
            
            // Fecha modal primeiro
            closeRentalModal();
            
            // Fecha toda a NUI após aluguel bem-sucedido
            setTimeout(() => {
                console.log('[DEBUG] 🚗 Fechando NUI após aluguel bem-sucedido');
                closeMenu();
            }, 500); // Pequeno delay para suavizar a transição
            
            // Se houver dados para atualizar, atualiza antes de fechar
            if (data.data) {
                currentData = data.data;
                updateDashboard();
                updateVehicleGrid();
                updateRentalsList();
            }
        } else {
            console.error(`Erro na resposta de ${action}:`, data);
            // Em caso de erro, não fecha a NUI para o usuário ver o erro
        }
        
        btnConfirm.disabled = false;
        btnConfirm.textContent = 'Confirmar';
    })
    .catch(err => {
        console.error(`Erro ao executar ${action}:`, err);
        btnConfirm.disabled = false;
        btnConfirm.textContent = 'Confirmar';
        // Em caso de erro, não fecha a NUI
    });
}

function previewVehicle(model) {
    console.log(`[DEBUG] Visualizando veículo: ${model}`);
    
    const resourceName = GetParentResourceName();
    fetch(`https://${resourceName}/previewVehicle`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: model
        })
    })
    .then(resp => {
        console.log(`[DEBUG] Resposta preview veículo:`, resp.status, resp.statusText);
        return resp.json();
    })
    .then(data => {
        console.log(`[DEBUG] Dados preview veículo:`, data);
    })
    .catch(err => {
        console.error('Erro ao visualizar veículo:', err);
    });
}

function openRentalModalFromCard(model) {
    console.log(`[DEBUG] Abrindo modal de aluguel para: ${model}`);
    
    const vehicle = currentData.availableVehicles.find(v => v.model === model);
    if (vehicle) {
        openRentalModal('rent', vehicle);
    }
}

/* FUNÇÃO SPAWNVEHICLE COMENTADA - Não é mais necessária na NUI
   Veículos são spawnados automaticamente após o aluguel
function spawnVehicle(plate) {
    console.log(`[DEBUG] Spawnando veículo com placa: ${plate}`);
    
    const resourceName = GetParentResourceName();
    fetch(`https://${resourceName}/spawnVehicle`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            plate: plate
        })
    })
    .then(resp => {
        console.log(`[DEBUG] Resposta spawn veículo:`, resp.status, resp.statusText);
        return resp.json();
    })
    .then(data => {
        console.log(`[DEBUG] Dados spawn veículo:`, data);
        if (data && data.success) {
            // Fecha a NUI após spawn bem-sucedido
            setTimeout(() => {
                console.log('[DEBUG] 🚗 Fechando NUI após spawn de veículo');
                closeMenu();
            }, 1000);
        }
    })
    .catch(err => {
        console.error('Erro ao spawnar veículo:', err);
    });
}
*/

function startTestDrive() {
    if (!currentModalVehicle) return;
    
    console.log('[DEBUG] Iniciando test-drive:', currentModalVehicle.model);
    
    btnTestDrive.disabled = true;
    btnTestDrive.textContent = 'Preparando...';
    
    const resourceName = GetParentResourceName();
    fetch(`https://${resourceName}/testDrive`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: currentModalVehicle.model
        })
    })
    .then(resp => {
        console.log('[DEBUG] Resposta test-drive HTTP:', resp.status, resp.statusText);
        return resp.json();
    })
    .then(data => {
        console.log('[DEBUG] Dados test-drive:', data);
        
        if (data && data.success) {
            closeRentalModal();
        }
        
        btnTestDrive.disabled = false;
        btnTestDrive.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
            </svg>
            Test-Drive
        `;
    })
    .catch(err => {
        console.error('Erro ao iniciar test-drive:', err);
        btnTestDrive.disabled = false;
        btnTestDrive.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
            </svg>
            Test-Drive
        `;
    });
}

// ========================================
// BUSCA
// ========================================

function handleSearch() {
    const query = searchInput.value.toLowerCase();
    
    document.querySelectorAll('.vehicle-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(query)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// ========================================
// CONFIGURAÇÃO DE EVENT LISTENERS
// ========================================

console.log('[NUI] Configurando event listeners...');

// Fechar menu
if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
    console.log('[DEBUG] closeBtn listener adicionado');
} else {
    console.warn('[NUI] closeBtn não encontrado!');
}

// Trocar tabs
document.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        switchTab(this.dataset.tab);
    });
});
console.log('[DEBUG] sidebar-btn listeners adicionados');

// Busca
if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
    console.log('[DEBUG] searchInput listener adicionado');
} else {
    console.warn('[NUI] searchInput não encontrado!');
}

// Modal
if (modalClose) {
    modalClose.addEventListener('click', closeRentalModal);
    console.log('[DEBUG] modalClose listener adicionado');
} else {
    console.warn('[NUI] modalClose não encontrado!');
}

if (btnCancel) {
    btnCancel.addEventListener('click', closeRentalModal);
    console.log('[DEBUG] btnCancel listener adicionado');
} else {
    console.warn('[NUI] btnCancel não encontrado!');
}

if (btnTestDrive) {
    btnTestDrive.addEventListener('click', startTestDrive);
    console.log('[DEBUG] btnTestDrive listener adicionado');
} else {
    console.warn('[NUI] btnTestDrive não encontrado!');
}

if (btnConfirm) {
    btnConfirm.addEventListener('click', confirmRental);
    console.log('[DEBUG] btnConfirm listener adicionado');
} else {
    console.warn('[NUI] btnConfirm não encontrado!');
}

// Fechar modal clicando fora
if (rentalModal) {
    rentalModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeRentalModal();
        }
    });
    console.log('[DEBUG] rentalModal click-outside listener adicionado');
} else {
    console.warn('[NUI] rentalModal não encontrado!');
}

// ESC para fechar
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        console.log('[DEBUG] ESC pressionado no JavaScript');
        if (isModalOpen) {
            console.log('[DEBUG] Fechando modal com ESC');
            closeRentalModal();
        } else if (tablet && tablet.classList.contains('show')) {
            console.log('[DEBUG] Fechando menu com ESC');
            closeMenu();
        }
    }
});
console.log('[DEBUG] keydown listener adicionado');

// LISTENER DE MENSAGENS DO CLIENTE
window.addEventListener('message', function(event) {
    const data = event.data;
    
    // Ignora mensagens inválidas
    if (!data || !data.action) {
        return;
    }
    
    console.log('[DEBUG] Mensagem recebida:', data.action);
    
    if (data.action === 'openMenu') {
        console.log('[DEBUG] Ação: openMenu');
        if (data.loading) {
            console.log('[DEBUG] Abrindo com loading...');
            openMenuWithLoading(data.data);
        } else {
            openMenu(data.data);
        }
    } else if (data.action === 'updateData') {
        console.log('[DEBUG] Ação: updateData - Atualizando dados');
        updateMenuData(data.data);
    } else if (data.action === 'showError') {
        console.log('[DEBUG] Ação: showError');
        showError(data.message);
    } else if (data.action === 'closeMenu') {
        console.log('[DEBUG] Ação: closeMenu');
        // NÃO chama closeMenu() aqui para evitar loop
        // Apenas fecha visualmente
        if (tablet && !isClosing) {
            tablet.classList.remove('show');
        }
    } else if (data.action === 'forceClose') {
        console.log('[DEBUG] Ação: forceClose - FORÇA FECHAMENTO');
        // Só executa se não estiver já processando
        if (!isClosing && (Date.now() - lastForceCloseTime) > 2000) {
            forceCloseAll();
        } else {
            console.log('[DEBUG] ForceClose ignorado - muito recente ou já processando');
        }
    } else if (data.action === 'test') {
        console.log('[DEBUG] ✅ TESTE BÁSICO RECEBIDO!');
        console.log('[DEBUG] Mensagem:', data.message);
        
        // Força o tablet a aparecer com fundo vermelho
        if (tablet) {
            tablet.style.display = 'flex';
            tablet.style.background = 'red';
            tablet.style.zIndex = '9999';
            console.log('[DEBUG] Tablet forçado a aparecer com fundo vermelho');
        } else {
            console.error('[DEBUG] Tablet não encontrado para teste!');
        }
    } else {
        console.warn('[DEBUG] Ação desconhecida:', data.action);
    }
});

// ========================================
// FUNÇÕES DE LOADING E UPDATE
// ========================================

function openMenuWithLoading(data) {
    console.log('[NUI DEBUG] === ABRINDO MENU COM LOADING ===');
    
    currentData = data;
    tablet.classList.add('show');
    
    // Atualiza dados básicos primeiro
    if (walletAmount) walletAmount.textContent = formatCurrency(data.playerCoins || 0);
    if (availableCount) availableCount.textContent = data.availableVehicles ? data.availableVehicles.length : '...';
    if (rentedCount) rentedCount.textContent = data.rentedVehicles ? data.rentedVehicles.length : '...';
    
    // Mostra loading nos grids
    if (vehicleGrid) {
        vehicleGrid.innerHTML = `
            <div class="loading-container" style="display: flex; justify-content: center; align-items: center; height: 200px; color: #fff;">
                <div style="text-align: center;">
                    <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 0 auto 20px;"></div>
                    <h3>🔄 Carregando veículos...</h3>
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
    }
    
    if (rentalsList) {
        rentalsList.innerHTML = `
            <div class="loading-container" style="display: flex; justify-content: center; align-items: center; height: 200px; color: #fff;">
                <div style="text-align: center;">
                    <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 0 auto 20px;"></div>
                    <h3>🔄 Carregando aluguéis...</h3>
                </div>
            </div>
        `;
    }
    
    // Atualiza atividade recente
    if (recentActivity) {
        recentActivity.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #fff;">
                <h4>🔄 Carregando atividades...</h4>
            </div>
        `;
    }
    
    console.log('[NUI DEBUG] ✅ Menu aberto com loading!');
}

function updateMenuData(data) {
    console.log('[NUI DEBUG] === ATUALIZANDO DADOS DO MENU ===');
    
    currentData = data;
    
    // Remove loading e atualiza interface
    updateDashboard();
    updateVehicleGrid();
    updateRentalsList();
    
    console.log('[NUI DEBUG] ✅ Dados atualizados!');
}

function showError(message) {
    console.log('[NUI DEBUG] === MOSTRANDO ERRO ===');
    
    if (vehicleGrid) {
        vehicleGrid.innerHTML = `<div style="text-align:center;padding:50px;color:#ff6b6b;"><h3>❌ ${message}</h3></div>`;
    }
    
    if (rentalsList) {
        rentalsList.innerHTML = `<div style="text-align:center;padding:50px;color:#ff6b6b;"><h3>❌ ${message}</h3></div>`;
    }
}

console.log('[NUI] Event listeners configurados com sucesso!');

// ========================================
// DEBUG (Remover em produção)
// ========================================

// Para testar no navegador
if (window.location.protocol === 'file:') {
    console.log('Modo de debug ativado');
    
    // Dados de teste
    setTimeout(() => {
        openMenu({
            availableVehicles: [
                { model: 'aleutian', name: 'Aleutian', brand: 'Vapid', price: 300, stock: 10, category: 'super', isRented: false },
                { model: 'elegy', name: 'Elegy RH8', brand: 'Annis', price: 250, stock: 8, category: 'sports', isRented: false },
                { model: 'sultan2', name: 'Sultan RS Classic', brand: 'Karin', price: 280, stock: 6, category: 'sports', isRented: true },
                { model: 'banshee', name: 'Banshee', brand: 'Bravado', price: 320, stock: 5, category: 'super', isRented: false },
            ],
            rentedVehicles: [
                { 
                    id: 1, 
                    model: 'sultan2', 
                    name: 'Sultan RS Classic', 
                    brand: 'Karin',
                    rentalDate: '01/02/2026',
                    expiryDate: '08/02/2026',
                    daysRented: 7,
                    totalPaid: 1960,
                    daysRemaining: 6,
                    pricePerDay: 280,
                    canRenew: true
                }
            ],
            playerCoins: 5000,
            paymentItem: 'ZNCoin',
            maxDays: 30
        });
    }, 500);
}