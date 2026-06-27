# Real-Time Forum

A full-stack discussion forum built with **Go**, **SQLite**, **HTML**, **CSS**, and **Vanilla JavaScript**. The application allows users to create posts, comment on discussions, react with likes/dislikes, and communicate instantly through real-time private messaging using WebSockets.

## Features

### Authentication

- User registration
- Secure login/logout
- Password hashing
- Session management

### Forum

- Create posts
- Browse all posts
- Categorize posts
- View individual discussions
- Comment on posts

### Reactions

- Like posts
- Dislike posts
- Like comments
- Dislike comments

### Real-Time Chat

- Private messaging between users
- WebSocket-based communication
- Instant message delivery
- Online user tracking

### Database

- SQLite database
- Persistent storage for:
  - Users
  - Posts
  - Comments
  - Reactions
  - Messages

## Technologies

- Go
- SQLite
- Gorilla WebSocket
- HTML5
- CSS3
- Vanilla JavaScript

## Project Structure

```
.
├── apis/
│   ├── chat/             # WebSocket chat
│   ├── error/            # Error handling
│   ├── like/             # Likes & dislikes
│   ├── post/             # Posts and comments
│   └── user/             # Authentication
├── database/             # Database operations
├── js/                   # Frontend scripts
├── style/                # CSS and images
├── templates/
│   └── mainPage.html
├── web/                  # HTTP server configuration
├── main.go               # Application entry point
├── forum.db              # SQLite database
├── go.mod
└── go.sum
```

## Prerequisites

- Go 1.23 or later

## Installation

Clone the repository:

```bash
git clone https://github.com/rjanahi/real-time-forum.git
cd real-time-forum
```

Install dependencies:

```bash
go mod tidy
```

## Running the Application

Start the server:

```bash
go run .
```

Open your browser and navigate to:

```
http://localhost:8080
```

## Usage

1. Register a new account.
2. Log in.
3. Create forum posts.
4. Browse discussions.
5. Comment on posts.
6. Like or dislike posts and comments.
7. Open a chat with another registered user for real-time messaging.

## Dependencies

- Gorilla WebSocket
- modernc SQLite
- Google UUID
- Go Crypto

## Future Improvements

- Group chats
- User profiles
- Image uploads
- Notifications
- Search functionality
- Post editing
- Comment editing
- Admin moderation tools
- User blocking
- Responsive mobile interface

## Authors

- Reem Khalid
- Omar Khalid

## License

This project was developed for educational purposes as part of the Reboot01 curriculum.