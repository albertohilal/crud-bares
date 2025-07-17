CREATE TABLE IF NOT EXISTS aa_clientes_autorizados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_slug VARCHAR(100) NOT NULL UNIQUE,
  nombre VARCHAR(255),
  clave_api VARCHAR(64) NOT NULL,
  activo TINYINT(1) DEFAULT 1
);

INSERT INTO aa_clientes_autorizados (cliente_slug, nombre, clave_api)
VALUES ('nocturno', 'Nocturno Bar', 'token-nocturno-123');
