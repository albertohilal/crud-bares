require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get('/categorias', async (req, res) => {
  try {
    const [categorias] = await pool.query('SELECT nombre FROM aa_menu_categorias ORDER BY nombre ASC');
    res.json(categorias.map(cat => cat.nombre));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

app.get('/productos', async (req, res) => {
  const token = req.headers['x-api-key'];
  if (!token) return res.status(401).json({ error: 'Token faltante' });

  try {
    const [clientes] = await pool.query("SELECT * FROM aa_clientes_autorizados WHERE clave_api = ? AND activo = 1", [token]);
    if (clientes.length === 0) return res.status(403).json({ error: 'Token inválido' });

    const slug = clientes[0].cliente_slug;
    const [productos] = await pool.query("SELECT * FROM aa_menu_productos WHERE cliente_slug = ? ORDER BY categoria, nombre_producto", [slug]);
    res.json(productos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

app.post('/productos', async (req, res) => {
  const token = req.headers['x-api-key'];
  if (!token) return res.status(401).json({ error: 'Token faltante' });

  try {
    const [clientes] = await pool.query("SELECT * FROM aa_clientes_autorizados WHERE clave_api = ? AND activo = 1", [token]);
    if (clientes.length === 0) return res.status(403).json({ error: 'Token inválido' });

    const slug = clientes[0].cliente_slug;
    const { nombre_producto, descripcion, categoria, precio } = req.body;
    await pool.query(
      "INSERT INTO aa_menu_productos (cliente_slug, nombre_producto, descripcion, categoria, precio) VALUES (?, ?, ?, ?, ?)",
      [slug, nombre_producto, descripcion, categoria, precio]
    );
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar producto' });
  }
});

app.delete('/productos/:id', async (req, res) => {
  const token = req.headers['x-api-key'];
  if (!token) return res.status(401).json({ error: 'Token faltante' });

  try {
    const [clientes] = await pool.query("SELECT * FROM aa_clientes_autorizados WHERE clave_api = ? AND activo = 1", [token]);
    if (clientes.length === 0) return res.status(403).json({ error: 'Token inválido' });

    const slug = clientes[0].cliente_slug;
    await pool.query("DELETE FROM aa_menu_productos WHERE id = ? AND cliente_slug = ?", [req.params.id, slug]);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

const PORT = process.env.PORT || 3011;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
