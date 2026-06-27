Este documento muestra el paso a paso de la realización del proyecto “Desarrollo e Implementación de una Solución Serverless para la Gestión de Inventarios mediante Telegraf API y Google Cloud Platform.” .

🔗 **Repositorio:** BotPlantillasV2

## Descripción General

El presente proyecto consiste en el desarrollo de un agente conversacional (bot) para Telegram, construido mediante el framework Node.js, y diseñado para automatizar el registro de inventario de tres máquinas reponedoras de alimentos. El sistema actúa como un intermediario ágil que captura los datos del operador en terreno y se integra directamente con la API de Google Sheets para almacenar la información en la nube en tiempo real.

A nivel técnico, la aplicación trasciende la ejecución de comandos básicos mediante la implementación de **WizardScenes** (máquinas de estado), lo que permite crear un flujo guiado paso a paso para el usuario. Además, incorpora la herramienta **Markup** para generar teclados dinámicos (botones en pantalla), lo cual restringe las opciones de entrada, agiliza el proceso de registro y elimina casi por completo los errores de tipeo humanos. Todo el sistema está desplegado bajo una arquitectura Serverless, garantizando alta disponibilidad sin costos de mantenimiento.

## Objetivos

Objetivo General:

- Optimizar el proceso de gestión y reposición de inventario mediante una solución tecnológica automatizada, con el fin de economizar los tiempos de operación, minimizar el margen de error humano y aumentar la competitividad de la empresa en el mercado.

Objetivos Específicos:

- Reducción de Tiempos: Agilizar el flujo de ingreso de datos en terreno, reemplazando las planillas manuales por una interfaz conversacional rápida y accesible desde cualquier dispositivo móvil.
- Integridad de Datos: Disminuir a casi un 0% el porcentaje de error humano en los registros mediante el uso de menús cerrados y validación estricta de variables (Máquina, Categoría, Producto y Cantidad).
- Eficiencia Logística: Proveer información centralizada y en tiempo real en la nube (Google Sheets), permitiendo que la toma de decisiones y la entrega de productos para reposición sean mucho más eficientes y rentables.

## Tecnologías Utilizadas

| Tecnología | Versión | Uso |
| --- | --- | --- |
| Telegraf | 4.16.3 | Es el framework principal que estás usando para interactuar con la API de Telegram y crear los comandos y escenas (Wizard) |
| google-spreadsheet | 4.1.4 | Sirve para leer y escribir los datos del inventario en tu documento de Excel en la nube |
| google-auth-library | 9.15.1 | Se encarga de la autenticación segura con los servicios de Google usando tu correo de cliente y llave privada. |
| Node.js | CommonJS | El entorno de ejecución de JavaScript donde corre el código |
| Vercel | Serverless Functions | Es la plataforma de alojamiento (hosting) |

## Arquitectura

El proyecto está construido sobre una arquitectura **Serverless** (sin servidor dedicado) y orientada a eventos, lo que garantiza alta disponibilidad, escalabilidad automática y un costo operativo nulo (Capa Gratuita).

#### 1. Stack Tecnológico (Componentes Core)

- **Frontend (Interfaz Cliente):** **Telegram API**. Actúa como la capa de presentación donde el operador interactúa mediante comandos y teclados dinámicos (Markups).
- **Backend (Lógica de Negocio):** Entorno **Node.js** utilizando el framework **Telegraf**. Es el cerebro del sistema, encargado de procesar los mensajes, administrar la máquina de estados (WizardScenes) y aplicar las reglas de validación.
- **Infraestructura y Despliegue:** **Vercel (Serverless Functions)**. Aloja el código de ejecución mediante despliegue continuo (CI/CD) conectado al repositorio principal en **GitHub**.
- **Base de Datos (Persistencia):** **Google Sheets** operando a través de la API de Google Cloud Platform. Se utiliza la librería `google-spreadsheet` para la inyección y estructuración de los datos en tiempo real.

