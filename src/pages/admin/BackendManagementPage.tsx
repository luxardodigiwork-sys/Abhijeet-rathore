import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Shield,
  UserPlus,
  Edit3,
  Trash2,
  Power,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Truck,
  Receipt,
  BarChart3,
  ShieldCheck,
  ArrowLeft,
  Key,
  Mail,
  Phone,
  Clock,
  ChevronRight,
  Save,
  Lock,
  Settings,
  User as UserIcon,
  AlertCircle,
  Search,
  History,
  LayoutTemplate,
  ShoppingBag,
  FileText,
  ImageIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { BackendUser, BackendPermissions } from "../../types";

import { ConfirmModal } from "../../components/admin/ConfirmModal";

type RoleType = "dispatch" | "owner" | "analysis" | "admin";

interface ActivityLog {
  id: number;
  user_id: number;
  admin_email: string;
  action: string;
  details: string;
  created_at: string;
  full_name: string;
  user_role: string;
}

const ROLE_TEMPLATES: Record<RoleType, BackendPermissions> = {
  owner: {
    dashboard: true,
    orders: true,
    products: true,
    collections: true,
    media: true,
    content: true,
    backend_management: true,
    settings: true,
    dispatch_actions: true,
    accounts_finance: true,
    analysis_reports: true,
    customer_details: true,
    export_data: true,
    tracking_controls: true,
    delivery_update_controls: true,
  },
  dispatch: {
    dashboard: true,
    orders: true,
    products: false,
    collections: false,
    media: false,
    content: false,
    backend_management: false,
    settings: false,
    dispatch_actions: true,
    accounts_finance: false,
    analysis_reports: false,
    customer_details: false,
    export_data: false,
    tracking_controls: true,
    delivery_update_controls: true,
  },
  analysis: {
    dashboard: true,
    orders: false,
    products: false,
    collections: false,
    media: false,
    content: false,
    backend_management: false,
    settings: false,
    dispatch_actions: false,
    accounts_finance: false,
    analysis_reports: true,
    customer_details: true,
    export_data: true,
    tracking_controls: false,
    delivery_update_controls: false,
  },
  admin: {
    dashboard: true,
    orders: true,
    products: true,
    collections: true,
    media: true,
    content: true,
    backend_management: true,
    settings: true,
    dispatch_actions: true,
    accounts_finance: true,
    analysis_reports: true,
    customer_details: true,
    export_data: true,
    tracking_controls: true,
    delivery_update_controls: true,
  },
};

