# Usa la imagen oficial y ligera de Nginx
FROM nginx:alpine

# Elimina la configuración por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia tu propia configuración (opcional, pero recomendado)
# COPY nginx.conf /etc/nginx/conf.d

# Copia los archivos de tu frontend (HTML, CSS, JS) al directorio público de Nginx
COPY . /usr/share/nginx/html

# Expone el puerto 80, que es el que Nginx usa por defecto
EXPOSE 80