#### 2. Flujo de Datos (Ciclo de Vida de una Petición)

El sistema abandona el método tradicional de *Long Polling* a favor de un modelo eficiente de **Webhooks**:

1. **Gatillador (Trigger):** El usuario envía una instrucción (ej. `/nuevoingreso`) a través del chat de Telegram.
2. **Petición HTTP:** Los servidores de Telegram capturan el mensaje y disparan inmediatamente una petición HTTP POST hacia la URL pública (Webhook) alojada en Vercel.
3. **Autenticación Perimetral:** Vercel "despierta" el código backend (`api/bot.js`). Un *Middleware* intercepta el mensaje y compara el ID de Telegram del remitente con la Lista Blanca configurada en las variables de entorno. Si no hay coincidencia, la petición es rechazada.
4. **Procesamiento (Wizard):** Si el usuario es válido, el sistema lo introduce en un túnel de 5 pasos secuenciales (Máquina -> Categoría -> Producto -> Cantidad).
5. **Inyección en la Nube:** Tras recolectar y validar aritméticamente la entrada final, el backend se autentica criptográficamente con Google Cloud (mediante un token JWT) e inyecta la nueva fila en la hoja de cálculo.
6. **Cierre de Ciclo:** El bot confirma el éxito de la operación al usuario y la función Serverless de Vercel se apaga automáticamente, liberando los recursos.

!image.png

### 3.Seguridad y Gestión de Credenciales

La seguridad del sistema se diseñó bajo el principio de **Privacidad por Diseño (Privacy by Design)** y el concepto de **Menor Privilegio**, garantizando que ninguna información sensible quede expuesta públicamente en el código fuente.

#### 1. Inyección de Credenciales vía Variables de Entorno (Environment Variables)

Para cumplir con los estándares de seguridad de la industria y evitar la filtración de contraseñas en repositorios públicos (como GitHub), se eliminaron todos los archivos de configuración locales (`.json`).

- Toda la información crítica se aloja de forma cifrada en la infraestructura de **Vercel** y se inyecta en el entorno de ejecución en tiempo de producción a través de la interfaz de administración (panel de control).
- Las llaves privadas criptográficas RSA de Google Cloud (`GOOGLE_PRIVATE_KEY`) se manejan como strings protegidos y se formatean dinámicamente en el código utilizando expresiones regulares (`.replace(/\\n/g, '\n')`) para reconstruir los saltos de línea exigidos por el protocolo SSH/JWT sin exponer el archivo físico.

#### 2. Control de Acceso Perimetral (Lista Blanca de Identificadores)

Dado que cualquier usuario en el mundo con acceso a Telegram puede interactuar con el `@usuario` del bot, se implementó un **Middleware de Autenticación**.

- El sistema no utiliza contraseñas tradicionales basadas en texto (las cuales son vulnerables a ataques de fuerza bruta y comprometen la privacidad en pantallas móviles).
- En su lugar, el backend valida el **ID Único de Telegram (`ctx.from.id`)** del remitente en cada evento HTTP entrante. Este identificador es inmutable, único por cuenta y es verificado directamente por los servidores de Telegram. Si el ID no coincide con la constante `MI_ID_TELEGRAM` configurada en la nube, la petición es descartada de forma inmediata con un código de acceso denegado, bloqueando cualquier intento de inyección de datos maliciosos en la base de datos de Google Sheets.

#### 3. Autenticación Criptográfica con Google Cloud (JWT)

La comunicación con la base de datos no se realiza mediante enlaces públicos ni permisos abiertos de edición. Se utiliza una **Cuenta de Servicio** de Google Cloud Platform (GCP) que opera bajo el protocolo **JSON Web Tokens (JWT)**. El bot se identifica con la nube mediante un correo electrónico institucional cifrado y una firma digital, otorgando permisos estrictamente limitados para escribir filas en el archivo Excel asignado, manteniendo el resto del Google Drive completamente aislado y seguro.

