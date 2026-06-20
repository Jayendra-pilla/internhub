from fastapi import FastAPI, HTTPException, Depends, Header, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from bson import ObjectId
import bcrypt as bcrypt_lib
from jose import jwt, JWTError
from database import users_collection, applications_collection, internships_collection, client
import datetime
import os
import io
import asyncio
import secrets
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from email_utils import send_reset_email

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

app = FastAPI()

@app.on_event("startup")
async def startup_db_check():
    try:
        await client.admin.command("ping")
        print("[OK] MongoDB connection successful!")
    except Exception as e:
        print(f"[ERROR] MongoDB connection FAILED: {e}")

SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_change_me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

def hash_password(password: str) -> str:
    return bcrypt_lib.hashpw(password.encode("utf-8"), bcrypt_lib.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt_lib.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(data: dict):
    payload = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload["exp"] = expire
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# ── Auth Dependencies ────────────────────────────────────────────────────────
async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def require_admin(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Hardcoded seed data ───────────────────────────────────────────────────────
SEED_INTERNSHIPS = [
    {"title": "Frontend Developer Intern", "company": "Google", "location": "Bengaluru (Remote)", "stipend": "₹30,000/mo", "duration": "3 Months", "category": "Frontend", "tags": ["React", "TypeScript", "CSS"], "description": "Build and maintain frontend components for Google products.", "requirements": "React, TypeScript, CSS knowledge required."},
    {"title": "Backend Developer Intern", "company": "TCS", "location": "Chennai", "stipend": "₹20,000/mo", "duration": "6 Months", "category": "Backend", "tags": ["Node.js", "PostgreSQL", "REST API"], "description": "Develop RESTful APIs and backend services.", "requirements": "Node.js and PostgreSQL experience."},
    {"title": "Fullstack Developer Intern", "company": "Wipro", "location": "Pune (Hybrid)", "stipend": "₹80,000/mo", "duration": "4 Months", "category": "Fullstack", "tags": ["React", "Express", "MongoDB"], "description": "Work on both frontend and backend of enterprise applications.", "requirements": "MERN stack proficiency."},
    {"title": "UI/UX Design Intern", "company": "Flipkart", "location": "Bengaluru", "stipend": "₹25,000/mo", "duration": "3 Months", "category": "Design", "tags": ["Figma", "Prototyping", "User Research"], "description": "Design user-centered interfaces for Flipkart's platform.", "requirements": "Figma and prototyping skills."},
    {"title": "Data Science Intern", "company": "Microsoft", "location": "Hyderabad (Remote)", "stipend": "₹45,000/mo", "duration": "6 Months", "category": "Data", "tags": ["Python", "Machine Learning", "Pandas"], "description": "Analyze large datasets and build ML models.", "requirements": "Python, Pandas, scikit-learn."},
    {"title": "React Developer Intern", "company": "Swiggy", "location": "Bengaluru", "stipend": "₹28,000/mo", "duration": "3 Months", "category": "Frontend", "tags": ["React", "Redux", "Tailwind"], "description": "Build Swiggy's consumer-facing web app features.", "requirements": "React and Redux experience."},
    {"title": "DevOps Intern", "company": "Infosys", "location": "Mysuru", "stipend": "₹22,000/mo", "duration": "6 Months", "category": "Backend", "tags": ["Docker", "CI/CD", "AWS"], "description": "Work with CI/CD pipelines and cloud infrastructure.", "requirements": "Docker, AWS, and Linux knowledge."},
    {"title": "Product Design Intern", "company": "Razorpay", "location": "Bengaluru (Hybrid)", "stipend": "₹35,000/mo", "duration": "4 Months", "category": "Design", "tags": ["Figma", "Design Systems", "Wireframing"], "description": "Create design systems and wireframes for Razorpay's products.", "requirements": "Figma proficiency and design system knowledge."},
    {"title": "ML Engineer Intern", "company": "Amazon", "location": "Hyderabad", "stipend": "₹60,000/mo", "duration": "6 Months", "category": "Data", "tags": ["Python", "TensorFlow", "NLP"], "description": "Build NLP models for Amazon's AI services.", "requirements": "Python, TensorFlow, NLP experience."},
    {"title": "Full Stack Intern", "company": "Zomato", "location": "Gurugram (Remote)", "stipend": "₹32,000/mo", "duration": "3 Months", "category": "Fullstack", "tags": ["Vue.js", "Django", "MySQL"], "description": "Develop Zomato's restaurant management platform.", "requirements": "Vue.js and Django experience."},
    {"title": "Angular Developer Intern", "company": "Paytm", "location": "Noida (Hybrid)", "stipend": "₹26,000/mo", "duration": "3 Months", "category": "Frontend", "tags": ["Angular", "TypeScript", "RxJS"], "description": "Build Angular-based features for Paytm's payment platform.", "requirements": "Angular, TypeScript, RxJS."},
    {"title": "Cloud & Backend Intern", "company": "PhonePe", "location": "Bengaluru", "stipend": "₹40,000/mo", "duration": "6 Months", "category": "Backend", "tags": ["Java", "Spring Boot", "GCP"], "description": "Develop scalable backend services on GCP.", "requirements": "Java, Spring Boot, GCP knowledge."},
    {"title": "Data Analyst Intern", "company": "Ola", "location": "Bengaluru (Remote)", "stipend": "₹35,000/mo", "duration": "4 Months", "category": "Data", "tags": ["SQL", "Power BI", "Excel"], "description": "Analyze ride data and generate business insights.", "requirements": "SQL, Power BI, Excel expertise."},
    {"title": "Motion & Visual Design Intern", "company": "CRED", "location": "Bengaluru", "stipend": "₹30,000/mo", "duration": "3 Months", "category": "Design", "tags": ["After Effects", "Figma", "Lottie"], "description": "Create motion graphics and animations for CRED's app.", "requirements": "After Effects and Figma skills."},
    {"title": "MERN Stack Intern", "company": "Zepto", "location": "Mumbai (Hybrid)", "stipend": "₹38,000/mo", "duration": "5 Months", "category": "Fullstack", "tags": ["MongoDB", "Express", "React", "Node.js"], "description": "Work on Zepto's quick-commerce platform using MERN stack.", "requirements": "Full MERN stack experience."},
    {"title": "Next.js Developer Intern", "company": "Meesho", "location": "Bengaluru (Remote)", "stipend": "₹27,000/mo", "duration": "3 Months", "category": "Frontend", "tags": ["Next.js", "React", "Vercel"], "description": "Build SSR features for Meesho's marketplace.", "requirements": "Next.js and React experience."},
    {"title": "Python Backend Intern", "company": "Freshworks", "location": "Chennai", "stipend": "₹33,000/mo", "duration": "6 Months", "category": "Backend", "tags": ["Python", "FastAPI", "Redis"], "description": "Build high-performance APIs using FastAPI and Redis.", "requirements": "Python, FastAPI, Redis knowledge."},
    {"title": "AI/ML Research Intern", "company": "Samsung R&D", "location": "Noida", "stipend": "₹55,000/mo", "duration": "6 Months", "category": "Data", "tags": ["PyTorch", "Computer Vision", "Python"], "description": "Research and implement computer vision models.", "requirements": "PyTorch and Computer Vision experience."},
    {"title": "Brand & Graphic Design Intern", "company": "Nykaa", "location": "Mumbai", "stipend": "₹22,000/mo", "duration": "3 Months", "category": "Design", "tags": ["Illustrator", "Photoshop", "Canva"], "description": "Create brand assets and marketing materials for Nykaa.", "requirements": "Illustrator, Photoshop, Canva skills."},
    {"title": "Full Stack (React + Go) Intern", "company": "Juspay", "location": "Bengaluru (Hybrid)", "stipend": "₹42,000/mo", "duration": "4 Months", "category": "Fullstack", "tags": ["React", "Go", "PostgreSQL"], "description": "Build payment infrastructure using React and Go.", "requirements": "React, Go, PostgreSQL knowledge."},
]


# ── Pydantic models ──────────────────────────────────────────────────────────
class ApplicationCreate(BaseModel):
    name: str
    email: str
    resumeUrl: str
    internship: str
    company: str


class ApplicationUpdate(BaseModel):
    name: str
    email: str
    resumeUrl: str


class StatusUpdate(BaseModel):
    status: str


class UserRegister(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class InternshipCreate(BaseModel):
    title: str
    company: str
    location: str
    stipend: str
    duration: str
    category: str
    description: Optional[str] = ""
    requirements: Optional[str] = ""
    tags: Optional[list] = []


class RoleUpdate(BaseModel):
    role: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    college: Optional[str] = None
    branch: Optional[str] = None
    cgpa: Optional[str] = None
    skills: Optional[list] = None


class ProfileResumeUpdate(BaseModel):
    resumeUrl: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str


# ── Helper: convert MongoDB doc to JSON-serialisable dict ────────────────────
def serialize(doc) -> dict:
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def home():
    return {"message": "Backend Running"}


# ── Auth ─────────────────────────────────────────────────────────────────────

@app.post("/register")
async def register(user: UserRegister):
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    await users_collection.insert_one({
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "role": "user",
        "createdAt": datetime.datetime.utcnow().strftime("%d/%m/%Y"),
    })
    return {"message": "User registered successfully"}


@app.post("/login")
async def login(user: UserLogin):
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "sub": db_user["email"],
        "role": db_user.get("role", "user"),
    })
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": db_user.get("role", "user"),
        "name": db_user.get("name", ""),
    }


