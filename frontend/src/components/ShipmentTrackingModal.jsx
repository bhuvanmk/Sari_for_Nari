import React, { useEffect, useState } from 'react';
import { X, Truck, MapPin, Calendar, Clock, CheckCircle, Package } from 'lucide-react';
import { api } from '../services/api';

export default function ShipmentTrackingModal({ order, onClose }) {
  const [loading, setLoading] = useState(true);
  const [shipmentData, setShipmentData] = useState(null);

  useEffect(() => {
    if (order && order.orderId) {
      loadTracking();
    }
  }, [order]);

  const loadTracking = async () => {
    setLoading(true);
    try {
      const res = await api.getShipmentTracking(order.orderId);
      if (res.ok) {
        setShipmentData(res.data);
      }
    } catch (err) {
      console.error("Error loading shipment tracking:", err);
    } finally {
      setLoading(false);
    }
  };

  const stages = [
    { key: 'LABEL_CREATED', label: 'Order Placed' },
    { key: 'PACKED', label: 'Packed' },
    { key: 'SHIPPED', label: 'In Transit' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' }
  ];

  const currentStatus = shipmentData?.shipment?.status || order?.status || 'LABEL_CREATED';

  const getStageIndex = (st) => {
    const lower = st.toLowerCase();
    if (lower.includes('delivered')) return 4;
    if (lower.includes('out for delivery')) return 3;
    if (lower.includes('shipped') || lower.includes('transit')) return 2;
    if (lower.includes('packed') || lower.includes('ready')) return 1;
    return 0;
  };

  const activeIdx = getStageIndex(currentStatus);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-amber-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900 to-amber-800 text-amber-50 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-serif font-bold flex items-center gap-2">
              <Truck className="w-6 h-6 text-amber-400" /> Live Shipment Tracking
            </h2>
            <p className="text-amber-200/80 text-xs mt-1">Order #{order.orderId}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-white/10 text-amber-200 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-amber-800 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Courier info card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-amber-50/60 rounded-xl p-4 border border-amber-200/60">
                <div>
                  <span className="text-xs text-amber-800/70 font-semibold block uppercase">Courier</span>
                  <span className="font-semibold text-amber-950">{shipmentData?.shipment?.courierName || order.courierName || 'Express Logistics'}</span>
                </div>
                <div>
                  <span className="text-xs text-amber-800/70 font-semibold block uppercase">Tracking No</span>
                  <span className="font-mono text-sm font-bold text-amber-900">{shipmentData?.shipment?.trackingNumber || order.trackingNumber || 'TRK-PENDING'}</span>
                </div>
                <div>
                  <span className="text-xs text-amber-800/70 font-semibold block uppercase">Est. Delivery</span>
                  <span className="font-semibold text-amber-950 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-amber-700" />
                    {shipmentData?.shipment?.estimatedDelivery ? new Date(shipmentData.shipment.estimatedDelivery).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '3-5 Business Days'}
                  </span>
                </div>
              </div>

              {/* Progress Stepper */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-4">Shipment Progress</h3>
                <div className="flex justify-between items-center relative">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0" />
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-amber-800 -translate-y-1/2 z-0 transition-all duration-500" 
                    style={{ width: `${(activeIdx / (stages.length - 1)) * 100}%` }}
                  />

                  {stages.map((st, i) => {
                    const isDone = i <= activeIdx;
                    return (
                      <div key={st.key} className="flex flex-col items-center relative z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isDone ? 'bg-amber-900 text-amber-100 ring-4 ring-amber-100' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {isDone ? <CheckCircle className="w-4 h-4 text-amber-300" /> : i + 1}
                        </div>
                        <span className={`text-[10px] mt-2 font-medium text-center ${isDone ? 'text-amber-950 font-bold' : 'text-gray-400'}`}>
                          {st.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timeline Checkpoints */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-800" /> Activity Log
                </h3>

                <div className="space-y-4 border-l-2 border-amber-200 ml-3 pl-4">
                  {shipmentData?.tracking && shipmentData.tracking.length > 0 ? (
                    shipmentData.tracking.map((item, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-amber-800 border-2 border-white" />
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-amber-950">{item.stage}</p>
                            <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-amber-700" /> {item.location}
                            </p>
                            {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(item.timestamp).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500 italic">
                      Shipment details logged and ready for dispatch.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t flex justify-end">
          <button 
            onClick={onClose} 
            className="px-5 py-2 bg-amber-900 text-amber-50 rounded-lg text-sm font-semibold hover:bg-amber-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