## Instalación y Configuración

### Instalación y Configuración

**Requisitos previos**

- Tener instalado Node.js (versión 16 o superior) y Git en tu equipo local.
- Una cuenta de Telegram y un bot registrado a través de **BotFather** (para obtener el Token de acceso).
- Un proyecto en **Google Cloud Platform (GCP)** con la API de Google Sheets habilitada y una Cuenta de Servicio (Service Account) con sus respectivas credenciales (llave privada y correo de servicio).
- Una cuenta en **Vercel** vinculada a tu GitHub para el despliegue Serverless.

**Pasos de instalación**

1. **Clona el repositorio:**
Abre tu terminal y ejecuta el siguiente comando para descargar el código fuente:Bash
    
    ```
    git clone https://github.com/NEVO-JzzPI/BotPlantillasV2.git
    cd BotPlantillasV2
    ```
    
2. **Instala las dependencias:**
Instala los paquetes necesarios de Node.js (Telegraf, Google-Spreadsheet, Google-Auth-Library) ejecutando:Bash
    
    ```
    npm install
    ```
    
3. **Configura las variables de entorno:**
Por motivos de seguridad, las credenciales no se suben al repositorio. En tu panel de control de Vercel (en *Settings* > *Environment Variables*), debes agregar las siguientes llaves:
    - `TELEGRAM_TOKEN`: Tu token de BotFather.
    - `MI_ID_TELEGRAM`: Tu ID numérico de Telegram para la lista blanca.
    - `GOOGLE_CLIENT_EMAIL`: Correo de la cuenta de servicio de GCP.
    - `GOOGLE_PRIVATE_KEY`: Llave RSA privada de Google.
    - `GOOGLE_SHEET_ID`: El código identificador de tu hoja de cálculo.
4. **Despliegue (Deploy) en Vercel:**
Importa tu repositorio de GitHub desde el dashboard de Vercel y haz clic en *Deploy*. Vercel detectará automáticamente la carpeta `/api` y compilará la función Serverless, entregándote una URL pública (ej: `https://tu-proyecto.vercel.app`).
5. **Configurar el Webhook (Enlace con Telegram):**
Para "despertar" el bot, debes enlazar Telegram con la URL de Vercel. Pega el siguiente enlace en tu navegador web reemplazando los datos entre corchetes:

```bash
https://api.telegram.org/bot[TU_TELEGRAM_TOKEN]/setWebhook?url=https://[TU_URL_DE_VERCEL]/api/bot

```

Si la pantalla devuelve un JSON con el mensaje "Webhook was set", el bot estará activo y listo para usarse.

## Estructura del Código

El proyecto está diseñado de forma modular para separar la configuración del servidor, la interfaz de usuario (Telegram) y la conexión a la base de datos (Google Sheets).

```
/BotPlantillasV2
  /api             → Controlador principal (bot.js) y endpoint del Webhook para Vercel.
  /scenes         → Lógica de estados (WizardScenes) y validación de interacción del usuario.
  /google          → Autenticación criptográfica (JWT) e inyección de datos a la API de Sheets.
  /json           → Base de datos local estática (productos.json) para generar teclados dinámicos.
  .gitignore       → Excepciones de seguridad para evitar la filtración de credenciales a GitHub.
  package.json     → Manifiesto de dependencias de entorno Node.js.
```

## API / Funcionalidades Principales

**1. Máquina de Estados (WizardScene)**
Implementación de un túnel conversacional de 4 pasos secuenciales. El bot retiene el contexto del usuario en memoria temporal, guiándolo paso a paso (Máquina → Categoría → Producto → Cantidad) para garantizar que la recolección de datos sea estructurada y evitar registros incompletos.

