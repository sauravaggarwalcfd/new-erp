from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import openpyxl
import io

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get('SECRET_KEY', 'garment-manufacturing-secret-key-change-in-production')
ALGORITHM = "HS256"

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    role: str  # admin, production_manager, user
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "user"

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

# Masters Models
class Buyer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    contact_person: str
    email: str
    phone: str
    address: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BuyerCreate(BaseModel):
    name: str
    contact_person: str
    email: str
    phone: str
    address: str

class Supplier(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    contact_person: str
    email: str
    phone: str
    address: str
    material_type: str  # fabric, trims, accessories
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SupplierCreate(BaseModel):
    name: str
    contact_person: str
    email: str
    phone: str
    address: str
    material_type: str

class RawMaterial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    code: str
    material_type: str  # fabric, trims, accessories
    unit: str  # meters, pieces, kg
    cost_per_unit: float
    supplier_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RawMaterialCreate(BaseModel):
    name: str
    code: str
    material_type: str
    unit: str
    cost_per_unit: float
    supplier_id: Optional[str] = None

class Color(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    code: str
    hex_value: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ColorCreate(BaseModel):
    name: str
    code: str
    hex_value: Optional[str] = None

class Size(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    code: str
    sort_order: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SizeCreate(BaseModel):
    name: str
    code: str
    sort_order: int

class Article(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    code: str
    description: str
    buyer_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ArticleCreate(BaseModel):
    name: str
    code: str
    description: str
    buyer_id: Optional[str] = None

# Fabric Model
class Fabric(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    item_type: str  # DYED, GREIGE, ZIP
    count_const: str
    fabric_name: str
    composition: str
    add_description: str
    gsm: Optional[int] = None
    width: Optional[str] = None
    color: Optional[str] = None
    final_item: str
    avg_roll_size: Optional[str] = None
    unit: str
    image_url: Optional[str] = None  # New field for image
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FabricCreate(BaseModel):
    item_type: str
    count_const: str
    fabric_name: str
    composition: str
    add_description: str
    gsm: Optional[int] = None
    width: Optional[str] = None
    color: Optional[str] = None
    final_item: str
    avg_roll_size: Optional[str] = None
    unit: str
    image_url: Optional[str] = None  # New field for image

# BOM Models
class BOMItem(BaseModel):
    material_id: str
    material_name: str
    avg_consumption: float
    wastage_percent: float
    total_consumption: float
    cost_per_unit: float
    total_cost: float

class BOM(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    article_id: str
    article_name: str
    color_id: str
    color_name: str
    items: List[BOMItem]
    total_cost: float
    status: str = "unassigned"  # unassigned, assigned
    mrp_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BOMCreate(BaseModel):
    article_id: str
    color_id: str
    items: List[BOMItem]

# MRP Models
class MRPMaterialRequirement(BaseModel):
    material_id: str
    material_name: str
    material_code: str
    unit: str
    total_quantity: float
    cost_per_unit: float
    total_cost: float

class MRP(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    mrp_number: str
    bom_ids: List[str]
    material_requirements: List[MRPMaterialRequirement]
    total_cost: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: str

class MRPCreate(BaseModel):
    bom_ids: List[str]

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = timedelta(days=7)):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        user = await db.users.find_one({"email": email}, {"_id": 0, "password": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Auth Routes
@api_router.post("/auth/register", response_model=Token)
async def register(user_input: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_input.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_dict = user_input.model_dump()
    hashed_password = hash_password(user_dict.pop("password"))
    user_obj = User(**user_dict)
    
    doc = user_obj.model_dump()
    doc['password'] = hashed_password
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    
    # Create token
    access_token = create_access_token(data={"sub": user_obj.email})
    return Token(access_token=access_token, token_type="bearer", user=user_obj)

@api_router.post("/auth/login", response_model=Token)
async def login(user_input: UserLogin):
    user_doc = await db.users.find_one({"email": user_input.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(user_input.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_doc.pop('password')
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user_obj = User(**user_doc)
    access_token = create_access_token(data={"sub": user_obj.email})
    return Token(access_token=access_token, token_type="bearer", user=user_obj)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Buyer Routes
@api_router.post("/buyers", response_model=Buyer)
async def create_buyer(buyer_input: BuyerCreate, current_user: User = Depends(get_current_user)):
    buyer_obj = Buyer(**buyer_input.model_dump())
    doc = buyer_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.buyers.insert_one(doc)
    return buyer_obj

@api_router.get("/buyers", response_model=List[Buyer])
async def get_buyers(current_user: User = Depends(get_current_user)):
    buyers = await db.buyers.find({}, {"_id": 0}).to_list(1000)
    for buyer in buyers:
        if isinstance(buyer['created_at'], str):
            buyer['created_at'] = datetime.fromisoformat(buyer['created_at'])
    return buyers

@api_router.put("/buyers/{buyer_id}", response_model=Buyer)
async def update_buyer(buyer_id: str, buyer_input: BuyerCreate, current_user: User = Depends(get_current_user)):
    result = await db.buyers.update_one({"id": buyer_id}, {"$set": buyer_input.model_dump()})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Buyer not found")
    updated = await db.buyers.find_one({"id": buyer_id}, {"_id": 0})
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Buyer(**updated)

@api_router.delete("/buyers/{buyer_id}")
async def delete_buyer(buyer_id: str, current_user: User = Depends(get_current_user)):
    result = await db.buyers.delete_one({"id": buyer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Buyer not found")
    return {"message": "Buyer deleted successfully"}

# Supplier Routes
@api_router.post("/suppliers", response_model=Supplier)
async def create_supplier(supplier_input: SupplierCreate, current_user: User = Depends(get_current_user)):
    supplier_obj = Supplier(**supplier_input.model_dump())
    doc = supplier_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.suppliers.insert_one(doc)
    return supplier_obj

@api_router.get("/suppliers", response_model=List[Supplier])
async def get_suppliers(current_user: User = Depends(get_current_user)):
    suppliers = await db.suppliers.find({}, {"_id": 0}).to_list(1000)
    for supplier in suppliers:
        if isinstance(supplier['created_at'], str):
            supplier['created_at'] = datetime.fromisoformat(supplier['created_at'])
    return suppliers

@api_router.put("/suppliers/{supplier_id}", response_model=Supplier)
async def update_supplier(supplier_id: str, supplier_input: SupplierCreate, current_user: User = Depends(get_current_user)):
    result = await db.suppliers.update_one({"id": supplier_id}, {"$set": supplier_input.model_dump()})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Supplier not found")
    updated = await db.suppliers.find_one({"id": supplier_id}, {"_id": 0})
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Supplier(**updated)

@api_router.delete("/suppliers/{supplier_id}")
async def delete_supplier(supplier_id: str, current_user: User = Depends(get_current_user)):
    result = await db.suppliers.delete_one({"id": supplier_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return {"message": "Supplier deleted successfully"}

# Raw Material Routes
@api_router.post("/raw-materials", response_model=RawMaterial)
async def create_raw_material(material_input: RawMaterialCreate, current_user: User = Depends(get_current_user)):
    material_obj = RawMaterial(**material_input.model_dump())
    doc = material_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.raw_materials.insert_one(doc)
    return material_obj

@api_router.get("/raw-materials", response_model=List[RawMaterial])
async def get_raw_materials(current_user: User = Depends(get_current_user)):
    materials = await db.raw_materials.find({}, {"_id": 0}).to_list(1000)
    for material in materials:
        if isinstance(material['created_at'], str):
            material['created_at'] = datetime.fromisoformat(material['created_at'])
    return materials

@api_router.put("/raw-materials/{material_id}", response_model=RawMaterial)
async def update_raw_material(material_id: str, material_input: RawMaterialCreate, current_user: User = Depends(get_current_user)):
    result = await db.raw_materials.update_one({"id": material_id}, {"$set": material_input.model_dump()})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Raw material not found")
    updated = await db.raw_materials.find_one({"id": material_id}, {"_id": 0})
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return RawMaterial(**updated)

@api_router.delete("/raw-materials/{material_id}")
async def delete_raw_material(material_id: str, current_user: User = Depends(get_current_user)):
    result = await db.raw_materials.delete_one({"id": material_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Raw material not found")
    return {"message": "Raw material deleted successfully"}

# Color Routes
@api_router.post("/colors", response_model=Color)
async def create_color(color_input: ColorCreate, current_user: User = Depends(get_current_user)):
    color_obj = Color(**color_input.model_dump())
    doc = color_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.colors.insert_one(doc)
    return color_obj

@api_router.get("/colors", response_model=List[Color])
async def get_colors(current_user: User = Depends(get_current_user)):
    colors = await db.colors.find({}, {"_id": 0}).to_list(1000)
    for color in colors:
        if isinstance(color['created_at'], str):
            color['created_at'] = datetime.fromisoformat(color['created_at'])
    return colors

@api_router.put("/colors/{color_id}", response_model=Color)
async def update_color(color_id: str, color_input: ColorCreate, current_user: User = Depends(get_current_user)):
    result = await db.colors.update_one({"id": color_id}, {"$set": color_input.model_dump()})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Color not found")
    updated = await db.colors.find_one({"id": color_id}, {"_id": 0})
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Color(**updated)

@api_router.delete("/colors/{color_id}")
async def delete_color(color_id: str, current_user: User = Depends(get_current_user)):
    result = await db.colors.delete_one({"id": color_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Color not found")
    return {"message": "Color deleted successfully"}

# Size Routes
@api_router.post("/sizes", response_model=Size)
async def create_size(size_input: SizeCreate, current_user: User = Depends(get_current_user)):
    size_obj = Size(**size_input.model_dump())
    doc = size_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.sizes.insert_one(doc)
    return size_obj

@api_router.get("/sizes", response_model=List[Size])
async def get_sizes(current_user: User = Depends(get_current_user)):
    sizes = await db.sizes.find({}, {"_id": 0}).sort("sort_order", 1).to_list(1000)
    for size in sizes:
        if isinstance(size['created_at'], str):
            size['created_at'] = datetime.fromisoformat(size['created_at'])
    return sizes

@api_router.put("/sizes/{size_id}", response_model=Size)
async def update_size(size_id: str, size_input: SizeCreate, current_user: User = Depends(get_current_user)):
    result = await db.sizes.update_one({"id": size_id}, {"$set": size_input.model_dump()})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Size not found")
    updated = await db.sizes.find_one({"id": size_id}, {"_id": 0})
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Size(**updated)

@api_router.delete("/sizes/{size_id}")
async def delete_size(size_id: str, current_user: User = Depends(get_current_user)):
    result = await db.sizes.delete_one({"id": size_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Size not found")
    return {"message": "Size deleted successfully"}

# Article Routes
@api_router.post("/articles", response_model=Article)
async def create_article(article_input: ArticleCreate, current_user: User = Depends(get_current_user)):
    article_obj = Article(**article_input.model_dump())
    doc = article_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.articles.insert_one(doc)
    return article_obj

@api_router.get("/articles", response_model=List[Article])
async def get_articles(current_user: User = Depends(get_current_user)):
    articles = await db.articles.find({}, {"_id": 0}).to_list(1000)
    for article in articles:
        if isinstance(article['created_at'], str):
            article['created_at'] = datetime.fromisoformat(article['created_at'])
    return articles

@api_router.put("/articles/{article_id}", response_model=Article)
async def update_article(article_id: str, article_input: ArticleCreate, current_user: User = Depends(get_current_user)):
    result = await db.articles.update_one({"id": article_id}, {"$set": article_input.model_dump()})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    updated = await db.articles.find_one({"id": article_id}, {"_id": 0})
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Article(**updated)

@api_router.delete("/articles/{article_id}")
async def delete_article(article_id: str, current_user: User = Depends(get_current_user)):
    result = await db.articles.delete_one({"id": article_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Article deleted successfully"}

# Fabric Routes
@api_router.post("/fabrics", response_model=Fabric)
async def create_fabric(fabric_input: FabricCreate, current_user: User = Depends(get_current_user)):
    fabric_obj = Fabric(**fabric_input.model_dump())
    doc = fabric_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.fabrics.insert_one(doc)
    return fabric_obj

@api_router.get("/fabrics", response_model=List[Fabric])
async def get_fabrics(current_user: User = Depends(get_current_user)):
    fabrics = await db.fabrics.find({}, {"_id": 0}).to_list(1000)
    for fabric in fabrics:
        if isinstance(fabric['created_at'], str):
            fabric['created_at'] = datetime.fromisoformat(fabric['created_at'])
    return fabrics

@api_router.put("/fabrics/{fabric_id}", response_model=Fabric)
async def update_fabric(fabric_id: str, fabric_input: FabricCreate, current_user: User = Depends(get_current_user)):
    result = await db.fabrics.update_one({"id": fabric_id}, {"$set": fabric_input.model_dump()})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Fabric not found")
    updated = await db.fabrics.find_one({"id": fabric_id}, {"_id": 0})
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Fabric(**updated)

@api_router.delete("/fabrics/{fabric_id}")
async def delete_fabric(fabric_id: str, current_user: User = Depends(get_current_user)):
    result = await db.fabrics.delete_one({"id": fabric_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Fabric not found")
    return {"message": "Fabric deleted successfully"}

# BOM Routes
@api_router.post("/boms", response_model=BOM)
async def create_bom(bom_input: BOMCreate, current_user: User = Depends(get_current_user)):
    # Get article and color names
    article = await db.articles.find_one({"id": bom_input.article_id}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    color = await db.colors.find_one({"id": bom_input.color_id}, {"_id": 0})
    if not color:
        raise HTTPException(status_code=404, detail="Color not found")
    
    # Calculate total cost
    total_cost = sum(item.total_cost for item in bom_input.items)
    
    bom_obj = BOM(
        article_id=bom_input.article_id,
        article_name=article['name'],
        color_id=bom_input.color_id,
        color_name=color['name'],
        items=bom_input.items,
        total_cost=total_cost
    )
    
    doc = bom_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.boms.insert_one(doc)
    return bom_obj

@api_router.get("/boms", response_model=List[BOM])
async def get_boms(status: Optional[str] = None, current_user: User = Depends(get_current_user)):
    query = {}
    if status:
        query["status"] = status
    boms = await db.boms.find(query, {"_id": 0}).to_list(1000)
    for bom in boms:
        if isinstance(bom['created_at'], str):
            bom['created_at'] = datetime.fromisoformat(bom['created_at'])
    return boms

@api_router.get("/boms/{bom_id}", response_model=BOM)
async def get_bom(bom_id: str, current_user: User = Depends(get_current_user)):
    bom = await db.boms.find_one({"id": bom_id}, {"_id": 0})
    if not bom:
        raise HTTPException(status_code=404, detail="BOM not found")
    if isinstance(bom['created_at'], str):
        bom['created_at'] = datetime.fromisoformat(bom['created_at'])
    return BOM(**bom)

@api_router.delete("/boms/{bom_id}")
async def delete_bom(bom_id: str, current_user: User = Depends(get_current_user)):
    result = await db.boms.delete_one({"id": bom_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="BOM not found")
    return {"message": "BOM deleted successfully"}

# MRP Routes
@api_router.post("/mrps", response_model=MRP)
async def create_mrp(mrp_input: MRPCreate, current_user: User = Depends(get_current_user)):
    if not mrp_input.bom_ids:
        raise HTTPException(status_code=400, detail="At least one BOM must be selected")
    
    # Get all selected BOMs
    boms = await db.boms.find({"id": {"$in": mrp_input.bom_ids}, "status": "unassigned"}, {"_id": 0}).to_list(1000)
    
    if len(boms) != len(mrp_input.bom_ids):
        raise HTTPException(status_code=400, detail="Some BOMs not found or already assigned")
    
    # Generate MRP number
    mrp_count = await db.mrps.count_documents({})
    mrp_number = f"MRP-{mrp_count + 1:05d}"
    
    # Consolidate material requirements
    material_map = {}
    for bom in boms:
        for item in bom['items']:
            mat_id = item['material_id']
            if mat_id not in material_map:
                # Get material details
                material = await db.raw_materials.find_one({"id": mat_id}, {"_id": 0})
                material_map[mat_id] = {
                    "material_id": mat_id,
                    "material_name": item['material_name'],
                    "material_code": material['code'] if material else "",
                    "unit": material['unit'] if material else "",
                    "total_quantity": 0,
                    "cost_per_unit": item['cost_per_unit'],
                    "total_cost": 0
                }
            material_map[mat_id]["total_quantity"] += item['total_consumption']
            material_map[mat_id]["total_cost"] += item['total_cost']
    
    material_requirements = [MRPMaterialRequirement(**mat) for mat in material_map.values()]
    total_cost = sum(mat.total_cost for mat in material_requirements)
    
    # Create MRP
    mrp_obj = MRP(
        mrp_number=mrp_number,
        bom_ids=mrp_input.bom_ids,
        material_requirements=material_requirements,
        total_cost=total_cost,
        created_by=current_user.username
    )
    
    doc = mrp_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.mrps.insert_one(doc)
    
    # Update BOMs as assigned
    await db.boms.update_many(
        {"id": {"$in": mrp_input.bom_ids}},
        {"$set": {"status": "assigned", "mrp_id": mrp_obj.id}}
    )
    
    return mrp_obj

@api_router.get("/mrps", response_model=List[MRP])
async def get_mrps(current_user: User = Depends(get_current_user)):
    mrps = await db.mrps.find({}, {"_id": 0}).to_list(1000)
    for mrp in mrps:
        if isinstance(mrp['created_at'], str):
            mrp['created_at'] = datetime.fromisoformat(mrp['created_at'])
    return mrps

@api_router.get("/mrps/{mrp_id}", response_model=MRP)
async def get_mrp(mrp_id: str, current_user: User = Depends(get_current_user)):
    mrp = await db.mrps.find_one({"id": mrp_id}, {"_id": 0})
    if not mrp:
        raise HTTPException(status_code=404, detail="MRP not found")
    if isinstance(mrp['created_at'], str):
        mrp['created_at'] = datetime.fromisoformat(mrp['created_at'])
    return MRP(**mrp)

@api_router.delete("/mrps/{mrp_id}")
async def delete_mrp(mrp_id: str, current_user: User = Depends(get_current_user)):
    # Get MRP to unassign BOMs
    mrp = await db.mrps.find_one({"id": mrp_id}, {"_id": 0})
    if not mrp:
        raise HTTPException(status_code=404, detail="MRP not found")
    
    # Unassign BOMs
    await db.boms.update_many(
        {"id": {"$in": mrp['bom_ids']}},
        {"$set": {"status": "unassigned"}, "$unset": {"mrp_id": ""}}
    )
    
    # Delete MRP
    await db.mrps.delete_one({"id": mrp_id})
    return {"message": "MRP deleted successfully"}

# Excel Upload Route
@api_router.post("/upload-excel")
async def upload_excel(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="File must be an Excel file (.xlsx or .xls)")
    
    try:
        contents = await file.read()
        workbook = openpyxl.load_workbook(io.BytesIO(contents))
        
        results = {
            "colors_added": 0,
            "articles_added": 0,
            "sizes_added": 0,
            "raw_materials_added": 0,
            "fabrics_added": 0,
            "errors": []
        }
        
        # Process Color ID sheet
        if "Color ID" in workbook.sheetnames:
            sheet = workbook["Color ID"]
            for row_idx, row in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=2):
                try:
                    if row[0] and row[1]:
                        color_data = row[1].split("/")
                        if len(color_data) >= 2:
                            color_id = color_data[0].strip()
                            color_name = color_data[1].strip()
                            
                            # Check if color already exists
                            existing = await db.colors.find_one({"code": color_id})
                            if not existing:
                                color_obj = Color(
                                    name=color_name,
                                    code=color_id,
                                    hex_value=None
                                )
                                doc = color_obj.model_dump()
                                doc['created_at'] = doc['created_at'].isoformat()
                                await db.colors.insert_one(doc)
                                results["colors_added"] += 1
                except Exception as e:
                    results["errors"].append(f"Color sheet row {row_idx}: {str(e)}")
        
        # Process Art No. sheet
        if "Art No." in workbook.sheetnames:
            sheet = workbook["Art No."]
            for row_idx, row in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=2):
                try:
                    if row[0]:
                        article_code = str(row[0]).strip()
                        
                        # Check if article already exists
                        existing = await db.articles.find_one({"code": article_code})
                        if not existing:
                            article_obj = Article(
                                name=article_code,
                                code=article_code,
                                description=f"Article {article_code}",
                                buyer_id=None
                            )
                            doc = article_obj.model_dump()
                            doc['created_at'] = doc['created_at'].isoformat()
                            await db.articles.insert_one(doc)
                            results["articles_added"] += 1
                except Exception as e:
                    results["errors"].append(f"Article sheet row {row_idx}: {str(e)}")
        
        # Process Units Master sheet
        if "Units Master" in workbook.sheetnames:
            sheet = workbook["Units Master"]
            sort_order = 1
            for row_idx, row in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=2):
                try:
                    if row[0]:
                        unit_name = str(row[0]).strip()
                        
                        # Check if size already exists
                        existing = await db.sizes.find_one({"code": unit_name})
                        if not existing:
                            size_obj = Size(
                                name=unit_name,
                                code=unit_name,
                                sort_order=sort_order
                            )
                            doc = size_obj.model_dump()
                            doc['created_at'] = doc['created_at'].isoformat()
                            await db.sizes.insert_one(doc)
                            results["sizes_added"] += 1
                            sort_order += 1
                except Exception as e:
                    results["errors"].append(f"Units sheet row {row_idx}: {str(e)}")
        
        # Process Components sheet (as Raw Materials)
        if "Components" in workbook.sheetnames:
            sheet = workbook["Components"]
            for row_idx, row in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=2):
                try:
                    if row[0]:
                        component_name = str(row[0]).strip()
                        component_code = component_name[:20].upper().replace(" ", "_")
                        
                        # Check if material already exists
                        existing = await db.raw_materials.find_one({"code": component_code})
                        if not existing:
                            material_obj = RawMaterial(
                                name=component_name,
                                code=component_code,
                                material_type="accessories",
                                unit="pieces",
                                cost_per_unit=0.0,
                                supplier_id=None
                            )
                            doc = material_obj.model_dump()
                            doc['created_at'] = doc['created_at'].isoformat()
                            await db.raw_materials.insert_one(doc)
                            results["raw_materials_added"] += 1
                except Exception as e:
                    results["errors"].append(f"Components sheet row {row_idx}: {str(e)}")
        
        # Process Fabric Master Data sheet
        if "FABRIC MASTER DATA" in workbook.sheetnames:
            sheet = workbook["FABRIC MASTER DATA"]
            for row_idx, row in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=2):
                try:
                    # Skip empty rows
                    if not row[0] or str(row[0]).strip() == "":
                        continue
                    
                    # Helper function to clean values
                    def clean_value(val):
                        if val is None:
                            return ""
                        val_str = str(val).strip()
                        # Handle Excel "None" strings
                        if val_str.upper() == "NONE" or val_str == "":
                            return ""
                        return val_str
                    
                    # Parse values with proper null handling
                    item_type = clean_value(row[0])
                    count_const = clean_value(row[1])
                    fabric_name = clean_value(row[2])
                    composition = clean_value(row[3])
                    add_description = clean_value(row[4])
                    
                    # Handle GSM - can be numeric or None
                    gsm = None
                    if row[5] and str(row[5]).strip().upper() != "NONE":
                        try:
                            gsm = int(float(row[5]))
                        except (ValueError, TypeError):
                            pass
                    
                    width = clean_value(row[6])
                    color = clean_value(row[7])
                    final_item = clean_value(row[8])
                    avg_roll_size = clean_value(row[9])
                    unit = clean_value(row[10]) or "Pcs"
                    
                    fabric_obj = Fabric(
                        item_type=item_type,
                        count_const=count_const,
                        fabric_name=fabric_name,
                        composition=composition,
                        add_description=add_description,
                        gsm=gsm,
                        width=width if width else None,
                        color=color if color else None,
                        final_item=final_item,
                        avg_roll_size=avg_roll_size if avg_roll_size else None,
                        unit=unit
                    )
                    doc = fabric_obj.model_dump()
                    doc['created_at'] = doc['created_at'].isoformat()
                    await db.fabrics.insert_one(doc)
                    results["fabrics_added"] += 1
                except Exception as e:
                    results["errors"].append(f"Fabric sheet row {row_idx}: {str(e)}")
        
        return {
            "message": "Excel file processed successfully",
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing Excel file: {str(e)}")

# Image Upload Route
@api_router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Create uploads directory if it doesn't exist
        upload_dir = Path("/app/uploads")
        upload_dir.mkdir(exist_ok=True)
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = upload_dir / unique_filename
        
        # Save file
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Return the URL path
        image_url = f"/uploads/{unique_filename}"
        
        return {
            "message": "Image uploaded successfully",
            "image_url": image_url,
            "filename": unique_filename
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading image: {str(e)}")

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
