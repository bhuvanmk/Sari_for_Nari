import requests
from typing import List, Optional, Dict, Any
from app.config import SPRING_BOOT_BASE_URL
from app.models.schemas import ProductCard

def search_products(
    query: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    color: Optional[str] = None,
    occasion: Optional[str] = None,
    category: Optional[str] = None
) -> List[ProductCard]:
    try:
        url = f"{SPRING_BOOT_BASE_URL}/api/products"
        params = {}
        
        search_terms = []
        if query:
            search_terms.append(query)
        if color and color.lower() not in (query or "").lower():
            search_terms.append(color)
        if occasion and occasion.lower() not in (query or "").lower():
            search_terms.append(occasion)
        if category and category.lower() not in (query or "").lower():
            search_terms.append(category)

        if search_terms:
            params["search"] = " ".join(search_terms)
        if min_price is not None:
            params["min_price"] = min_price
        if max_price is not None:
            params["max_price"] = max_price

        response = requests.get(url, params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            product_cards = []
            for item in data[:6]: # Limit to top 6 products
                card = ProductCard(
                    productId=item.get("productId") or item.get("id"),
                    name=item.get("name", "Narees Saree"),
                    price=float(item.get("price", 0)),
                    rating=float(item.get("rating", 4.5)) if item.get("rating") else 4.5,
                    image=item.get("imageUrl") or item.get("image"),
                    category=item.get("category", {}).get("categoryName") if isinstance(item.get("category"), dict) else str(item.get("category", "")),
                    available=item.get("stock", 1) > 0
                )
                product_cards.append(card)
            return product_cards
    except Exception as e:
        print(f"Error calling product search API: {e}")
    return []

def get_product_details(product_id: int) -> Optional[Dict[str, Any]]:
    try:
        url = f"{SPRING_BOOT_BASE_URL}/api/products/{product_id}"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"Error fetching product details {product_id}: {e}")
    return None
