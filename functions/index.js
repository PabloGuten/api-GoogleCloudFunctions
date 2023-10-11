// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction


const path = require('path');
require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const puppeteer = require('puppeteer');

//----------------------------------------------------------------------------------------------
const { logger } = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");

// The Firebase Admin SDK to access Firestore.
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

// // variables de entorno
// const usuario = process.env.dasusu; 
// const contraseña = process.env.dascon;
// let repetirCiclo = true;

// variables de entorno
const usuario = process.env.usuario;
const contraseña = process.env.contraseña;
let repetirCiclo = true;

exports.helloWorld = onRequest({ memory: '2GiB', timeoutSeconds: 540, region: 'europe-west3' }, async (request, response) => {

    // Primer log para comprobar que comeinza la ejecución
    console.log("He entrado en el endpoint DAS");

    // Configurar cabeceras CORS para permitir el acceso desde un origen específico
    response.set('Access-Control-Allow-Origin', 'https://das-delvy-facturacion.vercel.app');
    response.set('Access-Control-Allow-Methods', 'GET, POST');
    response.set('Access-Control-Allow-Headers', 'Content-Type');

    // Comprobar si es una solicitud OPTIONS (preflight)
    if (request.method === 'OPTIONS') {
        // Responder con los encabezados CORS permitidos
        response.status(204).send('');
    } else {
        try {



            // logger.info("Hello logs!", { structuredData: true });
            // response.send("Hello from Firebase!");


            // async function handler(req, res) {

            //DESCOMENTAR PARA PROBAR EL ENDPOINT
            const numSiniestro = request.body.numSiniestro;
            const numEncargo = request.body.numEncargo.toString();
            const numServicio = request.body.numServicio;
            const urlPdf = request.body.urlPdf;

            // variables para Cerrar la Facturación
            const DASCodigoFac = req.body.DASCodigoFac1;
            const DASFechaFac = req.body.DASFecha1;
            const DASPrecio = req.body.DASPrecio1;

            // Variables para hacer pruebas
            // const numSiniestro = "72050793-01-04-077";
            // const numEncargo = "280885";
            // const numServicio = "280975";
            // const urlPdf = 'https://firebasestorage.googleapis.com/v0/b/delvy-facturacion.appspot.com/o/72050793-01-04-077%2F72050793-01-04-077280975.pdf?alt=media&token=82f69b58-87c6-4cba-bfdc-369395595442';

            console.log('Endpoint Das ...');
            console.log('Número de siniestro: ' + numSiniestro);
            console.log('Número de encargo: ' + numEncargo);
            console.log('Número de servicio: ' + numServicio);
            console.log('Url del pdf: ' + urlPdf);

            if (numEncargo != undefined) {

                // Inicio de navegación, headless: false para ver el navegador
                // const browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-maximized'] });
                const browser = await puppeteer.launch({
                    headless: true,
                    defaultViewport: null,
                    ignoreHTTPSErrors: true,
                    // args: ['--window-size=1920,1080'],
                    args: ['--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36', '--start-maximized']

                });

                const page = await browser.newPage();
                await page.setViewport({ width: 1920, height: 1080 });
                await page.goto('https://innova.das.es/sisnet/', { waitUntil: 'domcontentloaded' });
                //page.setDefaultNavigationTimeout(0);
                await delay(2500);

                // Quitar la parte de las cookies

                //try catch para el error de la cookie
                try {
                    const cookie1 = await page.waitForSelector('[id="onetrust-reject-all-handler"]');
                    await cookie1.click();
                } catch (error) {
                    console.log("No se ha encontrado la cookie");

                    // en caso de error continuar con el programas para ello se necesita un continue mediante finally{}
                    //throw error;
                }
                // continuación del programa
                //finally {

                console.log("Se ha pasado el Finally la cookie");

                // Inicio de sesión NUEVO
                await delay(1500);
                const labelUsuario = await page.waitForSelector('[id="usuario"]');
                await labelUsuario.type(usuario, { delay: 320 });
                console.log("Se ha introducido el usuario: " + usuario);
                const labelContraseña = await page.waitForSelector('[id="clave"]');
                await labelContraseña.type(contraseña, { delay: 180 });
                const botonEntrar = await page.waitForSelector('[id="botonEntrar"]');
                await botonEntrar.click();

                // es un do-while para que se repita el ciclo en caso de que no se encuentre el estado aceptado
                //--------------------------------------------------------------------------------------------------------------
                //do {

                await delay(1500);
                const boxIzq = await page.waitForSelector('[id="leftFrame"]');
                const frameIzq = await boxIzq.contentFrame();
                await delay(2000);
                const sectorIzq1 = await frameIzq.waitForSelector('[id="jt2"]');
                await sectorIzq1.click();
                await delay(4000);
                console.log("Se ha encontrado el sector izquierdo");
                const sectorIzq2 = await frameIzq.waitForSelector('[id="jt1"]');
                await sectorIzq2.click();
                console.log("Se ha pasado el sector izquierdo");

                // Clicar en el filtro de nº de siniestro
                const boxCentro = await page.waitForSelector('[id="mainFrame"]');
                const frameCentro = await boxCentro.contentFrame();
                await delay(2000);


                // console.log("Se ha encontrado el frame del centro");
                // const filtro4 = await frameCentro.waitForSelector('[id="filtro4"]');
                // await filtro4.click();
                // console.log("Se ha encontrado el filtro 6");
                // PROBLENAS DE ESPERA
                let filtro6tc = false;
                do {

                    console.log("Se ha entrado en el bucle del filtro 6");
                    try {
                        const filtro6 = await frameCentro.waitForSelector('[id="filtro4"]', { visible: true });
                        await filtro6.click();
                        console.log("Se ha encontrado el filtro 6");
                    }
                    catch (error) {
                        console.log("No se ha encontrado el filtro 6");
                        filtro6tc = true;
                    }
                } while (filtro6tc)

                console.log("Se ha salido del bucle del filtro 6");


                // Introducir el nº de siniestro
                await delay(2500);
                const filtro6 = await frameCentro.waitForSelector('[id="filtro4"]');
                await filtro6.click();
                console.log("Se ha encontrado el filtro 6");
                const labelNumEncargo = await frameCentro.waitForSelector('[id="numeenca"]', { visible: true });
                await labelNumEncargo.click();
                console.log("Se ha encontrado el label del nº de encargo");
                console.log("nº de encargo: " + numEncargo);
                console.log(typeof (numEncargo));

                await labelNumEncargo.type(numEncargo, { delay: 220 });
                await delay(1500);
                console.log("Se ha introducido el nº de encargo");
                const botonBuscar = await frameCentro.waitForSelector('[name="botonBuscar"]');
                await botonBuscar.click();
                console.log("Se ha clicado en buscar");

                // Selección del siniestro 
                await delay(1500);
                const fidNumEncargo = "bloque1tr" + numEncargo;
                const filaNumEncargo = await frameCentro.waitForSelector('[id="' + fidNumEncargo + '"]');
                const linkEncargo = await filaNumEncargo.$('a');
                await linkEncargo.click();

                // Clicamos en la pestaño de encargos
                await delay(2500);
                const pestañaEncargos = await frameCentro.waitForSelector('[id="pes7"]');
                await pestañaEncargos.click();

                // lo que esya entre --- es la parte de aencontrar si esta aceptado o no
                //--------------------------------------------------------------------------------------------------------------
                //     await delay(1500);
                //     // try catch para el error de estado aceptado
                //     try {
                //         // Clicamos en aceptar si no esta aceptado
                //         const fidNumServicio1 = "capaFlecha" + numServicio;
                //         const filaNumServicio1 = await frameCentro.waitForSelector('[id="' + fidNumServicio1 + '"]');
                //         await filaNumServicio1.click();
                //         // Clicamos en el desplegable en la casilla de 'Aceptar'
                //         const desplegablePenFact1 = await frameCentro.waitForSelector('[title="Aceptar"]');
                //         await desplegablePenFact1.click();

                //         console.log("Se ha aceptado el estado");

                //         //recargar la pagina
                //         await delay(1500);
                //         await page.reload();

                //     } catch (error) {

                //         // En caso de tener que aceptar el estado, reapet
                //         repetirCiclo = false;
                //         console.log("No se ha encontrado el estado aceptado, se continua con el programa");
                //     }
                // } while (repetirCiclo == true);
                //--------------------------------------------------------------------------------------------------------------

                // Clicamos en el encargo que queremos facturar
                await delay(2000);
                // const boxCentro = await page.waitForSelector('[id="mainFrame"]');
                // const frameCentro = await boxCentro.contentFrame();
                const fidNumServicio = "capaFlecha" + numServicio;
                const filaNumServicio = await frameCentro.waitForSelector('[id="' + fidNumServicio + '"]');
                await filaNumServicio.click();

                // Clicamos en el desplegable en la casilla de 'Cerrar facturando'
                const desplegablePenFact = await frameCentro.waitForSelector('[title="Cerrar Facturando"]');
                await desplegablePenFact.click();

                // Clicar en el botón de 'Cerrar facturando'
                const nuevoFrame = await frameCentro.waitForSelector('[id="capaIframe"]');
                const nuevoFrame2 = await nuevoFrame.contentFrame();
                const fileUpload = await nuevoFrame2.waitForSelector('[id="fichero_1"]');

                // funcn para descargar del url y subir el archivo
                async function downloadAndUpload() {
                    try {
                        console.log('Como esta el url: ' + urlPdf);

                        // Descargar el archivo haciendo un get de la url
                        const response = await fetch(urlPdf)

                        // se guarda en el buffer el archivo descargado
                        const arrayBuffer = await response.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);

                        // se le asigna el nombre al archivo
                        const tempFilePath = `${numSiniestro}${numServicio}.pdf`;


                        // get the selector input type=file (for upload file)
                        await nuevoFrame2.waitForSelector('input[type=file]');
                        await delay(1500);

                        // get the ElementHandle of the selector above
                        const inputUploadHandle = await nuevoFrame2.$('input[type=file]');

                        //const tempFilePath = 'temp.pdf';

                        // Guardar el buffer en un archivo temporal
                        fs.writeFileSync(tempFilePath, buffer);

                        // Cargar el archivo desde el archivo temporal
                        await inputUploadHandle.uploadFile(tempFilePath);

                        // Eliminar el archivo temporal
                        fs.unlinkSync(tempFilePath);


                    } catch (error) {
                        console.error('Error al descargar y subir el archivo:', error);
                    }
                }

                // Llamada a la función para descargar y subir el archivo
                downloadAndUpload();

                await delay(2500);
                //await browser.close();

                // Quitar la cookie, la parte de finally
                // }
                response.status(200).json({ message: 'El programa ha funcionado correctamente, DAS' });
            } else {
                response.status(500).json({ message: 'Error DAS' });
            }
        } catch (error) {
            console.error('Error en la función:', error);
            response.status(500).json({ message: 'Error en la función' });
        }
    }
});

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}
