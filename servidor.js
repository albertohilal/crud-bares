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

// Obtener categorías
app.get('/categorias', async (req, res) => {
  try {
    const [categorias] = await pool.query('SELECT id, nombre FROM aa_menu_categorias WHERE visible = 1 ORDER BY orden ASC');
    res.json(categorias);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// Obtener productos por slug con nombre de categoría
app.get('/productos', async (req, res) => {
  const slug = req.query.slug;
  if (!slug) return res.status(400).json({ error: 'Falta el parámetro slug' });

  try {
    const [productos] = await pool.query(
      `SELECT p.*, c.nombre AS nombre_categoria
       FROM aa_menu_productos p
       LEFT JOIN aa_menu_categorias c ON p.categoria = c.id
       WHERE p.cliente_slug = ?
       ORDER BY c.orden, p.nombre_producto`,
      [slug]
    );
    res.json(productos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Guardar (insertar o actualizar) producto
app.post('/guardar-producto', async (req, res) => {
  const { id, nombre, descripcion, categoria, precio, slug } = req.body;

  if (!slug) return res.status(400).json({ error: 'Falta el slug del cliente' });

  try {
    const [clientes] = await pool.query("SELECT id FROM aa_clientes_autorizados WHERE cliente_slug = ?", [slug]);
    if (clientes.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });

    const cliente_id = clientes[0].id;

    if (id) {
      // Actualización
      await pool.query(
        "UPDATE aa_menu_productos SET nombre_producto = ?, descripcion = ?, categoria = ?, precio = ? WHERE id = ? AND cliente_id = ?",
        [nombre, descripcion, categoria, precio, id, cliente_id]
      );
      res.json({ mensaje: 'Producto actualizado correctamente' });
    } else {
      // Inserción
      await pool.query(
        `INSERT INTO aa_menu_productos 
         (cliente_id, cliente_slug, nombre_producto, descripcion, categoria, precio, visible, fecha_creacion) 
         VALUES (?, ?, ?, ?, ?, ?, 1, NOW())`,
        [cliente_id, slug, nombre, descripcion, categoria, precio]
      );
      res.json({ mensaje: 'Producto creado correctamente' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar producto' });
  }
});

// Eliminar producto
app.delete('/productos/:id', async (req, res) => {
  const { id } = req.params;
  const { slug } = req.query;

  if (!slug) return res.status(400).json({ error: 'Falta el parámetro slug' });

  try {
    const [cliente] = await pool.query("SELECT id FROM aa_clientes_autorizados WHERE cliente_slug = ?", [slug]);
    if (cliente.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });

    await pool.query("DELETE FROM aa_menu_productos WHERE id = ? AND cliente_slug = ?", [id, slug]);
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
