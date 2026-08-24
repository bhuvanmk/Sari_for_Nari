import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatbotWidget.css';

const INITIAL_GREETING = `Namaste! 👋

Welcome to Narees.

I'm your personal shopping and support assistant.

I can help you:
• Find sarees
• Recommend sarees
• Track orders
• Understand shipping and returns
• Answer website questions
• Help with your account

What would you like help with?`;

const DEFAULT_QUICK_ACTIONS = [
  { label: 'Find a Saree', action: 'Show me popular sarees' },
  { label: 'Track My Order', action: 'Where is my order?' },
  { label: 'Return / Exchange', action: 'What is your return policy?' },
  { label: 'Shipping Help', action: 'How long does delivery take?' },
  { label: 'Payment Help', action: 'What payment methods do you accept?' },
  { label: 'Account Help', action: 'How do I reset my password?' }
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(() => 'conv_' + Math.random().toString(36).substr(2, 9));
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Add initial greeting on first load if empty
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          sender: 'bot',
          text: INITIAL_GREETING,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickActions: DEFAULT_QUICK_ACTIONS
        }
      ]);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (customText = null) => {
    const queryText = (customText || inputText).trim();
    if (!queryText || isLoading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: queryText,
      time: timeStr
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputText('');
    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      const headers = { 'Content-Type': 'application/json' };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: queryText,
          conversationId: conversationId
        })
      });

      if (response.ok) {
        const data = await response.json();
        const botMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          text: data.message || "I'm here to help!",
          products: data.products || [],
          orders: data.orders || [],
          quickActions: data.quickActions || [],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error('Failed response');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: "I'm having trouble connecting to Narees support servers right now. Please try again in a few moments! 🙏",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setConversationId('conv_' + Math.random().toString(36).substr(2, 9));
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: INITIAL_GREETING,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: DEFAULT_QUICK_ACTIONS
      }
    ]);
  };

  const handleQuickAction = (actionText) => {
    if (actionText === 'LOGIN') {
      navigate('/login');
      setIsOpen(false);
    } else {
      handleSendMessage(actionText);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        className="narees-chatbot-fab"
        onClick={() => setIsOpen(!isOpen)}
        title="Narees AI Assistant"
        aria-label="Open Narees AI Chat Assistant"
      >
        {isOpen ? '✕' : '🤖'}
        {!isOpen && <span className="narees-chatbot-badge">AI</span>}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="narees-chatbot-window">
          {/* Header */}
          <div className="narees-chatbot-header">
            <div className="narees-chatbot-header-title">
              <div className="narees-chatbot-avatar">🤖</div>
              <div className="narees-chatbot-header-text">
                <h4>Narees Assistant</h4>
                <p>Online | Saree & Support AI</p>
              </div>
            </div>
            <div className="narees-chatbot-header-actions">
              <button className="narees-chatbot-header-btn" onClick={handleClearChat} title="Clear Chat">
                🗑️
              </button>
              <button className="narees-chatbot-header-btn" onClick={() => setIsOpen(false)} title="Close Chat">
                ✕
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="narees-chatbot-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`narees-chat-msg ${msg.sender}`}>
                <div className="narees-chat-bubble">{msg.text}</div>

                {/* Render Products */}
                {msg.products && msg.products.length > 0 && (
                  <div className="narees-chat-products">
                    {msg.products.map((prod, idx) => (
                      <div key={idx} className="narees-chat-product-card">
                        <img
                          src={prod.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300'}
                          alt={prod.name}
                          className="narees-chat-product-img"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300';
                          }}
                        />
                        <div className="narees-chat-product-info">
                          <p className="narees-chat-product-name">{prod.name}</p>
                          <span className="narees-chat-product-price">₹{prod.price?.toLocaleString('en-IN')}</span>
                          <span className="narees-chat-product-rating">⭐ {prod.rating || 4.5}</span>
                          <button
                            className="narees-chat-product-btn"
                            onClick={() => {
                              navigate(`/product/${prod.productId}`);
                              setIsOpen(false);
                            }}
                          >
                            View Product
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Render Order Cards */}
                {msg.orders && msg.orders.length > 0 && (
                  <div className="narees-chat-products">
                    {msg.orders.map((ord, idx) => (
                      <div key={idx} className="narees-chat-order-card">
                        <div className="narees-chat-order-header">
                          <span>Order #{ord.orderId}</span>
                          <span className="narees-chat-order-badge">{ord.status}</span>
                        </div>
                        {ord.totalAmount && <div>Total: ₹{ord.totalAmount?.toLocaleString('en-IN')}</div>}
                        {ord.estimatedDelivery && <div>Est. Delivery: {ord.estimatedDelivery}</div>}
                        {ord.courierName && <div>Courier: {ord.courierName} ({ord.trackingNumber})</div>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Render Quick Actions */}
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="narees-quick-actions">
                    {msg.quickActions.map((qa, qidx) => (
                      <button
                        key={qidx}
                        className="narees-quick-btn"
                        onClick={() => handleQuickAction(qa.action || qa.label)}
                      >
                        {qa.label}
                      </button>
                    ))}
                  </div>
                )}

                <span className="narees-chat-time">{msg.time}</span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="narees-chat-msg bot">
                <div className="narees-typing-indicator">
                  <div className="narees-typing-dot"></div>
                  <div className="narees-typing-dot"></div>
                  <div className="narees-typing-dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div className="narees-chatbot-footer">
            <input
              type="text"
              className="narees-chatbot-input"
              placeholder="Ask something..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="narees-chatbot-send-btn"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputText.trim()}
              title="Send Message"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
