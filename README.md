# BookShop Application

A comprehensive full-stack bookshop application built with Node.js, React, and MongoDB. Features include user authentication, profile management, book catalog, reviews, and admin functionality with production-level logging and monitoring.

## 🚀 Features

### Authentication & User Management
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **User Registration & Login**: Complete user onboarding flow
- **Profile Management**: Users can update their profile information and upload profile pictures
- **Role-based Access Control**: Admin and user roles with different permissions
- **User Dashboard**: Personalized dashboard showing user statistics and recent activity

### Book Management
- **Book Catalog**: Browse books with search, filtering, and sorting capabilities
- **Add/Edit Books**: Users can add new books with cover images and detailed information
- **Book Reviews**: Rating and review system for books
- **Categories**: Organize books by categories
- **Stock Management**: Track book inventory

### Admin Features
- **User Management**: Admin dashboard to view and manage all users
- **Book Moderation**: Admins can edit or delete any book
- **Analytics**: View platform statistics and user activity

### Technical Features
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **File Upload**: Secure image upload for profiles and book covers
- **Real-time Status**: Backend connection status indicator
- **Production Logging**: Comprehensive logging with Winston and OpenTelemetry
- **Monitoring**: Jaeger tracing and Prometheus metrics
- **Security**: Helmet.js, rate limiting, input validation, and CORS protection

## 🛠 Technology Stack

### Frontend
- **React 18** with Hooks and Context API
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **Vite** for build tooling

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing
- **Winston** for logging
- **OpenTelemetry** for observability
- **Helmet.js** for security
- **Express Rate Limit** for API protection

### DevOps & Deployment
- **Docker** with multi-stage builds
- **Kubernetes** manifests for orchestration
- **Docker Compose** for local development
- **Nginx** for frontend serving
- **Jaeger** for distributed tracing
- **Prometheus** for metrics collection

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB 7.0+
- Docker and Docker Compose (for containerized deployment)
- Kubernetes cluster (for K8s deployment)

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bookshop-application
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   # Backend environment
   cp backend/.env.example backend/.env
   
   # Frontend environment
   cp frontend/.env.example frontend/.env
   ```

4. **Configure environment variables**
   
   **Backend (.env):**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/bookshop
   JWT_SECRET=your_super_secret_jwt_key_here
   FRONTEND_URL=http://localhost:5173
   JAEGER_ENDPOINT=http://localhost:14268/api/traces
   LOG_LEVEL=info
   ```

   **Frontend (.env):**
   ```env
   VITE_API_URL=http://localhost:5000
   ```

5. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d --name mongodb -p 27017:27017 mongo:7.0
   
   # Or use your local MongoDB installation
   ```

6. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend API on http://localhost:5000
   - Frontend on http://localhost:5173

### Using Docker Compose

1. **Start all services**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - Frontend on http://localhost:3000
   - Backend API on http://localhost:5000
   - MongoDB on localhost:27017
   - Jaeger UI on http://localhost:16686
   - Prometheus metrics on http://localhost:9090

2. **View logs**
   ```bash
   docker-compose logs -f
   ```

3. **Stop services**
   ```bash
   docker-compose down
   ```

## 🐳 Docker Deployment

### Building Images

1. **Build Backend Image**
   ```bash
   cd backend
   docker build -t sriniv7654/user-management:backend-latest .
   ```

2. **Build Frontend Image**
   ```bash
   cd frontend
   docker build -t sriniv7654/user-management:frontend-latest .
   ```

3. **Push to Docker Hub**
   ```bash
   docker push sriniv7654/user-management:backend-latest
   docker push sriniv7654/user-management:frontend-latest
   ```

## ☸️ Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (minikube, kind, or cloud provider)
- kubectl configured to access your cluster

### Deploy to Kubernetes

1. **Apply the manifests**
   ```bash
   kubectl apply -f k8s-manifests.yaml
   ```

2. **Check deployment status**
   ```bash
   kubectl get pods -n bookshop
   kubectl get services -n bookshop
   ```

3. **Access the application**
   ```bash
   # Get the external IP for frontend
   kubectl get service frontend-service -n bookshop
   
   # Get the external IP for Jaeger
   kubectl get service jaeger-service -n bookshop
   ```

4. **Port forwarding (for local access)**
   ```bash
   # Frontend
   kubectl port-forward service/frontend-service 3000:80 -n bookshop
   
   # Backend API
   kubectl port-forward service/backend-service 5000:5000 -n bookshop
   
   # Jaeger UI
   kubectl port-forward service/jaeger-service 16686:16686 -n bookshop
   ```

### Configuration Management

The Kubernetes deployment uses ConfigMaps and Secrets for configuration:

- **ConfigMaps**: Non-sensitive configuration (ports, URLs, log levels)
- **Secrets**: Sensitive data (database credentials, JWT secrets)

To update configuration:
```bash
kubectl edit configmap backend-config -n bookshop
kubectl edit secret bookshop-secrets -n bookshop
```

## 📊 Monitoring & Observability

### OpenTelemetry Integration

The application includes comprehensive observability:

1. **Distributed Tracing**: Automatic instrumentation with OpenTelemetry
2. **Metrics Collection**: Prometheus metrics for performance monitoring
3. **Logging**: Structured logging with Winston

### Accessing Monitoring Tools

1. **Jaeger UI** (Distributed Tracing)
   - Local: http://localhost:16686
   - Kubernetes: Port-forward or use external IP

2. **Prometheus Metrics**
   - Backend metrics: http://localhost:9090 (or backend-service:9090)
   - OpenTelemetry Collector: http://localhost:8889

3. **Application Logs**
   - Docker: `docker-compose logs backend`
   - Kubernetes: `kubectl logs -f deployment/backend -n bookshop`

### Key Metrics to Monitor

- **API Response Times**: Track endpoint performance
- **Error Rates**: Monitor application errors
- **Database Connections**: MongoDB connection health
- **User Activity**: Registration, login, and book operations
- **File Uploads**: Profile pictures and book covers

## 🔧 Configuration

### Environment Variables

#### Backend Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/bookshop` |
| `JWT_SECRET` | JWT signing secret | Required |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `JAEGER_ENDPOINT` | Jaeger collector endpoint | `http://localhost:14268/api/traces` |
| `LOG_LEVEL` | Logging level | `info` |

#### Frontend Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` |

### Security Configuration

The application implements multiple security layers:

1. **Authentication**: JWT tokens with secure signing
2. **Authorization**: Role-based access control
3. **Input Validation**: Express-validator for API inputs
4. **Rate Limiting**: Prevent API abuse
5. **CORS**: Configured for specific origins
6. **Helmet.js**: Security headers
7. **File Upload Security**: Type and size validation

## 🧪 API Documentation

### Authentication Endpoints

```
POST /api/auth/register - Register new user
POST /api/auth/login - User login
GET /api/auth/me - Get current user
POST /api/auth/logout - User logout
```

### User Management

```
GET /api/users - Get all users (admin only)
GET /api/users/profile - Get user profile
PUT /api/users/profile - Update user profile
POST /api/users/profile/picture - Upload profile picture
DELETE /api/users/:id - Delete user (admin only)
```

### Book Management

```
GET /api/books - Get all books (with search/filter)
GET /api/books/:id - Get single book
POST /api/books - Add new book
PUT /api/books/:id - Update book
DELETE /api/books/:id - Delete book
POST /api/books/:id/reviews - Add book review
```

### System Endpoints

```
GET /api/health - Health check
GET /api/status - Backend status
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**
   ```bash
   # Check MongoDB status
   docker ps | grep mongo
   
   # Check MongoDB logs
   docker logs mongodb
   ```

2. **Backend Not Starting**
   ```bash
   # Check environment variables
   cat backend/.env
   
   # Check backend logs
   npm run server
   ```

3. **Frontend Build Issues**
   ```bash
   # Clear node_modules and reinstall
   rm -rf frontend/node_modules
   cd frontend && npm install
   ```

4. **Kubernetes Deployment Issues**
   ```bash
   # Check pod status
   kubectl describe pod <pod-name> -n bookshop
   
   # Check logs
   kubectl logs <pod-name> -n bookshop
   ```

### Performance Optimization

1. **Database Indexing**: Ensure proper indexes on frequently queried fields
2. **Image Optimization**: Compress uploaded images
3. **Caching**: Implement Redis for session management
4. **CDN**: Use CDN for static assets in production

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the logs for error details

---

**Built with ❤️ for the developer community**