export default function BackendManagementPage() {
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [rolePermissions, setRolePermissions] = useState<
    Record<string, BackendPermissions>
  >({});
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "logs" | "permissions">(
    "users",
  );

  // Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<BackendUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Form States
  const [userFormData, setUserFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "dispatch" as RoleType,
    status: "active" as "active" | "disabled",
  });

  const [passwordFormData, setPasswordFormData] = useState({
    newPassword: "",
    forceReset: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchLogs(selectedRole);
    }
  }, [selectedRole]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, permsRes] = await Promise.all([
        fetch("/api/backend-users"),
        fetch("/api/role-permissions"),
      ]);

      if (usersRes.ok && permsRes.ok) {
        const usersData = await usersRes.json();
        const permsData = await permsRes.json();

        // Map backend users to frontend format
        const mappedUsers = usersData.users.map((u: any) => ({
          id: u.id.toString(),
          fullName: u.full_name || u.email.split("@")[0],
          username: u.email,
          email: u.email,
          phone: u.phone,
          role: u.role,
          status: u.status,
          createdAt: u.created_at,
          lastLogin: u.last_login,
          createdBy: u.created_by,
          forcePasswordReset: !!u.force_password_reset,
        }));

        setUsers(mappedUsers);
        setRolePermissions(permsData.permissions);
      }
    } catch (err) {
      console.error("Failed to fetch backend management data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async (role?: string) => {
    try {
      const url = role
        ? `/api/activity-logs?role=${role}`
        : "/api/activity-logs";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to fetch logs", err);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role.toLowerCase().includes(searchQuery.toLowerCase());

      if (selectedRole) {
        return matchesSearch && u.role === selectedRole;
      }
      return matchesSearch;
    });
  }, [users, searchQuery, selectedRole]);

  const applyTemplate = async (role: RoleType) => {
    const template = ROLE_TEMPLATES[role];
    try {
      const res = await fetch(`/api/role-permissions/${role}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: template }),
      });

      if (res.ok) {
        setRolePermissions((prev) => ({
          ...prev,
          [role]: template,
        }));
        alert(`Template applied for ${role}`);
      }
    } catch (err) {
      console.error("Error applying template", err);
    }
  };

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.status === "active").length,
      disabled: users.filter((u) => u.status === "disabled").length,
      roles: Object.keys(rolePermissions).length,
    };
  }, [users, rolePermissions]);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingUser ? "PUT" : "POST";
      const url = editingUser
        ? `/api/backend-users/${editingUser.id}`
        : "/api/backend-users";

      const payload = {
        full_name: userFormData.fullName,
        email: userFormData.email,
        phone: userFormData.phone,
        role: userFormData.role,
        status: userFormData.status,
        ...(editingUser ? {} : { password: userFormData.password }),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchData();
        setIsUserModalOpen(false);
        setEditingUser(null);
        resetUserForm();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save user");
      }
    } catch (err) {
      console.error("Error saving user", err);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch(`/api/backend-users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: editingUser.role,
          status: editingUser.status,
          full_name: editingUser.fullName,
          phone: editingUser.phone,
          password: passwordFormData.newPassword,
          force_password_reset: passwordFormData.forceReset,
        }),
      });

      if (res.ok) {
        await fetchData();
        setIsPasswordModalOpen(false);
        setPasswordFormData({ newPassword: "", forceReset: false });
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update password");
      }
    } catch (err) {
      console.error("Error updating password", err);
    }
  };

  const toggleUserStatus = async (user: BackendUser) => {
    try {
      const res = await fetch(`/api/backend-users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: user.role,
          status: user.status === "active" ? "disabled" : "active",
          full_name: user.fullName,
          phone: user.phone,
        }),
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error("Error toggling status", err);
    }
  };

  const handleDeleteUser = (id: string) => {
    setUserToDelete(id);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch(`/api/backend-users/${userToDelete}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error("Error deleting user", err);
    } finally {
      setUserToDelete(null);
    }
  };

  const handlePermissionToggle = async (
    role: string,
    key: keyof BackendPermissions,
  ) => {
    const currentPerms = rolePermissions[role];
    const newPerms = { ...currentPerms, [key]: !currentPerms[key] };

    try {
      const res = await fetch(`/api/role-permissions/${role}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: newPerms }),
      });

      if (res.ok) {
        setRolePermissions((prev) => ({
          ...prev,
          [role]: newPerms,
        }));
      }
    } catch (err) {
      console.error("Error updating permissions", err);
    }
  };

  const resetUserForm = () => {
    setUserFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      role: "dispatch",
      status: "active",
    });
  };

  const roles = [
    { id: "dispatch", title: "Dispatch", icon: Truck, color: "bg-zinc-900" },
    { id: "owner", title: "Owner", icon: Shield, color: "bg-black" },
    {
      id: "analysis",
      title: "Analysis",
      icon: BarChart3,
      color: "bg-zinc-700",
    },
  ];

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Link
              to="/admin"
              className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors mb-6 text-[10px] font-bold uppercase tracking-widest"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-black mb-2 tracking-tight uppercase">
              Backend Management
            </h1>
            <p className="text-gray-500 font-medium">
              Control users, passwords, and role-based page access.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/admin/dispatch"
              className="px-6 py-4 bg-white border border-gray-200 text-black font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm"
            >
              <Truck size={16} />
              <span>Dispatch Portal</span>
            </Link>
            <button
              onClick={() => {
                setEditingUser(null);
                resetUserForm();
                setIsUserModalOpen(true);
              }}
              className="px-6 py-4 bg-black text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-black/10"
            >
              <UserPlus size={16} />
              <span>Create Backend User</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              label: "Total Backend Users",
              value: stats.total,
              icon: Users,
              color: "text-black",
            },
            {
              label: "Active Users",
              value: stats.active,
              icon: CheckCircle2,
              color: "text-emerald-600",
            },
            {
              label: "Disabled Users",
              value: stats.disabled,
              icon: XCircle,
              color: "text-red-500",
            },
            {
              label: "Roles Managed",
              value: stats.roles,
              icon: ShieldCheck,
              color: "text-zinc-500",
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-gray-50 ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <span className="text-2xl font-bold text-black">
                  {stat.value}
                </span>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Default Credentials Info */}
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-12 flex items-start gap-3">
          <div className="p-2 bg-white rounded-xl text-amber-600 shadow-sm">
            <Shield size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-900 uppercase tracking-tight mb-1">
              Testing Credentials
            </p>
            <p className="text-xs text-amber-800 opacity-80 leading-relaxed">
              For testing purposes, each role has a default user seeded.
              <span className="font-bold ml-1">Password: 311001</span>.
              Usernames:{" "}
              <code className="bg-white/50 px-1 rounded">owner_311001</code>,{" "}
              <code className="bg-white/50 px-1 rounded">dispatch_311001</code>,
              etc.
            </p>
          </div>
        </div>

        {/* Role Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {roles.map((role, idx) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              onClick={() => {
                setSelectedRole(role.id as RoleType);
                setActiveTab("users");
              }}
              className={`group p-8 rounded-3xl border transition-all text-left relative overflow-hidden ${
                selectedRole === role.id
                  ? "border-black bg-black text-white shadow-2xl"
                  : "border-gray-100 bg-white hover:border-black"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${
                  selectedRole === role.id
                    ? "bg-white/10"
                    : `${role.color} text-white`
                }`}
              >
                <role.icon size={24} />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight mb-2">
                {role.title}
              </h3>
              <p
                className={`text-[10px] font-bold uppercase tracking-widest ${
                  selectedRole === role.id ? "text-white/60" : "text-gray-400"
                }`}
              >
                {users.filter((u) => u.role === role.id).length} Users •{" "}
                {
                  Object.values(rolePermissions[role.id] || {}).filter(Boolean)
                    .length
                }{" "}
                Permissions
              </p>
              {selectedRole === role.id && (
                <motion.div
                  layoutId="active-role"
                  className="absolute top-4 right-4"
                >
                  <ChevronRight size={20} className="text-white" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative max-w-2xl">
            <Search
              className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name, email, or role..."
              className="w-full pl-16 pr-8 py-6 bg-white border border-gray-100 rounded-[2rem] text-sm focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Management View */}
        <AnimatePresence mode="wait">
          {selectedRole && (
            <motion.div
              key={selectedRole}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Tabs */}
              <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-2xl w-fit">
                {[
                  { id: "users", label: "Users", icon: Users },
                  { id: "logs", label: "Activity Logs", icon: History },
                  {
                    id: "permissions",
                    label: "Permissions",
                    icon: ShieldCheck,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                      activeTab === tab.id
                        ? "bg-white text-black shadow-sm"
                        : "text-gray-400 hover:text-black"
                    }`}
                  >
                    <tab.icon size={14} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Role Stats */}
              {activeTab === "users" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      label: "Total Users",
                      value: users.filter((u) => u.role === selectedRole)
                        .length,
                      color: "text-black",
                    },
                    {
                      label: "Active",
                      value: users.filter(
                        (u) => u.role === selectedRole && u.status === "active",
                      ).length,
                      color: "text-emerald-600",
                    },
                    {
                      label: "Disabled",
                      value: users.filter(
                        (u) =>
                          u.role === selectedRole && u.status === "disabled",
                      ).length,
                      color: "text-red-500",
                    },
                    {
                      label: "Logins Today",
                      value: users.filter((u) => {
                        if (u.role !== selectedRole || !u.lastLogin)
                          return false;
                        const loginDate = new Date(u.lastLogin);
                        const today = new Date();
                        return (
                          loginDate.toDateString() === today.toDateString()
                        );
                      }).length,
                      color: "text-zinc-500",
                    },
                  ].map((stat, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm"
                    >
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        {stat.label}
                      </p>
                      <p className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                  {activeTab === "users" && (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold uppercase tracking-tight text-black">
                          {selectedRole} Users
                        </h2>
                      </div>

                      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                        <div className="max-h-[600px] overflow-auto scrollbar-hide">
                          <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-10 bg-white border-b border-gray-50">
                              <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  User
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  Status
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  Last Login
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {filteredUsers
                                .filter((u) => u.role === selectedRole)
                                .map((user) => (
                                  <tr
                                    key={user.id}
                                    className="group hover:bg-gray-50/50 transition-colors"
                                  >
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold uppercase text-xs">
                                          {user.fullName.charAt(0)}
                                        </div>
                                        <div>
                                          <div className="text-sm font-bold text-black flex items-center gap-2">
                                            {user.fullName}
                                            {user.forcePasswordReset && (
                                              <span
                                                className="p-1 bg-amber-50 text-amber-600 rounded"
                                                title="Force Password Reset Active"
                                              >
                                                <RefreshCw size={10} />
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-[10px] text-gray-400 font-medium flex items-center gap-2 mt-0.5">
                                            <Mail size={10} /> {user.email}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <button
                                        onClick={() => toggleUserStatus(user)}
                                        className={`flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-full transition-all ${
                                          user.status === "active"
                                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                            : "bg-red-50 text-red-600 hover:bg-red-100"
                                        }`}
                                      >
                                        {user.status === "active" ? (
                                          <CheckCircle2 size={10} />
                                        ) : (
                                          <XCircle size={10} />
                                        )}
                                        {user.status}
                                      </button>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-2">
                                        <Clock size={12} />
                                        {user.lastLogin
                                          ? new Date(
                                              user.lastLogin,
                                            ).toLocaleString()
                                          : "Never"}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => {
                                            setEditingUser(user);
                                            setUserFormData({
                                              fullName: user.fullName,
                                              email: user.email,
                                              phone: user.phone || "",
                                              password: "",
                                              role: user.role as RoleType,
                                              status: user.status,
                                            });
                                            setIsUserModalOpen(true);
                                          }}
                                          className="p-2 text-gray-400 hover:text-black hover:bg-white rounded-xl border border-transparent hover:border-gray-100 transition-all"
                                        >
                                          <Edit3 size={14} />
                                        </button>
                                        <button
                                          onClick={() => {
                                            setEditingUser(user);
                                            setPasswordFormData({
                                              newPassword: "",
                                              forceReset:
                                                user.forcePasswordReset ||
                                                false,
                                            });
                                            setIsPasswordModalOpen(true);
                                          }}
                                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-white rounded-xl border border-transparent hover:border-gray-100 transition-all"
                                        >
                                          <Key size={14} />
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteUser(user.id)
                                          }
                                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-xl border border-transparent hover:border-gray-100 transition-all"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "logs" && (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold uppercase tracking-tight text-black">
                          Activity Logs
                        </h2>
                      </div>
                      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                        <div className="max-h-[600px] overflow-auto scrollbar-hide">
                          <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-10 bg-white border-b border-gray-50">
                              <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  Admin
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  Action
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  Details
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  Time
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {logs.map((log) => (
                                <tr
                                  key={log.id}
                                  className="hover:bg-gray-50/50 transition-colors"
                                >
                                  <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-black">
                                      {log.admin_email}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span
                                      className={`text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                                        log.action.includes("login")
                                          ? "bg-blue-50 text-blue-600"
                                          : log.action.includes("create")
                                            ? "bg-emerald-50 text-emerald-600"
                                            : log.action.includes("delete")
                                              ? "bg-red-50 text-red-600"
                                              : "bg-gray-50 text-gray-600"
                                      }`}
                                    >
                                      {log.action}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-[10px] text-gray-500">
                                      {log.details || "-"}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-[10px] text-gray-400 font-medium">
                                      {new Date(
                                        log.created_at,
                                      ).toLocaleString()}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {logs.length === 0 && (
                                <tr>
                                  <td
                                    colSpan={4}
                                    className="px-6 py-12 text-center text-gray-400 text-xs font-medium"
                                  >
                                    No activity logs found for this role.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "permissions" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold uppercase tracking-tight text-black">
                          Role Permissions
                        </h2>
                        <button
                          onClick={() => applyTemplate(selectedRole!)}
                          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-[9px] font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all"
                        >
                          <LayoutTemplate size={14} />
                          Apply {selectedRole} Template
                        </button>
                      </div>

                      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            {
                              key: "dashboard",
                              label: "Dashboard",
                              icon: BarChart3,
                            },
                            {
                              key: "orders",
                              label: "Orders",
                              icon: ShoppingBag,
                            },
                            {
                              key: "dispatch_actions",
                              label: "Dispatch Actions",
                              icon: Truck,
                            },
                            {
                              key: "analysis_reports",
                              label: "Analysis/Reports",
                              icon: BarChart3,
                            },
                            {
                              key: "customer_details",
                              label: "Customer Details",
                              icon: Users,
                            },
                            {
                              key: "export_data",
                              label: "Export Data",
                              icon: Save,
                            },
                            {
                              key: "backend_management",
                              label: "Backend Management",
                              icon: Shield,
                            },
                            {
                              key: "tracking_controls",
                              label: "Tracking Controls",
                              icon: Truck,
                            },
                            {
                              key: "delivery_update_controls",
                              label: "Delivery Updates",
                              icon: CheckCircle2,
                            },
                          ].map((perm) => (
                            <button
                              key={perm.key}
                              onClick={() =>
                                handlePermissionToggle(
                                  selectedRole!,
                                  perm.key as keyof BackendPermissions,
                                )
                              }
                              className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                                rolePermissions[selectedRole!]?.[
                                  perm.key as keyof BackendPermissions
                                ]
                                  ? "border-black bg-black text-white"
                                  : "border-gray-100 bg-gray-50/50 text-gray-400 hover:border-gray-200"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <perm.icon size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                  {perm.label}
                                </span>
                              </div>
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                  rolePermissions[selectedRole!]?.[
                                    perm.key as keyof BackendPermissions
                                  ]
                                    ? "bg-white border-white text-black"
                                    : "bg-white border-gray-200"
                                }`}
                              >
                                {rolePermissions[selectedRole!]?.[
                                  perm.key as keyof BackendPermissions
                                ] && <CheckCircle2 size={12} />}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Role Info Sidebar */}
                <div className="space-y-6">
                  <div className="bg-black text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      {selectedRole === "dispatch" && <Truck size={120} />}
                      {selectedRole === "owner" && <Shield size={120} />}
                      {selectedRole === "analysis" && <BarChart3 size={120} />}
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold uppercase tracking-tight mb-4">
                        {selectedRole} Role
                      </h3>
                      <p className="text-white/60 text-xs leading-relaxed mb-8">
                        {selectedRole === "dispatch" &&
                          "Responsible for inventory tracking, order fulfillment, and logistics management."}
                        {selectedRole === "owner" &&
                          "Full system access including user management, financial oversight, and core settings."}
                        {selectedRole === "analysis" &&
                          "Focused on data visualization, sales performance, and market trend analysis."}
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                            Active Users
                          </span>
                          <span className="text-sm font-bold">
                            {
                              users.filter(
                                (u) =>
                                  u.role === selectedRole &&
                                  u.status === "active",
                              ).length
                            }
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                            Permissions
                          </span>
                          <span className="text-sm font-bold">
                            {
                              Object.values(
                                rolePermissions[selectedRole!] || {},
                              ).filter(Boolean).length
                            }{" "}
                            / 10
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
                    <h4 className="text-[10px] font-bold text-black uppercase tracking-widest mb-4">
                      Quick Actions
                    </h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setEditingUser(null);
                          resetUserForm();
                          setUserFormData((prev) => ({
                            ...prev,
                            role: selectedRole!,
                          }));
                          setIsUserModalOpen(true);
                        }}
                        className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-black hover:border-black transition-all flex items-center gap-3"
                      >
                        <UserPlus size={14} /> Add {selectedRole} User
                      </button>
                      <button
                        onClick={() => applyTemplate(selectedRole!)}
                        className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-black hover:border-black transition-all flex items-center gap-3"
                      >
                        <LayoutTemplate size={14} /> Reset Permissions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Modal */}
        <AnimatePresence>
          {isUserModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden"
              >
                <div className="p-10 border-b border-gray-50 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-black uppercase tracking-tight">
                      {editingUser ? "Edit User" : "Create User"}
                    </h2>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                      {editingUser
                        ? "Update account details"
                        : "Add new backend member"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsUserModalOpen(false)}
                    className="p-3 hover:bg-gray-50 rounded-2xl transition-colors"
                  >
                    <XCircle size={24} className="text-gray-300" />
                  </button>
                </div>

                <form onSubmit={handleSaveUser} className="p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                          size={16}
                        />
                        <input
                          type="text"
                          value={userFormData.fullName}
                          onChange={(e) =>
                            setUserFormData({
                              ...userFormData,
                              fullName: e.target.value,
                            })
                          }
                          className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
                          placeholder="e.g. Arjun Singh"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                          size={16}
                        />
                        <input
                          type="email"
                          value={userFormData.email}
                          onChange={(e) =>
                            setUserFormData({
                              ...userFormData,
                              email: e.target.value,
                            })
                          }
                          className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
                          placeholder="e.g. arjun@luxardo.in"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                        Phone (Optional)
                      </label>
                      <div className="relative">
                        <Phone
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                          size={16}
                        />
                        <input
                          type="tel"
                          value={userFormData.phone}
                          onChange={(e) =>
                            setUserFormData({
                              ...userFormData,
                              phone: e.target.value,
                            })
                          }
                          className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                        System Role
                      </label>
                      <div className="relative">
                        <Shield
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                          size={16}
                        />
                        <select
                          value={userFormData.role}
                          onChange={(e) =>
                            setUserFormData({
                              ...userFormData,
                              role: e.target.value as RoleType,
                            })
                          }
                          className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all appearance-none"
                        >
                          <option value="dispatch">Dispatch</option>
                          <option value="owner">Owner</option>
                          <option value="analysis">Analysis</option>
                        </select>
                      </div>
                    </div>
                    {!editingUser && (
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                          Initial Password
                        </label>
                        <div className="relative">
                          <Lock
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                            size={16}
                          />
                          <input
                            type="password"
                            value={userFormData.password}
                            onChange={(e) =>
                              setUserFormData({
                                ...userFormData,
                                password: e.target.value,
                              })
                            }
                            className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsUserModalOpen(false)}
                      className="flex-1 py-5 bg-gray-50 text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-5 bg-black text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-800 transition-all shadow-xl shadow-black/10"
                    >
                      {editingUser ? "Update Member" : "Create Member"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Password Modal */}
        <AnimatePresence>
          {isPasswordModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
              >
                <div className="p-10 border-b border-gray-50 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-black uppercase tracking-tight">
                      Security Control
                    </h2>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                      Reset password for {editingUser?.fullName}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="p-3 hover:bg-gray-50 rounded-2xl transition-colors"
                  >
                    <XCircle size={24} className="text-gray-300" />
                  </button>
                </div>

                <form
                  onSubmit={handleUpdatePassword}
                  className="p-10 space-y-8"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                        size={16}
                      />
                      <input
                        type="password"
                        value={passwordFormData.newPassword}
                        onChange={(e) =>
                          setPasswordFormData({
                            ...passwordFormData,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                      <AlertCircle size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">
                        Force Password Reset
                      </p>
                      <p className="text-[9px] text-amber-600 font-medium mt-0.5">
                        User must change password on next login
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setPasswordFormData({
                          ...passwordFormData,
                          forceReset: !passwordFormData.forceReset,
                        })
                      }
                      className={`w-12 h-6 rounded-full transition-all relative ${
                        passwordFormData.forceReset
                          ? "bg-amber-600"
                          : "bg-amber-200"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                          passwordFormData.forceReset ? "left-7" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsPasswordModalOpen(false)}
                      className="flex-1 py-5 bg-gray-50 text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-5 bg-black text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-800 transition-all shadow-xl shadow-black/10"
                    >
                      Update Security
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <ConfirmModal
        isOpen={!!userToDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDeleteUser}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
}
