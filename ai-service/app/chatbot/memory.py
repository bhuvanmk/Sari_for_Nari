from typing import Dict, List, Any

class ConversationMemory:
    def __init__(self, max_history: int = 6):
        self.conversations: Dict[str, List[Dict[str, str]]] = {}
        self.max_history = max_history

    def get_history(self, conversation_id: str) -> List[Dict[str, str]]:
        return self.conversations.get(conversation_id, [])

    def add_message(self, conversation_id: str, sender: str, text: str):
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = []
        self.conversations[conversation_id].append({"sender": sender, "text": text})
        if len(self.conversations[conversation_id]) > self.max_history * 2:
            self.conversations[conversation_id] = self.conversations[conversation_id][-self.max_history * 2:]

    def clear(self, conversation_id: str):
        if conversation_id in self.conversations:
            del self.conversations[conversation_id]

conversation_memory = ConversationMemory()
