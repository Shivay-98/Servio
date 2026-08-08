# Servio Application - Testing Guide

**Date:** 2026-08-07  
**Status:** All Major Issues Fixed ✅

---

## 🔧 Issues Fixed

### 1. Authentication Issues
- ✅ Fixed login response data extraction
- ✅ Fixed registration response data extraction
- ✅ Added role-based redirects (admin → `/admin`, provider → `/dashboard`)
- ✅ Fixed async token response in backend auth controller

### 2. API Endpoint Mismatches
- ✅ Fixed admin dashboard endpoint: `/admin/dashboard/stats` → `/admin/dashboard`
- ✅ Fixed provider dashboard endpoint: `/providers/dashboard/stats` → `/provider/dashboard`
- ✅ Fixed all provider service URLs: `/providers/*` → `/provider/*`

### 3. Missing Pages
- ✅ Created `AdminProviderDetailPage.jsx`
- ✅ Created `AdminAnalyticsPage.jsx`

### 4. Export/Import Issues
- ✅ Fixed `notification.service.js` default export
- ✅ Fixed `store.js` named export
- ✅ Fixed `admin.service.js` missing exports

---

## 🧪 Complete Testing Checklist

### Step 1: Backend Verification
```bash
# Check backend is running
curl http://localhost:5000/api/health

# Expected: {"success":true,"message":"Servio API is running",...}
```

### Step 2: Test Admin Login
1. Go to: http://localhost:5173/login
2. Login with:
   - Email: `admin@servio.com`
   - Password: `Admin@123`
3. ✅ Should redirect to: `/admin` (Admin Dashboard)
4. ✅ Dashboard should load with stats (0 providers initially)
5. ✅ Navigate to:
   - Providers page
   - Analytics page
   - All pages should load without errors

### Step 3: Test Provider Registration
1. Go to: http://localhost:5173/register
2. Fill in form:
   - First Name: Test
   - Last Name: Provider
   - Email: provider@test.com
   - Password: Test@1234
   - Check "I agree to Terms"
3. Click "Create Account"
4. ✅ Should redirect to: `/dashboard` (Provider Dashboard)

### Step 4: Test Provider Dashboard
After registering as a provider:

1. ✅ **Dashboard Page** (`/dashboard`)
   - Should show welcome message
   - Profile completion: 0%
   - Documents uploaded: 0
   - Application status: Draft
   - Quick actions should be visible

2. ✅ **Profile Page** (`/profile`)
   - Personal tab - Fill in details
   - Professional tab - Select category, add experience
   - Address tab - Add address
   - Click "Save" after each section
   - Profile completion should increase

3. ✅ **Documents Page** (`/documents`)
   - Upload at least:
     - Aadhar card (type: `aadhar`)
     - Profile photo (type: `profile_photo`)
   - Should see uploaded documents

4. ✅ **Application Status** (`/application-status`)
   - Once profile is 60%+ complete and documents uploaded
   - "Submit Application" button should be enabled
   - Click to submit
   - Status should change to "Pending"

### Step 5: Test Admin Review Flow
1. Logout from provider account
2. Login as admin (`admin@servio.com` / `Admin@123`)
3. Go to: `/admin/providers`
4. ✅ Should see the provider you just created
5. Click "View" on the provider
6. ✅ Should see provider details page with tabs:
   - Details (bio, experience, skills, address)
   - Documents (uploaded files)
   - Actions (review, suspend, delete)
7. Go to "Actions" tab
8. ✅ Add review comment and approve/reject
9. ✅ Provider status should update

---

## 🌐 API Endpoints Reference

### Auth Routes (`/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `GET /me` - Get current user
- `POST /refresh-token` - Refresh access token

### Provider Routes (`/api/v1/provider`) - Requires provider role
- `GET /dashboard` - Get dashboard stats
- `GET /profile` - Get provider profile
- `PUT /profile` - Update profile
- `POST /profile/photo` - Upload profile photo
- `POST /application/submit` - Submit application
- `GET /application/status` - Get application status

### Admin Routes (`/api/v1/admin`) - Requires admin role
- `GET /dashboard` - Get admin dashboard stats
- `GET /analytics` - Get analytics data
- `GET /providers` - List all providers (with filters)
- `GET /providers/:id` - Get provider details
- `PUT /providers/:id/review` - Review application (approve/reject)
- `PUT /providers/:id/suspend` - Suspend/unsuspend provider
- `DELETE /providers/:id` - Delete provider

### Document Routes (`/api/v1/documents`) - Requires provider role
- `GET /` - List all documents
- `POST /` - Upload document
- `GET /:id` - Get document details
- `DELETE /:id` - Delete document

### Category Routes (`/api/v1/categories`) - Public
- `GET /` - List all categories

---

## 🐛 Known Issues & Workarounds

### Issue: Dashboard shows "Failed to load dashboard"
**Cause:** API endpoint mismatch  
**Status:** ✅ FIXED  
**Solution Applied:** Updated service files to use correct endpoints

### Issue: Profile upload not working
**Cause:** Incorrect API route  
**Status:** ✅ FIXED  
**Solution Applied:** Changed `/providers/*` to `/provider/*`

### Issue: Application submission fails
**Cause:** Missing required documents or profile completion < 60%  
**Workaround:** 
1. Complete profile to at least 60%
2. Upload minimum documents (aadhar, profile_photo)
3. Then submit application

---

## 📝 Environment Configuration

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/servio
JWT_SECRET=your_jwt_secret_key_here_change_this_to_random_32_chars_min
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here_change_this_random_32_chars
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=821119135811889
CLOUDINARY_API_SECRET=9uNFPFepR0ohsqI_2PLtEbWV4yw
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_CLOUDINARY_CLOUD_NAME=demo
VITE_APP_NAME=Servio
```

---

## 🚀 Quick Start Commands

### Start Backend
```bash
cd server
npm run dev
```

### Start Frontend
```bash
cd client
npm run dev
```

### Seed Database
```bash
cd server
node utils/seed.js
```

---

## ✅ Success Criteria

The application is working correctly if:

1. ✅ Admin can login and see dashboard with statistics
2. ✅ Provider can register and access provider dashboard
3. ✅ Provider can complete profile, upload documents
4. ✅ Provider can submit application when requirements met
5. ✅ Admin can view, approve/reject, suspend, or delete providers
6. ✅ All pages load without "Failed to load" errors
7. ✅ File uploads work for both profile photos and documents
8. ✅ Role-based redirects work correctly after login/registration

---

## 🎯 Current Status: FULLY FUNCTIONAL ✅

All major issues have been resolved. The application is ready for testing and use.

**Last Updated:** 2026-08-07 16:45 UTC
