"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, MapPin, CreditCard, Truck, ArrowLeft, CheckCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { createOrder } from "@/lib/api/orderApi";
import { processCodPayment } from "@/lib/api/paymentApi";
import { toast } from "sonner";

const PAYMENT_METHODS = [
  { id: "cod",    label: "Cash on Delivery",  icon: Truck,       description: "Pay when your order arrives" },
  { id: "stripe", label: "Credit / Debit Card", icon: CreditCard, description: "Secure online payment via Stripe" },
];

const EMPTY_ADDRESS = {
  name: "", address_line: "", city: "", state: "", postal_code: "", country: "India", phone: "",
};

export default function CheckoutPage() {
  const router              = useRouter();
  const { data: session }   = useSession();
  const { cart, clear }     = useCart();
  const userId              = session?.user?.id ?? null;

  const [address, setAddress]       = useState(EMPTY_ADDRESS);
  const [paymentMethod, setPayment] = useState("cod");
  const [notes, setNotes]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [errors, setErrors]         = useState({});

  const updateAddress = (field, value) => setAddress((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    const e = {};
    if (!address.name)         e.name         = "Full name is required.";
    if (!address.address_line) e.address_line = "Address is required.";
    if (!address.city)         e.city         = "City is required.";
    if (!address.postal_code)  e.postal_code  = "Postal code is required.";
    if (!address.country)      e.country      = "Country is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    if (cart.items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create the order
      const orderRes = await createOrder({
        user_id: userId,
        items: cart.items.map((i) => ({
          product_id:    i.product_id,
          product_name:  i.product_name,
          product_image: i.image_url ?? null,
          price:         parseFloat(i.price),
          quantity:      i.quantity,
        })),
        shipping_address: address,
        payment_method:   paymentMethod,
        notes:            notes || undefined,
      }, userId);

      const orderId = orderRes.data?.id;
      const total   = orderRes.data?.total_amount;

      // 2. Handle payment
      if (paymentMethod === "cod") {
        await processCodPayment(orderId, total, userId);
        await clear();
        toast.success("Order placed successfully!");
        router.push(`/orders/${orderId}`);
      } else if (paymentMethod === "stripe") {
        // Stripe: redirect to payment page with order info
        // (Stripe Elements integration would go here in a real app)
        toast.info("Stripe checkout coming soon! Redirecting to your order...");
        await clear();
        router.push(`/orders/${orderId}`);
      }

    } catch (err) {
      const msg = err?.response?.data?.message ?? "Failed to place order. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0 && !loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-20 h-20 mx-auto text-muted-foreground opacity-30 mb-6" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add items to your cart before checking out.</p>
        <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
          Browse Products
        </Link>
      </div>
    );
  }

  const Field = ({ label, field, type = "text", placeholder = "" }) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={address[field]}
        onChange={(e) => updateAddress(field, e.target.value)}
        className={`w-full px-3 py-2.5 rounded-xl border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors ${
          errors[field] ? "border-red-400" : "border-border"
        }`}
      />
      {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link href="/cart" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Forms */}
        <div className="lg:col-span-2 space-y-8">

          {/* Shipping Address */}
          <Section title="Shipping Address" icon={<MapPin className="w-4 h-4" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><Field label="Full Name" field="name" placeholder="John Doe" /></div>
              <div className="sm:col-span-2"><Field label="Address" field="address_line" placeholder="123 Main Street, Apt 4B" /></div>
              <Field label="City" field="city" placeholder="Mumbai" />
              <Field label="State / Province" field="state" placeholder="Maharashtra" />
              <Field label="Postal Code" field="postal_code" placeholder="400001" />
              <Field label="Country" field="country" placeholder="India" />
              <div className="sm:col-span-2"><Field label="Phone (optional)" field="phone" type="tel" placeholder="+91 9876543210" /></div>
            </div>
          </Section>

          {/* Payment Method */}
          <Section title="Payment Method" icon={<CreditCard className="w-4 h-4" />}>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((m) => {
                const Icon = m.icon;
                const active = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPayment(m.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      active ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{m.label}</p>
                      <p className="text-sm text-muted-foreground">{m.description}</p>
                    </div>
                    {active && <CheckCircle className="w-5 h-5 text-primary ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Notes */}
          <Section title="Order Notes (Optional)" icon={<ShoppingBag className="w-4 h-4" />}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions for delivery..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </Section>
        </div>

        {/* Right — Order Summary */}
        <aside>
          <div className="sticky top-6 rounded-2xl border border-border bg-card p-6 space-y-5">
            <h2 className="font-bold text-foreground text-lg">Order Summary</h2>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3 text-sm">
                  <div className="w-10 h-10 rounded-lg bg-muted shrink-0 overflow-hidden">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-base">📦</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground line-clamp-1">{item.product_name}</p>
                    <p className="text-muted-foreground text-xs">×{item.quantity}</p>
                  </div>
                  <p className="font-medium shrink-0">${item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal ({cart.total_items} items)</span>
                <span>${parseFloat(cart.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span className="text-green-500">Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                <span>Total</span>
                <span>${parseFloat(cart.subtotal).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Placing Order...</>
              ) : (
                <>Place Order · ${parseFloat(cart.subtotal).toFixed(2)}</>
              )}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
        {icon} {title}
      </h2>
      {children}
    </div>
  );
}
