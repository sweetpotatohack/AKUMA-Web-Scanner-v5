#!/bin/bash

echo "🔥 AKUMA Web Scanner v5.0 - Starting up... 🔥"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored text
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose >/dev/null 2>&1; then
    print_error "docker-compose is not installed."
    exit 1
fi

print_status "Starting AKUMA Web Scanner services..."

# Stop any existing containers
print_status "Stopping any existing containers..."
docker-compose down >/dev/null 2>&1

# Start the services
print_status "Starting core services (postgres, redis)..."
docker-compose up postgres redis -d

print_status "Waiting for database to be ready..."
for i in {1..30}; do
    if docker-compose exec postgres pg_isready -U akuma >/dev/null 2>&1; then
        print_success "Database is ready!"
        break
    fi
    echo -n "."
    sleep 1
done

print_status "Starting backend API..."
docker-compose up akuma-backend --build -d

print_status "Waiting for backend to be ready..."
for i in {1..60}; do
    if curl -s http://localhost:8000/ >/dev/null 2>&1; then
        print_success "Backend API is ready!"
        break
    fi
    echo -n "."
    sleep 1
done

print_status "Starting frontend and remaining services..."
docker-compose up akuma-frontend nginx celery-worker --build -d

echo ""
print_success "🎉 AKUMA Web Scanner v5.0 is running!"
echo ""
echo "📋 Access points:"
echo "  🌍 Web Interface: http://localhost:3001"
echo "  📡 API Documentation: http://localhost:8000/docs"
echo "  🔧 Direct API: http://localhost:8000"
echo ""
echo "📊 Check status: docker-compose ps"
echo "📝 View logs: docker-compose logs -f"
echo "🛑 Stop: docker-compose down"
echo ""
echo "🚀 Happy scanning!"
