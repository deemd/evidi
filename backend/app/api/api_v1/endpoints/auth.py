from fastapi import APIRouter, HTTPException
from app.models.user import LoginRequest, RegisterRequest, UserOut, FiltersModel
from app.db.database import get_users_collection
from app.db.utils import get_default_filters

router = APIRouter()


@router.post("/login", response_model=UserOut)
def login(data: LoginRequest):
    """Authenticate user and return user data."""
    users_collection = get_users_collection()
    user = users_collection.find_one({"email": data.email})

    if not user or user.get("pwd") != data.pwd:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    filters = user.get("filters", get_default_filters())

    return UserOut(
        id=user["email"],
        email=user["email"],
        full_name=user.get("full_name"),
        filters=FiltersModel(**filters),
        resume=user.get("resume"),
    )


@router.post("/register", response_model=UserOut)
def register(data: RegisterRequest):
    """Register a new user."""
    users_collection = get_users_collection()
    
    existing_user = users_collection.find_one({"email": data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = {
        "email": data.email,
        "full_name": data.full_name,
        "pwd": data.pwd,
        "filters": get_default_filters(),
        "resume": None
    }

    users_collection.insert_one(new_user)

    return UserOut(
        id=data.email,
        email=data.email,
        full_name=data.full_name,
        filters=FiltersModel(**get_default_filters()),
        resume=None,
    )