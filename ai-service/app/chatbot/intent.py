import re
from typing import Dict, Any

def detect_intent(message: str) -> str:
    msg_lower = message.lower().strip()
    
    # Order Tracking / Status
    if any(k in msg_lower for k in ["track", "where is my order", "order status", "my order", "my orders", "recent order", "shipped"]):
        if any(k in msg_lower for k in ["cancel", "cancellation"]):
            return "ORDER_CANCELLATION"
        return "ORDER_STATUS"
        
    # Order Cancellation
    if any(k in msg_lower for k in ["cancel my order", "cancel order", "how to cancel"]):
        return "ORDER_CANCELLATION"

    # Returns & Exchanges
    if any(k in msg_lower for k in ["return", "refund"]):
        return "RETURN_POLICY"
    if "exchange" in msg_lower:
        return "EXCHANGE_POLICY"

    # Shipping
    if any(k in msg_lower for k in ["shipping", "delivery", "dispatch", "how long delivery", "deliver to"]):
        return "SHIPPING"

    # Payment
    if any(k in msg_lower for k in ["payment", "upi", "cod", "cash on delivery", "card", "failed payment", "deducted"]):
        return "PAYMENT"

    # Account / Profile
    if any(k in msg_lower for k in ["account", "password", "profile", "login", "register", "signup"]):
        if "password" in msg_lower:
            return "PASSWORD_RESET"
        return "ACCOUNT"

    # Product Search / Discovery
    if any(k in msg_lower for k in ["saree", "sarees", "silk", "cotton", "under", "below", "price", "wedding", "banarasi", "kanchipuram", "color", "red", "blue", "green", "pink", "black", "buy", "show me", "recommend", "looking for"]):
        return "PRODUCT_SEARCH"

    # Greeting / General Help
    if any(k in msg_lower for k in ["hi", "hello", "namaste", "hey", "help"]):
        return "GENERAL_CONVERSATION"

    return "WEBSITE_HELP"
