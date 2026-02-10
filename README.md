# 🌐 Community Hub

A community communication platform built with Spring Boot and React for managing multiple communities with real-time messaging capabilities.

![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-green)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Moderator, Member)
- Protected routes on frontend and backend
- BCrypt password encryption

### 👥 Community Management
- Create public or private communities
- View all communities user belongs to
- Member management (add/remove members)
- Role assignment (Admin, Moderator, Member)
- Leave community functionality
- Invitation system with email notifications

### 💬 Direct Messaging
- Real-time one-on-one messaging using WebSocket (STOMP)
- Persistent message history
- Unread message badges
- Conversation list with last message preview
- Message search functionality
- Online/offline connection status indicator
- Prevent self-messaging

### 📊 Statistics
- Global platform statistics (total users, communities, members)
- Community-specific statistics (member count, roles distribution)

### 📤 Bulk User Upload
- Import users from Excel (.xlsx) files
- Import users from CSV files
- Download template files
- Automatic validation and error reporting

### 🎨 User Interface
- Responsive design with Tailwind CSS
- Smooth animations using Framer Motion
- Toast notifications for user feedback
- Loading states and empty state messages
- Clean, modern interface

## 🛠️ Tech Stack

### Backend
- Java 21
- Spring Boot 3.2.0
- Spring Security (JWT)
- Spring Data JPA with PostgreSQL
- Spring WebSocket (STOMP over SockJS)
- Apache POI & OpenCSV for file processing
- Spring Mail for email notifications
- Maven

### Frontend
- React 18.2
- React Router v6
- Vite (build tool)
- Tailwind CSS
- Framer Motion
- Axios
- @stomp/stompjs & sockjs-client
- React Toastify
- React Icons

## 📋 Prerequisites

- Java 21 or higher
- Node.js 18+
- PostgreSQL 14+
- Maven 3.8+

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/mohamedrafil/Community-Hub.git
cd Community-Hub
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE community_hub;
```

### 3. Backend Configuration

Navigate to backend directory and update `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/community_hub
    username: your_username
    password: your_password
  
  mail:
    username: your-email@gmail.com
    password: your-gmail-app-password

jwt:
  secret: your_secure_jwt_secret_key
```

Or create a `.env` file with:
```env
DATABASE_URL=jdbc:postgresql://localhost:5432/community_hub
DB_USERNAME=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
```

Run the backend:

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend will run at `http://localhost:8080`

### 4. Frontend Configuration

Navigate to frontend directory:

```bash
cd frontend
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=http://localhost:8080/ws
```

Start the frontend:

```bash
npm run dev
```

Frontend will run at `http://localhost:5173`

### 5. Gmail Configuration (Optional - for email invites)

1. Enable 2-Factor Authentication on Gmail
2. Generate App Password: Google Account → Security → 2-Step Verification → App passwords
3. Use generated password in configuration

## 📁 Project Structure

```
Community-Hub/
├── backend/
│   ├── src/main/java/com/communityhub/
│   │   ├── config/           # Security, WebSocket, CORS
│   │   ├── controller/       # REST & WebSocket endpoints
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── model/            # JPA Entities
│   │   ├── repository/       # Data Access Layer
│   │   ├── security/         # JWT & Auth filters
│   │   └── service/          # Business Logic
│   └── src/main/resources/
│       └── application.yml   # Configuration
│
└── frontend/
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── context/          # Auth Context
    │   ├── pages/            # Page components
    │   │   ├── Auth/
    │   │   ├── Dashboard/
    │   │   ├── Community/
    │   │   ├── Messages/
    │   │   └── Admin/
    │   └── services/         # API & WebSocket
    └── package.json
```

## 🔌 Key API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Communities
- `GET /api/communities` - List user's communities
- `POST /api/communities` - Create community
- `GET /api/communities/{id}` - Get community details

### Members
- `GET /api/members/community/{communityId}` - List members
- `POST /api/members/assign-role` - Assign role
- `DELETE /api/members/{memberId}` - Remove member

### Messages
- `GET /api/messages/conversations` - List conversations
- `GET /api/messages/history/{receiverId}` - Get chat history
- `PUT /api/messages/mark-read/{senderId}` - Mark as read

### WebSocket
- `CONNECT /ws` - WebSocket connection
- `SUBSCRIBE /user/queue/messages` - Receive messages
- `SEND /app/chat.sendMessage` - Send message

### Statistics
- `GET /api/statistics/global` - Platform statistics
- `GET /api/statistics/community/{id}` - Community stats

### Bulk Upload
- `POST /api/bulk-upload/upload` - Upload Excel/CSV
- `GET /api/bulk-upload/template` - Download template

### Invites
- `POST /api/invites/send` - Send invitation
- `GET /api/invites/pending` - List pending invites
- `POST /api/invites/accept/{id}` - Accept invite
- `POST /api/invites/reject/{id}` - Reject invite

## 🎯 How to Use

### Create a Community
1. Login/Register
2. Go to Dashboard
3. Click "Create Community"
4. Enter name, description, and choose visibility
5. You become the Admin

### Add Members
- **Invite by Email**: Send email invitation
- **Bulk Upload**: Upload Excel/CSV with user details
- **Accept Join Requests**: For private communities

### Send Messages
1. Go to Messages page
2. Click "New Message"
3. Select a member from your community
4. Start chatting in real-time

### Manage Roles
1. Go to Community Home
2. Click Members tab
3. Select member and assign role (Admin/Moderator/Member)

## 🌍 Environment Variables

### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection URL |
| `DB_USERNAME` | Yes | Database username |
| `DB_PASSWORD` | Yes | Database password |
| `JWT_SECRET` | Yes | Secret key for JWT tokens |
| `MAIL_USERNAME` | No* | Gmail address (*Required for invites) |
| `MAIL_PASSWORD` | No* | Gmail app password (*Required for invites) |

### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL |
| `VITE_WS_URL` | Yes | WebSocket server URL |

## 🐛 Troubleshooting

**Backend won't start:**
- Verify PostgreSQL is running
- Check database credentials
- Ensure port 8080 is available

**Frontend can't connect:**
- Verify backend is running on port 8080
- Check `.env` file has correct URLs
- Clear browser cache

**Messages not sending:**
- Check browser console for WebSocket errors
- Verify both users are in the same community
- Refresh the page to reconnect WebSocket

**Email invites not working:**
- Verify Gmail 2FA is enabled
- Use App Password, not regular password
- Check SMTP settings in application.yml

## 🔒 Security

- JWT tokens for authentication
- BCrypt password hashing
- CORS configuration
- Input validation
- SQL injection prevention via JPA
- XSS protection
- Environment variables for sensitive data

<!-- ## 👨‍💻 Author

**Mohamed Rafil**
- GitHub: [@mohamedrafil](https://github.com/mohamedrafil)

## 📞 Support

For issues or questions, open an issue on [GitHub Issues](https://github.com/mohamedrafil/Community-Hub/issues)

--- -->


<div align="center">

**⭐ Star this repo if you find it useful! ⭐**

</div>
