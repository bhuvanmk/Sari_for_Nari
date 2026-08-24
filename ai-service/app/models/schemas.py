from pydantic import BaseModel
from typing import List, Optional, Any, Dict

class UserContext(BaseModel):
    userId: Optional[int] = None
    username: Optional[str] = None
    email: Optional[str] = None
    jwtToken: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    conversationId: Optional[str] = "default"
    userContext: Optional[UserContext] = None

class ProductCard(BaseModel):
    productId: int
    name: str
    price: float
    rating: Optional[float] = 4.5
    image: Optional[str] = None
    category: Optional[str] = None
    available: Optional[bool] = True

class OrderItemCard(BaseModel):
    productId: Optional[int] = None
    productName: Optional[str] = None
    quantity: Optional[int] = 1
    price: Optional[float] = None
    image: Optional[str] = None

class OrderCard(BaseModel):
    orderId: str
    status: str
    totalAmount: Optional[float] = None
    paymentStatus: Optional[str] = None
    createdAt: Optional[str] = None
    estimatedDelivery: Optional[str] = None
    courierName: Optional[str] = None
    trackingNumber: Optional[str] = None
    items: Optional[List[OrderItemCard]] = []

class QuickAction(BaseModel):
    label: str
    action: str

class ChatResponse(BaseModel):
    conversationId: str
    message: str
    intent: str
    products: Optional[List[ProductCard]] = []
    orders: Optional[List[OrderCard]] = []
    quickActions: Optional[List[QuickAction]] = []
