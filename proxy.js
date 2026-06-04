const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/consultar', async (req, res) => {
    const { rif, codigo_captcha } = req.body;

    try {
        const response = await axios.post(
            'http://contribuyente.seniat.gob.ve/BuscaRif/BuscaRif.jsp', 
            `p_rif=${rif}&p_cedula=&codigo=${codigo_captcha}`, 
            {
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
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