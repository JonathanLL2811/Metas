require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const multer = require('multer');
const cors = require('cors');  // Importar CORS
const upload = multer();  // Configuración de multer para manejar la carga de archivos
const app = express();

// Middleware para habilitar CORS
app.use(cors());

// Middleware para parsear el cuerpo de la petición (JSON)
app.use(express.json());

// Configuración de la conexión a la base de datos usando los datos del archivo .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Endpoint para obtener todas las actividades
app.get('/actividad', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM actividad');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para crear una nueva actividad
app.post('/actividad', upload.single('foto'), async (req, res) => {
  const { actividad, fecha, descripcion de la actividad, limitantes, conclusiones } = req.body;
  const foto = req.file ? req.file.buffer : null;  // Si hay foto, tomamos el archivo

  try {
    const result = await pool.query(
      'INSERT INTO actividad (actividad, fecha, descripcion de la actividad, limitantes, conclusiones, foto) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [actividad, fecha, descripcion, limitantes, conclusiones, foto]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Configurar el puerto y arranque del servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
