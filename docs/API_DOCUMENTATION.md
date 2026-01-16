# The Compagnon - API Documentation

**Version:** 2.0  
**Base URL:** `http://localhost:3000/api`  
**Date:** January 16, 2026

---

## Table of Contents

1. [Authentication](#authentication)
2. [Modules](#modules)
3. [Mood Tracking](#mood-tracking)
4. [Sandbox](#sandbox)
5. [Chat](#chat)
6. [Materials](#materials)
7. [Admin](#admin)
8. [GDPR](#gdpr)

---

## Authentication

### Join Session
Create a new participant session.

**Endpoint:** `POST /api/auth/join`

**Request Body:**
```json
{
  "nickname": "string (required, 1-50 characters)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "participant": {
      "id": "uuid",
      "nickname": "string",
      "avatarSeed": "string",
      "createdAt": "ISO 8601 datetime"
    },
    "sessionToken": "string"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid nickname
- `500` - Server error

---

### Get Session
Retrieve current session information.

**Endpoint:** `GET /api/auth/session`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nickname": "string",
    "avatarSeed": "string",
    "createdAt": "ISO 8601 datetime",
    "lastSeen": "ISO 8601 datetime"
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Invalid or missing session token
- `500` - Server error

---

## Modules

### Get Modules
Retrieve all modules with participant-specific progress.

**Endpoint:** `GET /api/modules`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "order": "number",
      "unlocked": "boolean",
      "completed": "boolean",
      "unlockedAt": "ISO 8601 datetime | null",
      "completedAt": "ISO 8601 datetime | null"
    }
  ]
}
```

---

### Complete Module
Mark a module as completed.

**Endpoint:** `POST /api/modules/:moduleId/complete`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "moduleId": "string",
    "completedAt": "ISO 8601 datetime"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Module not unlocked or already completed
- `401` - Unauthorized
- `404` - Module not found

---

## Mood Tracking

### Update Mood
Record a participant's mood.

**Endpoint:** `POST /api/mood`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Request Body:**
```json
{
  "mood": "confused | thinking | aha | wow",
  "moduleId": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "number",
    "mood": "string",
    "moduleId": "string | null",
    "timestamp": "ISO 8601 datetime"
  }
}
```

**Rate Limit:** 10 requests per minute

---

### Get Mood History
Retrieve mood history for the current participant.

**Endpoint:** `GET /api/mood/history?limit=50`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 50, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "mood": "string",
      "moduleId": "string | null",
      "timestamp": "ISO 8601 datetime"
    }
  ]
}
```

---

## Sandbox

### Create App
Submit a new sandbox application.

**Endpoint:** `POST /api/sandbox/create`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Request Body:**
```json
{
  "title": "string (required, 1-100 characters)",
  "code": "string (required, max 50KB)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "string",
    "createdAt": "ISO 8601 datetime",
    "previewUrl": "/sandbox/preview/{id}"
  }
}
```

**Rate Limit:** 5 requests per minute

---

### Get Gallery
Retrieve all active sandbox apps.

**Endpoint:** `GET /api/sandbox/gallery`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "participantId": "uuid",
      "participantNickname": "string",
      "createdAt": "ISO 8601 datetime",
      "upvotes": "number",
      "downvotes": "number",
      "userVote": "up | down | null"
    }
  ]
}
```

---

### Vote on App
Vote for a sandbox application.

**Endpoint:** `POST /api/sandbox/:appId/vote`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Request Body:**
```json
{
  "voteType": "up | down"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "appId": "uuid",
    "voteType": "up | down",
    "upvotes": "number",
    "downvotes": "number"
  }
}
```

---

## Chat

### Send Message
Send a message to the AI assistant.

**Endpoint:** `POST /api/chat/message`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Request Body:**
```json
{
  "message": "string (required, max 500 characters)",
  "conversationHistory": [
    {
      "role": "user | assistant",
      "content": "string"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "string",
    "model": "string",
    "responseTime": "number (milliseconds)",
    "error": "boolean"
  }
}
```

**Rate Limit:** 10 requests per minute

---

### Get Chat History
Retrieve chat history.

**Endpoint:** `GET /api/chat/history?limit=20`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "message": "string",
      "response": "string",
      "responseTime": "number",
      "timestamp": "ISO 8601 datetime"
    }
  ]
}
```

---

### Get Chat Status
Check AI assistant availability.

**Endpoint:** `GET /api/chat/status`

**Response:**
```json
{
  "success": true,
  "data": {
    "available": "boolean",
    "model": "string",
    "rateLimit": "number"
  }
}
```

---

## Materials

### Get All Materials
Retrieve all learning materials.

**Endpoint:** `GET /api/materials`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "type": "pdf | video | link",
      "description": "string",
      "url": "string",
      "category": "string",
      "order": "number"
    }
  ]
}
```

---

### Get Material
Retrieve a specific material.

**Endpoint:** `GET /api/materials/:materialId`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "type": "pdf | video | link",
    "description": "string",
    "url": "string",
    "category": "string"
  }
}
```

---

## Admin

### Login
Authenticate as admin.

**Endpoint:** `POST /api/admin/login`

**Request Body:**
```json
{
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "string",
    "expiresAt": "number (timestamp)"
  }
}
```

---

### Get Dashboard Stats
Retrieve dashboard statistics.

**Endpoint:** `GET /api/admin/stats`

**Headers:**
```
Authorization: Bearer {adminToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalParticipants": "number",
    "activeSessions": "number",
    "totalMoodUpdates": "number",
    "totalApps": "number",
    "totalChatMessages": "number"
  }
}
```

---

### Get Participants
List all participants.

**Endpoint:** `GET /api/admin/participants`

**Headers:**
```
Authorization: Bearer {adminToken}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nickname": "string",
      "avatarSeed": "string",
      "createdAt": "ISO 8601 datetime",
      "lastSeen": "ISO 8601 datetime",
      "isOnline": "boolean"
    }
  ]
}
```

---

### Unlock Module
Unlock a module for participant(s).

**Endpoint:** `POST /api/admin/modules/unlock`

**Headers:**
```
Authorization: Bearer {adminToken}
```

**Request Body:**
```json
{
  "moduleId": "string (required)",
  "participantId": "uuid (optional)",
  "unlockForAll": "boolean (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "unlocked": "number (count of unlocked)"
  }
}
```

---

### Broadcast Message
Send message to all participants.

**Endpoint:** `POST /api/admin/broadcast`

**Headers:**
```
Authorization: Bearer {adminToken}
```

**Request Body:**
```json
{
  "message": "string (required)",
  "type": "info | warning | error"
}
```

---

### Generate Secret Code
Create a secret code for Easter eggs.

**Endpoint:** `POST /api/admin/codes/generate`

**Headers:**
```
Authorization: Bearer {adminToken}
```

**Request Body:**
```json
{
  "moduleId": "string (required)",
  "description": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "code": "string (8 characters)",
    "moduleId": "string",
    "description": "string"
  }
}
```

---

## GDPR

### Export User Data
Export all user data (GDPR compliance).

**Endpoint:** `GET /api/gdpr/export`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exportDate": "ISO 8601 datetime",
    "participant": {},
    "progress": [],
    "moods": [],
    "apps": [],
    "votes": [],
    "chatHistory": [],
    "metadata": {}
  }
}
```

