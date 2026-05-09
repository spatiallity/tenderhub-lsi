from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from supabase import create_client, Client
from app.core.config import settings
from app.core.unit_kerja import get_region

router = APIRouter()

def get_supabase_admin() -> Client:
    """Get Supabase client with admin privileges"""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        raise HTTPException(status_code=500, detail="Supabase configuration missing")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    title: Optional[str] = ""
    role: str = "user"  # admin, pusat, cabang, manager, user
    unit_kerja: Optional[str] = None


class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    unit_kerja: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str]
    title: Optional[str]
    role: str
    is_active: bool
    created_at: str
    unit_kerja: Optional[str] = None
    unit_kerja_region: Optional[str] = None


@router.post("/users", response_model=UserResponse)
async def create_user(user_data: CreateUserRequest):
    """
    Create a new user (Admin only)
    Creates user in Supabase Auth and profile in profiles table
    """
    try:
        supabase = get_supabase_admin()
        
        print(f"🔵 Creating user: {user_data.email}")
        
        # Create user in Supabase Auth
        auth_response = supabase.auth.admin.create_user({
            "email": user_data.email,
            "password": user_data.password,
            "email_confirm": True,  # Auto-confirm email
            "user_metadata": {
                "name": user_data.name,
                "title": user_data.title,
                "role": user_data.role
            }
        })
        
        print(f"✅ Auth user created: {auth_response}")
        
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Failed to create user")
        
        user_id = auth_response.user.id
        
        # Create profile (should be auto-created by trigger, but ensure it exists)
        profile_data = {
            "id": user_id,
            "email": user_data.email,
            "name": user_data.name,
            "title": user_data.title,
            "role": user_data.role,
            "is_active": True,
            "unit_kerja": user_data.unit_kerja,
            "unit_kerja_region": get_region(user_data.unit_kerja) if user_data.unit_kerja else None,
        }
        
        print(f"🔵 Creating profile: {profile_data}")
        
        # Upsert profile
        supabase.table("profiles").upsert(profile_data).execute()
        
        print(f"✅ Profile created")
        
        # Convert datetime to string
        created_at_str = auth_response.user.created_at
        if hasattr(created_at_str, 'isoformat'):
            created_at_str = created_at_str.isoformat()
        
        return UserResponse(
            id=user_id,
            email=user_data.email,
            name=user_data.name,
            title=user_data.title,
            role=user_data.role,
            is_active=True,
            created_at=created_at_str,
            unit_kerja=user_data.unit_kerja,
            unit_kerja_region=get_region(user_data.unit_kerja) if user_data.unit_kerja else None,
        )
        
    except Exception as e:
        print(f"❌ Error creating user: {str(e)}")
        print(f"❌ Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/users", response_model=List[UserResponse])
async def list_users():
    """
    List all users (Admin only)
    """
    try:
        supabase = get_supabase_admin()
        
        # Get all profiles
        response = supabase.table("profiles").select("*").execute()
        
        users = []
        for profile in response.data:
            users.append(UserResponse(
                id=profile["id"],
                email=profile.get("email", ""),
                name=profile.get("name"),
                title=profile.get("title"),
                role=profile.get("role", "user"),
                is_active=profile.get("is_active", True),
                created_at=profile.get("created_at", ""),
                unit_kerja=profile.get("unit_kerja"),
                unit_kerja_region=profile.get("unit_kerja_region"),
            ))
        
        return users
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/users/{user_id}")
async def update_user(user_id: str, user_data: UpdateUserRequest):
    """
    Update user profile (Admin only)
    """
    try:
        supabase = get_supabase_admin()
        
        # Build update data
        update_data = {}
        if user_data.name is not None:
            update_data["name"] = user_data.name
        if user_data.title is not None:
            update_data["title"] = user_data.title
        if user_data.role is not None:
            update_data["role"] = user_data.role
        if user_data.is_active is not None:
            update_data["is_active"] = user_data.is_active
        if user_data.unit_kerja is not None:
            update_data["unit_kerja"] = user_data.unit_kerja
            update_data["unit_kerja_region"] = get_region(user_data.unit_kerja) if user_data.unit_kerja else None

        if not update_data:
            raise HTTPException(status_code=400, detail="No data to update")
        
        # Update profile
        response = supabase.table("profiles").update(update_data).eq("id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"message": "User updated successfully", "data": response.data[0]}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/users/{user_id}")
async def delete_user(user_id: str):
    """
    Delete user (Admin only)
    Deletes from Auth and profile (cascade)
    """
    try:
        supabase = get_supabase_admin()
        
        # Delete user from Auth (profile will cascade delete)
        supabase.auth.admin.delete_user(user_id)
        
        return {"message": "User deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
