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

async function escribirEnExcel(maquina, producto, cantidad,fechaHoy) {
    try {
        
        await doc.loadInfo(); 
        const hoja = doc.sheetsByIndex[0]; 
        await hoja.addRow({
            Fecha: fechaHoy,
            Maquina: maquina,
            Producto: producto,
            Cantidad: cantidad
        });


    }
    catch (error) {
        console.error('Error con la escritura en elW Excel:', error);
    }
}
module.exports = { escribirEnExcel };
