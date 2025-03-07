require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const multer = require('multer');
const cors = require('cors');
const upload = multer();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Lista de departamentos
const departamentos = [
  'laboratorio', 'direccion', 'personal', 'planeamiento',
  'bienes', 'redes', 'vigilancia', 'marcon'
];

// Generar endpoints para cada departamento
departamentos.forEach((departamento) => {
  
  // Obtener todas las actividades
  app.get(`/${departamento}`, async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM ${departamento}`);
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Obtener una imagen específica
  app.get(`/${departamento}/:id/foto`, async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(`SELECT foto FROM ${departamento} WHERE id = $1`, [id]);
      if (result.rows.length > 0) {
        const foto = result.rows[0].foto;
        res.set('Content-Type', 'image/jpeg');
        res.send(foto);
      } else {
        res.status(404).json({ error: 'Imagen no encontrada' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Crear una nueva actividad
  app.post(`/${departamento}`, upload.single('foto'), async (req, res) => {
    const { actividad, fecha, descripcion, limitantes, conclusiones } = req.body;
    const foto = req.file ? req.file.buffer : null;
    try {
      const result = await pool.query(
        `INSERT INTO ${departamento} (actividad, fecha, descripcion, limitantes, conclusiones, foto) 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [actividad, fecha, descripcion, limitantes, conclusiones, foto]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Eliminar una actividad
  app.delete(`/${departamento}/:id`, async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(`DELETE FROM ${departamento} WHERE id = $1 RETURNING *`, [id]);
      if (result.rows.length > 0) {
        res.json({ message: 'Actividad eliminada', data: result.rows[0] });
      } else {
        res.status(404).json({ error: 'Actividad no encontrada' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
