const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Configurar CORS
app.use(cors());
app.use(express.json());

// Configuración de Multer para manejar imágenes
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configuración de la base de datos en Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const departamentos = ["laboratorio", "direccion", "personal", "planeamiento", "bienes", "redes", "vigilancia", "marcon"];

departamentos.forEach((departamento) => {
  // Obtener todos los registros
  app.get(`/${departamento}`, async (req, res) => {
    try {
      const result = await pool.query(`SELECT id, actividad, fecha, descripcion, limitantes, conclusiones, encode(foto, 'base64') AS foto FROM ${departamento}`);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Insertar un nuevo registro
  app.post(`/${departamento}`, upload.single('foto'), async (req, res) => {
    try {
      const { actividad, fecha, descripcion, limitantes, conclusiones } = req.body;
      const foto = req.file ? req.file.buffer : null;
      
      const result = await pool.query(
        `INSERT INTO ${departamento} (actividad, fecha, foto, descripcion, limitantes, conclusiones) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [actividad, fecha, foto, descripcion, limitantes, conclusiones]
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Eliminar un registro por ID
  app.delete(`/${departamento}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query(`DELETE FROM ${departamento} WHERE id = $1`, [id]);
      res.json({ message: "Registro eliminado" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
