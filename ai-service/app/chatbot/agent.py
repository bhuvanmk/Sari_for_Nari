import re
import requests
from typing import Dict, Any, List, Optional
from app.config import HF_TOKEN, LLM_MODEL_NAME
from app.models.schemas import ChatRequest, ChatResponse, ProductCard, OrderCard, QuickAction
from app.chatbot.intent import detect_intent
from app.chatbot.memory import conversation_memory
from app.chatbot.prompts import SYSTEM_PROMPT
from app.tools.products import search_products
from app.tools.orders import get_my_orders, cancel_order
from app.tools.knowledge import search_knowledge_base

class ChatbotAgent:
    def __init__(self):
        self.hf_token = HF_TOKEN

    def _call_hf_llm(self, prompt: str, user_message: str) -> Optional[str]:
        if not self.hf_token or self.hf_token.startswith("PASTE_"):
            return None

        # Standard Hugging Face Inference Router Chat Completion API
        url = "https://router.huggingface.co/hf-inference/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.hf_token}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": LLM_MODEL_NAME,
            "messages": [
                {"role": "system", "content": prompt},
                {"role": "user", "content": user_message}
            ],
            "max_tokens": 512,
            "temperature": 0.3
        }

        try:
            res = requests.post(url, headers=headers, json=payload, timeout=8)
            if res.status_code == 200:
                data = res.json()
                if "choices" in data and len(data["choices"]) > 0:
                    return data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            print(f"HF Router API call failed: {e}")

        # Fallback to direct model inference API
        url_direct = f"https://api-inference.huggingface.co/models/{LLM_MODEL_NAME}"
        try:
            res = requests.post(
                url_direct,
                headers={"Authorization": f"Bearer {self.hf_token}"},
                json={"inputs": f"{prompt}\nUser: {user_message}\nAssistant:"},
                timeout=8
            )
            if res.status_code == 200:
                data = res.json()
                if isinstance(data, list) and len(data) > 0 and "generated_text" in data[0]:
                    txt = data[0]["generated_text"]
                    if "Assistant:" in txt:
                        return txt.split("Assistant:")[-1].strip()
                    return txt.strip()
        except Exception as e:
            print(f"HF Direct API call failed: {e}")

        return None

    def _extract_price_filters(self, message: str) -> Dict[str, Any]:
        filters = {}
        msg = message.lower()
        
        # Regex for "under 3000", "below ₹2500", "under 5000", "less than 2000"
        under_match = re.search(r'(?:under|below|less than)\s*₹?\s*(\d+)', msg)
        if under_match:
            filters["max_price"] = float(under_match.group(1))

        above_match = re.search(r'(?:above|over|more than)\s*₹?\s*(\d+)', msg)
        if above_match:
            filters["min_price"] = float(above_match.group(1))

        colors = ["red", "blue", "green", "pink", "yellow", "black", "white", "maroon", "purple", "gold"]
        for c in colors:
            if c in msg:
                filters["color"] = c
                break

        occasions = ["wedding", "party", "festival", "festive", "daily", "work", "bridal"]
        for o in occasions:
            if o in msg:
                filters["occasion"] = o
                break

        categories = ["silk", "cotton", "kanchipuram", "banarasi", "chanderi", "georgette", "chiffon", "organza", "paithani"]
        for cat in categories:
            if cat in msg:
                filters["category"] = cat
                break

        return filters

    def process_request(self, req: ChatRequest) -> ChatResponse:
        conv_id = req.conversationId or "default"
        user_msg = req.message.strip()
        user_ctx = req.userContext

        # Detect intent
        intent = detect_intent(user_msg)
        
        # Get memory history
        history_list = conversation_memory.get_history(conv_id)
        history_str = "\n".join([f"{m['sender']}: {m['text']}" for m in history_list])

        products: List[ProductCard] = []
        orders: List[OrderCard] = []
        quick_actions: List[QuickAction] = []
        rag_context = ""
        llm_response = None

        if intent in ["PRODUCT_SEARCH", "PRODUCT_RECOMMENDATION", "PRODUCT_DETAILS"]:
            filters = self._extract_price_filters(user_msg)
            # Perform product search via Spring Boot tool
            products = search_products(
                query=user_msg,
                min_price=filters.get("min_price"),
                max_price=filters.get("max_price"),
                color=filters.get("color"),
                occasion=filters.get("occasion"),
                category=filters.get("category")
            )
            if products:
                rag_context = f"Found {len(products)} matching products in catalog: " + ", ".join([f"{p.name} (₹{p.price})" for p in products])
            else:
                rag_context = "No exact products matching the search query were found in the current store stock."

        elif intent in ["ORDER_STATUS", "MY_ORDERS"]:
            jwt = user_ctx.jwtToken if user_ctx else None
            if jwt:
                orders = get_my_orders(jwt)
                if orders:
                    rag_context = f"User has {len(orders)} recent orders. Latest order #{orders[0].orderId} status: {orders[0].status}."
                else:
                    rag_context = "User currently has no orders placed on Narees."
            else:
                rag_context = "User is not currently logged in. Prompt them to log in to view their order status."
                quick_actions.append(QuickAction(label="Log In Now", action="LOGIN"))

        elif intent == "ORDER_CANCELLATION":
            jwt = user_ctx.jwtToken if user_ctx else None
            order_id_match = re.search(r'#?([A-Za-z0-9\-]{4,30})', user_msg)
            if jwt and order_id_match and "cancel" in user_msg.lower():
                order_id = order_id_match.group(1)
                cancel_res = cancel_order(order_id, jwt)
                rag_context = f"Cancellation execution result for order #{order_id}: {cancel_res.get('message')}"
            else:
                rag_context = search_knowledge_base("cancellation policy order cancel")
                if jwt:
                    orders = get_my_orders(jwt)

        else:
            # Query RAG Knowledge Base
            rag_context = search_knowledge_base(user_msg)

        # Build prompt & system instructions
        full_system_prompt = SYSTEM_PROMPT.format(context=rag_context or "None", history=history_str or "None")

        # Call Hugging Face LLM
        llm_response = self._call_hf_llm(full_system_prompt, user_msg)

        # Fallback response generator if LLM response is not returned or fails
        if not llm_response:
            if intent == "PRODUCT_SEARCH":
                if products:
                    llm_response = f"I found some beautiful saree options for you on Narees! ✨"
                else:
                    llm_response = "I couldn't find any sarees matching that exact query right now. Try searching for silk, cotton, Banarasi, or wedding sarees under a specific price!"
            elif intent in ["ORDER_STATUS", "MY_ORDERS"]:
                if user_ctx and user_ctx.jwtToken:
                    if orders:
                        llm_response = f"Here are your recent orders from Narees. Your latest order #{orders[0].orderId} is currently **{orders[0].status}**."
                    else:
                        llm_response = "You don't have any recent orders placed yet. Would you like help finding a saree today?"
                else:
                    llm_response = "Please log in to your Narees account to view your live orders and tracking information. 👋"
            elif intent == "GENERAL_CONVERSATION":
                llm_response = "Namaste! 👋 Welcome to Narees. I'm your AI shopping and customer support assistant. How can I help you today?"
            elif rag_context:
                # Clean up RAG context for presentation
                clean_lines = [line for line in rag_context.split('\n') if not line.startswith('--- Document')]
                llm_response = "\n".join(clean_lines[:8]).strip()
            else:
                llm_response = "I'm sorry, I don't have enough specific information about that right now. Please feel free to ask about our sarees, orders, shipping, or return policies!"

        # Add message to history
        conversation_memory.add_message(conv_id, "User", user_msg)
        conversation_memory.add_message(conv_id, "Assistant", llm_response)

        # Default quick actions if none set
        if not quick_actions:
            quick_actions = [
                QuickAction(label="Find a Saree", action="FIND_SAREE"),
                QuickAction(label="Track My Order", action="TRACK_ORDER"),
                QuickAction(label="Return / Exchange", action="RETURN_HELP")
            ]

        return ChatResponse(
            conversationId=conv_id,
            message=llm_response,
            intent=intent,
            products=products,
            orders=orders,
            quickActions=quick_actions
        )

chatbot_agent = ChatbotAgent()
