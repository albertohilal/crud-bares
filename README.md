# CRUD Bares 🍻

Este proyecto permite a bares o comercios gestionar su menú de productos mediante un formulario web protegido con token. Cada cliente tiene acceso solo a sus propios productos.

---

## 🔧 Tecnologías utilizadas

- **Frontend**: HTML5, Bootstrap 5, JavaScript
- **Backend**: Node.js + Express
- **Base de datos**: MySQL
- **Login**: por token API (`x-api-key`)
- **Despliegue**: local o servidor VPS

---

## 📂 Estructura del proyecto

crud-bares/
├── public/
│ ├── login.html # Formulario de ingreso con token
│ └── form_crud.html # Interfaz CRUD para productos
├── servidor.js # Backend Express
├── .env # Variables de entorno (NO subir a GitHub)
├── .gitignore # Archivos ignorados por Git
└── README.md

yaml
Copiar
Editar

---

## ⚙️ Instalación y ejecución

### 1. Cloná el repositorio

```bash
git clone git@github.com:albertohilal/crud-bares.git
cd crud-bares
2. Instalá las dependencias
bash
Copiar
Editar
npm install
3. Configurá tu archivo .env
Creá un archivo .env con tus credenciales MySQL:

env
Copiar
Editar
DB_HOST=sv46.byethost46.org
DB_USER=iunaorg_b3toh
DB_PASSWORD=elgeneral2018
DB_DATABASE=iunaorg_bares
DB_PORT=3306
PORT=3011
4. Iniciá el servidor
bash
Copiar
Editar
node servidor.js
Luego abrí tu navegador en:

bash
Copiar
Editar
http://localhost:3011/login.html
🔑 Acceso por token
Cada cliente autorizado posee un token que debe ingresar para gestionar su menú.
Ejemplo de token de prueba:

Copiar
Editar
token-nocturno-123
Este token debe estar en la tabla aa_clientes_autorizados con activo = 1.

🧠 Funcionalidades
Agregar, ver y eliminar productos

Cada cliente ve solo sus productos

Categorías ordenadas alfabéticamente

Interfaz responsive y usable

Backend protegido por token

📌 Notas
El archivo .env está excluido del repositorio por seguridad.

Si querés extender el CRUD con edición o subida de imágenes, podés agregar campos al formulario y manejar archivos con multer.

📄 Licencia
MIT – Libre para usar, modificar y mejorar.