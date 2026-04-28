import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  Truck,
  BarChart3,
  Receipt,
  ArrowRight,
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type SystemRole = "dispatch" | "analysis" | "owner" | null;

export default function BackendGatewayPage() {
  const [selectedRole, setSelectedRole] = useState<SystemRole>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { loginAdmin, user, resetPassword: resetPasswordFn } = useAuth();

  const [showResetForm, setShowResetForm] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Check for existing sessions and redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.forcePasswordReset) {
        setShowResetForm(true);
        return;
      }

      if (user.role === "dispatch") {
        navigate("/dispatch/dashboard");
      } else if (["owner", "analysis"].includes(user.role)) {
        navigate(`/${user.role}/dashboard`);
      } else if (user.role === "super_admin" || user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "customer") {
        navigate("/account");
      }
    }
  }, [user, navigate]);

  const handleBackendLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await loginAdmin(username, password);
      // Explicit redirect after successful login to ensure it happens immediately
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user.role === "dispatch") {
          navigate("/dispatch/dashboard");
        } else if (["owner", "analysis"].includes(data.user.role)) {
          navigate(`/${data.user.role}/dashboard`);
        } else if (
          data.user.role === "super_admin" ||
          data.user.role === "admin"
        ) {
          navigate("/admin/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.message || `Invalid ${selectedRole} ID or Password`);
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await resetPasswordFn(user?.email || username, resetCode, newPassword);
      alert("Password updated successfully. Please login again.");
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
      setIsLoading(false);
    }
  };

  const handleRequestCode = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/recover-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email || username }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Verification code sent to your email.");
      }
    } catch (err) {
      console.error("Failed to request code", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceholderLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(
        `${selectedRole?.toUpperCase()} portal is currently under development. Access restricted.`,
      );
    }, 1000);
  };

  const systems = [
    {
      id: "dispatch",
      title: "Dispatch",
      description:
        "Manage order verification, packing, shipment, delivery, and tracking",
      icon: Truck,
      color: "bg-zinc-900",
    },
    {
      id: "analysis",
      title: "Analysis",
      description: "View business insights, orders, revenue, and reports",
      icon: BarChart3,
      color: "bg-zinc-700",
    },
    {
      id: "owner",
      title: "Owner",
      description: "High-level business overview and strategic controls",
      icon: Shield,
      color: "bg-black",
    },
  ];

  const resetForm = () => {
    setSelectedRole(null);
    setUsername("");
    setPassword("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-6xl">
        <AnimatePresence mode="wait">
          {!selectedRole ? (
            <motion.div
              key="gateway"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-xl mb-6">
                  <Lock size={24} />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-black tracking-tight mb-4 uppercase">
                  Luxardo Backend
                </h1>
                <p className="text-gray-500 font-medium text-lg max-w-md mx-auto">
                  Secure operational access for internal teams
                </p>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {systems.map((system, idx) => (
                  <motion.div
                    key={system.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                  >
                    <button
                      onClick={() => setSelectedRole(system.id as SystemRole)}
                      className="group block w-full text-left h-full bg-white border border-gray-100 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:border-black transition-all duration-500"
                    >
                      <div
                        className={`w-12 h-12 ${system.color} text-white rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}
                      >
                        <system.icon size={24} />
                      </div>

                      <h3 className="text-xl font-bold text-black mb-4 uppercase tracking-tight">
                        {system.title}
                      </h3>

                      <p className="text-gray-500 text-sm leading-relaxed mb-8 min-h-[60px]">
                        {system.description}
                      </p>

                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black group-hover:gap-4 transition-all duration-300">
                        <span>Access Portal</span>
                        <ArrowRight size={14} />
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : showResetForm ? (
            <motion.div
              key="reset"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md mx-auto"
            >
              <div className="bg-white border border-gray-100 p-10 rounded-3xl shadow-2xl shadow-black/5">
                <div className="flex flex-col items-center mb-10">
                  <div className="w-16 h-16 bg-red-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Lock size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-black uppercase tracking-tight mb-2 text-center">
                    Reset Password
                  </h2>
                  <p className="text-gray-400 text-sm font-medium uppercase tracking-widest text-center">
                    Administrator has requested a password update
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-4 rounded-xl mb-6 flex items-center gap-3">
                    <ShieldCheck size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Verification Code
                    </label>
                    <div className="relative">
                      <ShieldCheck
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type="text"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
                        placeholder="Enter code"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleRequestCode}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-black uppercase tracking-widest hover:underline"
                      >
                        Request Code
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-5 bg-black text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-800 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck size={14} />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md mx-auto"
            >
              <button
                onClick={resetForm}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors mb-8"
              >
                <ArrowLeft size={14} />
                <span>Back to Gateway</span>
              </button>

              <div className="bg-white border border-gray-100 p-10 rounded-3xl shadow-2xl shadow-black/5">
                <div className="flex flex-col items-center mb-10">
                  <div
                    className={`w-16 h-16 ${systems.find((s) => s.id === selectedRole)?.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                  >
                    {React.createElement(
                      systems.find((s) => s.id === selectedRole)?.icon || Lock,
                      { size: 32 },
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-black uppercase tracking-tight mb-2">
                    {selectedRole} Portal
                  </h2>
                  <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">
                    Secure Access Required
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-4 rounded-xl mb-6 flex items-center gap-3">
                    <ShieldCheck size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleBackendLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      {selectedRole === "dispatch" ? "Dispatch ID" : "Username"}
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
                        placeholder={`Enter ${selectedRole} ID`}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-5 bg-black text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-800 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lock size={14} />
                        <span>Authenticate</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-10 pt-8 border-t border-gray-50 flex items-center justify-center gap-4">
                  <ShieldCheck size={16} className="text-gray-300" />
                  <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                    End-to-End Encrypted Session
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-20 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">
            Luxardo Internal Systems &copy; {new Date().getFullYear()}
          </p>
          <div className="flex justify-center gap-6 mt-6">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> System
              Online
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <Shield size={10} /> Encrypted Access
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
