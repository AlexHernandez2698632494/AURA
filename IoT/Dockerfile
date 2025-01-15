# Usa una imagen base de Node.js
FROM node:18

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia el archivo package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias de Angular
RUN npm install -g @angular/cli

# Copia todo el código fuente al contenedor
COPY ./ /app

# Instala las dependencias del proyecto Angular
RUN npm install

# Expone el puerto donde el frontend estará corriendo
EXPOSE 4201

# Comando para ejecutar Angular (ng serve) cuando se inicie el contenedor
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4201"]
