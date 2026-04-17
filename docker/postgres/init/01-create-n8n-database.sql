-- Crea la base de datos aislada para n8n (persistencia de workflows, credenciales, ejecuciones).
-- Se ejecuta una sola vez, en el primer arranque del volumen postgres_data.
SELECT 'CREATE DATABASE n8n_db OWNER ecommerce_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'n8n_db')\gexec

GRANT ALL PRIVILEGES ON DATABASE n8n_db TO ecommerce_user;
