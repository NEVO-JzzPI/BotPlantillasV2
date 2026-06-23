const { Telegraf, session, Scenes } = require('telegraf');
const inventarioWizard = require('../scenes/inventarioWizard.js'); 

// Extraemos las llaves desde la nube (Vercel), no desde el JSON local
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const MI_ID_SECRETO = Number(process.env.MI_ID_TELEGRAM);

bot.use((ctx, next) => {
  if (ctx.from && ctx.from.id === MI_ID_SECRETO) return next();
  return ctx.reply('Acceso denegado ');
});

const stage = new Scenes.Stage([inventarioWizard]);
bot.use(session());
bot.use(stage.middleware());

bot.command('nuevoingreso', (ctx) => {
  ctx.scene.enter('WIZARD_INVENTARIO');
});

// --------------------------------------------------------
// EL GRAN CAMBIO: Exportamos la función para Vercel
// --------------------------------------------------------
module.exports = async (req, res) => {
  try {
    // Si Telegram nos envía un mensaje (POST)
    if (req.method === 'POST') {
      await bot.handleUpdate(req.body, res);
    } else {
      // Si tú abres la URL en tu navegador (GET)
      res.status(200).send('El bot Serverless está activo y esperando a Telegram.');
    }
  } catch (error) {
    console.error('Error en el Webhook:', error);
    res.status(500).send('Error interno del servidor');
  }
};