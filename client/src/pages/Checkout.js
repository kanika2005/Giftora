import React, { useState, useEffect, useRef } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider";
import Spinner from "../components/Spinner";

export default function Checkout() {
  const navigate = useNavigate();
  const { show } = useToast();
  const token = localStorage.getItem("token");

  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [shipping, setShipping] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState("");
  const [deliveryCharges, setDeliveryCharges] = useState(0);

  const [localMessage, setLocalMessage] = useState("");
  const MESSAGE_LIMIT = 250;

  const TEMPLATES = {
    Birthday: "Happy Birthday! 🎂",
    Anniversary: "Happy Anniversary 💕",
    Romantic: "With all my love ❤️",
    ThankYou: "Thank you so much 🙏",
  };

  // ---------------- FETCH CART ----------------
  useEffect(() => {
    if (!token) return navigate("/login");

    API.get("/cart", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((r) => setCart(r.data))
      .catch(() => navigate("/login"));
  }, [token, navigate]);

  // ---------------- DELIVERY LOGIC ----------------
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!deliveryDate || !deliveryTimeSlot) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    if (deliveryDate === today) setDeliveryCharges(200);
    else if (deliveryDate === tomorrowStr && deliveryTimeSlot === "midnight")
      setDeliveryCharges(300);
    else setDeliveryCharges(0);
  }, [deliveryDate, deliveryTimeSlot, today]);

  if (!cart)
    return (
      <div className="flex justify-center py-20">
        <Spinner size={48} />
      </div>
    );

  const items = cart.items.filter((i) => i.product);
  const subtotal = items.reduce(
    (s, i) => s + i.product.price * i.qty,
    0
  );
  const total = subtotal + deliveryCharges;

  // ---------------- SUBMIT ORDER ----------------
  const submit = async (e) => {
    e.preventDefault();

    if (!deliveryDate || !deliveryTimeSlot) {
      show("Please select delivery date & time", { type: "error" });
      return;
    }

    try {
      setIsLoading(true);

      const r = await API.post(
        "/orders",
        {
          shipping,
          paymentMethod,
          message: localMessage,
          deliveryDate,
          deliveryTimeSlot,
        },
        { headers: { Authorization: "Bearer " + token } }
      );

      show("🎉 Order placed successfully!", { type: "success" });
      navigate("/orders");
    } catch {
      show("Order failed", { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="checkout-page">
      <div className="checkout-card">
        <h2 className="text-2xl font-bold mb-6">Checkout</h2>

        {/* ORDER SUMMARY */}
        <div className="bg-[#f8faf5] rounded-xl p-5 mb-8 border">
          <h3 className="font-semibold mb-3">Order Summary</h3>

          {items.map((it) => (
            <div key={it.product._id} className="flex justify-between text-sm mb-1">
              <span>{it.product.title} × {it.qty}</span>
              <span>₹{it.product.price * it.qty}</span>
            </div>
          ))}

          <div className="flex justify-between mt-3">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          {deliveryCharges > 0 && (
            <div className="flex justify-between text-orange-600">
              <span>Delivery</span>
              <span>+₹{deliveryCharges}</span>
            </div>
          )}

          <div className="flex justify-between font-bold mt-2 border-t pt-2">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={submit}>
          <h3 className="font-semibold mb-3">Shipping Details</h3>

          {["name", "address", "city", "postalCode", "phone"].map((field) => (
            <input
              key={field}
              className="w-full border rounded-lg p-3 mb-3"
              placeholder={field.replace(/([A-Z])/g, " $1")}
              required
              value={shipping[field]}
              onChange={(e) =>
                setShipping({ ...shipping, [field]: e.target.value })
              }
            />
          ))}

          {/* DELIVERY */}
          <h3 className="font-semibold mt-6 mb-3">Delivery</h3>

          <input
            type="date"
            min={today}
            className="w-full border rounded-lg p-3 mb-3"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3 mb-6">
            {["morning", "afternoon", "evening", "midnight"].map((slot) => (
              <label
                key={slot}
                className={`border rounded-xl p-3 cursor-pointer ${
                  deliveryTimeSlot === slot
                    ? "border-green-600 bg-green-50"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="slot"
                  value={slot}
                  className="mr-2"
                  checked={deliveryTimeSlot === slot}
                  onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                />
                {slot}
              </label>
            ))}
          </div>

          {/* MESSAGE */}
          <h3 className="font-semibold mb-2">Gift Message</h3>

          <div className="flex gap-2 mb-2 flex-wrap">
            {Object.keys(TEMPLATES).map((k) => (
              <button
                key={k}
                type="button"
                className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                onClick={() => setLocalMessage(TEMPLATES[k])}
              >
                {k}
              </button>
            ))}
          </div>

          <textarea
            className="w-full border rounded-lg p-3 mb-1"
            rows={3}
            maxLength={MESSAGE_LIMIT}
            value={localMessage}
            onChange={(e) => setLocalMessage(e.target.value)}
            placeholder="Write something special…"
          />
          <div className="text-xs text-gray-500 mb-6">
            {localMessage.length}/{MESSAGE_LIMIT}
          </div>

          {/* PAYMENT */}
          <h3 className="font-semibold mb-2">Payment</h3>

          <label className="flex items-center gap-2 mb-3">
            <input
              type="radio"
              checked={paymentMethod === "COD"}
              onChange={() => setPaymentMethod("COD")}
            />
            Cash on Delivery
          </label>

          <button
            disabled={isLoading}
            className="btn-gold w-full py-3 rounded-full text-lg"
          >
            {isLoading ? "Placing Order..." : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
