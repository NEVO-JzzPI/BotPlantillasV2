const { Scenes, Markup } = require('telegraf');
const { escribirEnExcel } = require('../google/GuardarSheets.js');

const inventarioWizard = new Scenes.WizardScene(
  'WIZARD_INVENTARIO',


  (ctx) => {
    ctx.reply('Iniciando registro de inventario.\n\n¿En qué máquina estás?',
      Markup.keyboard([
        ['Máquina 1', 'Máquina 2'], ['Máquina 3']
      ]).oneTime().resize()
    );
    return ctx.wizard.next(); // Avanza al paso 2 y se queda esperando
  },

  // PASO 2: Guardamos la Máquina y preguntamos el Producto
  (ctx) => {
    // Si el usuario manda un sticker o algo que no es texto, lo retamos
    if (!ctx.message || !ctx.message.text) {
      ctx.reply('Por favor, escríbeme el nombre de la máquina.');
      return; // No avanza de paso hasta que responda bien
    }

    // Guardamos la respuesta en la memoria temporal de la escena
    ctx.wizard.state.maquina = ctx.message.text;

    ctx.reply('Perfecto. ¿Qué producto vas a ingresar?',Markup.removeKeyboard());
    return ctx.wizard.next();
  },

  // PASO 3: Guardamos el Producto y preguntamos la Cantidad
  (ctx) => {
    if (!ctx.message || !ctx.message.text) {
      ctx.reply('Dime el nombre del producto en texto, por favor.');
      return;
    }

    ctx.wizard.state.producto = ctx.message.text;

    ctx.reply('🔢 ¿Y cuántas unidades son? (Solo ingresa el número)');
    return ctx.wizard.next();
  },

  // PASO 4: Guardamos Cantidad, inyectamos en Excel y cerramos el túnel
  async (ctx) => {
    if (!ctx.message || isNaN(ctx.message.text)) {
      ctx.reply('Eso no parece un número válido. Ingresa solo números enteros.');
      return;
    }

    const cantidad = Number(ctx.message.text);
    const maquina = ctx.wizard.state.maquina;
    const producto = ctx.wizard.state.producto;

    // Sacamos la fecha actual automáticamente (Formato YYYY-MM-DD)
    const fechaHoy = new Date().toLocaleDateString('en-CA');

    ctx.reply(`⏳ Anotando ${cantidad} unidades de ${producto} en ${maquina}...`);

    try {
      // AQUÍ OCURRE LA MAGIA: Llamamos a tu código de Google Sheets
      // Asumo que tu función recibe un objeto o los parámetros sueltos. 
      // Ajusta esto según cómo armaste tu GuardarSheets.js
      await escribirEnExcel(maquina, producto, cantidad, fechaHoy);

      ctx.reply('✅ ¡Datos guardados exitosamente en tu Excel!');
    } catch (error) {
      console.error('Error inyectando al Excel:', error);
      ctx.reply('❌ Pucha, hubo un error al guardar en el Excel. Intenta de nuevo.');
    }

    // Rompemos el túnel para que el bot vuelva a la normalidad
    return ctx.scene.leave();
  }
);

// Exportamos la escena para que main.js la pueda usar
module.exports = inventarioWizard;