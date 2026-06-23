const { Scenes, Markup } = require('telegraf');
const { escribirEnExcel } = require('../google/GuardarSheets.js');
// Importamos tu JSON de productos
const baseDeDatosProductos = require('../json/productos.json');

const inventarioWizard = new Scenes.WizardScene(
  'WIZARD_INVENTARIO',

  // PASO 1: Preguntamos la Máquina
  (ctx) => {
    ctx.reply(
      '🔧 Iniciando registro de inventario.\n\n¿En qué máquina estás?',
      Markup.keyboard(['Máquina 1', 'Máquina 2', 'Máquina 3'], { columns: 2 })
        .oneTime()
        .resize()
    );
    return ctx.wizard.next();
  },

  // PASO 2: Guardamos Máquina y mostramos las Categorías de productos
  (ctx) => {
    if (!ctx.message || !ctx.message.text) return;
    
    ctx.wizard.state.maquina = ctx.message.text;
    
    // Extraemos solo los nombres de las categorías (las llaves del JSON)
    const categorias = Object.keys(baseDeDatosProductos);
    

    ctx.reply(
      'Selecciona la categoría del producto:',
      Markup.keyboard(categorias, { columns: 2 }).oneTime().resize()
    );
    
    return ctx.wizard.next();
  },

  
  (ctx) => {
    if (!ctx.message || !ctx.message.text) return;

    const categoriaElegida = ctx.message.text;

    
    if (!baseDeDatosProductos[categoriaElegida]) {
      ctx.reply('Por favor, usa los botones del menú para elegir una categoría.');
      return; 
    }

    ctx.wizard.state.categoria = categoriaElegida;
    
    
    const productosDeLaCategoria = baseDeDatosProductos[categoriaElegida];

    ctx.reply(
      '¿Qué producto exacto vas a ingresar?',
      Markup.keyboard(productosDeLaCategoria, { columns: 2 }).oneTime().resize()
    );

    return ctx.wizard.next();
  },

  
  (ctx) => {
    if (!ctx.message || !ctx.message.text) return;

    const productoElegido = ctx.message.text;
    const categoria = ctx.wizard.state.categoria;

    
    if (!baseDeDatosProductos[categoria].includes(productoElegido)) {
      ctx.reply('Ese producto no corresponde. Usa los botones, por favor.');
      return;
    }

    ctx.wizard.state.producto = productoElegido;
    
    
    ctx.reply('Ingresa la cantidad en números enteros:', Markup.removeKeyboard());
    
    return ctx.wizard.next();
  },

  
  async (ctx) => {
    if (!ctx.message || isNaN(ctx.message.text)) {
      ctx.reply('Eso no es un numero. Ingresa solo números (ej: 50).');
      return;
    }

    const cantidad = Number(ctx.message.text);
    const maquina = ctx.wizard.state.maquina;
    const producto = ctx.wizard.state.producto;
    
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    const fechaHoy = `${dia}/${mes}/${anio}`;

    ctx.reply(`Guardando ${cantidad} unidades de ${producto} en ${maquina}...`);

    try {
      await escribirEnExcel({
        Fecha: fechaHoy,
        Maquina: maquina,
        Producto: producto,
        Cantidad: cantidad
      });
      ctx.reply('¡Datos ingresados al Excel con éxito!');
    } catch (error) {
      console.error('Error inyectando al Excel:', error);
      ctx.reply('Error al guardar en la nube. Intenta de nuevo.');
    }

    return ctx.scene.leave(); 
  }
);
module.exports = inventarioWizard;