// map.js - Script do mapa FluxBus
// Variáveis globais
let map;
let userMarker;
let userLocation = null;

// CSS custom variables (caso não estejam disponíveis no JS)
const COLORS = {
    primary: '#1391bb',
    secondary: '#0f758c',
    dark: '#0a4b59',
    light: '#f2f2f2',
    darker: '#222121'
};

/**
 * Inicializar o mapa
 */
function initMap() {
    try {
        // Criar o mapa com tile minimalista (CartoDB Positron - bem clarinho)
        map = L.map('map', {
            zoomControl: false,
            attributionControl: false
        }).setView([-30.0346, -51.2177], 13); // Porto Alegre como padrão

        // Adicionar tile layer claro e minimalista
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        // Adicionar controle de zoom personalizado
        L.control.zoom({
            position: 'topright'
        }).addTo(map);

        // Tentar obter localização do usuário
        getUserLocation();
        
        console.log('Mapa inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar mapa:', error);
        showError('Erro ao carregar o mapa');
    }
}

/**
 * Obter localização do usuário
 */
function getUserLocation() {
    if (!navigator.geolocation) {
        console.log('Geolocalização não suportada');
        showLocationError();
        return;
    }

    // Opções de geolocalização
    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
    };

    navigator.geolocation.getCurrentPosition(
        onLocationSuccess,
        onLocationError,
        options
    );
}

/**
 * Callback de sucesso da geolocalização
 */
function onLocationSuccess(position) {
    try {
        userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        
        // Centralizar mapa na localização do usuário
        map.setView([userLocation.lat, userLocation.lng], 16);
        
        // Adicionar marcador do usuário (bolinha azul)
        userMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
            color: COLORS.primary,
            fillColor: COLORS.primary,
            fillOpacity: 0.8,
            radius: 8,
            weight: 3
        }).addTo(map);

        // Adicionar círculo de precisão
        L.circle([userLocation.lat, userLocation.lng], {
            color: COLORS.primary,
            fillColor: COLORS.primary,
            fillOpacity: 0.1,
            radius: position.coords.accuracy,
            weight: 1
        }).addTo(map);

        // Atualizar campo de origem com endereço aproximado
        updateOriginAddress();
        
        console.log('Localização obtida:', userLocation);
    } catch (error) {
        console.error('Erro ao processar localização:', error);
        showLocationError();
    }
}

/**
 * Callback de erro da geolocalização
 */
function onLocationError(error) {
    console.log('Erro ao obter localização:', error);
    
    let message = 'Erro desconhecido';
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message = 'Permissão de localização negada';
            break;
        case error.POSITION_UNAVAILABLE:
            message = 'Localização indisponível';
            break;
        case error.TIMEOUT:
            message = 'Timeout na obtenção da localização';
            break;
    }
    
    console.log('Detalhes do erro:', message);
    showLocationError();
}

/**
 * Atualizar endereço de origem (simulado)
 * Em produção, você faria reverse geocoding aqui
 */
function updateOriginAddress() {
    const originInput = document.getElementById('origin');
    if (originInput) {
        originInput.value = "Sua localização atual";
    }
}

/**
 * Mostrar erro de localização
 */
function showLocationError() {
    const originInput = document.getElementById('origin');
    if (originInput) {
        originInput.placeholder = "Localização não disponível";
    }
}

/**
 * Mostrar erro genérico
 */
function showError(message) {
    // Você pode integrar isso com seu sistema de notificações
    console.error(message);
    alert(message);
}

/**
 * Função de busca de rota
 */
function searchRoute() {
    try {
        const origin = document.getElementById('origin')?.value || '';
        const destination = document.getElementById('destination')?.value || '';
        
        if (!destination.trim()) {
            showError('Por favor, digite o destino!');
            return;
        }
        
        if (!userLocation) {
            showError('Aguarde enquanto obtemos sua localização...');
            return;
        }
        
        // Aqui você implementaria a lógica de busca de rotas
        // Pode fazer uma requisição AJAX para seu backend Flask
        console.log('Buscando rota de:', origin, 'para:', destination);
        
        // Exemplo de como fazer requisição para Flask:
        // fetch('/buscar_rota', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         origin: userLocation,
        //         destination: destination
        //     })
        // })
        // .then(response => response.json())
        // .then(data => {
        //     // Processar resultado da rota
        //     console.log('Rota encontrada:', data);
        // })
        // .catch(error => {
        //     console.error('Erro na busca:', error);
        //     showError('Erro ao buscar rota');
        // });
        
        // Por enquanto, apenas um placeholder
        showError('Funcionalidade de busca será implementada em breve!');
        
    } catch (error) {
        console.error('Erro na busca de rota:', error);
        showError('Erro ao buscar rota');
    }
}

/**
 * Inicializar navegação bottom
 */
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active de todos
            navItems.forEach(nav => nav.classList.remove('active'));
            // Adiciona active no clicado
            this.classList.add('active');
            
            // Aqui você pode adicionar lógica de navegação
            console.log('Navegando para:', this.textContent.trim());
        });
    });
}

/**
 * Inicialização principal
 */
function init() {
    // Aguardar DOM carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
        return;
    }
    
    // Inicializar componentes
    initMap();
    initNavigation();
    
    console.log('FluxBus Map inicializado');
}

// Auto-inicializar
init();

// Expor funções globalmente (se necessário)
window.FluxBusMap = {
    searchRoute: searchRoute,
    getUserLocation: getUserLocation,
    map: () => map,
    userLocation: () => userLocation
};