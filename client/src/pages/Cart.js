import React, { useEffect, useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';

export default function Cart() {
  const [cart, setCart] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      API.get('/cart', {
        headers: { Authorization: 'Bearer ' + token },
      })
        .then((r) => setCart(r.data))
        .catch((e) => {
          if (e.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          } else {
            console.error(e);
          }
        });
    }
  }, [token, navigate]);

  const updateQty = async (productId, qty) => {
    try {
      await API.post(
        '/cart/add',
        { productId, qty },
        { headers: { Authorization: 'Bearer ' + token } }
      );
      const r = await API.get('/cart', {
        headers: { Authorization: 'Bearer ' + token },
      });
      setCart(r.data);
    } catch (e) {
      if (e.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        console.error(e);
      }
    }
  };

  if (!token)
    return (
      <div className="cart-page">
        <div className="cart-card text-center">
          <h2 className="text-xl font-semibold mb-2">
            Please login to view your cart
          </h2>
        </div>
      </div>
    );

  if (!cart)
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={48} />
      </div>
    );

  const items = cart.items.filter((i) => i && i.product);
  const subtotal = items.reduce(
    (sum, it) => sum + it.product.price * it.qty,
    0
  );

  // Calculate gift options costs
  const giftOptionsTotal = items.reduce((sum, it) => {
    let itemGiftCost = 0;
    if (it.giftWrapping && it.product.giftOptions?.wrappingPrice) {
      itemGiftCost += it.product.giftOptions.wrappingPrice;
    }
    if (it.personalization?.enabled && it.product.giftOptions?.personalizationPrice) {
      itemGiftCost += it.product.giftOptions.personalizationPrice;
    }
    return sum + (itemGiftCost * it.qty);
  }, 0);

  const total = subtotal + giftOptionsTotal;

  return (
    <div className="cart-page">
      <div className="cart-card">
        <h2 className="text-2xl font-semibold mb-6">Your Cart</h2>

        {/* EMPTY CART */}
        {items.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-2xl font-semibold mb-2">
              Your cart feels lonely 🎁
            </h3>
            <p className="text-gray-600 mb-6">
              Add something special to make someone smile.
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-gold px-6 py-3 rounded-full"
            >
              Browse Gifts
            </button>
          </div>
        )}

        {/* CART ITEMS */}
        {items.length > 0 && (
          <>
            <ul>
              {items.map((it) => (
                <li
                  key={it.product._id}
                  className="flex items-center gap-6 py-4 border-b last:border-b-0"
                >
                  <img
                    src={it.product.image}
                    alt={it.product.title}
                    className="w-24 h-24 rounded-xl object-cover bg-gray-50"
                  />

                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">
                      {it.product.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      ₹{(it.product.price || 0).toFixed(0)}
                    </p>
                    
                    {/* Gift options display */}
                    {(it.giftWrapping || it.personalization?.enabled) && (
                      <div className="mt-2 text-xs text-gray-600 space-y-1">
                        {it.giftWrapping && (
                          <div className="flex items-center gap-1">
                            <span>🎁 Gift Wrapping</span>
                            <span className="text-pink-600">(+₹{it.product.giftOptions?.wrappingPrice || 5})</span>
                          </div>
                        )}
                        {it.personalization?.enabled && (
                          <div className="flex items-center gap-1">
                            <span>✨ {it.personalization.type === 'engraving' ? 'Engraving' : 'Personalization'}</span>
                            <span className="text-pink-600">(+₹{it.product.giftOptions?.personalizationPrice || 10})</span>
                          </div>
                        )}
                        {it.personalization?.text && (
                          <div className="italic text-gray-500 pl-4">
                            "{it.personalization.text.substring(0, 50)}{it.personalization.text.length > 50 ? '...' : ''}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <input
                    type="number"
                    min="1"
                    className="border rounded-lg px-3 py-2 w-20 text-center"
                    value={it.qty}
                    onChange={(e) =>
                      updateQty(it.product._id, Number(e.target.value))
                    }
                  />
                </li>
              ))}
            </ul>

            {/* SUBTOTAL */}
            <div className="mt-10 border-t pt-6">
              <div className="flex justify-between text-lg mb-2">
                <span>Items Subtotal:</span>
                <span>₹{subtotal.toFixed(0)}</span>
              </div>
              {giftOptionsTotal > 0 && (
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Gift Options:</span>
                  <span>₹{giftOptionsTotal.toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xl font-semibold mb-4">
                <span>Total:</span>
                <span>₹{total.toFixed(0)}</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                💌 Add a personalized gift message at checkout
              </p>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full btn-gold px-6 py-3 rounded-full text-lg"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
