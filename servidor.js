const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

console.log("Variables de entorno cargadas:", {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_DATABASE: process.env.DB_DATABASE,
  DB_PORT: process.env.DB_PORT,
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

// ✅ Obtener categorías ordenadas alfabéticamente
app.get("/categorias", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM aa_menu_categorias WHERE visible = 1 ORDER BY nombre ASC");
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
});

app.get("/bodegas", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM aa_bodegas ORDER BY nombre");
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener bodegas:", error);
    res.status(500).json({ error: "Error al obtener bodegas" });
  }
});

app.get("/subtipos-vino", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM aa_subtipos_vino ORDER BY orden");
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener subtipos de vino:", error);
    res.status(500).json({ error: "Error al obtener subtipos de vino" });
  }
});

app.get("/productos/:slug", async (req, res) => {
  const slug = req.params.slug;
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.nombre_producto,
        p.descripcion,
        p.precio,
        p.precio_chico,
        p.precio_grande,
        p.categoria,
        c.nombre AS nombre_categoria,
        p.bodega_id,
        b.nombre AS nombre_bodega,
        p.subcategoria_tipo_id,
        s.nombre AS nombre_subtipo
      FROM aa_menu_productos p
      LEFT JOIN aa_menu_categorias c ON p.categoria = c.id
      LEFT JOIN aa_bodegas b ON p.bodega_id = b.id
      LEFT JOIN aa_subtipos_vino s ON p.subcategoria_tipo_id = s.id
      WHERE p.cliente_slug = ?
      ORDER BY p.categoria DESC
    `, [slug]);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

app.get("/producto", async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: "Falta el parámetro id" });

  try {
    const [rows] = await pool.query("SELECT * FROM aa_menu_productos WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener producto por ID:", error);
    res.status(500).json({ error: "Error al obtener producto" });
  }
});

app.post("/producto", async (req, res) => {
  const {
    nombre_producto,
    descripcion,
    precio,
    precio_chico,
    precio_grande,
    categoria,
    bodega_id,
    subcategoria_tipo_id,
    cliente_slug
  } = req.body;

  try {
    const [result] = await pool.query(`
      INSERT INTO aa_menu_productos 
        (nombre_producto, descripcion, precio, precio_chico, precio_grande, categoria, bodega_id, subcategoria_tipo_id, cliente_slug, visible)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      nombre_producto,
      descripcion,
      precio,
      precio_chico,
      precio_grande,
      categoria,
      bodega_id || null,
      subcategoria_tipo_id || null,
      cliente_slug
    ]);

    res.json({ mensaje: "Producto creado", id: result.insertId });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

app.put("/producto", async (req, res) => {
  const id = req.query.id;
  const {
    nombre_producto,
    descripcion,
    precio,
    precio_chico,
    precio_grande,
    categoria,
    bodega_id,
    subcategoria_tipo_id,
    cliente_slug
  } = req.body;

  try {
    const [result] = await pool.query(`
      UPDATE aa_menu_productos SET
        nombre_producto = ?,
        descripcion = ?,
        precio = ?,
        precio_chico = ?,
        precio_grande = ?,
        categoria = ?,
        bodega_id = ?,
        subcategoria_tipo_id = ?,
        cliente_slug = ?
      WHERE id = ?
    `, [
      nombre_producto,
      descripcion,
      precio,
      precio_chico,
      precio_grande,
      categoria,
      bodega_id || null,
      subcategoria_tipo_id || null,
      cliente_slug,
      id
    ]);

    res.json({ mensaje: "Producto actualizado", actualizado: result.affectedRows });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

app.delete("/producto", async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: "Falta el parámetro id" });

  try {
    const [result] = await pool.query("DELETE FROM aa_menu_productos WHERE id = ?", [id]);
    res.json({ mensaje: "Producto eliminado", eliminados: result.affectedRows });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

const PORT = process.env.PORT || 3011;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
