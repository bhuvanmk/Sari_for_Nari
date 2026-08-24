import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Sparkles } from 'lucide-react';
import Navbar from './Navbar';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const mailtoSubject = encodeURIComponent(formData.subject || 'Inquiry regarding Sarees For Naaris');
    const mailtoBody = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nMessage:\n${formData.message}`
    );
    
    // Open mail client addressed to teamvelocity4you@gmail.com
    window.location.href = `mailto:teamvelocity4you@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;
    setSubmitted(true);
  };

  const handleSampleFill = () => {
    setFormData({
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 98765 43210',
      subject: 'Custom Order Inquiry for Kanjivaram Bridal Saree',
      message: 'Hello Sarees For Naaris Team,\n\nI am looking for a real gold zari woven Maroon Kanjivaram silk saree for an upcoming wedding. Could you please share catalog options and customization details?\n\nThank you!'
    });
  };

  return (
    <div className="page-wrapper" style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '3rem auto', padding: '0 1.5rem 4rem 1.5rem' }}>
        {/* Title Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ 
            color: 'var(--color-primary-hover)', 
            textTransform: 'uppercase', 
            letterSpacing: '3px', 
            fontSize: '0.85rem', 
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Sparkles size={16} /> We are here to assist you
          </span>
          <h1 style={{ 
            fontFamily: 'Cinzel, serif', 
            fontSize: '2.8rem', 
            color: 'var(--color-accent)', 
            marginTop: '0.5rem',
            marginBottom: '1rem',
            fontWeight: 700
          }}>
            Contact Us
          </h1>
          <p style={{ maxWidth: '650px', margin: '0 auto', color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7' }}>
            Have questions regarding our handloom saree collections, order status, or custom weaving requests? Send us a message and our support team will reach out promptly.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '2.5rem' 
        }}>
          {/* Left Column: Contact Details & Sample Contact Option */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Quick Info Card */}
            <div style={{ 
              background: '#FFFFFF', 
              border: '1px solid var(--border-color)', 
              borderRadius: '16px', 
              padding: '2rem',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
            }}>
              <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--color-accent)', marginBottom: '1.5rem', fontSize: '1.4rem', fontWeight: 700 }}>
                Get In Touch
              </h3>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                <Mail size={22} color="var(--color-accent)" style={{ marginTop: '0.2rem' }} />
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '0.25rem', fontWeight: 600 }}>Email Us</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>teamvelocity4you@gmail.com</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                <Phone size={22} color="var(--color-accent)" style={{ marginTop: '0.2rem' }} />
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '0.25rem', fontWeight: 600 }}>Support Helpline</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>+91 (800) 108-9000 (Mon–Sat, 9AM-7PM IST)</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <MapPin size={22} color="var(--color-accent)" style={{ marginTop: '0.2rem' }} />
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '0.25rem', fontWeight: 600 }}>Artisan Headquarters</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Heritage Weaving Hub, Varanasi, Uttar Pradesh - 221001</p>
                </div>
              </div>
            </div>

            {/* Sample Contact Fill Option */}
            <div style={{ 
              background: '#FFFFFF', 
              border: '1px solid var(--border-color)', 
              borderRadius: '16px', 
              padding: '1.8rem',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
            }}>
              <h4 style={{ fontFamily: 'Cinzel, serif', color: 'var(--color-accent)', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 700 }}>
                Need a quick template?
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.2rem', lineHeight: '1.5' }}>
                Click below to auto-fill sample inquiry details into the contact form.
              </p>
              <button 
                type="button" 
                onClick={handleSampleFill}
                style={{
                  background: 'rgba(200, 155, 60, 0.12)',
                  border: '1px solid var(--color-primary)',
                  color: 'var(--color-primary-hover)',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                Load Sample Inquiry Contact
              </button>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div style={{ 
            background: '#FFFFFF', 
            border: '1px solid var(--border-color)', 
            borderRadius: '20px', 
            padding: '2.5rem',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
          }}>
            <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--color-accent)', marginBottom: '1.5rem', fontSize: '1.4rem', fontWeight: 700 }}>
              Send Inquiry Message
            </h3>

            {submitted && (
              <div style={{ 
                background: 'rgba(76, 154, 106, 0.15)', 
                border: '1px solid var(--success)', 
                borderRadius: '10px', 
                padding: '1rem', 
                marginBottom: '1.5rem',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.9rem',
                fontWeight: 600
              }}>
                <CheckCircle size={20} />
                <span>Your email application opened! Message pre-addressed to teamvelocity4you@gmail.com.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Full Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={formData.name} 
                  onChange={handleChange}
                  placeholder="Enter your name" 
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Email Address *</label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    value={formData.email} 
                    onChange={handleChange}
                    placeholder="name@example.com" 
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Phone Number</label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange}
                    placeholder="+91 98765 43210" 
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Subject *</label>
                <input 
                  type="text" 
                  name="subject" 
                  required 
                  value={formData.subject} 
                  onChange={handleChange}
                  placeholder="Inquiry subject" 
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Message *</label>
                <textarea 
                  name="message" 
                  rows={5} 
                  required 
                  value={formData.message} 
                  onChange={handleChange}
                  placeholder="How can we help you?" 
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button 
                type="submit" 
                className="btn-gold" 
                style={{ 
                  marginTop: '0.5rem',
                  padding: '0.9rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <Send size={18} /> Send Email to teamvelocity4you@gmail.com
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