---

### Delete User Data
Delete all user data (GDPR right to erasure).

**Endpoint:** `POST /api/gdpr/delete`

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Request Body:**
```json
{
  "keepAnonymizedData": "boolean (optional)",
  "deleteApps": "boolean (optional)",
  "deleteChatHistory": "boolean (optional)"
}
```

---

## Error Responses

All endpoints may return the following error format:

```json
{
  "success": false,
  "error": "Error message string"
}
```

**Common Status Codes:**
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Rate Limiting

Rate limits are applied per IP address:

- **General API**: 100 requests/minute
- **Authentication**: 5 attempts/15 minutes
- **Chat**: 10 messages/minute
- **Sandbox**: 5 submissions/minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2026-01-16T12:45:00.000Z
```

---

## WebSocket Events

**Connection:**
```javascript
const socket = io('http://localhost:3000');
```

**Events Emitted by Server:**
- `module:unlock` - Module unlocked for participant
- `participant:joined` - New participant joined
- `mood:update` - Mood update from any participant
- `admin:broadcast` - Admin broadcast message
- `admin:kick` - Participant kicked
- `admin:system_pause` - System paused
- `admin:system_resume` - System resumed

**Events Received by Server:**
- `ping` - Health check (responds with `pong`)

---

## Environment Variables

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
ADMIN_PASSWORD=admin123
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=gemma2:2b
OLLAMA_TIMEOUT=30000
OLLAMA_RATE_LIMIT=5
```

---

**Last Updated:** January 16, 2026  
**Maintained by:** The Compagnon Team
