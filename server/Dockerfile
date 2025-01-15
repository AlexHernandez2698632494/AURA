# Usa la imagen oficial de Node.js
FROM node:16

# Crear y establecer el directorio de trabajo
WORKDIR /app

# Copiar el package.json y package-lock.json (si existe)
COPY package*.json ./  
# Copiar los package.json desde la carpeta server

# Instalar las dependencias
RUN npm install

# Copiar todo el código de la aplicación, incluyendo seed.js y la carpeta seed
COPY /. ./  
# Copiar todo el contenido de la carpeta 'server' al contenedor

# Exponer el puerto en el que el servidor estará corriendo
EXPOSE 3000

# Comando para ejecutar la siembra de datos y luego iniciar el servidor
CMD ["sh", "-c", "npm run seed && npm start"]
