const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Guardaremos la cookie en la memoria del servidor temporalmente
let sesionCookie = '';

// 1. NUEVA RUTA PARA TRAER EL CAPTCHA REAL DE LA SESIÓN
app.get('/api/captcha-imagen', async (req, res) => {
    try {
        // Pedimos la imagen al SENIAT y guardamos las cookies que nos devuelva
        const response = await axios.get('http://contribuyente.seniat.gob.ve/BuscaRif/Captcha.jpg', {
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        // Guardamos la cookie de la sesión activa
        sesionCookie = response.headers['set-cookie'] ? response.headers['set-cookie'].join(';') : '';
        
        // Le enviamos la imagen directamente a tu página web
        res.set('Content-Type', 'image/jpeg');
        res.send(response.data);
    } catch (error) {
        res.status(500).send("Error al obtener el captcha");
    }
});

// 2. RUTA PARA CONSULTAR CON LA MISMA COOKIE
app.post('/api/consultar', async (req, res) => {
    const { rif, codigo_captcha } = req.body;

    try {
        const response = await axios.post(
            'http://contribuyente.seniat.gob.ve/BuscaRif/BuscaRif.jsp', 
            `p_rif=${rif}&p_cedula=&codigo=${codigo_captcha}`, 
            {
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0',
                    'Cookie': sesionCookie // <--- Aquí le inyectamos la cookie guardada
                }
            }
        );
        res.json({ htmlResultado: response.data });
    } catch (error) {
        res.status(500).json({ error: "Error de conexión con el SENIAT" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy corriendo`));
