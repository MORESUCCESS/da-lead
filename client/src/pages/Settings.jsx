import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import {
  User,
  Crown,
  Bell,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const plans = {
  free: {
    label: "Free Plan",
    color: "bg-gray-100 text-gray-700",
    features: [
      "Up to 50 leads",
      "10 AI analyses/month",
      "10 message drafts/month",
    ],
  },
  pro: {
    label: "Pro Plan",
    color: "bg-primary-50 text-primary",
    features: [
      "Unlimited leads",
      "Unlimited AI analyses",
      "Unlimited messages",
      "CSV import",
      "Priority support",
    ],
  },
  enterprise: {
    label: "Enterprise",
    color: "bg-amber-50 text-amber-700",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Custom integrations",
      "Dedicated account manager",
    ],
  },
};

export default function Settings() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    freelanceCategory: "",
    location: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    api
      .get("/users")
      .then((res) => {
        setProfile(res.data.user);
        setForm({
          name: res.data.user.name || "",
          bio: res.data.user.bio || "",
          freelanceCategory: res.data.user.freelanceCategory || "",
          location: res.data.user.location || "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError("");
    try {
      const res = await api.put("/users", form);
      setProfile(res.data.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const plan = profile?.plan || "free";
  const planInfo = plans[plan] || plans.free;

  // handle avatar change
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setAvatarUploading(true);
    try {
      const res = await api.post("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile((prev) => ({ ...prev, avatar: res.data.avatar }));
    } catch {
      setError("Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#e0e0e0]">Settings</h1>
        <p className="text-[#a0a0a0] mt-1">
          Manage your account and preferences.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Form */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-5 order-2">
          {success && (
            <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-3 rounded-xl">
              <CheckCircle size={16} /> Profile updated successfully!
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="card p-6 bg-[#1e1e1e] border-gray-800">
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-800">
              <User size={18} className="text-gray-500" />
              <h2 className="font-bold text-[#e0e0e0]">Profile Information</h2>
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#e0e0e0] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="input-field border-gray-800 bg-[#121212] text-[#e0e0e0]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#e0e0e0] mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="input-field border-gray-800 bg-[#121212] text-[#6A6A6A] cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-[#e0e0e0] mb-1.5">
                    Freelance Category
                  </label>
                  <input
                    type="text"
                    value={form.freelanceCategory}
                    onChange={(e) =>
                      setForm({ ...form, freelanceCategory: e.target.value })
                    }
                    placeholder="e.g. Web Designer, Copywriter, Social Media Manager"
                    className="input-field border-gray-800 bg-[#121212] text-[#e0e0e0]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#e0e0e0] mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    placeholder="e.g. Lagos, London, New York"
                    className="input-field border-gray-800 bg-[#121212] text-[#e0e0e0]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#e0e0e0] mb-1.5">
                  Bio / Context for AI
                  <span className="text-[#a0a0a0] font-normal ml-1.5 text-xs">
                    This helps our AI write better pitches by understanding who
                    you are.
                  </span>
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  placeholder="I am a specialized web developer focusing on React and conversion optimization..."
                  className="input-field resize-none border-gray-800 bg-[#121212] text-[#e0e0e0]"
                />
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-gray-800">
              <button
                type="submit"
                disabled={saving || loading}
                className="btn-primary bg-[#522398] text-sm"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>

        {/* Right: Plan + Prefs */}
        <div className="space-y-5">
          {/* Profile Picture */}
          <div className="order-1 relative card p-5 bg-[#1e1e1e] border-1 border-gray-800 overflow-hidden w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-[#522386] to-[#522386]/40 w-full h-[50%] z-0"></div>

            {/* Display user profile picture */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={
                    profile?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || "U")}&background=522398&color=fff`
                  }
                  alt="Avatar"
                  className="rounded-full object-cover mt-5"
                />
                {avatarUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">...</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center">
                <label className="btn-primary bg-[#522398] text-xs px-4 py-2 cursor-pointer">
                  {avatarUploading ? "Uploading..." : "Change Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-[#a0a0a0] mt-4">
                  JPG, PNG or WebP. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="card p-5 hidden">
            <div className="flex items-center gap-2 mb-4">
              <Crown size={16} className="text-amber-500" />
              <h3 className="font-bold text-gray-900">Subscription Plan</h3>
            </div>
            <span
              className={`inline-block text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-lg mb-4 ${planInfo.color}`}
            >
              {planInfo.label}
            </span>
            <ul className="space-y-2 mb-5">
              {planInfo.features.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <CheckCircle size={13} className="text-success shrink-0" />{" "}
                  {f}
                </li>
              ))}
            </ul>
            {plan === "free" && (
              <button className="btn-accent w-full text-sm flex items-center justify-center gap-2">
                <Crown size={15} /> Upgrate to pro(coming soon!)
              </button>
            )}
          </div>

          {/* Preferences */}
          <div className="card p-5 hidden">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={16} className="text-gray-500" />
              <h3 className="font-bold text-gray-900">Preferences</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Email Notifications
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-primary transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Follow-up Reminders
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-primary transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </label>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card p-5 border-red-100 hidden">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} className="text-red-500" />
              <h3 className="font-bold text-gray-900">Danger Zone</h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              These actions are permanent and cannot be undone.
            </p>
            <button className="text-sm font-semibold text-red-500 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors w-full">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
