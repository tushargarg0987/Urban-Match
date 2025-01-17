from pydantic import BaseModel
from typing import List, Dict

class UserBase(BaseModel):
    name: str
    age: int
    gender: str
    email: str
    city: str
    interests: List[str]
    questionnaire: Dict[str, str] 

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int

    class Config:
        from_attributes = True
