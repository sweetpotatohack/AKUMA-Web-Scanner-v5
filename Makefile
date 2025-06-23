.PHONY: help up down logs clean restart build quick status test

# Default help
help:
	@echo "🔥 AKUMA Web Scanner v5.0 - Quick Commands 🔥"
	@echo ""
	@echo "📋 Available commands:"
	@echo "  make up          - Start all services (one command!)"
	@echo "  make quick       - Quick start (core services only)"
	@echo "  make down        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make build       - Build/rebuild all images"
	@echo "  make logs        - Show logs from all services"
	@echo "  make status      - Show status of all containers"
	@echo "  make clean       - Clean up (remove containers & volumes)"
	@echo "  make test        - Test API endpoints"
	@echo ""
	@echo "🚀 Quick start: make up"

# Start all services with dependencies
up:
	@echo "🚀 Starting AKUMA Web Scanner v5.0..."
	docker-compose up postgres redis -d
	@echo "⏳ Waiting for database..."
	@sleep 5
	docker-compose up akuma-backend --build -d
	@echo "⏳ Waiting for backend..."
	@sleep 10
	docker-compose up akuma-frontend --build -d
	docker-compose up nginx celery-worker -d
	@echo ""
	@echo "✅ AKUMA v5.0 is ready!"
	@echo "🌍 Web UI: http://localhost:3001"
	@echo "📡 API: http://localhost:8000/docs"
	@echo "📊 Monitor: docker-compose logs -f"

# Quick start (essential services only)
quick:
	@echo "⚡ Quick starting AKUMA core services..."
	docker-compose up postgres redis akuma-backend akuma-frontend nginx -d --build
	@echo "✅ Core services ready!"
	@echo "🌍 Web UI: http://localhost:3001"
	@echo "📡 API: http://localhost:8000/docs"

# Stop all services
down:
	@echo "🛑 Stopping AKUMA Web Scanner..."
	docker-compose down

# Restart all services
restart: down up

# Build all images
build:
	@echo "🔧 Building all Docker images..."
	docker-compose build --no-cache

# Show logs
logs:
	docker-compose logs -f

# Show container status
status:
	@echo "📊 AKUMA Web Scanner Status:"
	docker-compose ps
	@echo ""
	@echo "🌐 Access points:"
	@echo "  Web UI: http://localhost:3001"
	@echo "  API Docs: http://localhost:8000/docs"
	@echo "  Grafana: http://localhost:3000 (if running separately)"

# Clean up everything
clean:
	@echo "🧹 Cleaning up AKUMA Web Scanner..."
	docker-compose down -v --remove-orphans
	docker system prune -f
	@echo "✅ Cleanup complete!"

# Test API endpoints
test:
	@echo "🧪 Testing AKUMA API..."
	@echo "Health check:"
	curl -s http://localhost:8000/ | jq . || echo "API not ready"
	@echo ""
	@echo "Dashboard stats:"
	curl -s http://localhost:8000/api/dashboard/stats | jq . || echo "Stats not ready"
	@echo ""
	@echo "Frontend check:"
	curl -s -I http://localhost:3001/ | head -1 || echo "Frontend not ready"

# Development shortcuts
dev: up logs

# Production startup (with healthchecks)
prod:
	@echo "🏭 Starting AKUMA for production..."
	docker-compose -f docker-compose.yml up -d --build
	@echo "⏳ Waiting for services to be healthy..."
	@sleep 15
	@make status
