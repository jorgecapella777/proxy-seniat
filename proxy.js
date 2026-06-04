const express = require('express');
const axios = require('axios');
const cors = require('cors');
const https = require('https'); // <-- Importamos el módulo de seguridad nativo

const app = express();
app.use(cors());
app.use(express.json());

// Creamos un agente que permite conexiones aunque el sitio sea inseguro o antiguo
const agent = new https.Agent({  
  rejectUnauthorized: false
});

let sesionCookie = '';

// RUTA PARA TRAER LA IMAGEN DEL CAPTCHA
app.get('/api/captcha-imagen', async (req, res) => {
    try {
        const response = await axios.get('http://contribuyente.seniat.gob.ve/BuscaRif/Captcha.jpg', {
            responseType: 'arraybuffer',
            httpsAgent: agent, // <-- Le decimos a axios que ignore la seguridad aquí
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        
        sesionCookie = response.headers['set-cookie'] ? response.headers['set-cookie'].join(';') : '';
        
        res.set('Content-Type', 'image/jpeg');
        res.send(response.data);
    } catch (error) {
        console.error("Error al pedir captcha:", error.message);
        res.status(500).send("Error al obtener el captcha");
    }
});

// RUTA PARA HACER LA CONSULTA
app.post('/api/consultar', async (req, res) => {
    const { rif, codigo_captcha } = req.body;

    try {
        const response = await axios.post(
            'http://contribuyente.seniat.gob.ve/BuscaRif/BuscaRif.jsp', 
            `p_rif=${rif}&p_cedula=&codigo=${codigo_captcha}`, 
            {
                httpsAgent: agent, // <-- También ignoramos la seguridad al enviar el formulario
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    'Cookie': sesionCookie
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
