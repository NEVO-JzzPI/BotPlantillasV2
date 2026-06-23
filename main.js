const {escribirEnExcel} = require('./google/GuardarSheets.js');
const {Telegraf,session, Scenes} = require('telegraf');
const information = require('./json/information.json');
const MiIdTelegram = information.IdTelegram;
const inventarioWizard = require('./scenes/inventarioWizard.js');



const bot = new Telegraf(information.token);

//seguridad para que solo el dueño del bot pueda usarlo
bot.use((ctx, next) => {
  if (ctx.from.id.toString() === MiIdTelegram) {
    return next();
  } else {
    ctx.reply('Lo siento, no estás autorizado para usar este bot.');
    return;
  }
});

// const mensajeAyuda = 'Puta que andai perdido ql';



// bot.command('pruebaexcel', async (contexto) => {
//   try {
//     contexto.reply('Escribiendo en el Excel, dame un segundo...');
    
//     await escribirEnExcel();
    
    
//     contexto.reply('¡Anotado! Revisa tu Google Sheet. 🚀');
//   } catch (error) {
//     console.error('Error con el Excel:', error);
//     contexto.reply('Pucha, hubo un error. Revisa la consola de Visual Studio.');
//   }
// });
// bot.command('miid', (ctx) => {
//   const miNumeroDeId = ctx.from.id;
//   ctx.reply(`Tu número de ID secreto es: ${miNumeroDeId}`);
// });

const stage = new Scenes.Stage([inventarioWizard]);
// Activamos la memoria del bot (OBLIGATORIO para Wizards)
bot.use(session());
// Le conectamos el teatro al bot
bot.use(stage.middleware());

bot.command('nuevoingreso', (ctx) => {
  ctx.scene.enter('WIZARD_INVENTARIO');
});

//Inicio del bot
try{
  bot.launch();
  console.log('Bot iniciado correctamente Presiona Ctrl+C para detenerlo');
}catch(error){
  console.error('Error al iniciar el bot:', error);
}


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