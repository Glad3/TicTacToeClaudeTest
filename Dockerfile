# Use official PHP image with Apache
FROM php:8.3-cli

# Set working directory
WORKDIR /app

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy backend files
COPY backend /app/backend

# Install dependencies
WORKDIR /app/backend
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Expose port (Railway sets PORT env var)
EXPOSE 8000

# Start PHP built-in server
CMD php -S 0.0.0.0:${PORT:-8000} -t public