# ── Forgot Password ───────────────────────────────────────────────────────────

@app.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest):
    """Generate a reset token and email it. Always returns 200 to prevent email enumeration."""
    email = body.email.strip().lower()

    # Always return the same success message regardless of whether the email exists
    user = await users_collection.find_one({"email": email})
    if user:
        token = secrets.token_urlsafe(32)
        expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
        await users_collection.update_one(
            {"email": email},
            {"$set": {"reset_token": token, "reset_token_expiry": expiry}}
        )
        try:
            await send_reset_email(email, token)
        except Exception as e:
            print(f"❌ Failed to send reset email: {e}")
            raise HTTPException(status_code=500, detail="Failed to send reset email. Please try again.")

    return {"message": "If that email is registered, you will receive a password reset link shortly."}


@app.post("/reset-password")
async def reset_password(body: ResetPasswordRequest):
    """Verify reset token and update the user's password."""
    if not body.new_password or len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    if body.new_password != body.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    user = await users_collection.find_one({"reset_token": body.token})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link. Please request a new one.")

    expiry = user.get("reset_token_expiry")
    if not expiry or datetime.datetime.utcnow() > expiry:
        # Clean up expired token
        await users_collection.update_one(
            {"reset_token": body.token},
            {"$unset": {"reset_token": "", "reset_token_expiry": ""}}
        )
        raise HTTPException(status_code=400, detail="Reset link has expired. Please request a new one.")

    hashed = hash_password(body.new_password)
    await users_collection.update_one(
        {"reset_token": body.token},
        {
            "$set": {"password": hashed},
            "$unset": {"reset_token": "", "reset_token_expiry": ""}
        }
    )
    return {"message": "Password reset successful. You can now log in with your new password."}


