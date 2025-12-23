import React, { useEffect, useState } from "react";
import API from "../api";
import { useToast } from "../components/ToastProvider";

export default function Admin() {
  const { show } = useToast();
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);

  const emptyForm = {
    title: "",
    description: "",
    price: "",
    image: "/images/balloons.jpeg",
    category: "decor",
    stock: 100,
  };

  const [form, setForm] = useState(emptyForm);

  // ---------------- FETCH PRODUCTS ----------------
  const fetchProducts = async () => {
    try {
      const r = await API.get("/admin/products", {
        headers: { Authorization: "Bearer " + token },
      });
      setProducts(r.data);
    } catch (e) {
      console.error(e);
      show("Failed to load products", { type: "error" });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ---------------- ADD / UPDATE ----------------
  const submit = async () => {
    try {
      if (editing) {
        await API.put(`/admin/products/${editing._id}`, form, {
          headers: { Authorization: "Bearer " + token },
        });
        show("Product updated successfully", { type: "success" });
      } else {
        await API.post("/admin/products", form, {
          headers: { Authorization: "Bearer " + token },
        });
        show("Product created successfully", { type: "success" });
      }
      setForm(emptyForm);
      setEditing(null);
      fetchProducts();
    } catch (e) {
      show(e.response?.data?.message || "Error saving product", {
        type: "error",
      });
    }
  };

  // ---------------- EDIT ----------------
  const editProduct = (p) => {
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description,
      price: p.price,
      image: p.image,
      category: p.category,
      stock: p.stock,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---------------- DELETE ----------------
  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await API.delete(`/admin/products/${id}`, {
        headers: { Authorization: "Bearer " + token },
      });
      show("Product deleted", { type: "success" });
      fetchProducts();
    } catch {
      show("Delete failed", { type: "error" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* ---------------- FORM CARD ---------------- */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-10">
        <h2 className="text-2xl font-bold mb-4">
          {editing ? "Edit Product" : "Add New Product"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="border rounded-lg p-3"
            placeholder="Product Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <input
            className="border rounded-lg p-3"
            placeholder="Price"
            type="number"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: Number(e.target.value) })
            }
          />

          <input
            className="border rounded-lg p-3"
            placeholder="Category (cake, bouquet, decor)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />

          <input
            className="border rounded-lg p-3"
            placeholder="Image URL"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />

          <input
            className="border rounded-lg p-3"
            placeholder="Stock"
            type="number"
            value={form.stock}
            onChange={(e) =>
              setForm({ ...form, stock: Number(e.target.value) })
            }
          />

          <textarea
            className="border rounded-lg p-3 md:col-span-2"
            placeholder="Product Description"
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={submit}
            className="bg-[#e6b84c] hover:bg-[#d9a93a] text-black px-6 py-2 rounded-full font-semibold"
          >
            {editing ? "Update Product" : "Create Product"}
          </button>

          <button
            onClick={() => {
              setEditing(null);
              setForm(emptyForm);
            }}
            className="border px-6 py-2 rounded-full"
          >
            Reset
          </button>
        </div>
      </div>

      {/* ---------------- PRODUCTS LIST ---------------- */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">All Products</h3>

        {products.length === 0 && (
          <div className="text-gray-500">No products found.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p) => (
            <div
              key={p._id}
              className="flex gap-4 items-center border rounded-xl p-4 hover:shadow transition"
            >
              <img
                src={p.image}
                alt={p.title}
                className="w-24 h-24 object-contain rounded"
              />

              <div className="flex-1">
                <div className="font-semibold">{p.title}</div>
                <div className="text-sm text-gray-500">
                  ₹{p.price} · {p.category}
                </div>
                <div className="text-xs text-gray-400">
                  Stock: {p.stock}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => editProduct(p)}
                  className="px-4 py-1 bg-yellow-300 rounded-full text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProduct(p._id)}
                  className="px-4 py-1 bg-red-500 text-white rounded-full text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
