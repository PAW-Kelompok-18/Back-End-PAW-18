# Updated Backend Specification for Ticket Booking System

## 1. Technology Stack

- Primary Database: MongoDB
- In-Memory Database: Redis (for waiting list management)
- Framework: Express.js
- Programming Language: TypeScript
- Runtime: Node.js

## 2. Server Architecture

- Two separate servers:
  1. Authentication Server: Handles login, waiting list (using Redis), and active user tracking
  2. Ticket Server: Manages seat selection and ticket purchases

## 3. Database Schema

### MongoDB Schema

#### Users Collection

```typescript
{
  _id: ObjectId,
  email: string,
  googleId: string,
  name: string,
  lastActive: Date
}
```

#### Seats Collection

```typescript
{
  _id: ObjectId,
  seatNumber: string,
  category: 'VIP' | 'Regular',
  status: 'available' | 'unavailable' | 'inTransaction' | 'booked',
  season: string,
  price: number
}
```

#### Transactions Collection

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  seats: Array<ObjectId>,
  status: 'pending' | 'completed' | 'cancelled',
  createdAt: Date,
  completedAt: Date
}
```

#### Tickets Collection

```typescript
{
  _id: ObjectId,
  transactionId: ObjectId,
  userId: ObjectId,
  seatId: ObjectId,
  qrCode: string,
  issuedAt: Date
}
```

### Redis Schema

#### Waiting List

- Use a sorted set to manage the waiting list
- Key: `waiting_list`
- Score: Timestamp of when the user joined the waiting list
- Value: User ID

```
ZADD waiting_list <timestamp> <user_id>
```

#### Active Users

- Use a set to track active users
- Key: `active_users`
- Value: User ID

```
SADD active_users <user_id>
```

## 4. API Endpoints

### Authentication Server

#### POST /auth/google

- Handles Google OAuth login
- Creates or updates user in the MongoDB database
- Adds user to active users in Redis if limit not reached, otherwise adds to waiting list
- Returns JWT token for authenticated session

#### GET /auth/status

- Returns current user status (active or waiting)
- Checks Redis for user status

#### POST /auth/logout

- Invalidates user session
- Removes user from active users in Redis
- Promotes next user from waiting list if available

#### GET /waitingList/status

- Returns current waiting list status and user's position if applicable
- Retrieves information from Redis waiting list

#### POST /waitingList/join

- Adds user to waiting list in Redis if active user limit is reached

### Ticket Server

(Endpoints remain the same as in the original specification)

## 5. Key Functionalities

### Waiting List Management (Updated)

- Use Redis sorted set for efficient waiting list management
- Implement atomic operations for adding/removing users from the waiting list
- Use Redis pub/sub for real-time notifications when a user's turn comes up

### Active User Tracking (Updated)

- Use Redis set to track active users
- Implement Redis expiration for automatic removal of inactive users

(Other functionalities remain the same as in the original specification)

## 6. Redis Integration

- Implement Redis connection and error handling
- Use Redis transactions for operations that require multiple steps
- Set up Redis persistence to prevent data loss in case of server restarts

(Sections 7-9 remain the same as in the original specification)