# ── Profile ────────────────────────────────────────────────────────────────

SAFE_PROFILE_FIELDS = {"password": 0, "reset_token": 0, "reset_token_expiry": 0}


@app.get("/profile")
async def get_profile(current_user=Depends(get_current_user)):
    """Return the current user's profile (excluding sensitive fields)."""
    email = current_user["email"]

    # Fetch fresh from DB (exclude password & token fields)
    user = await users_collection.find_one({"email": email}, SAFE_PROFILE_FIELDS)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Count applications for statistics
    total = await applications_collection.count_documents({"email": email})
    pending = await applications_collection.count_documents({"email": email, "status": "Pending"})
    under_review = await applications_collection.count_documents({"email": email, "status": "Under Review"})
    accepted = await applications_collection.count_documents({"email": email, "status": "Accepted"})
    rejected = await applications_collection.count_documents({"email": email, "status": "Rejected"})

    profile = serialize(user)
    profile["stats"] = {
        "total": total,
        "pending": pending,
        "under_review": under_review,
        "accepted": accepted,
        "rejected": rejected,
    }
    return profile


@app.put("/profile")
async def update_profile(body: ProfileUpdate, current_user=Depends(get_current_user)):
    """Update editable profile fields."""
    updates = {}
    if body.name is not None:
        if not body.name.strip():
            raise HTTPException(status_code=400, detail="Name cannot be empty.")
        updates["name"] = body.name.strip()
    if body.college is not None:
        updates["college"] = body.college.strip()
    if body.branch is not None:
        updates["branch"] = body.branch.strip()
    if body.cgpa is not None:
        updates["cgpa"] = body.cgpa.strip()
    if body.skills is not None:
        updates["skills"] = [s.strip() for s in body.skills if s.strip()]

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update.")

    await users_collection.update_one(
        {"email": current_user["email"]},
        {"$set": updates}
    )
    user = await users_collection.find_one({"email": current_user["email"]}, SAFE_PROFILE_FIELDS)
    profile = serialize(user)
    return profile


