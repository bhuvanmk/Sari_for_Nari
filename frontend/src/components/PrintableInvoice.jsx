import React from 'react';
import { Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';
import './PrintableInvoice.css';

export default function PrintableInvoice({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${order.orderId || order.id || '8921'}`;
  const currentDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Calculate totals
  const grandTotal = Number(order.totalAmount || order.amount || 0);
  const subtotal = Math.round(grandTotal / 1.05); // Calculate 5% GST portion
  const gst = grandTotal - subtotal;
  const shipping = grandTotal > 2999 ? 0 : 150;

  const items = order.items && order.items.length > 0 ? order.items : (
    order.orderItems || [
      {
        id: 1,
        title: order.sareeName || order.productTitle || 'Pure Handloom Silk Saree',
        category: 'Banarasi Silk',
        price: grandTotal,
        quantity: 1
      }
    ]
  );

  const customerName = order.user?.username || order.customerName || 'Valued Customer';
  const customerEmail = order.user?.email || order.customerEmail || 'customer@sareesfornaaris.com';

  return (
    <div className="invoice-modal-overlay">
      <div className="invoice-modal-actions no-print">
        <button className="btn-invoice-back" onClick={onClose}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div className="right-action-buttons">
          <button className="btn-invoice-print" onClick={handlePrint}>
            <Printer size={16} /> Print Official Invoice
          </button>
        </div>
      </div>

      <div className="invoice-document-paper" id="printable-invoice">
        {/* Header */}
        <div className="invoice-header">
          <div className="invoice-brand-col">
            <div className="invoice-logo-row">
              <img src="/brand_logo.png" alt="Sarees For Naaris" className="invoice-logo" />
              <div>
                <h1 className="invoice-brand-name">SAREES FOR NAARIS</h1>
                <p className="invoice-brand-sub">Pure Handloom Elegance & Authentic Weaves</p>
              </div>
            </div>
            <p className="invoice-address-line">
              108 Silk Weaver Street, Heritage Loom Quarter<br />
              Varanasi, Uttar Pradesh - 221001, India<br />
              GSTIN: 09AAACS4592K1Z8 | Contact: support@sareesfornaaris.com
            </p>
          </div>

          <div className="invoice-meta-col">
            <h2 className="invoice-title">TAX INVOICE</h2>
            <div className="invoice-meta-grid">
              <span className="meta-label">Invoice No:</span>
              <span className="meta-value highlight">{invoiceNumber}</span>
              
              <span className="meta-label">Order Ref:</span>
              <span className="meta-value">#{order.orderId || order.id}</span>

              <span className="meta-label">Invoice Date:</span>
              <span className="meta-value">{currentDate}</span>

              <span className="meta-label">Payment Method:</span>
              <span className="meta-value status-paid">
                <CheckCircle2 size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> 
                {order.paymentMethod || 'Online'} ({order.paymentStatus || 'COMPLETED'})
              </span>
            </div>
          </div>
        </div>

        <hr className="invoice-divider" />

        {/* Customer & Shipping Details */}
        <div className="invoice-addresses-grid">
          <div className="address-box">
            <h3>Billed To & Shipping Address</h3>
            <p className="customer-name"><strong>{customerName}</strong></p>
            <p className="customer-address">
              {order.addressSnapshot || order.shippingAddress || 'Standard Registered Delivery Address'}
            </p>
            <p className="customer-contact">
              Email: {customerEmail}
            </p>
          </div>

          <div className="address-box seller-box">
            <h3>Dispatched By (Boutique Seller)</h3>
            <p className="seller-name"><strong>Royal Handloom Weavers Boutique</strong></p>
            <p className="seller-address">
              Saree Hub Craft Center, Sector 4, Varanasi - 221002
            </p>
            <p className="seller-contact">
              Authorized Silk Mark Certified Artisan Partner
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="invoice-items-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Item & Craft Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th className="text-right">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>
                  <strong>{item.title}</strong>
                  {item.category && <span className="item-sub-tag"> — {item.category}</span>}
                </td>
                <td>{item.quantity}</td>
                <td>₹{Number(item.price).toLocaleString('en-IN')}</td>
                <td className="text-right">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Invoice Summary Calculation */}
        <div className="invoice-totals-wrapper">
          <div className="invoice-notes font-small">
            <p><strong>Terms & Authenticity Guarantee:</strong></p>
            <ul>
              <li>This product is certified authentic Handloom Silk with Silk Mark Tag.</li>
              <li>Includes 7-day complimentary return & replacement guarantee.</li>
              <li>Dry clean only recommended for pure zari & silk fabrics.</li>
            </ul>
          </div>

          <div className="invoice-summary-box">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-row">
              <span>GST (5% Apparel Standard):</span>
              <span>₹{gst.toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-row">
              <span>Express Shipping:</span>
              <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
            </div>
            <hr className="summary-divider" />
            <div className="summary-row grand-total">
              <span>Grand Total:</span>
              <span>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <p>Thank you for supporting traditional Indian handloom weavers!</p>
          <p className="computer-generated-notice">This is a computer-generated invoice and requires no signature.</p>
        </div>
      </div>
    </div>
  );
}
