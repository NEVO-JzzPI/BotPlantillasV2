const {Telegraf} = require('telegraf');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const information = require('./information.json');


const bot = new Telegraf(information.token);
const mensajeAyuda = 'Puta que andai perdido ql';

const credenciales = require('./inventario-telegram-bot.json');
const informacion = require('./information.json');

// Autenticación del robot de Google
const authDeGoogle = new JWT({
  email: credenciales.client_email,
  key: credenciales.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});


const documentoID = '1dApPOFEGd_L71rZGm8fvbA7aLRwmb9zYx8jJvGhALYY';
const doc = new GoogleSpreadsheet(documentoID, authDeGoogle);

// function numeroRandom(){
//     return Math.floor(Math.random() * 100) + 1;
// };
// //comandos predeterminados 
// bot.start((contexto)=>{
//     contexto.reply('Wenaaaa tamo activooooo');
// });
// bot.help((contexto)=>{
//     contexto.reply(mensajeAyuda);
// });
// //Comamdos personalizados
// bot.command('random', (contexto)=>{
//     const numeroRandomv = numeroRandom();
//     contexto.reply(`Tu número random es: ${numeroRandomv}`);
// });
// bot.command('randomavanzado', (contexto)=>{
//     const mensaje = contexto.update.message.text;
//     const numero = Number(mensaje.split(' ')[1]);
//     contexto.reply(numero);
    
// });
//Eventos
// bot.on('text', (cont)=>{
//     const mensajeBot = cont.update.message.text;
//     cont.reply('Miraaaa dijiste esta wea de comando ' + mensajeBot);
// });




bot.command('pruebaexcel', async (contexto) => {
  try {
    contexto.reply('Escribiendo en el Excel, dame un segundo...');
    
    // Cargar la info del Excel
    await doc.loadInfo(); 
    const hoja = doc.sheetsByIndex[0]; // Selecciona la primera hoja (pestaña)
    
    // Inyectar una fila de prueba
    await hoja.addRow({
      Fecha: '2026-06-09', 
      Maquina: 'Máquina 1',
      Producto: 'Inyección de prueba',
      Cantidad: 100
    });

    contexto.reply('¡Anotado! Revisa tu Google Sheet. 🚀');
  } catch (error) {
    console.error('Error con el Excel:', error);
    contexto.reply('Pucha, hubo un error. Revisa la consola de Visual Studio.');
  }
});

//Inicio del bot
try{
    bot.launch();
    console.log('Bot iniciado correctamente Presiona Ctrl+C para detenerlo');
}catch(error){
    console.error('Error al iniciar el bot:', error);
}

