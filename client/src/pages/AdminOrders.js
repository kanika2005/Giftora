import React, { useEffect, useState } from "react";
import API from "../api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const r = await API.get("/admin/orders", {
        headers: { Authorization: "Bearer " + token },
      });
      setOrders(r.data);
    } catch (e) {
      console.error(e);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(
        `/admin/orders/${id}`,
        { status },
        { headers: { Authorization: "Bearer " + token } }
      );
      fetchOrders();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">📦 All Orders</h2>

      {orders.length === 0 && (
        <div className="bg-white rounded-xl p-6 text-gray-500 shadow">
          No orders yet.
        </div>
      )}

      <div className="grid gap-5">
        {orders.map((o) => (
          <div
            key={o._id}
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
          >
            {/* ---------- HEADER ---------- */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <div className="font-semibold text-lg">
                  Order #{o._id.slice(-6)}
                </div>
                <div className="text-sm text-gray-500">
                  User: {o.user?.email || "Guest"}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-bold text-gray-800">
                  ₹{o.totalAmount.toFixed(0)}
                </div>
                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium
                    ${
                      o.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : o.status === "Shipped"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                >
                  {o.status}
                </span>
              </div>
            </div>

            {/* ---------- ITEMS ---------- */}
            <div className="mt-4">
              <div className="font-medium mb-2">🛍 Items</div>
              <ul className="space-y-1 text-sm text-gray-700">
                {o.items.map((it, idx) => (
                  <li key={idx}>
                    • {it.name} × {it.qty}
                  </li>
                ))}
              </ul>
            </div>

            {/* ---------- MESSAGE ---------- */}
            {o.message && (
              <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                <div className="text-sm">
                  💌 <strong>Gift Message:</strong> {o.message}
                </div>
              </div>
            )}

            {/* ---------- DELIVERY ---------- */}
            {o.deliveryDate && (
              <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-3 rounded text-sm">
                <strong>🚚 Delivery:</strong>{" "}
                {new Date(o.deliveryDate).toLocaleDateString()}{" "}
                <span className="capitalize">
                  ({o.deliveryTimeSlot?.replace("-", " ")})
                </span>
                {o.deliveryType !== "standard" && (
                  <span className="ml-2 inline-block bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs">
                    {o.deliveryType === "same-day"
                      ? "Same-day"
                      : "Midnight"}{" "}
                    (+₹{o.deliveryCharges || 0})
                  </span>
                )}
              </div>
            )}

            {/* ---------- ACTIONS ---------- */}
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => updateStatus(o._id, "Shipped")}
                className="px-4 py-1.5 bg-yellow-300 hover:bg-yellow-400 rounded-full text-sm font-medium"
              >
                Mark Shipped
              </button>

              <button
                onClick={() => updateStatus(o._id, "Delivered")}
                className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm font-medium"
              >
                Mark Delivered
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
