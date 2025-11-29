from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from enum import Enum


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(
    title="Factory Management System",
    description="Comprehensive factory management with tasks & communication",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ==================== ENUMS ====================
class OrderStatus(str, Enum):
    PENDING = "pending"
    IN_PRODUCTION = "in_production"
    QUALITY_CHECK = "quality_check"
    COMPLETED = "completed"
    SHIPPED = "shipped"

class ProductionStage(str, Enum):
    CUTTING = "cutting"
    STITCHING = "stitching"
    FINISHING = "finishing"
    QUALITY_CHECK = "quality_check"
    PACKAGING = "packaging"

class QCStatus(str, Enum):
    PASSED = "passed"
    FAILED = "failed"
    PENDING = "pending"

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class MessageType(str, Enum):
    TEXT = "text"
    TASK_NOTIFICATION = "task_notification"
    SYSTEM = "system"
    FILE = "file"

class NotificationType(str, Enum):
    TASK_CREATED = "task_created"
    TASK_REMINDER = "task_reminder" 
    TASK_COMPLETED = "task_completed"
    TASK_OVERDUE = "task_overdue"
    TASK_UPDATED = "task_updated"


# ==================== MODELS ====================

# Order Models
class SizeQuantity(BaseModel):
    size: str
    quantity: int

class OrderCreate(BaseModel):
    customer_name: str
    style_number: str
    garment_type: str
    color: str
    sizes: List[SizeQuantity]
    total_quantity: int
    delivery_date: str
    notes: Optional[str] = ""

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    style_number: str
    garment_type: str
    color: str
    sizes: List[SizeQuantity]
    total_quantity: int
    delivery_date: str
    status: OrderStatus = OrderStatus.PENDING
    notes: Optional[str] = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Production Models
class ProductionStageCreate(BaseModel):
    order_id: str
    stage: ProductionStage
    assigned_worker_id: Optional[str] = None
    notes: Optional[str] = ""

class ProductionStageRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str
    stage: ProductionStage
    assigned_worker_id: Optional[str] = None
    status: str = "pending"  # pending, in_progress, completed
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    notes: Optional[str] = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Material Models
class MaterialCreate(BaseModel):
    name: str
    category: str  # fabric, thread, button, zipper, label, etc.
    unit: str  # meters, pieces, kg, etc.
    quantity: float
    reorder_level: float
    supplier_id: Optional[str] = None
    unit_price: float

class Material(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    unit: str
    quantity: float
    reorder_level: float
    supplier_id: Optional[str] = None
    unit_price: float
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Supplier Models
class SupplierCreate(BaseModel):
    name: str
    contact_person: str
    phone: str
    email: str
    address: str
    materials_supplied: List[str]

class Supplier(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    contact_person: str
    phone: str
    email: str
    address: str
    materials_supplied: List[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Worker Models
class WorkerCreate(BaseModel):
    name: str
    department: str  # cutting, stitching, finishing, qc, packaging
    phone: str
    skills: List[str]

class Worker(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    department: str
    phone: str
    skills: List[str]
    active: bool = True
    joined_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Quality Check Models
class QualityCheckCreate(BaseModel):
    order_id: str
    stage: ProductionStage
    inspector_id: str
    defects_found: List[str]
    notes: Optional[str] = ""

class QualityCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str
    stage: ProductionStage
    inspector_id: str
    status: QCStatus = QCStatus.PENDING
    defects_found: List[str]
    notes: Optional[str] = ""
    checked_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Task/Communication Models
class TaskCreate(BaseModel):
    title: str
    description: str
    assigned_to: str
    department: str
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[str] = None
    tags: List[str] = []
    estimated_hours: Optional[float] = None
    frequency: str = "once"  # once, daily, weekly, monthly, specific_dates
    recurrence_pattern: Optional[str] = None  # For weekly: "mon,wed,fri", for monthly: "15"
    start_date: Optional[str] = None
    specific_dates: List[str] = []
    reminder_enabled: bool = False
    reminder_before_hours: Optional[int] = None
    initial_attachments: List[dict] = []  # For files attached during creation
    notify_users: List[str] = []  # User IDs to notify
    notify_groups: List[str] = []  # Group IDs to notify
    send_notifications: bool = True

class Task(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    assigned_to: str
    department: str
    priority: TaskPriority
    status: TaskStatus = TaskStatus.PENDING
    due_date: Optional[str] = None
    tags: List[str] = []
    estimated_hours: Optional[float] = None
    frequency: str = "once"
    recurrence_pattern: Optional[str] = None
    start_date: Optional[str] = None
    specific_dates: List[str] = []
    reminder_enabled: bool = False
    reminder_before_hours: Optional[int] = None
    notify_users: List[str] = []
    notify_groups: List[str] = []
    send_notifications: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    created_by: Optional[str] = None


# Conversation Models (1-on-1 Chat)
class ConversationCreate(BaseModel):
    participant1_id: str
    participant1_name: str
    participant2_id: str
    participant2_name: str

class Conversation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    participant1_id: str
    participant1_name: str
    participant2_id: str
    participant2_name: str
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Message Models (1-on-1)
class MessageCreate(BaseModel):
    conversation_id: str
    sender_id: str
    sender_name: str
    content: str
    message_type: MessageType = MessageType.TEXT
    task_id: Optional[str] = None  # If message is about a task
    attachments: List[dict] = []

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversation_id: str
    sender_id: str
    sender_name: str
    content: str
    message_type: MessageType = MessageType.TEXT
    task_id: Optional[str] = None
    attachments: List[dict] = []
    read_by_recipient: bool = False
    sent_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Group Chat Models
class GroupChatCreate(BaseModel):
    name: str
    description: str
    department: Optional[str] = None
    members: List[dict]  # [{"user_id": "id", "user_name": "name", "role": "admin/member"}]
    created_by: str

class GroupChat(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    department: Optional[str] = None
    members: List[dict]
    created_by: str
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Group Message Models
class GroupMessageCreate(BaseModel):
    group_id: str
    sender_id: str
    sender_name: str
    content: str
    message_type: MessageType = MessageType.TEXT
    task_id: Optional[str] = None
    attachments: List[dict] = []

class GroupMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    group_id: str
    sender_id: str
    sender_name: str
    content: str
    message_type: MessageType = MessageType.TEXT
    task_id: Optional[str] = None
    attachments: List[dict] = []
    read_by: List[str] = []  # List of user IDs who have read this message
    sent_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Task Notification Models
class TaskNotificationCreate(BaseModel):
    task_id: str
    notification_type: NotificationType
    recipient_id: str
    recipient_name: str
    title: str
    content: str
    task_data: dict  # Complete task information
    attachments: List[dict] = []

class TaskNotification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    task_id: str
    notification_type: NotificationType
    recipient_id: str
    recipient_name: str
    title: str
    content: str
    task_data: dict
    attachments: List[dict] = []
    read: bool = False
    action_taken: Optional[str] = None  # "completed", "viewed", "snoozed"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    read_at: Optional[datetime] = None
    

# Task Completion Models (for interactive notifications)
class TaskCompletionCreate(BaseModel):
    task_id: str
    completed_by: str
    completed_by_name: str
    actual_hours: Optional[float] = None
    completion_notes: str
    completion_status: str = "completed"  # completed, partially_completed, blocked
    completion_attachments: List[dict] = []

class TaskCompletion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    task_id: str
    completed_by: str
    completed_by_name: str
    actual_hours: Optional[float] = None
    completion_notes: str
    completion_status: str = "completed"
    completion_attachments: List[dict] = []
    completed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Task Comment Models
class TaskCommentCreate(BaseModel):
    task_id: str
    user_id: str
    user_name: str
    comment: str

class TaskComment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    task_id: str
    user_id: str
    user_name: str
    comment: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Subtask Models
class SubtaskCreate(BaseModel):
    task_id: str
    title: str

class Subtask(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    task_id: str
    title: str
    completed: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None


# Attachment Models
class TaskAttachmentCreate(BaseModel):
    task_id: str
    file_name: str
    file_url: str
    file_type: str
    uploaded_by: str

class TaskAttachment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    task_id: str
    file_name: str
    file_url: str
    file_type: str
    uploaded_by: str
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Time Log Models
class TimeLogCreate(BaseModel):
    task_id: str
    user_id: str
    user_name: str
    hours: float
    description: Optional[str] = ""

class TimeLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    task_id: str
    user_id: str
    user_name: str
    hours: float
    description: Optional[str] = ""
    logged_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Activity Log Model
class ActivityLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    task_id: str
    user_id: str
    user_name: str
    action: str  # "created", "commented", "status_changed", "assigned", etc.
    details: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ==================== HELPER FUNCTIONS ====================
def serialize_datetime(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj

def serialize_doc(doc):
    if doc:
        for key, value in doc.items():
            if isinstance(value, datetime):
                doc[key] = value.isoformat()
    return doc

def deserialize_doc(doc):
    datetime_fields = ['created_at', 'updated_at', 'started_at', 'completed_at', 'checked_at', 'last_updated', 'joined_date', 'logged_at', 'uploaded_at']
    if doc:
        for field in datetime_fields:
            if field in doc and isinstance(doc[field], str):
                doc[field] = datetime.fromisoformat(doc[field])
    return doc


# Helper function to log task activities
async def log_activity(task_id: str, user_id: str, user_name: str, action: str, details: str):
    activity = ActivityLog(
        task_id=task_id,
        user_id=user_id,
        user_name=user_name,
        action=action,
        details=details
    )
    doc = activity.model_dump()
    doc = serialize_doc(doc)
    await db.activity_logs.insert_one(doc)


# Helper function to send task notifications
async def send_task_notification(task_data: dict, notification_type: str, recipients: List[dict]):
    """Send task notifications to specified recipients"""
    for recipient in recipients:
        try:
            # Create notification content based on type
            if notification_type == "task_created":
                title = f"🆕 New Task Assigned: {task_data['title']}"
                content = f"You have been assigned a new {task_data['priority']} priority task in {task_data['department']} department."
            elif notification_type == "task_reminder":
                title = f"⏰ Task Reminder: {task_data['title']}"
                content = f"Reminder: Task is due on {task_data.get('due_date', 'no due date')}."
            elif notification_type == "task_completed":
                title = f"✅ Task Completed: {task_data['title']}"
                content = f"Task has been marked as completed in {task_data['department']} department."
            else:
                title = f"📋 Task Update: {task_data['title']}"
                content = f"Task has been updated."

            notification = TaskNotification(
                task_id=task_data['id'],
                notification_type=notification_type,
                recipient_id=recipient['user_id'],
                recipient_name=recipient['user_name'],
                title=title,
                content=content,
                task_data=task_data,
                attachments=task_data.get('attachments', [])
            )
            
            doc = notification.model_dump()
            doc = serialize_doc(doc)
            await db.task_notifications.insert_one(doc)
            
        except Exception as e:
            logging.error(f"Failed to send notification to {recipient.get('user_name', 'unknown')}: {str(e)}")


# Helper function to get conversation between two users
async def get_or_create_conversation(user1_id: str, user1_name: str, user2_id: str, user2_name: str):
    """Get existing conversation or create new one"""
    # Check if conversation exists (either direction)
    conversation = await db.conversations.find_one({
        "$or": [
            {"participant1_id": user1_id, "participant2_id": user2_id},
            {"participant1_id": user2_id, "participant2_id": user1_id}
        ]
    }, {"_id": 0})
    
    if conversation:
        return deserialize_doc(conversation)
    
    # Create new conversation
    new_conversation = Conversation(
        participant1_id=user1_id,
        participant1_name=user1_name,
        participant2_id=user2_id,
        participant2_name=user2_name
    )
    doc = new_conversation.model_dump()
    doc = serialize_doc(doc)
    await db.conversations.insert_one(doc)
    return new_conversation.model_dump()


# ==================== ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "Factory Management System API"}


# ==================== ORDER ROUTES ====================
@api_router.post("/orders", response_model=Order)
async def create_order(order_input: OrderCreate):
    order = Order(**order_input.model_dump())
    doc = order.model_dump()
    doc = serialize_doc(doc)
    await db.orders.insert_one(doc)
    return order

@api_router.get("/orders", response_model=List[Order])
async def get_orders(status: Optional[str] = None):
    query = {}
    if status:
        query['status'] = status
    orders = await db.orders.find(query, {"_id": 0}).to_list(1000)
    orders = [deserialize_doc(order) for order in orders]
    return orders

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return deserialize_doc(order)

@api_router.put("/orders/{order_id}")
async def update_order(order_id: str, status: Optional[str] = None, notes: Optional[str] = None):
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if status:
        update_data['status'] = status
    if notes is not None:
        update_data['notes'] = notes
    
    result = await db.orders.update_one({"id": order_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order updated successfully"}

@api_router.delete("/orders/{order_id}")
async def delete_order(order_id: str):
    result = await db.orders.delete_one({"id": order_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order deleted successfully"}


# ==================== PRODUCTION ROUTES ====================
@api_router.post("/production", response_model=ProductionStageRecord)
async def create_production_stage(stage_input: ProductionStageCreate):
    stage_record = ProductionStageRecord(**stage_input.model_dump())
    doc = stage_record.model_dump()
    doc = serialize_doc(doc)
    await db.production_stages.insert_one(doc)
    return stage_record

@api_router.get("/production", response_model=List[ProductionStageRecord])
async def get_production_stages(order_id: Optional[str] = None):
    query = {}
    if order_id:
        query['order_id'] = order_id
    stages = await db.production_stages.find(query, {"_id": 0}).to_list(1000)
    stages = [deserialize_doc(stage) for stage in stages]
    return stages

@api_router.put("/production/{stage_id}")
async def update_production_stage(stage_id: str, status: Optional[str] = None, 
                                 started_at: Optional[str] = None,
                                 completed_at: Optional[str] = None):
    update_data = {}
    if status:
        update_data['status'] = status
    if started_at:
        update_data['started_at'] = started_at
    if completed_at:
        update_data['completed_at'] = completed_at
    
    result = await db.production_stages.update_one({"id": stage_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Production stage not found")
    return {"message": "Production stage updated successfully"}


# ==================== MATERIAL ROUTES ====================
@api_router.post("/materials", response_model=Material)
async def create_material(material_input: MaterialCreate):
    material = Material(**material_input.model_dump())
    doc = material.model_dump()
    doc = serialize_doc(doc)
    await db.materials.insert_one(doc)
    return material

@api_router.get("/materials", response_model=List[Material])
async def get_materials(low_stock: Optional[bool] = None):
    materials = await db.materials.find({}, {"_id": 0}).to_list(1000)
    materials = [deserialize_doc(mat) for mat in materials]
    
    if low_stock:
        materials = [mat for mat in materials if mat['quantity'] <= mat['reorder_level']]
    
    return materials

@api_router.get("/materials/{material_id}", response_model=Material)
async def get_material(material_id: str):
    material = await db.materials.find_one({"id": material_id}, {"_id": 0})
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return deserialize_doc(material)

@api_router.put("/materials/{material_id}")
async def update_material(material_id: str, quantity: Optional[float] = None, 
                         unit_price: Optional[float] = None):
    update_data = {"last_updated": datetime.now(timezone.utc).isoformat()}
    if quantity is not None:
        update_data['quantity'] = quantity
    if unit_price is not None:
        update_data['unit_price'] = unit_price
    
    result = await db.materials.update_one({"id": material_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Material not found")
    return {"message": "Material updated successfully"}

@api_router.delete("/materials/{material_id}")
async def delete_material(material_id: str):
    result = await db.materials.delete_one({"id": material_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Material not found")
    return {"message": "Material deleted successfully"}


# ==================== SUPPLIER ROUTES ====================
@api_router.post("/suppliers", response_model=Supplier)
async def create_supplier(supplier_input: SupplierCreate):
    supplier = Supplier(**supplier_input.model_dump())
    doc = supplier.model_dump()
    doc = serialize_doc(doc)
    await db.suppliers.insert_one(doc)
    return supplier

@api_router.get("/suppliers", response_model=List[Supplier])
async def get_suppliers():
    suppliers = await db.suppliers.find({}, {"_id": 0}).to_list(1000)
    suppliers = [deserialize_doc(sup) for sup in suppliers]
    return suppliers

@api_router.delete("/suppliers/{supplier_id}")
async def delete_supplier(supplier_id: str):
    result = await db.suppliers.delete_one({"id": supplier_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return {"message": "Supplier deleted successfully"}


# ==================== WORKER ROUTES ====================
@api_router.post("/workers", response_model=Worker)
async def create_worker(worker_input: WorkerCreate):
    worker = Worker(**worker_input.model_dump())
    doc = worker.model_dump()
    doc = serialize_doc(doc)
    await db.workers.insert_one(doc)
    return worker

@api_router.get("/workers", response_model=List[Worker])
async def get_workers(department: Optional[str] = None, active: Optional[bool] = None):
    query = {}
    if department:
        query['department'] = department
    if active is not None:
        query['active'] = active
    workers = await db.workers.find(query, {"_id": 0}).to_list(1000)
    workers = [deserialize_doc(worker) for worker in workers]
    return workers

@api_router.put("/workers/{worker_id}")
async def update_worker(worker_id: str, active: Optional[bool] = None):
    update_data = {}
    if active is not None:
        update_data['active'] = active
    
    result = await db.workers.update_one({"id": worker_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Worker not found")
    return {"message": "Worker updated successfully"}

@api_router.delete("/workers/{worker_id}")
async def delete_worker(worker_id: str):
    result = await db.workers.delete_one({"id": worker_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Worker not found")
    return {"message": "Worker deleted successfully"}


# ==================== QUALITY CHECK ROUTES ====================
@api_router.post("/quality-checks", response_model=QualityCheck)
async def create_quality_check(qc_input: QualityCheckCreate):
    qc = QualityCheck(**qc_input.model_dump())
    if len(qc.defects_found) == 0:
        qc.status = QCStatus.PASSED
    else:
        qc.status = QCStatus.FAILED
    
    doc = qc.model_dump()
    doc = serialize_doc(doc)
    await db.quality_checks.insert_one(doc)
    return qc

@api_router.get("/quality-checks", response_model=List[QualityCheck])
async def get_quality_checks(order_id: Optional[str] = None):
    query = {}
    if order_id:
        query['order_id'] = order_id
    qcs = await db.quality_checks.find(query, {"_id": 0}).to_list(1000)
    qcs = [deserialize_doc(qc) for qc in qcs]
    return qcs


# ==================== TASK ROUTES ====================
@api_router.post("/tasks", response_model=Task)
async def create_task(task_input: TaskCreate):
    task_data = task_input.model_dump()
    initial_attachments = task_data.pop('initial_attachments', [])
    notify_users = task_data.pop('notify_users', [])
    notify_groups = task_data.pop('notify_groups', [])
    send_notifications = task_data.pop('send_notifications', True)
    
    # Validate attachment sizes (increased to 8MB for Base64 encoded data - 6MB file becomes ~8MB Base64)
    for att in initial_attachments:
        if att.get('file_url', '').startswith('data:') and len(att.get('file_url', '')) > 8000000:  # 8MB limit for data URLs
            raise HTTPException(status_code=413, detail=f"Attachment '{att.get('file_name', 'unknown')}' is too large. Maximum size is 6MB.")
    
    task = Task(**{**task_data, 'notify_users': notify_users, 'notify_groups': notify_groups, 'send_notifications': send_notifications})
    doc = task.model_dump()
    doc = serialize_doc(doc)
    await db.tasks.insert_one(doc)
    
    # Add initial attachments if provided
    task_attachments = []
    if initial_attachments:
        for att in initial_attachments:
            try:
                attachment = TaskAttachment(
                    task_id=task.id,
                    file_name=att.get('file_name', 'Untitled'),
                    file_url=att.get('file_url', ''),
                    file_type=att.get('file_type', 'link'),
                    uploaded_by=att.get('uploaded_by', 'System')
                )
                att_doc = attachment.model_dump()
                att_doc = serialize_doc(att_doc)
                await db.task_attachments.insert_one(att_doc)
                task_attachments.append(att_doc)
            except Exception as e:
                logging.warning(f"Failed to save attachment {att.get('file_name', 'unknown')}: {str(e)}")
                # Continue with task creation even if attachment fails
    
    # Log activity
    await log_activity(task.id, task.created_by or 'system', task.created_by or 'System', 'created', f'Created task: {task.title}')
    
    # Send notifications if enabled
    if send_notifications:
        task_dict = task.model_dump()
        task_dict['attachments'] = task_attachments
        
        # Always notify the assigned person
        assigned_worker = await db.workers.find_one({"id": task.assigned_to}, {"_id": 0})
        if assigned_worker:
            await send_task_notification(
                task_dict, 
                "task_created", 
                [{"user_id": task.assigned_to, "user_name": assigned_worker['name']}]
            )
        
        # Notify additional users if specified
        if notify_users:
            additional_recipients = []
            for user_id in notify_users:
                worker = await db.workers.find_one({"id": user_id}, {"_id": 0})
                if worker:
                    additional_recipients.append({"user_id": user_id, "user_name": worker['name']})
            
            if additional_recipients:
                await send_task_notification(task_dict, "task_created", additional_recipients)
        
        # Notify groups if specified (send as group messages)
        if notify_groups:
            for group_id in notify_groups:
                group = await db.group_chats.find_one({"id": group_id}, {"_id": 0})
                if group:
                    try:
                        # Create task notification message in group chat
                        notification_content = f"🆕 **New Task Created**\\n\\n**{task.title}**\\n{task.description}\\n\\nPriority: {task.priority} | Department: {task.department}\\nAssigned to: {assigned_worker['name'] if assigned_worker else 'Unknown'}\\n{f'Due: {task.due_date}' if task.due_date else ''}"
                        
                        # Send as system message in group
                        group_message = GroupMessage(
                            group_id=group_id,
                            sender_id="system",
                            sender_name="Factory System",
                            content=notification_content,
                            message_type="task_notification",
                            task_id=task.id,
                            attachments=task_attachments
                        )
                        
                        msg_doc = group_message.model_dump()
                        msg_doc = serialize_doc(msg_doc)
                        await db.group_messages.insert_one(msg_doc)
                        
                        # Update group last message
                        await db.group_chats.update_one(
                            {"id": group_id},
                            {"$set": {
                                "last_message": f"🆕 New Task: {task.title}",
                                "last_message_at": group_message.sent_at.isoformat()
                            }}
                        )
                        
                    except Exception as e:
                        logging.error(f"Failed to send group message for task {task.id}: {str(e)}")
    
    
    return task

@api_router.get("/tasks", response_model=List[Task])
async def get_tasks(status: Optional[str] = None, department: Optional[str] = None):
    query = {}
    if status:
        query['status'] = status
    if department:
        query['department'] = department
    tasks = await db.tasks.find(query, {"_id": 0}).to_list(1000)
    tasks = [deserialize_doc(task) for task in tasks]
    return tasks

@api_router.put("/tasks/{task_id}")
async def update_task(task_id: str, status: Optional[str] = None):
    update_data = {}
    if status:
        update_data['status'] = status
        if status == "completed":
            update_data['completed_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.tasks.update_one({"id": task_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task updated successfully"}

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    result = await db.tasks.delete_one({"id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}


# ==================== TASK COMMENTS ROUTES ====================
@api_router.post("/tasks/{task_id}/comments", response_model=TaskComment)
async def create_task_comment(task_id: str, comment_input: TaskCommentCreate):
    # Verify task exists
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    comment = TaskComment(**comment_input.model_dump())
    doc = comment.model_dump()
    doc = serialize_doc(doc)
    await db.task_comments.insert_one(doc)
    
    # Log activity
    await log_activity(task_id, comment_input.user_id, comment_input.user_name, "commented", "Added a comment")
    
    return comment

@api_router.get("/tasks/{task_id}/comments", response_model=List[TaskComment])
async def get_task_comments(task_id: str):
    comments = await db.task_comments.find({"task_id": task_id}, {"_id": 0}).sort("created_at", 1).to_list(1000)
    comments = [deserialize_doc(comment) for comment in comments]
    return comments

@api_router.delete("/tasks/{task_id}/comments/{comment_id}")
async def delete_task_comment(task_id: str, comment_id: str):
    result = await db.task_comments.delete_one({"id": comment_id, "task_id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"message": "Comment deleted successfully"}


# ==================== SUBTASKS ROUTES ====================
@api_router.post("/tasks/{task_id}/subtasks", response_model=Subtask)
async def create_subtask(task_id: str, subtask_input: SubtaskCreate):
    # Verify task exists
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    subtask = Subtask(**subtask_input.model_dump())
    doc = subtask.model_dump()
    doc = serialize_doc(doc)
    await db.subtasks.insert_one(doc)
    
    return subtask

@api_router.get("/tasks/{task_id}/subtasks", response_model=List[Subtask])
async def get_subtasks(task_id: str):
    subtasks = await db.subtasks.find({"task_id": task_id}, {"_id": 0}).sort("created_at", 1).to_list(1000)
    subtasks = [deserialize_doc(subtask) for subtask in subtasks]
    return subtasks

@api_router.put("/tasks/{task_id}/subtasks/{subtask_id}")
async def update_subtask(task_id: str, subtask_id: str, completed: bool):
    update_data = {
        "completed": completed,
        "completed_at": datetime.now(timezone.utc).isoformat() if completed else None
    }
    
    result = await db.subtasks.update_one({"id": subtask_id, "task_id": task_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Subtask not found")
    return {"message": "Subtask updated successfully"}

@api_router.delete("/tasks/{task_id}/subtasks/{subtask_id}")
async def delete_subtask(task_id: str, subtask_id: str):
    result = await db.subtasks.delete_one({"id": subtask_id, "task_id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Subtask not found")
    return {"message": "Subtask deleted successfully"}


# ==================== TASK ATTACHMENTS ROUTES ====================
@api_router.post("/tasks/{task_id}/attachments", response_model=TaskAttachment)
async def create_attachment(task_id: str, attachment_input: TaskAttachmentCreate):
    # Verify task exists
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    attachment = TaskAttachment(**attachment_input.model_dump())
    doc = attachment.model_dump()
    doc = serialize_doc(doc)
    await db.task_attachments.insert_one(doc)
    
    # Log activity
    await log_activity(task_id, attachment_input.uploaded_by, attachment_input.uploaded_by, "attached_file", f"Attached file: {attachment_input.file_name}")
    
    return attachment

@api_router.get("/tasks/{task_id}/attachments", response_model=List[TaskAttachment])
async def get_attachments(task_id: str):
    attachments = await db.task_attachments.find({"task_id": task_id}, {"_id": 0}).sort("uploaded_at", -1).to_list(1000)
    attachments = [deserialize_doc(attachment) for attachment in attachments]
    return attachments

@api_router.delete("/tasks/{task_id}/attachments/{attachment_id}")
async def delete_attachment(task_id: str, attachment_id: str):
    result = await db.task_attachments.delete_one({"id": attachment_id, "task_id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Attachment not found")
    return {"message": "Attachment deleted successfully"}


# ==================== TIME LOGS ROUTES ====================
@api_router.post("/tasks/{task_id}/time-logs", response_model=TimeLog)
async def create_time_log(task_id: str, timelog_input: TimeLogCreate):
    # Verify task exists
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    timelog = TimeLog(**timelog_input.model_dump())
    doc = timelog.model_dump()
    doc = serialize_doc(doc)
    await db.time_logs.insert_one(doc)
    
    # Log activity
    await log_activity(task_id, timelog_input.user_id, timelog_input.user_name, "logged_time", f"Logged {timelog_input.hours} hours")
    
    return timelog

@api_router.get("/tasks/{task_id}/time-logs", response_model=List[TimeLog])
async def get_time_logs(task_id: str):
    timelogs = await db.time_logs.find({"task_id": task_id}, {"_id": 0}).sort("logged_at", -1).to_list(1000)
    timelogs = [deserialize_doc(timelog) for timelog in timelogs]
    return timelogs

@api_router.get("/tasks/{task_id}/total-hours")
async def get_total_hours(task_id: str):
    timelogs = await db.time_logs.find({"task_id": task_id}, {"_id": 0}).to_list(1000)
    total_hours = sum(log.get('hours', 0) for log in timelogs)
    return {"total_hours": total_hours}


# ==================== ACTIVITY LOG ROUTES ====================
@api_router.get("/tasks/{task_id}/activities", response_model=List[ActivityLog])
async def get_task_activities(task_id: str):
    activities = await db.activity_logs.find({"task_id": task_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    activities = [deserialize_doc(activity) for activity in activities]
    return activities


# ==================== TASK TAGS ROUTES ====================
@api_router.put("/tasks/{task_id}/tags")
async def update_task_tags(task_id: str, tags: List[str]):
    result = await db.tasks.update_one({"id": task_id}, {"$set": {"tags": tags}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Tags updated successfully"}


# ==================== CONVERSATIONS ROUTES (1-on-1 Chat) ====================
@api_router.get("/conversations", response_model=List[Conversation])
async def get_user_conversations(user_id: str):
    conversations = await db.conversations.find({
        "$or": [{"participant1_id": user_id}, {"participant2_id": user_id}]
    }, {"_id": 0}).sort("last_message_at", -1).to_list(1000)
    conversations = [deserialize_doc(conv) for conv in conversations]
    return conversations

@api_router.post("/conversations", response_model=Conversation)
async def create_conversation(conv_input: ConversationCreate):
    # Check if conversation already exists
    existing = await get_or_create_conversation(
        conv_input.participant1_id, conv_input.participant1_name,
        conv_input.participant2_id, conv_input.participant2_name
    )
    return existing

@api_router.get("/conversations/{conversation_id}/messages", response_model=List[Message])
async def get_conversation_messages(conversation_id: str, limit: Optional[int] = 50):
    messages = await db.messages.find(
        {"conversation_id": conversation_id}, 
        {"_id": 0}
    ).sort("sent_at", -1).limit(limit).to_list(limit or 50)
    
    messages = [deserialize_doc(msg) for msg in messages]
    return list(reversed(messages))  # Return in chronological order

@api_router.post("/conversations/{conversation_id}/messages", response_model=Message)
async def send_message(conversation_id: str, message_input: MessageCreate):
    # Verify conversation exists
    conversation = await db.conversations.find_one({"id": conversation_id})
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    message = Message(**message_input.model_dump())
    doc = message.model_dump()
    doc = serialize_doc(doc)
    await db.messages.insert_one(doc)
    
    # Update conversation last message
    await db.conversations.update_one(
        {"id": conversation_id},
        {"$set": {
            "last_message": message.content[:100],
            "last_message_at": message.sent_at.isoformat()
        }}
    )
    
    return message

@api_router.put("/conversations/{conversation_id}/messages/{message_id}/read")
async def mark_message_read(conversation_id: str, message_id: str):
    result = await db.messages.update_one(
        {"id": message_id, "conversation_id": conversation_id},
        {"$set": {"read_by_recipient": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message marked as read"}


# ==================== GROUP CHAT ROUTES ====================
@api_router.get("/groups", response_model=List[GroupChat])
async def get_user_groups(user_id: Optional[str] = None):
    query = {}
    if user_id:
        query = {"members": {"$elemMatch": {"user_id": user_id}}}
    
    groups = await db.group_chats.find(query, {"_id": 0}).sort("last_message_at", -1).to_list(1000)
    groups = [deserialize_doc(group) for group in groups]
    return groups

@api_router.post("/groups", response_model=GroupChat)
async def create_group_chat(group_input: GroupChatCreate):
    group = GroupChat(**group_input.model_dump())
    doc = group.model_dump()
    doc = serialize_doc(doc)
    await db.group_chats.insert_one(doc)
    return group

@api_router.get("/groups/{group_id}/messages", response_model=List[GroupMessage])
async def get_group_messages(group_id: str, limit: Optional[int] = 50):
    messages = await db.group_messages.find(
        {"group_id": group_id}, 
        {"_id": 0}
    ).sort("sent_at", -1).limit(limit).to_list(limit or 50)
    
    messages = [deserialize_doc(msg) for msg in messages]
    return list(reversed(messages))

@api_router.post("/groups/{group_id}/messages", response_model=GroupMessage)
async def send_group_message(group_id: str, message_input: GroupMessageCreate):
    # Verify group exists and user is member
    group = await db.group_chats.find_one({"id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Check if sender is group member
    is_member = any(member['user_id'] == message_input.sender_id for member in group['members'])
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this group")
    
    message = GroupMessage(**message_input.model_dump())
    doc = message.model_dump()
    doc = serialize_doc(doc)
    await db.group_messages.insert_one(doc)
    
    # Update group last message
    await db.group_chats.update_one(
        {"id": group_id},
        {"$set": {
            "last_message": message.content[:100],
            "last_message_at": message.sent_at.isoformat()
        }}
    )
    
    return message

@api_router.put("/groups/{group_id}/messages/{message_id}/read")
async def mark_group_message_read(group_id: str, message_id: str, user_id: str):
    # Add user to read_by list if not already there
    result = await db.group_messages.update_one(
        {"id": message_id, "group_id": group_id},
        {"$addToSet": {"read_by": user_id}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message marked as read"}


# ==================== TASK NOTIFICATIONS ROUTES ====================
@api_router.get("/notifications", response_model=List[TaskNotification])
async def get_user_notifications(user_id: str, unread_only: Optional[bool] = False):
    query = {"recipient_id": user_id}
    if unread_only:
        query["read"] = False
    
    notifications = await db.task_notifications.find(
        query, {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    notifications = [deserialize_doc(notif) for notif in notifications]
    return notifications

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    result = await db.task_notifications.update_one(
        {"id": notification_id},
        {"$set": {
            "read": True,
            "read_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

@api_router.put("/notifications/{notification_id}/action")
async def update_notification_action(notification_id: str, action: str):
    result = await db.task_notifications.update_one(
        {"id": notification_id},
        {"$set": {"action_taken": action}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification action updated"}


# ==================== TASK COMPLETION ROUTES (Interactive) ====================
@api_router.post("/tasks/{task_id}/complete", response_model=TaskCompletion)
async def complete_task_interactive(task_id: str, completion_input: TaskCompletionCreate):
    # Verify task exists
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Create completion record
    completion = TaskCompletion(**completion_input.model_dump())
    doc = completion.model_dump()
    doc = serialize_doc(doc)
    await db.task_completions.insert_one(doc)
    
    # Update task status
    await db.tasks.update_one(
        {"id": task_id},
        {"$set": {
            "status": completion_input.completion_status,
            "completed_at": completion.completed_at.isoformat()
        }}
    )
    
    # Log activity
    await log_activity(task_id, completion_input.completed_by, completion_input.completed_by_name, "completed_interactive", f"Completed task with notes: {completion_input.completion_notes[:50]}...")
    
    # Send completion notification to relevant parties
    if task.get('send_notifications', True):
        task_dict = deserialize_doc(task)
        completion_dict = completion.model_dump()
        
        # Notify task creator
        if task.get('created_by') and task['created_by'] != completion_input.completed_by:
            creator = await db.workers.find_one({"id": task['created_by']}, {"_id": 0})
            if creator:
                await send_task_notification(
                    {**task_dict, 'completion_details': completion_dict},
                    "task_completed",
                    [{"user_id": task['created_by'], "user_name": creator['name']}]
                )
    
    return completion

@api_router.get("/tasks/{task_id}/completions", response_model=List[TaskCompletion])
async def get_task_completions(task_id: str):
    completions = await db.task_completions.find(
        {"task_id": task_id}, 
        {"_id": 0}
    ).sort("completed_at", -1).to_list(1000)
    completions = [deserialize_doc(comp) for comp in completions]
    return completions


# ==================== ANALYTICS ROUTES ====================
@api_router.get("/analytics/dashboard")
async def get_dashboard_analytics():
    # Get counts
    total_orders = await db.orders.count_documents({})
    active_orders = await db.orders.count_documents({"status": {"$in": ["pending", "in_production", "quality_check"]}})
    completed_orders = await db.orders.count_documents({"status": "completed"})
    
    total_workers = await db.workers.count_documents({"active": True})
    total_materials = await db.materials.count_documents({})
    low_stock_materials = await db.materials.count_documents({"$expr": {"$lte": ["$quantity", "$reorder_level"]}})
    
    pending_tasks = await db.tasks.count_documents({"status": "pending"})
    total_qc_checks = await db.quality_checks.count_documents({})
    failed_qc = await db.quality_checks.count_documents({"status": "failed"})
    
    return {
        "orders": {
            "total": total_orders,
            "active": active_orders,
            "completed": completed_orders
        },
        "workers": {
            "total": total_workers
        },
        "materials": {
            "total": total_materials,
            "low_stock": low_stock_materials
        },
        "tasks": {
            "pending": pending_tasks
        },
        "quality": {
            "total_checks": total_qc_checks,
            "failed": failed_qc,
            "pass_rate": round((total_qc_checks - failed_qc) / total_qc_checks * 100, 2) if total_qc_checks > 0 else 100
        }
    }

@api_router.get("/analytics/production-efficiency")
async def get_production_efficiency():
    # Get production stages data
    stages = await db.production_stages.find({"status": "completed"}, {"_id": 0}).to_list(1000)
    
    stage_counts = {}
    for stage in stages:
        stage_name = stage.get('stage', 'unknown')
        stage_counts[stage_name] = stage_counts.get(stage_name, 0) + 1
    
    return {
        "stage_completion": stage_counts,
        "total_completed_stages": len(stages)
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
