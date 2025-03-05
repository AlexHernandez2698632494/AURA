import mongoose from "mongoose";
import { connectDB, connectFiwareDB } from "../../../config/db.js";

export const checkConnection = async (req, res) => {
  try {
    // Verifica el estado de la conexión de la base de datos de autenticación
    const stateDB = connectDB.readyState;
    // Verifica el estado de la conexión de la base de datos de Fiware
    const stateFiwareDB = connectFiwareDB.readyState;

    // Estados posibles: 0 = desconectado, 1 = conectado, 2 = conectando, 3 = desconectando
    const status = {
      0: "Disconnected",
      1: "Connected",
      2: "Connecting",
      3: "Disconnecting",
    };

    let authDBStatus = status[stateDB];
    let fiwareDBStatus = status[stateFiwareDB];

    let activeConnections = [];
    let message = "No MongoDB connections are active";

    try {
      await connectDB.db.command({ ping: 1 });
      activeConnections.push("Authentication DB");
    } catch (error) {
      authDBStatus = "Disconnected";
    }

    try {
      await connectFiwareDB.db.command({ ping: 1 });
      activeConnections.push("Fiware DB");
    } catch (error) {
      fiwareDBStatus = "Disconnected";
    }

    if (activeConnections.length === 2) {
      message = "Both MongoDB connections are healthy";
    } else if (activeConnections.length === 1) {
      message = `Only ${activeConnections[0]} is active`;
    }

    res.json({
      authDBStatus,
      fiwareDBStatus,
      message,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error checking MongoDB connections",
      error: error.message,
    });
  }
};

export const welcomeMessage = (req, res) => {
  const getRoutes = (stack, parentPath = '') => {
    const routes = [];

    stack.forEach((middleware) => {
      if (middleware.route) {
        // Rutas directas en el router
        let path = `${parentPath}${middleware.route.path}`.replace(/\/+/g, '/');
        if (path === '') path = '/'; // Si es vacío, convertirlo en "/"
        routes.push(path);
      } else if (middleware.name === 'router' && middleware.handle.stack) {
        // Extraer correctamente el prefijo de la ruta del módulo
        const modulePath = middleware.regexp?.source
          .replace(/^\^/, '') // Eliminar el "^" al inicio
          .replace(/\\\//g, '/') // Convertir barras invertidas en "/"
          .replace(/\(\?:\(\?=\/\|\$\)\)/g, '') // Quitar expresiones de coincidencia
          .replace(/\(\.\*\)\?/g, '') // Quitar comodines innecesarios
          .replace(/\?\(\?=\/\|\$\)/g, '') // Eliminar partes de regex no deseadas
          .replace(/\/$/, '') || ''; // Quitar "/" final si existe

        // Concatenar correctamente evitando "//"
        const newParentPath = `${parentPath}/${modulePath}`.replace(/\/+/g, '/');
        const nestedRoutes = getRoutes(middleware.handle.stack, newParentPath);
        routes.push(...nestedRoutes);
      }
    });

    return routes;
  };

  // Limpiar rutas eliminando "//" y asegurando que la raíz sea "/"
  const cleanRoutes = (routes) => {
    return routes.map(route => (route === '/' ? '/' : route.replace(/\/+/g, '/').replace(/\/$/, '')));
  };

  const routes = cleanRoutes(getRoutes(req.app._router.stack));
  const port = req.app.get("port") || process.env.PORT || 3000;

  res.status(200).send({
    message: "Bienvenido al servidor SIMATI UDB",
    routes: routes,
    port: port,
  });
};
