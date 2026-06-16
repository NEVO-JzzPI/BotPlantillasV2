

 async function guardarEnGoogleSheets(maquina, producto, cantidad) {

    try {
      // Cargar la info del Excel
      await doc.loadInfo(); 
      const hoja = doc.sheetsByIndex[0]; // Selecciona la primera hoja (pestaña)
      
      // Inyectar una fila de prueba
      await hoja.addRow({
        Fecha: new Date().toLocaleString(), 
        Maquina: maquina,
        Producto: producto,
        Cantidad: cantidad
      });
    
      
    } catch (error) {
      console.error('Error con el Excel:', error);
    }   
}
module.exports = { guardarEnGoogleSheets };

