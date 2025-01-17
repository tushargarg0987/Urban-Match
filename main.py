from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models, schemas
from utils.match_score import calculate_match_score
from utils.otp_service import OTPService
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
load_dotenv()

from utils.ai import generate_response

app = FastAPI()

app.mount("/client", StaticFiles(directory="public", html=True), name="public")
app.mount("/login", StaticFiles(directory="public", html=True), name="public_login")
app.mount("/register", StaticFiles(directory="public", html=True), name="public_reg")


origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow these origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def redirect_to_login():
    return RedirectResponse(url="/login")

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    print(user.dict())
    # Check if the email already exists
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400, detail="A user with this email already exists."
        )
    # Create a new user if the email does not exist
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.get("/users/", response_model=list[schemas.User])
def read_users(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, updated_user: schemas.UserCreate, db: Session = Depends(get_db)):
    # print(update_user)
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    for key, value in updated_user.dict().items():
        setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    return user

@app.delete("/users/{user_id}", response_model=dict)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    return {"message": f"User with ID {user_id} has been deleted successfully"}


'''
Below is the implementation of a basic logic for matching which work on:
    - city matching as required
    - atleast one interest match
    - it is faster as 1st level of filtering is done on database level
    - Low accuracy as it relies on city first
'''

# @app.get("/users/{user_id}/matches", response_model=list[schemas.User])
# def find_matches(user_id: int, db: Session = Depends(get_db)):
#     user = db.query(models.User).filter(models.User.id == user_id).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")

#     potential_matches = db.query(models.User).filter(
#         models.User.id != user_id,
#         models.User.city == user.city
#     ).all()

#     matches = []
#     user_interests = set(user.interests or [])
#     for match in potential_matches:
#         if user_interests.intersection(set(match.interests or [])):
#             matches.append(match)

#     return matches


'''
Below is the implementation of a better logic for matching which work on:
    - points where points are compiled up by the similarities in profile
    - nothing is a required matched field in this
    - it is slower as it fetches all the entries from database and then apply matching operation on all the entries
    - provides with a better accuracy
'''

@app.get("/users/{user_id}/matches", response_model=list[schemas.User])
def find_matches(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    potential_matches = db.query(models.User).filter(models.User.id != user_id and models.User.gender != user.gender).all()

    def calculate_score(match):
        score = 0

        if user.city == match.city:
            score += 50

        shared_interests = set(user.interests or []).intersection(set(match.interests or []))
        score += len(shared_interests) * 10

        age_diff = abs(user.age - match.age)
        if age_diff <= 5:
            score += 30
        elif age_diff <= 10:
            score += 15
        return score

    matches = []
    for match in potential_matches:
        # score = calculate_score(match)
        score = calculate_match_score(user, match)
        if score >= 10:
            matches.append({"user": match, "score": score})

    matches = sorted(matches, key=lambda x: x["score"], reverse=True)

    return [match["user"] for match in matches]

@app.post("/users/send-otp")
async def send_otp(user_email: str):
    """
    Endpoint to send OTP to user's email using the external OTP service.
    """
    response = OTPService.generate_otp(email=user_email)

    if response["status"] == "error":
        raise HTTPException(status_code=500, detail=response["message"])

    return {"message": response["message"]}

@app.post("/users/verify-otp")
async def verify_otp(user_email: str, otp: str, reg: bool, db: Session = Depends(get_db)):
    """
    Endpoint to verify the OTP using the external OTP service.
    """
    existing_user = db.query(models.User).filter(models.User.email == user_email).first()
    if reg is True:
        if existing_user:
            raise HTTPException(
                status_code=401, detail="A user with this email already exists."
            )
    else:
        if not existing_user:
            raise HTTPException(
                status_code=401, detail="No user exists with this email, try register."
            )
    
    response = OTPService.verify_otp(email=user_email, otp=otp)

    if response["status"] == "error":
        raise HTTPException(status_code=400, detail=response["message"])

    return {existing_user}

@app.get("/get-response")
async def get_response(user_id: int,message: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    res = generate_response(user, message)
    return res