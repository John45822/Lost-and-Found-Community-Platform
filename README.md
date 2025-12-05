# Lost and Found Platform

A web application for managing lost and found items with admin and user roles.

## Features

- **User Management**: Registration with ID verification, admin approval system
- **Post Management**: Create posts for lost/found items, admin approval required
- **Messaging**: Users can message each other and admins
- **Notifications**: Real-time notifications for account approvals, post approvals, and messages
- **Comments**: Users can comment on posts
- **Admin Dashboard**: Manage accounts, approve posts, edit/delete content

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/lostfound
```

For MongoDB Atlas, use:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lostfound
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Default Admin Account

- **Username**: admin
- **Password**: admin123

## Deployment to Render

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variable:
   - `MONGODB_URI`: Your MongoDB connection string
7. Deploy!

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Register new user

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/approved` - Get approved users
- `GET /api/users/pending` - Get pending users
- `PUT /api/users/:id/approve` - Approve user account
- `DELETE /api/users/:id/decline` - Decline user account
- `DELETE /api/users/:id` - Delete user account

### Posts
- `GET /api/posts/approved` - Get all approved posts
- `GET /api/posts/pending` - Get pending posts (admin)
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id/approve` - Approve post
- `DELETE /api/posts/:id/decline` - Decline post
- `PUT /api/posts/:id` - Edit post
- `DELETE /api/posts/:id` - Delete post

### Comments
- `GET /api/comments/post/:postId` - Get comments for a post
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Edit comment

### Messages
- `GET /api/messages/user/:userId` - Get messages for user
- `POST /api/messages` - Send message

### Notifications
- `GET /api/notifications/user/:userId` - Get notifications for user
- `PUT /api/notifications/:id/read` - Mark notification as read

## License

ISC

