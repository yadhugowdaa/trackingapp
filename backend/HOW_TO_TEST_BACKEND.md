# How to Test IKYKIK Backend

## What's Running:
✅ MongoDB (port 27017) - Already started!

## To Start Auth Service:

### Option 1: Quick Fix & Run
```bash
# 1. Navigate to auth service
cd c:\Users\Yadhu Gowda\OneDrive\Desktop\todolist\backend\auth-service

# 2. Install all dependencies properly
npm install @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/mongoose mongoose bcrypt jsonwebtoken @nestjs/jwt class-validator class-transformer reflect-metadata rxjs

# 3. Install dev dependencies
npm install --save-dev typescript @types/node @types/bcrypt ts-node nodemon

# 4. Run in development mode
npx ts-node src/main.ts
```

You should see:
```
🚀 Auth Service is running on: http://localhost:3001
```

## Test the API:

### Using PowerShell:
```powershell
# Register a new user
Invoke-RestMethod -Uri http://localhost:3001/auth/register -Method POST -ContentType "application/json" -Body '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
Invoke-RestMethod -Uri http://localhost:3001/auth/login -Method POST -ContentType "application/json" -Body '{"email":"test@example.com","password":"password123"}'
```

### Using your browser:
You won't see much - APIs don't have visual interfaces. You'd need to use:
- Postman (download from postman.com)
- Thunder Client (VS Code extension)
- Or just the PowerShell commands above

## What You'll Get:
A JSON response with user data and JWT token:
```json
{
  "user": {
    "_id": "...",
    "name": "Test User",
    "email": "test@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
