# LoanPilot 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

A modern, full-stack loan management application built with React, TypeScript, and Node.js. LoanPilot provides a comprehensive solution for managing loans, customers, and payments with an intuitive user interface. This application is designed to streamline loan processing, customer management, and financial tracking for lending institutions and individual lenders.

## 🚀 Features

### 🔐 Authentication & Security
- **Secure Authentication** - JWT-based authentication system
- **Role-based Access Control** - Different permission levels for admin and regular users
- **Password Recovery** - Secure password reset functionality via email
- **Session Management** - Secure session handling and token refresh

### 💰 Loan Management
- **Loan Application** - Streamlined loan application process
- **Loan Approval Workflow** - Multi-step approval process
- **Loan Types** - Support for different loan products
- **Amortization Schedules** - Automatic generation of payment schedules
- **Interest Calculation** - Support for various interest calculation methods

### 👥 Customer Management
- **Customer Profiles** - Comprehensive customer information storage
- **Document Management** - Secure storage of customer documents
- **Credit Scoring** - Basic credit assessment tools
- **Communication History** - Track all customer interactions

### 💳 Payment Processing
- **Online Payments** - Integration with payment gateways
- **Payment Scheduling** - Automatic payment reminders
- **Receipt Generation** - Automatic receipt generation
- **Late Payment Tracking** - Monitor and manage delinquent accounts

### 📊 Reporting & Analytics
- **Financial Reports** - Generate detailed financial statements
- **Portfolio Analysis** - Analyze loan portfolio performance
- **Collection Reports** - Track collection efficiency
- **Custom Reports** - Create and save custom report templates

### 🎨 User Experience
- **Responsive Design** - Fully responsive interface for all devices
- **Dark/Light Mode** - Built-in theme support
- **Keyboard Navigation** - Full keyboard accessibility
- **Multi-language Support** - Support for multiple languages

### ⚙️ Administration
- **User Management** - Add, edit, and manage system users
- **System Settings** - Configure application parameters
- **Audit Logs** - Track all system activities
- **Backup & Restore** - Data backup and recovery tools

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: React Query
- **UI Components**: Radix UI, Shadcn UI
- **Styling**: Tailwind CSS with CSS Modules
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: React Router v6
- **Icons**: Lucide Icons
- **Charts**: Recharts
- **Date Handling**: date-fns

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: JWT with refresh tokens
- **Validation**: Zod
- **Logging**: Winston
- **API Documentation**: OpenAPI/Swagger

### Database
- **Primary Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Migrations**: Drizzle Kit
- **Caching**: Redis (optional)

### DevOps & Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Web Server**: Nginx
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana (optional)
- **Logging**: ELK Stack (optional)

## 📦 Prerequisites

- Node.js (v18 or later)
- npm or yarn
- PostgreSQL
- Docker (optional, for containerization)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/SafeerAbbas624/LoanPilot.git
cd LoanPilot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/loanpilot

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d

# Email (Optional, for password reset)
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=your-email@example.com
```

### 4. Set up the database

1. Make sure PostgreSQL is running
2. Create a new database (default: loanpilot)
3. Run database migrations:

```bash
npm run db:push
```

### 5. Start the development server

```bash
# Start both frontend and backend in development mode
npm run dev
```

The application should now be running at `http://localhost:3000`

## 🐳 Docker Setup (Alternative)

1. Make sure Docker and Docker Compose are installed
2. Run the following command:

```bash
docker-compose up --build
```

## 🏗️ Project Structure

```
LoanPilot/
├── client/               # Frontend React application
├── server/               # Backend Node.js/Express server
│   ├── lib/              # Utility functions and middleware
│   ├── routes.ts         # API routes
│   └── index.ts          # Server entry point
├── shared/               # Shared code between frontend and backend
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile            # Docker configuration
└── nginx.conf            # Nginx configuration
```

## 📚 Documentation

### API Documentation

Our API follows RESTful principles and uses JSON for requests and responses. The API is versioned and documented using OpenAPI 3.0.

#### Authentication

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

#### Common Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /api/v1/loans | Create new loan |
| GET    | /api/v1/loans | List all loans |
| GET    | /api/v1/loans/{id} | Get loan details |
| PUT    | /api/v1/loans/{id} | Update loan |
| DELETE | /api/v1/loans/{id} | Delete loan |

### Database Schema

![Database Schema](https://example.com/db-schema.png) *(Placeholder for actual schema diagram)*

## 🚀 Deployment

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ and npm 8+
- PostgreSQL 14+

### Production Deployment

1. Set up environment variables in `.env.production`
2. Build the application:
   ```bash
   npm run build
   ```
3. Start the services:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```
4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Application environment | Yes | `development` |
| `PORT` | Server port | No | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `JWT_SECRET` | Secret for JWT signing | Yes | - |
| `SENDGRID_API_KEY` | SendGrid API key for emails | No | - |

## 🧪 Testing

Run the test suite:

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check connection string in `.env`
   - Ensure database user has correct permissions

2. **Build Failures**
   - Clear `node_modules` and reinstall dependencies
   - Check Node.js version compatibility
   - Verify all environment variables are set

3. **API Errors**
   - Check server logs for detailed error messages
   - Verify request headers and body format
   - Ensure authentication tokens are valid

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Workflow

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Start development servers:
   ```bash
   # Start backend
   npm run dev:server
   
   # Start frontend in another terminal
   npm run dev:client
   ```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

For any questions or feedback, please open an issue on GitHub or contact us at [your-email@example.com](mailto:your-email@example.com).

---

Built with ❤️ by [Safeer Abbas]

[![GitHub stars](https://img.shields.io/github/stars/SafeerAbbas624/LoanPilot?style=social)](https://github.com/SafeerAbbas624/LoanPilot/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/SafeerAbbas624/LoanPilot?style=social)](https://github.com/SafeerAbbas624/LoanPilot/network/members)
[![GitHub issues](https://img.shields.io/github/issues/SafeerAbbas624/LoanPilot)](https://github.com/SafeerAbbas624/LoanPilot/issues)
