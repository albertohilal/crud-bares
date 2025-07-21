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

// Ruta: Categorías
app.get("/categorias", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM aa_menu_categorias");
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
});

// Ruta: Bodegas
app.get("/bodegas", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM aa_bodegas");
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener bodegas:", error);
    res.status(500).json({ error: "Error al obtener bodegas" });
  }
});

// Ruta: Subtipos
app.get("/subtipos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM aa_subtipos_vino");
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener subtipos:", error);
    res.status(500).json({ error: "Error al obtener subtipos" });
  }
});

// Ruta: Listar productos por slug
app.get("/productos", async (req, res) => {
  const slug = req.query.slug;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM aa_menu_productos WHERE cliente_slug = ?",
      [slug]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// ✅ Ruta: Obtener producto por ID (necesaria para Editar)
app.get("/productos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM aa_menu_productos WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ error: "Error al obtener producto" });
  }
});

// Ruta: Crear producto
app.post("/productos", async (req, res) => {
  const {
    nombre_producto,
    precio,
    descripcion,
    categoria,
    cliente_slug,
    precio_chico,
    precio_grande,
    visible,
    subcategoria_tipo_id,
    bodega_id,
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO aa_menu_productos 
       (nombre_producto, precio, descripcion, categoria, cliente_slug, precio_chico, precio_grande, visible, subcategoria_tipo_id, bodega_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre_producto,
        precio,
        descripcion,
        categoria,
        cliente_slug,
        precio_chico,
        precio_grande,
        visible,
        subcategoria_tipo_id,
        bodega_id,
      ]
    );
    res.json({ id: result.insertId });
  } catch (error) {
    console.error("Error al insertar producto:", error);
    res.status(500).json({ error: "Error al insertar producto" });
  }
});

// Ruta: Eliminar producto
app.delete("/productos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM aa_menu_productos WHERE id = ?", [id]);
    res.sendStatus(204);
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

// Ruta: Editar producto
app.put("/productos/:id", async (req, res) => {
  const { id } = req.params;
  const {
    nombre_producto,
    precio,
    descripcion,
    categoria,
    cliente_slug,
    precio_chico,
    precio_grande,
    visible,
    subcategoria_tipo_id,
    bodega_id,
  } = req.body;

  try {
    await pool.query(
      `UPDATE aa_menu_productos 
       SET nombre_producto = ?, precio = ?, descripcion = ?, categoria = ?, cliente_slug = ?, 
           precio_chico = ?, precio_grande = ?, visible = ?, subcategoria_tipo_id = ?, bodega_id = ?
       WHERE id = ?`,
      [
        nombre_producto,
        precio,
        descripcion,
        categoria,
        cliente_slug,
        precio_chico,
        precio_grande,
        visible,
        subcategoria_tipo_id,
        bodega_id,
        id,
      ]
    );
    res.sendStatus(200);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

const PORT = process.env.PORT || 3011;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
