# SE4030 – Secure Software Development Assignment

## Group Information
*(Please fill in your group members' details below)*
1. **[Member 1 Name]** - [Index Number]
2. **[Member 2 Name]** - [Index Number]
3. **[Member 3 Name]** - [Index Number]
4. **[Member 4 Name]** - [Index Number]

---

## Project Links

- **Original Third-Party Project Repository:**  
  [https://github.com/sushanthreddy009/Food_Delivery_Application](https://github.com/sushanthreddy009/Food_Delivery_Application)

- **Modified Secure Project Repository (This Repo):**  
  [https://github.com/GovindiTharshika/Food_Delivery_Application-Modified](https://github.com/GovindiTharshika/Food_Delivery_Application-Modified)

- **YouTube Presentation Video:**  
  *(Insert your YouTube video link here - Max 20 mins)*  
  `[Link to YouTube Video]`

---

## Project Overview

This repository contains the modified, secure version of the MERN stack "Food Delivery Application". As part of the **SE4030 Secure Software Development** module, this project was audited for security vulnerabilities. 

**9 distinct vulnerabilities** were identified in the original codebase and fixed in this repository. All fixes are thoroughly documented in the commit history and in the inline code comments. Additionally, a new feature for **Google OAuth 2.0 login** was successfully implemented using the Authorization Code Grant type.

### Fixed Vulnerabilities Overview
1. **NoSQL Injection** (Fixed using `express-mongo-sanitize`)
2. **Cross-Site Scripting (XSS)** (Fixed using `xss-clean`)
3. **No Rate Limiting / Brute Force** (Fixed using `express-rate-limit`)
4. **Missing Security Headers** (Fixed using `helmet`)
5. **Insecure Direct Object Reference (IDOR)** (Fixed with ownership validation in order fetching)
6. **Weak Password Policy** (Fixed with a strong regex validator)
7. **Insecure File Upload** (Fixed by validating MIME types of base64 image strings)
8. **Hardcoded API Secrets Exposure** (Fixed by removing secrets from code, using `.env`, and rewriting git history)
9. **Information Leakage via Errors** (Fixed by sanitizing production error responses)

---

## How to Run the Application Locally

### 1. Prerequisites
- Node.js installed
- MongoDB installed and running locally (or MongoDB Atlas URI)

### 2. Environment Configuration
Create a `config.env` file in the `backend/config/` directory with the following variables:
```env
PORT=4000
NODE_ENV=DEVELOPMENT
DB_LOCAL_URI=mongodb://127.0.0.1/Internship

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_TIME=90

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary Credentials (For image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration
EMAIL_USERNAME=your_mailtrap_user
EMAIL_PASSWORD=your_mailtrap_pass
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=25
EMAIL_FROM=orderit@example.com

# Stripe Credentials (Optional for local testing)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_API_KEY=your_stripe_api_key
```

### 3. Run the Backend
```bash
cd backend
npm install
npm run dev
```

### 4. Run the Frontend
Open a new terminal window:
```bash
cd frontend
npm install --legacy-peer-deps
npm start
```
The application will be running at `http://localhost:3000`.
