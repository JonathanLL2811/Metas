require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const multer = require('multer');
const app = express();

// Configuración de multer para manejo de archivos (foto)
const storage = multer.memoryStorage();  // Guardar en memoria
const upload = multer({ storage: storage });

// Middleware para parsear el cuerpo de la solicitud
app.use(express.json());

// Conexión a la base de datos PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// **GET** Endpoint para obtener todas las actividades
app.get('/actividades', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM actividades');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// **POST** Endpoint para agregar una nueva actividad
app.post('/actividad', upload.single('foto'), async (req, res) => {
  const { fecha, descripcion, limitantes } = req.body;
  const foto = req.file ? req.file.buffer : null;  // Si se sube una foto, se guarda en el campo "foto"
  
  try {
    const result = await pool.query(
      'INSERT INTO actividades (fecha, descripcion, limitantes, foto) VALUES ($1, $2, $3, $4) RETURNING *',
      [fecha, descripcion, limitantes, foto]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// **DELETE** Endpoint para eliminar una actividad por su id
app.delete('/actividades/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM actividades WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    res.status(200).json({ message: 'Actividad eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Configuración del puerto del servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
