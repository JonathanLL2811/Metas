const express = require('express');
const multer = require('multer');
const pool = require('./db');  // Conexión a la base de datos PostgreSQL

const app = express();
app.use(express.json());  // Middleware para procesar JSON

// Configuración de Multer para manejar la foto (almacenarla en memoria)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint para agregar una actividad con foto
app.post('/actividades', upload.single('foto'), async (req, res) => {
  const { actividad, fecha, descripcion, limitantes, conclusiones } = req.body;
  const foto = req.file ? req.file.buffer : null; // Si hay foto, tomamos el archivo en memoria

  try {
    const result = await pool.query(
      'INSERT INTO actividades (actividad, fecha, descripcion, limitantes, foto, conclusiones) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [actividad, fecha, descripcion, limitantes, foto, conclusiones]
    );
    res.status(201).json(result.rows[0]); // Retorna la actividad que se acaba de agregar
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al agregar la actividad');
  }
});

// Endpoint para obtener una actividad con su foto
app.get('/actividades/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('SELECT * FROM actividades WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Actividad no encontrada');
    }

    const actividad = result.rows[0];

    // Si la foto está presente, la enviamos en formato base64
    if (actividad.foto) {
      actividad.foto = actividad.foto.toString('base64');  // Convertir a base64
    }

    res.status(200).json(actividad);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener la actividad');
  }
});

// Puerto en el que se ejecutará el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});
