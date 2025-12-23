import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider";
import { useUser } from "../context/UserContext";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { show } = useToast();
  const { login } = useUser();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const r = await API.post("/auth/signup", { name, email, password });
      localStorage.setItem("token", r.data.token);
      login(r.data.user);
      navigate("/");
    } catch (e) {
      const data = e.response?.data;
      show(data?.message || "Signup failed", { type: "error" });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{
        backgroundImage: "url('https://i.pinimg.com/1200x/0a/95/65/0a95650364a0bcc3ca1dc06aa524d24f.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* ---------- OVERLAY ---------- */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* ---------- CARD ---------- */}
      <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 z-10">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-wide">
            Giftora <span className="text-pink-500">🎁</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create your account & start gifting joy
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-4">
          <input
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-300"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-300"
            placeholder="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-300"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-[#e6b84c] hover:bg-[#d9a93a] text-gray-900 font-semibold transition"
          >
            Create Account
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          Already have an account?{" "}
          <span
            className="text-pink-500 font-medium cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </div>
      </div>
    </div>
  );
}
