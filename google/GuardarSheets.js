const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const authDeGoogle = new JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), 
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const documentoID = process.env.GOOGLE_SHEET_ID;
const doc = new GoogleSpreadsheet(documentoID, authDeGoogle);

async function escribirEnExcel({ Fecha, Maquina, Producto, Cantidad }) {
    try {
        
        await doc.loadInfo(); 
        const hoja = doc.sheetsByIndex[0]; 
        await hoja.addRow({
            Fecha: Fecha,
            Maquina: Maquina,
            Producto: Producto,
            Cantidad: Cantidad
        });


    }
    catch (error) {
        console.error('Error con la escritura en elW Excel:', error);
    }
}
module.exports = { escribirEnExcel };
