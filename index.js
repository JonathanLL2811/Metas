const express = require('express');
const multer = require('multer');
const pool = require('./db'); // Conexión a la base de datos

const app = express();
app.use(express.json()); // Middleware para manejar JSON

// Configuración de almacenamiento de Multer (en memoria)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint para agregar actividad con imagen
app.post('/actividades', upload.single('foto'), async (req, res) => {
  const { actividad, fecha, descripcion, limitantes, conclusiones } = req.body;
  const foto = req.file ? req.file.buffer : null; // Aquí obtenemos el archivo subido

  try {
    const result = await pool.query(
      'INSERT INTO actividades (actividad, fecha, descripcion, limitantes, foto, conclusiones) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [actividad, fecha, descripcion, limitantes, foto, conclusiones]
    );
    res.status(201).json(result.rows[0]); // Retorna la actividad agregada
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al agregar la actividad');
  }
});

// Puerto en el que se ejecutará el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});
