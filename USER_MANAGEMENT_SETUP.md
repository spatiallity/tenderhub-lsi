# User Management Setup Guide

## Status
✅ Backend API endpoint created (`/api/v1/users`)  
✅ Frontend UI component created (`UserManagement.jsx`)  
✅ Integration with SettingsPage completed  
✅ Supabase package added to requirements.txt  

⚠️ **REQUIRES CONFIGURATION**: Supabase Service Role Key needed

---

## What's Been Implemented

### Backend (`backend/app/api/v1/users.py`)
- **POST /api/v1/users** - Create new user with Supabase Auth
- **GET /api/v1/users** - List all users
- **PATCH /api/v1/users/{user_id}** - Update user profile
- **DELETE /api/v1/users/{user_id}** - Delete user

### Frontend (`frontend/src/components/Settings/UserManagement.jsx`)
- Full CRUD interface for user management
- Add user form with email, password, name, title, role
- Table view with inline editing
- Delete confirmation
- Admin-only access control
- Guest mode restrictions

### Features
- **Role-based access**: Only admin users can manage other users
- **Guest protection**: Guest users see warning message
- **Auto-confirm email**: New users are automatically verified
- **Profile sync**: Creates profile in `profiles` table automatically
- **Secure**: Uses Supabase Service Role Key for admin operations

---

## Setup Instructions

### Step 1: Get Supabase Keys

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/aedojcjkhorogsgwasab
2. Navigate to **Settings** → **API**
3. Copy the following keys:
   - **Project URL** (already set correctly)
   - **anon public** key (replace the truncated one)
   - **service_role** key (⚠️ IMPORTANT: Keep this secret!)
   - **JWT Secret** (under JWT Settings)

### Step 2: Update `backend/.env`

Replace the placeholder values in `backend/.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://aedojcjkhorogsgwasab.supabase.co
SUPABASE_ANON_KEY=<paste your full anon public key here>
SUPABASE_SERVICE_KEY=<paste your service_role key here>
SUPABASE_JWT_SECRET=<paste your JWT secret here>
```

**⚠️ SECURITY WARNING**: 
- Never commit the `service_role` key to git
- The service_role key has admin privileges and can bypass Row Level Security
- Only use it in backend server code, never in frontend

### Step 3: Install Dependencies

```bash
cd backend
pip install supabase==2.10.0
```

Or install all requirements:
```bash
pip install -r requirements.txt
```

### Step 4: Restart Backend

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 5: Test User Management

1. Open the app: http://localhost:5173
2. Login as an admin user
3. Go to **Settings** page
4. Scroll to **Manajemen Pengguna** section
5. Click **Tambah User** button
6. Fill in the form:
   - Email: test@sucofindo.co.id
   - Password: test123
   - Name: Test User
   - Title: Tester
   - Role: User
7. Click **Simpan User**
8. Verify the user appears in the table
9. Try editing and deleting the test user

---

## Troubleshooting

### Error: "Supabase configuration missing"
- Check that all Supabase keys are set in `backend/.env`
- Restart the backend server after updating .env

### Error: "Failed to create user"
- Verify the email format is valid
- Check that the password is at least 6 characters
- Ensure the email doesn't already exist in Supabase Auth

### Error: "User not found" when updating
- The user might have been deleted from Supabase Auth
- Try refreshing the user list

### Users not appearing in list
- Check that the `profiles` table exists in Supabase
- Run the `supabase/auth_setup.sql` script if needed
- Verify the trigger is working to auto-create profiles

---

## API Testing with curl

### Create User
```bash
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@sucofindo.co.id",
    "password": "password123",
    "name": "New User",
    "title": "Sales Manager",
    "role": "user"
  }'
```

### List Users
```bash
curl http://localhost:8000/api/v1/users
```

### Update User
```bash
curl -X PATCH http://localhost:8000/api/v1/users/{user_id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "role": "manager"
  }'
```

### Delete User
```bash
curl -X DELETE http://localhost:8000/api/v1/users/{user_id}
```

---

## Security Considerations

1. **Service Role Key**: Only use in backend, never expose to frontend
2. **Password Requirements**: Currently minimum 6 characters (Supabase default)
3. **Email Verification**: Auto-confirmed for admin-created users
4. **Row Level Security**: Profiles table should have RLS policies
5. **Admin Check**: Frontend checks `isAdmin` from AuthContext

---

## Next Steps

1. ✅ Get Supabase keys from dashboard
2. ✅ Update `backend/.env` with real keys
3. ✅ Install supabase package
4. ✅ Restart backend
5. ✅ Test creating a user
6. ✅ Test editing a user
7. ✅ Test deleting a user
8. ✅ Verify only admin users can access the feature

---

## Files Modified

- `backend/app/api/v1/users.py` - New user management API
- `backend/app/main.py` - Registered users router
- `backend/requirements.txt` - Added supabase==2.10.0
- `frontend/src/components/Settings/UserManagement.jsx` - New UI component
- `frontend/src/pages/SettingsPage.jsx` - Integrated UserManagement component
- `backend/.env` - Needs Supabase keys configuration

---

## Support

If you encounter issues:
1. Check backend logs for error messages
2. Verify all environment variables are set correctly
3. Ensure Supabase project is accessible
4. Check that the user has admin role in the profiles table
