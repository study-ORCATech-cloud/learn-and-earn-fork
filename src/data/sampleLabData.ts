import { LegacyLabContent } from '../types/lab';

export const sampleLabData: LegacyLabContent = {
  labName: "Docker Container Management Lab",
  description: "Learn how to build, run, and manage Docker containers with practical examples. This lab covers basic Docker commands, Dockerfile creation, and container networking.",
  files: [
    {
      path: "README.md",
      name: "README.md",
      type: "file",
      size: 2048,
      language: "markdown",
      is_premium: false,
      access_granted: true,
      content: `# Docker Container Management Lab

## Overview
Welcome to the Docker Container Management Lab! In this hands-on exercise, you'll learn the fundamentals of containerization using Docker.

## Learning Objectives
By the end of this lab, you will be able to:
- Create and build Docker images from Dockerfiles
- Run and manage Docker containers
- Understand container networking basics
- Work with Docker volumes for data persistence
- Use docker-compose for multi-container applications

## Prerequisites
- Basic understanding of command-line interface
- Docker installed on your system
- Text editor of your choice

## Lab Structure
This lab contains the following files and directories:
- \`Dockerfile\` - Main application container definition
- \`docker-compose.yml\` - Multi-container orchestration
- \`app/\` - Sample Python web application
- \`nginx/\` - Nginx configuration files
- \`scripts/\` - Helper scripts for lab exercises

## Getting Started
1. Start by examining the Dockerfile
2. Build the Docker image using: \`docker build -t myapp .\`
3. Run the container: \`docker run -p 8080:8080 myapp\`
4. Follow the exercises in the lab-exercises.md file

## Support
If you encounter any issues, refer to the troubleshooting section or reach out for help.

Happy containerizing! 🐳`
    },
    {
      path: "Dockerfile",
      name: "Dockerfile",
      type: "file",
      size: 512,
      language: "dockerfile",
      is_premium: false,
      access_granted: true,
      content: `# Use Python 3.9 slim image as base
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ .

# Expose port 8080
EXPOSE 8080

# Set environment variables
ENV FLASK_APP=main.py
ENV FLASK_ENV=production

# Create non-root user for security
RUN adduser --disabled-password --gecos '' appuser && \\
    chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:8080/health || exit 1

# Run the application
CMD ["python", "main.py"]`
    },
    {
      path: "docker-compose.yml",
      name: "docker-compose.yml",
      type: "file",
      size: 768,
      language: "yaml",
      content: `version: '3.8'

services:
  web:
    build: .
    ports:
      - "8080:8080"
    environment:
      - FLASK_ENV=development
      - DATABASE_URL=postgresql://user:password@db:5432/myapp
    depends_on:
      - db
      - redis
    volumes:
      - ./app:/app
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - web
    networks:
      - app-network

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

  redis:
    image: redis:alpine
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge`
    },
    {
      path: "requirements.txt",
      name: "requirements.txt",
      type: "file",
      size: 128,
      language: "text",
      content: `Flask==2.3.2
gunicorn==21.2.0
psycopg2-binary==2.9.7
redis==4.6.0
requests==2.31.0
python-dotenv==1.0.0`
    },
    {
      path: "app",
      name: "app",
      type: "directory",
      size: 0,
      children: [
        {
          path: "app/main.py",
          name: "main.py",
          type: "file",
          size: 1024,
          language: "python",
          content: `#!/usr/bin/env python3
"""
Simple Flask web application for Docker lab demonstration.
"""

from flask import Flask, jsonify, render_template_string
import os
import redis
import psycopg2
from datetime import datetime

app = Flask(__name__)

# HTML template for the home page
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Docker Lab App</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 600px; margin: 0 auto; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .success { background-color: #d4edda; color: #155724; }
        .error { background-color: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🐳 Docker Lab Application</h1>
        <p>Welcome to the Docker Container Management Lab!</p>
        
        <h2>Application Status</h2>
        <div class="status success">
            ✅ Flask application is running
        </div>
        
        <p><strong>Container ID:</strong> {{ container_id }}</p>
        <p><strong>Timestamp:</strong> {{ timestamp }}</p>
        
        <h2>Available Endpoints</h2>
        <ul>
            <li><a href="/health">/health</a> - Health check endpoint</li>
            <li><a href="/info">/info</a> - Container information</li>
        </ul>
    </div>
</body>
</html>
"""

@app.route('/')
def home():
    container_id = os.environ.get('HOSTNAME', 'unknown')
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    return render_template_string(HTML_TEMPLATE, 
                                container_id=container_id,
                                timestamp=timestamp)

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'container_id': os.environ.get('HOSTNAME', 'unknown')
    })

@app.route('/info')
def info():
    return jsonify({
        'application': 'Docker Lab App',
        'version': '1.0.0',
        'python_version': os.sys.version,
        'container_id': os.environ.get('HOSTNAME', 'unknown'),
        'environment': os.environ.get('FLASK_ENV', 'production')
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)`
        },
        {
          path: "app/config.py",
          name: "config.py",
          type: "file",
          size: 256,
          language: "python",
          content: `"""
Configuration settings for the Flask application.
"""

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration class."""
    
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///app.db'
    REDIS_URL = os.environ.get('REDIS_URL') or 'redis://localhost:6379'
    
class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    
class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}`
        }
      ]
    },
    {
      path: "nginx",
      name: "nginx",
      type: "directory",
      size: 0,
      children: [
        {
          path: "nginx/nginx.conf",
          name: "nginx.conf",
          type: "file",
          size: 512,
          language: "text",
          content: `events {
    worker_connections 1024;
}

http {
    upstream web {
        server web:8080;
    }
    
    server {
        listen 80;
        server_name localhost;
        
        location / {
            proxy_pass http://web;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        location /health {
            proxy_pass http://web/health;
            access_log off;
        }
    }
}`
        }
      ]
    },
    {
      path: "scripts",
      name: "scripts",
      type: "directory",
      size: 0,
      children: [
        {
          path: "scripts/build.sh",
          name: "build.sh",
          type: "file",
          size: 256,
          language: "bash",
          content: `#!/bin/bash

# Docker Lab - Build Script
echo "🐳 Building Docker Lab Application..."

# Build the Docker image
docker build -t docker-lab-app .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    echo "Run with: docker run -p 8080:8080 docker-lab-app"
else
    echo "❌ Docker build failed!"
    exit 1
fi`
        },
        {
          path: "scripts/run.sh",
          name: "run.sh",
          type: "file",
          size: 384,
          language: "bash",
          content: `#!/bin/bash

# Docker Lab - Run Script
echo "🚀 Starting Docker Lab Application..."

# Check if image exists
if [[ "$(docker images -q docker-lab-app 2> /dev/null)" == "" ]]; then
    echo "❌ Docker image not found. Please build first with: ./scripts/build.sh"
    exit 1
fi

# Run the container
docker run -d \\
    --name docker-lab-container \\
    -p 8080:8080 \\
    -e FLASK_ENV=development \\
    docker-lab-app

if [ $? -eq 0 ]; then
    echo "✅ Container started successfully!"
    echo "🌐 Application available at: http://localhost:8080"
    echo "🔍 View logs with: docker logs docker-lab-container"
else
    echo "❌ Failed to start container!"
    exit 1
fi`
        },
        {
          path: "scripts/cleanup.sh",
          name: "cleanup.sh",
          type: "file",
          size: 192,
          language: "bash",
          content: `#!/bin/bash

# Docker Lab - Cleanup Script
echo "🧹 Cleaning up Docker Lab resources..."

# Stop and remove container
docker stop docker-lab-container 2>/dev/null
docker rm docker-lab-container 2>/dev/null

# Remove image
docker rmi docker-lab-app 2>/dev/null

echo "✅ Cleanup completed!"
echo "All Docker Lab resources have been removed."`
        }
      ]
    },
    {
      path: "lab-exercises.md",
      name: "lab-exercises.md",
      type: "file",
      size: 3072,
      language: "markdown",
      content: `# Docker Lab Exercises

## Exercise 1: Building Your First Container

### Objective
Build and run the sample application using Docker.

### Steps
1. **Examine the Dockerfile**
   - Open the \`Dockerfile\` and understand each instruction
   - Notice how we use multi-stage builds for optimization

2. **Build the Image**
   \`\`\`bash
   docker build -t my-docker-app .
   \`\`\`

3. **Run the Container**
   \`\`\`bash
   docker run -p 8080:8080 my-docker-app
   \`\`\`

4. **Test the Application**
   - Open http://localhost:8080 in your browser
   - Check the health endpoint: http://localhost:8080/health

### Questions
- What is the base image used?
- Why do we copy requirements.txt first?
- What port does the application expose?

---

## Exercise 2: Container Management

### Objective
Learn basic container management commands.

### Steps
1. **List Running Containers**
   \`\`\`bash
   docker ps
   \`\`\`

2. **View Container Logs**
   \`\`\`bash
   docker logs <container-id>
   \`\`\`

3. **Execute Commands in Container**
   \`\`\`bash
   docker exec -it <container-id> /bin/bash
   \`\`\`

4. **Stop and Remove Container**
   \`\`\`bash
   docker stop <container-id>
   docker rm <container-id>
   \`\`\`

---

## Exercise 3: Docker Compose

### Objective
Use docker-compose to run multi-container application.

### Steps
1. **Start the Application Stack**
   \`\`\`bash
   docker-compose up -d
   \`\`\`

2. **Check Running Services**
   \`\`\`bash
   docker-compose ps
   \`\`\`

3. **View Service Logs**
   \`\`\`bash
   docker-compose logs web
   \`\`\`

4. **Scale a Service**
   \`\`\`bash
   docker-compose up -d --scale web=3
   \`\`\`

5. **Stop All Services**
   \`\`\`bash
   docker-compose down
   \`\`\`

---

## Exercise 4: Advanced Topics

### Volume Mounting
\`\`\`bash
docker run -v $(pwd)/app:/app -p 8080:8080 my-docker-app
\`\`\`

### Environment Variables
\`\`\`bash
docker run -e FLASK_ENV=production -p 8080:8080 my-docker-app
\`\`\`

### Network Inspection
\`\`\`bash
docker network ls
docker network inspect bridge
\`\`\`

---

## Troubleshooting

### Common Issues
1. **Port Already in Use**
   - Use \`lsof -i :8080\` to find processes using port 8080
   - Kill the process or use a different port

2. **Permission Denied**
   - Ensure Docker daemon is running
   - Add your user to docker group: \`sudo usermod -aG docker $USER\`

3. **Image Build Fails**
   - Check Dockerfile syntax
   - Ensure all required files exist

### Useful Commands
- \`docker system prune\` - Clean up unused resources
- \`docker images\` - List all images
- \`docker volume ls\` - List volumes
- \`docker network ls\` - List networks

---

## Next Steps
- Explore Docker Hub for pre-built images
- Learn about Docker security best practices
- Try building multi-stage Dockerfiles
- Experiment with container orchestration tools like Docker Swarm or Kubernetes`
    }
  ],
  metadata: {
    lastUpdated: new Date().toISOString(),
    totalFiles: 10,
    mainInstruction: "This is a comprehensive Docker lab covering container basics, image building, and multi-container orchestration. Start with the README.md file for an overview."
  }
};