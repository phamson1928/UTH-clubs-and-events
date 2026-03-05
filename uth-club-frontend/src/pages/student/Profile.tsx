import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "../../hooks/use-toast";
import Navbar from "../../components/Navbar";
import { User, Mail, Shield, Save, Key } from "lucide-react";

const API_BASE = (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3000";

export default function StudentProfile() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Profile state
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        mssv: "",
        role: "",
    });

    // Password state
    const [passwordState, setPasswordState] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const res = await axios.get(`${API_BASE}/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile({
                name: res.data.name || "",
                email: res.data.email || "",
                mssv: res.data.mssv || "",
                role: res.data.role || "user"
            });
        } catch (error) {
            toast({
                title: "Lỗi!",
                description: "Không thể tải thông tin hồ sơ.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem("authToken");
            await axios.patch(`${API_BASE}/users/me`, {
                name: profile.name,
                mssv: profile.mssv
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local storage name if it was changed
            const userRaw = localStorage.getItem("authUser");
            if (userRaw) {
                const user = JSON.parse(userRaw);
                user.name = profile.name;
                localStorage.setItem("authUser", JSON.stringify(user));
                // Trigger storage event for Navbar
                window.dispatchEvent(new Event("storage"));
            }

            toast({
                title: "Thành công!",
                description: "Hồ sơ của bạn đã được cập nhật.",
            });
        } catch (error: any) {
            toast({
                title: "Lỗi!",
                description: error.response?.data?.message || "Không thể cập nhật hồ sơ.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordState.newPassword !== passwordState.confirmPassword) {
            toast({
                title: "Lỗi",
                description: "Mật khẩu xác nhận không khớp.",
                variant: "destructive"
            });
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem("authToken");
            await axios.patch(`${API_BASE}/users/me/password`, {
                currentPassword: passwordState.currentPassword,
                newPassword: passwordState.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast({
                title: "Thành công!",
                description: "Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.",
            });

            // Clear password fields
            setPasswordState({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch (error: any) {
            toast({
                title: "Lỗi!",
                description: error.response?.data?.message || "Không thể đổi mật khẩu.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex justify-center items-center h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">Hồ Sơ Của Tôi</h1>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Thông tin cá nhân */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
                            <div className="bg-teal-100 p-2 rounded-full text-teal-600">
                                <User className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Thông Tin Cá Nhân</h2>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Họ và tên
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm border p-2"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mã số sinh viên (MSSV)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Shield className="h-4 w-4" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm border p-2"
                                        value={profile.mssv}
                                        onChange={(e) => setProfile({ ...profile, mssv: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email (Không thể thay đổi)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <input
                                        type="email"
                                        disabled
                                        className="pl-10 block w-full bg-gray-50 border-gray-300 rounded-md shadow-sm text-gray-500 sm:text-sm border p-2 cursor-not-allowed"
                                        value={profile.email}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Vai trò
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    className="block w-full bg-gray-50 border-gray-300 rounded-md shadow-sm text-gray-500 sm:text-sm border p-2 cursor-not-allowed uppercase"
                                    value={profile.role === 'user' ? 'Sinh viên' : profile.role}
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-300"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Đổi mật khẩu */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
                            <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                                <Key className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Đổi Mật Khẩu</h2>
                        </div>

                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mật khẩu hiện tại
                                </label>
                                <input
                                    type="password"
                                    required
                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm border p-2"
                                    value={passwordState.currentPassword}
                                    onChange={(e) => setPasswordState({ ...passwordState, currentPassword: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mật khẩu mới
                                </label>
                                <input
                                    type="password"
                                    required
                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm border p-2"
                                    value={passwordState.newPassword}
                                    onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Xác nhận mật khẩu mới
                                </label>
                                <input
                                    type="password"
                                    required
                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm border p-2"
                                    value={passwordState.confirmPassword}
                                    onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 mt-auto">
                                <button
                                    type="submit"
                                    disabled={saving || !passwordState.currentPassword || !passwordState.newPassword}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:bg-gray-400"
                                >
                                    <Key className="w-4 h-4 mr-2" />
                                    Đổi Mật Khẩu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