@app.put("/profile/resume")
async def update_profile_resume(body: ProfileResumeUpdate, current_user=Depends(get_current_user)):
    """Update the stored resume URL."""
    if not body.resumeUrl.strip():
        raise HTTPException(status_code=400, detail="Resume URL cannot be empty.")
    await users_collection.update_one(
        {"email": current_user["email"]},
        {"$set": {"resumeUrl": body.resumeUrl.strip()}}
    )
    return {"resumeUrl": body.resumeUrl.strip()}


@app.put("/profile/password")
async def change_password(body: ChangePasswordRequest, current_user=Depends(get_current_user)):
    """Change the user's password after verifying the current one."""
    if not verify_password(body.current_password, current_user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters.")
    if body.new_password != body.confirm_password:
        raise HTTPException(status_code=400, detail="New passwords do not match.")
    if body.current_password == body.new_password:
        raise HTTPException(status_code=400, detail="New password must differ from the current one.")

    await users_collection.update_one(
        {"email": current_user["email"]},
        {"$set": {"password": hash_password(body.new_password)}}
    )
    return {"message": "Password changed successfully."}


# ── One-time Admin Setup ──────────────────────────────────────────────────────

@app.post("/setup-admin")
async def setup_admin():
    """Creates admin@gmail.com with role=admin. Only works if no admin exists."""
    existing_admin = await users_collection.find_one({"role": "admin"})
    if existing_admin:
        raise HTTPException(status_code=400, detail="An admin account already exists.")

    existing = await users_collection.find_one({"email": "admin@gmail.com"})
    if existing:
        # Promote existing account
        await users_collection.update_one(
            {"email": "admin@gmail.com"},
            {"$set": {"role": "admin"}}
        )
        return {"message": "Existing admin@gmail.com promoted to admin role."}

    await users_collection.insert_one({
        "name": "Admin",
        "email": "admin@gmail.com",
        "password": hash_password("Admin@1234"),
        "role": "admin",
        "createdAt": datetime.datetime.utcnow().strftime("%d/%m/%Y"),
    })
    return {"message": "Admin account created. Email: admin@gmail.com | Password: Admin@1234"}


@app.post("/reset-admin-password")
async def reset_admin_password():
    """TEMPORARY: Resets the admin account password to Admin@1234. Remove after use."""
    result = await users_collection.update_one(
        {"role": "admin"},
        {"$set": {"password": hash_password("Admin@1234"), "email": "admin@gmail.com", "name": "Admin"}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="No admin found. Call /setup-admin first.")
    return {"message": "Admin password reset to Admin@1234. Email: admin@gmail.com"}


# ── Seed Internships ──────────────────────────────────────────────────────────

@app.post("/admin/seed-internships")
async def seed_internships(admin=Depends(require_admin)):
    """One-time seed of hardcoded internships into MongoDB. Safe to call multiple times — skips duplicates."""
    inserted = 0
    skipped = 0
    for item in SEED_INTERNSHIPS:
        existing = await internships_collection.find_one({
            "title": item["title"],
            "company": item["company"]
        })
        if existing:
            skipped += 1
            continue
        doc = dict(item)
        doc["createdAt"] = datetime.datetime.utcnow().strftime("%d/%m/%Y")
        doc["createdBy"] = "admin@gmail.com"
        await internships_collection.insert_one(doc)
        inserted += 1
    return {"message": f"Seeded {inserted} internships. Skipped {skipped} duplicates."}


# ── Public: Internships (from DB) ─────────────────────────────────────────────

@app.get("/internships")
async def get_internships():
    docs = []
    async for doc in internships_collection.find():
        docs.append(serialize(doc))
    # If DB is empty, fall back to hardcoded seed data so the page always shows
    if not docs:
        return [
            {**item, "id": str(idx + 1)}
            for idx, item in enumerate(SEED_INTERNSHIPS)
        ]
    return docs


# ── Public: Applications ──────────────────────────────────────────────────────

class ApplicationCreateSecure(BaseModel):
    name: str
    resumeUrl: str
    internship: str
    company: str


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...), current_user=Depends(get_current_user)):
    """Upload a PDF resume to Cloudinary. Max 5MB."""
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    
    file_content = await file.read()
    if len(file_content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Resume file must be less than 5 MB.")
    
    try:
        # Use resource_type="raw" with format="pdf" so the URL ends in .pdf
        # This lets browsers open the PDF inline in a new tab
        loop = asyncio.get_event_loop()
        file_bytes = io.BytesIO(file_content)
        result = await loop.run_in_executor(
            None,
            lambda: cloudinary.uploader.upload(
                file_bytes,
                resource_type="raw",
                format="pdf",
                folder="resumes",
                public_id=f"{current_user['email'].split('@')[0]}_{int(datetime.datetime.utcnow().timestamp())}",
                overwrite=True,
            )
        )
        secure_url = result.get("secure_url")
        print(f"✅ Resume uploaded: {secure_url}")
        return {"resumeUrl": secure_url}
    except Exception as e:
        print(f"❌ Cloudinary upload error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload resume: {str(e)}") 


@app.post("/apply")
async def apply(application: ApplicationCreateSecure, current_user=Depends(get_current_user)):
    """Submit a new application. Email is taken from the JWT token — not from the request body."""
    doc = application.dict()
    doc["email"] = current_user["email"]
    doc["status"] = "Pending"
    doc["appliedAt"] = datetime.datetime.utcnow().strftime("%d/%m/%Y")
    result = await applications_collection.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    del doc["_id"]
    return doc


@app.get("/my-applications")
async def get_my_applications(current_user=Depends(get_current_user)):
    """Return only the applications belonging to the currently authenticated user."""
    try:
        docs = []
        async for doc in applications_collection.find({"email": current_user["email"]}):
            docs.append(serialize(doc))
        return docs
    except Exception as e:
        print(f"❌ /my-applications error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/applications")
async def get_applications(admin=Depends(require_admin)):
    """Admin-only: returns all applications."""
    try:
        docs = []
        async for doc in applications_collection.find():
            docs.append(serialize(doc))
        return docs
    except Exception as e:
        print(f"❌ /applications error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/applications/{app_id}")
async def update_application(app_id: str, update: ApplicationUpdate, current_user=Depends(get_current_user)):
    """Update own application only."""
    try:
        oid = ObjectId(app_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID")

    # Verify ownership
    existing = await applications_collection.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Application not found")
    if existing.get("email") != current_user["email"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to edit this application")

    result = await applications_collection.update_one(
        {"_id": oid},
        {"$set": update.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")

    doc = await applications_collection.find_one({"_id": oid})
    return serialize(doc)


@app.patch("/applications/{app_id}/status")
async def update_status(app_id: str, body: StatusUpdate):
    try:
        oid = ObjectId(app_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID")

    result = await applications_collection.update_one(
        {"_id": oid},
        {"$set": {"status": body.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")

    doc = await applications_collection.find_one({"_id": oid})
    return serialize(doc)


@app.delete("/applications/{app_id}")
async def delete_application(app_id: str, current_user=Depends(get_current_user)):
    """Delete own application only."""
    try:
        oid = ObjectId(app_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID")

    # Verify ownership
    existing = await applications_collection.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Application not found")
    if existing.get("email") != current_user["email"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this application")

    result = await applications_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")

    return {"message": "Application deleted successfully"}


# ── Admin: Users ──────────────────────────────────────────────────────────────

@app.get("/admin/users")
async def admin_get_users(admin=Depends(require_admin)):
    docs = []
    async for doc in users_collection.find({}, {"password": 0}):
        docs.append(serialize(doc))
    return docs


@app.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str, admin=Depends(require_admin)):
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    result = await users_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}


@app.put("/admin/users/{user_id}/role")
async def admin_update_user_role(user_id: str, body: RoleUpdate, admin=Depends(require_admin)):
    if body.role not in ["user", "admin"]:
        raise HTTPException(status_code=400, detail="Role must be 'user' or 'admin'")
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    result = await users_collection.update_one(
        {"_id": oid},
        {"$set": {"role": body.role}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    doc = await users_collection.find_one({"_id": oid}, {"password": 0})
    return serialize(doc)


# ── Admin: Applications ───────────────────────────────────────────────────────

@app.get("/admin/applications")
async def admin_get_applications(admin=Depends(require_admin)):
    docs = []
    async for doc in applications_collection.find():
        docs.append(serialize(doc))
    return docs


@app.patch("/admin/applications/{app_id}/status")
async def admin_update_status(app_id: str, body: StatusUpdate, admin=Depends(require_admin)):
    try:
        oid = ObjectId(app_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID")
    result = await applications_collection.update_one(
        {"_id": oid},
        {"$set": {"status": body.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    doc = await applications_collection.find_one({"_id": oid})
    return serialize(doc)


@app.delete("/admin/applications/{app_id}")
async def admin_delete_application(app_id: str, admin=Depends(require_admin)):
    try:
        oid = ObjectId(app_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID")
    result = await applications_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"message": "Application deleted"}


# ── Admin: Internships CRUD ───────────────────────────────────────────────────

@app.get("/admin/internships")
async def admin_get_internships(admin=Depends(require_admin)):
    docs = []
    async for doc in internships_collection.find():
        docs.append(serialize(doc))
    return docs


@app.post("/admin/internships")
async def admin_create_internship(internship: InternshipCreate, admin=Depends(require_admin)):
    doc = internship.dict()
    doc["createdAt"] = datetime.datetime.utcnow().strftime("%d/%m/%Y")
    doc["createdBy"] = admin["email"]
    result = await internships_collection.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    del doc["_id"]
    return doc


@app.put("/admin/internships/{internship_id}")
async def admin_update_internship(internship_id: str, internship: InternshipCreate, admin=Depends(require_admin)):
    try:
        oid = ObjectId(internship_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid internship ID")
    result = await internships_collection.update_one(
        {"_id": oid},
        {"$set": internship.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Internship not found")
    doc = await internships_collection.find_one({"_id": oid})
    return serialize(doc)


@app.delete("/admin/internships/{internship_id}")
async def admin_delete_internship(internship_id: str, admin=Depends(require_admin)):
    try:
        oid = ObjectId(internship_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid internship ID")
    result = await internships_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Internship not found")
    return {"message": "Internship deleted"}


# ── Admin: Analytics ──────────────────────────────────────────────────────────

@app.get("/admin/analytics")
async def admin_analytics(admin=Depends(require_admin)):
    total_users = await users_collection.count_documents({})
    total_internships = await internships_collection.count_documents({})
    total_applications = await applications_collection.count_documents({})
    pending = await applications_collection.count_documents({"status": "Pending"})
    under_review = await applications_collection.count_documents({"status": "Under Review"})
    accepted = await applications_collection.count_documents({"status": "Accepted"})
    rejected = await applications_collection.count_documents({"status": "Rejected"})

    # Applications per company (top 5)
    pipeline = [
        {"$group": {"_id": "$company", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5},
    ]
    top_companies = []
    async for doc in applications_collection.aggregate(pipeline):
        top_companies.append({"company": doc["_id"], "count": doc["count"]})

    return {
        "total_users": total_users,
        "total_internships": total_internships,
        "total_applications": total_applications,
        "pending": pending,
        "under_review": under_review,
        "accepted": accepted,
        "rejected": rejected,
        "top_companies": top_companies,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)