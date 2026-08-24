import requests
from typing import List, Optional, Dict, Any
from app.config import SPRING_BOOT_BASE_URL
from app.models.schemas import OrderCard, OrderItemCard

def get_my_orders(jwt_token: str) -> List[OrderCard]:
    if not jwt_token:
        return []
    try:
        url = f"{SPRING_BOOT_BASE_URL}/api/orders/my-orders"
        headers = {"Authorization": f"Bearer {jwt_token}"}
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            order_cards = []
            for item in data[:5]:
                items_list = []
                for order_item in item.get("items", []):
                    prod = order_item.get("product") or {}
                    items_list.append(OrderItemCard(
                        productId=prod.get("productId"),
                        productName=prod.get("name"),
                        quantity=order_item.get("quantity", 1),
                        price=float(order_item.get("price", 0)) if order_item.get("price") else None,
                        image=prod.get("imageUrl")
                    ))

                card = OrderCard(
                    orderId=str(item.get("orderId")),
                    status=item.get("status", "Processing"),
                    totalAmount=float(item.get("totalAmount", 0)) if item.get("totalAmount") else None,
                    paymentStatus=item.get("paymentStatus"),
                    createdAt=str(item.get("createdAt")) if item.get("createdAt") else None,
                    estimatedDelivery=str(item.get("estimatedDeliveryDate")) if item.get("estimatedDeliveryDate") else None,
                    courierName=item.get("courierName"),
                    trackingNumber=item.get("trackingNumber"),
                    items=items_list
                )
                order_cards.append(card)
            return order_cards
    except Exception as e:
        print(f"Error fetching orders: {e}")
    return []

def cancel_order(order_id: str, jwt_token: str, reason: str = "Cancelled by user via chatbot") -> Dict[str, Any]:
    if not jwt_token:
        return {"success": False, "message": "Authentication required to cancel an order."}
    try:
        url = f"{SPRING_BOOT_BASE_URL}/api/orders/{order_id}/cancel"
        headers = {"Authorization": f"Bearer {jwt_token}"}
        response = requests.post(url, json={"reason": reason}, headers=headers, timeout=5)
        if response.status_code == 200:
            return {"success": True, "message": f"Order #{order_id} has been successfully cancelled."}
        else:
            res_data = response.json() if response.headers.get("content-type") == "application/json" else {}
            err_msg = res_data.get("message", f"Failed to cancel order (HTTP {response.status_code})")
            return {"success": False, "message": err_msg}
    except Exception as e:
        return {"success": False, "message": f"Error cancelling order: {str(e)}"}
