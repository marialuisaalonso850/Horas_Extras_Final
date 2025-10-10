# Usa una imagen oficial de Node.js ligera y segura
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos de dependencias
# Esto aprovecha el caché de Docker para no reinstalar si no cambian
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia el resto del código de tu aplicación
COPY . .

# Expone el puerto en el que corre tu API
EXPOSE 3000

# El comando para iniciar la aplicación cuando el contenedor se ejecute
CMD [ "npm", "start" ]