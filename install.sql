-- ========================================
-- ESTRUTURA PARA ALUGUEL DE VEÍCULOS VIP
-- ========================================

-- Verifica se a coluna expires_at existe na tabela player_vehicles
-- Se não existir, adiciona ela
ALTER TABLE player_vehicles 
ADD COLUMN IF NOT EXISTS expires_at BIGINT NULL;

-- Cria índice para melhor performance na verificação de expiração
CREATE INDEX IF NOT EXISTS idx_expires_at ON player_vehicles(expires_at);

-- Verifica se a coluna plate tem tamanho suficiente (deve ser VARCHAR(8) no mínimo)
-- Se for menor, altera para VARCHAR(8)
ALTER TABLE player_vehicles 
MODIFY COLUMN plate VARCHAR(8) NOT NULL;

-- ========================================
-- TABELA DE CONTROLE DE ALUGUÉIS (OPCIONAL)
-- ========================================

CREATE TABLE IF NOT EXISTS `vip_car_rentals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `citizenid` varchar(50) NOT NULL,
  `vehicle_model` varchar(50) NOT NULL,
  `vehicle_name` varchar(100) NOT NULL,
  `rental_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `plate` varchar(8) NOT NULL,
  `total_paid` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `citizenid` (`citizenid`),
  KEY `plate` (`plate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- LIMPEZA DE DADOS CORROMPIDOS (EXECUTE APENAS UMA VEZ)
-- ========================================

-- Remove placas muito longas que podem ter sido criadas pelo bug anterior
DELETE FROM player_vehicles 
WHERE LENGTH(plate) > 8;

-- ========================================
-- COMO FUNCIONA O SISTEMA
-- ========================================
-- 1. Veículo alugado é inserido em player_vehicles com expires_at = timestamp + 30 dias
-- 2. Sistema verifica periodicamente veículos com expires_at < tempo atual
-- 3. Remove automaticamente veículos expirados
-- 4. Aluguel é SEMPRE 30 dias fixos
-- 5. Placas são geradas com 8 caracteres aleatórios (letras e números)
-- 6. Veículos ficam na garagem 'pillboxgarage' por padrão