**2. Interfaces Dinámicas y Restrictivas (Markup)**
Generación automática de teclados en pantalla leyendo una base de datos local (`productos.json`). El sistema fuerza al usuario a utilizar los botones (con organización en grillas) e ignora entradas de texto libre, reduciendo el error humano y los problemas de tipeo a un 0%.

**3. Integración Segura en Tiempo Real (Google Sheets API)**
Conexión asíncrona con Google Cloud Platform mediante autenticación criptográfica (JSON Web Tokens). El bot inyecta los datos procesados directamente como nuevas filas en una hoja de cálculo, formateando las fechas automáticamente al estándar local (DD/MM/YYYY).

**4. Middleware de Seguridad Perimetral**
Sistema de validación que intercepta cada mensaje entrante antes de procesarlo. Compara el identificador único (ID) del usuario de Telegram con una lista blanca inyectada a través de Variables de Entorno. Los usuarios no autorizados reciben un mensaje de denegación de acceso y sus peticiones son destruidas.

## Pruebas

Para garantizar la estabilidad del sistema MVP, las validaciones se realizan mediante **Pruebas Funcionales End-to-End (E2E)** directamente sobre la interfaz cliente (Telegram).

El protocolo de pruebas de aceptación incluye:

1. **Prueba de Seguridad:** Intentar acceder al bot con una cuenta de Telegram no registrada para verificar que el Middleware bloquea el acceso.
2. **Prueba de Validación de Entrada:** Ingresar texto alfabético cuando el Wizard solicita la "Cantidad" numérica para comprobar que el sistema rechaza el dato y solicita el reingreso.
3. **Prueba de Persistencia:** Completar un flujo de inventario exitoso y verificar en tiempo real que la nueva fila aparece en el documento de Google Sheets con las columnas ordenadas y la fecha correcta.
4. **Prueba de Concurrencia Serverless:** Simular un entorno inactivo y enviar un comando para confirmar que el Webhook de Vercel "despierta" el código, procesa la solicitud y vuelve a estado de reposo sin latencia notable.

## Estado Actual

<aside>
✅

**Versión actual:** 1.0.0 (MVP)

El proyecto se encuentra en estado: **Completado (Desplegado en Producción)**.

</aside>

## Próximos Pasos

Corto/Mediano plazo

- Integración de **navegación bidireccional (botón "Atrás")** dentro de la máquina de estados (`WizardScene`), otorgando al usuario la capacidad de corregir selecciones previas en tiempo real para minimizar aún más el margen de error humano.
- Desarrollo de un comando administrativo `/agregar` para la **gestión dinámica del catálogo**. Esto permitirá a los administradores registrar nuevos productos directamente desde Telegram, actualizando la base de datos sin necesidad de realizar un nuevo despliegue (redeploy) del código fuente.

Largo plazo:

- Implementación de un comando `/reporte` para solicitar al bot un resumen diario de los ingresos directamente en el chat.
- Escalabilidad del archivo `productos.json` hacia una base de datos no relacional (como MongoDB) en caso de que el catálogo supere los 500 ítems.

## Equipo / Créditos

| Nombre | Rol |
| --- | --- |
| Nicolas Esteban Vergara Orellana | Desarrollador Backend & Arquitectura Serverless |

## Notas Adicionales

Este proyecto fue desarrollado como una iniciativa personal con el objetivo de aplicar conocimientos de ingeniería de software en la resolución de problemas reales de logística y captura de datos en terreno en una empresa reponedora de alimentos.

Si te interesa la automatización de procesos, la integración de APIs, o estás buscando un perfil capaz de diseñar y desplegar soluciones Serverless eficientes, ¡no dudes en contactarme!

- 💼 **LinkedIn:** https://www.linkedin.com/in/nicolas-esteban-vergara-orellana-470903322/
- 🐙 **GitHub:** https://github.com/NEVO-JzzPI
- ✉️ **Contacto:** nicolasestebanvergaraorellana@gmail.com
