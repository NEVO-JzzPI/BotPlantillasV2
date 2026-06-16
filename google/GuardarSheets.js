const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const information = require('../json/information.json');

const credenciales = require('../json/credenciales.json');

const authDeGoogle = new JWT({
  email: credenciales.client_email,
  key: credenciales.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});


const documentoID = information.DocumentoID;
const doc = new GoogleSpreadsheet(documentoID, authDeGoogle);

async function escribirEnExcel() {
    try {
        // Cargar la info del Excel
        await doc.loadInfo(); 
        const hoja = doc.sheetsByIndex[0]; // Selecciona la primera hoja (pestaña)
        await hoja.addRow({
            Fecha: '2026-06-09', 
            Maquina: 'Máquina 1',
            Producto: 'Inyección de prueba',
            Cantidad: 100
        });


    }
    catch (error) {
        console.error('Error con la escritura en elW Excel:', error);
    }
}
module.exports = { escribirEnExcel };
