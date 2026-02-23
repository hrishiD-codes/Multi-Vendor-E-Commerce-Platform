FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy composer files first for caching
COPY composer.json composer.lock ./

# Install PHP dependencies (no scripts, no dev)
RUN composer install --no-interaction --no-scripts --no-dev --prefer-dist

# Copy application source
COPY . .

# Generate optimized autoloader and run post-install scripts
RUN composer dump-autoload --optimize \
    && php artisan package:discover --ansi

# Set permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Expose port
EXPOSE 8000

# Start-up script: run migrations then serve
CMD ["sh", "-c", "php artisan migrate --force && php artisan db:seed --force && php artisan serve --host=0.0.0.0 --port=8000"]
