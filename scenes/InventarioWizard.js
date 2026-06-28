const { Scenes, Markup } = require('telegraf');
const { escribirEnExcel } = require('../google/GuardarSheets.js');
const baseDeDatosProductos = require('../json/productos.json');

const inventarioWizard = new Scenes.WizardScene(
  'WIZARD_INVENTARIO',

  // PASO 0: Inicio. Envía la pregunta por la Máquina.
  (ctx) => {
    ctx.reply(
      '🔧 Iniciando registro de inventario.\n\n¿En qué máquina estás?',
      Markup.keyboard(['Máquina 1', 'Máquina 2', 'Máquina 3', 'Máquina 4'], { columns: 2 })
        .oneTime()
        .resize()
    );
    return ctx.wizard.next();
  },

  // PASO 1: CAPTURA LA MÁQUINA y pregunta por la Categoría.
  (ctx) => {
    if (!ctx.message || !ctx.message.text) return;
    

    if (ctx.message.text === 'Volver atras') {
      ctx.scene.reenter();
      return;
    }
    
    ctx.wizard.state.maquina = ctx.message.text;

    const categorias = Object.keys(baseDeDatosProductos);
    const tecladoConAtras = [...categorias, 'Volver atras'];

    ctx.reply(
      'Selecciona la categoría del producto:',
      Markup.keyboard(tecladoConAtras, { columns: 2 }).oneTime().resize()
    );
    
    return ctx.wizard.next();
  },

  // PASO 2: CAPTURA LA CATEGORÍA y pregunta por el Producto.
  (ctx) => {
    if (!ctx.message || !ctx.message.text) return;
    

    if (ctx.message.text === 'Volver atras') {
      ctx.wizard.selectStep(1);
      ctx.reply(
        '🔙 Volvimos. ¿En qué máquina estás?',
        Markup.keyboard(['Máquina 1', 'Máquina 2', 'Máquina 3', 'Máquina 4'], { columns: 2 }).oneTime().resize()
      );
      return; 
    }

    const categoriaElegida = ctx.message.text;

    if (!baseDeDatosProductos[categoriaElegida]) {
      ctx.reply('Por favor, usa los botones del menú para elegir una categoría.');
      return; 
    }

    ctx.wizard.state.categoria = categoriaElegida;
    
    const productosDeLaCategoria = baseDeDatosProductos[categoriaElegida];
    const tecladoConAtras = [...productosDeLaCategoria, 'Volver atras'];

    ctx.reply(
      '¿Qué producto exacto vas a ingresar?',
      Markup.keyboard(tecladoConAtras, { columns: 2 }).oneTime().resize()
    );

    return ctx.wizard.next();
  },

  // PASO 3: CAPTURA EL PRODUCTO y pregunta por la Cantidad.
  (ctx) => {
    if (!ctx.message || !ctx.message.text) return;


    if (ctx.message.text === 'Volver atras') {
      ctx.wizard.selectStep(2);
      const categorias = Object.keys(baseDeDatosProductos);
      const tecladoConAtras = [...categorias, 'Volver atras'];

      ctx.reply(
        '🔙 Volvimos. Selecciona la categoría del producto:',
        Markup.keyboard(tecladoConAtras, { columns: 2 }).oneTime().resize()
      );
      return;
    }

    const productoElegido = ctx.message.text;
    const categoria = ctx.wizard.state.categoria;

    if (!baseDeDatosProductos[categoria].includes(productoElegido)) {
      ctx.reply('Ese producto no corresponde. Usa los botones, por favor.');
      return;
    }

    ctx.wizard.state.producto = productoElegido;

    ctx.reply(
      'Ingresa la cantidad en números enteros:', 
      Markup.keyboard(['Volver atras']).oneTime().resize()
    );
    
    return ctx.wizard.next();
  },

  // PASO 4: CAPTURA LA CANTIDAD e inyecta al Excel.
  async (ctx) => {
    if (!ctx.message || !ctx.message.text) return;
    

    if (ctx.message.text === 'Volver atras') {
      ctx.wizard.selectStep(3);
      const categoria = ctx.wizard.state.categoria;
      const productosDeLaCategoria = baseDeDatosProductos[categoria];
      const tecladoConAtras = [...productosDeLaCategoria, 'Volver atras'];

      ctx.reply(
        '🔙 Volvimos. ¿Qué producto exacto vas a ingresar?', 
        Markup.keyboard(tecladoConAtras, { columns: 2 }).oneTime().resize()
      );
      return;
    }

    if (isNaN(ctx.message.text)) {
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

    ctx.reply(`Guardando ${cantidad} unidades de ${producto} en ${maquina}...`, Markup.removeKeyboard());

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