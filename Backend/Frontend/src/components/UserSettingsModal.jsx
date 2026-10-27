import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useAuth } from '../context/Authprovider';
import useConversation from '../zustand/userConversation';
import useGetAllusers from '../context/useGetAllusers';
import PixelAvatar from './PixelAvatar';
import {
    FiUser,
    FiSettings,
    FiTrash2,
    FiAlertTriangle,
    FiCheck,
    FiX,
    FiRefreshCw
} from 'react-icons/fi';
import { IoColorPaletteOutline } from 'react-icons/io5';

// Palettes for avatar customization
const SKIN_COLORS = ["#FDDBB4", "#F1C27D", "#C68642", "#8D5524", "#E8BEAC", "#FFCBA4"];
const HAIR_STYLES = [
    { id: "short", label: "Short" },
    { id: "long", label: "Long" },
    { id: "curly", label: "Curly" },
    { id: "bald", label: "Bald" },
    { id: "ponytail", label: "Ponytail" },
    { id: "afro", label: "Afro" },
];
const HAIR_COLORS = ["#36251D", "#1C1C1C", "#8B4513", "#D4AF37", "#E8E8E8", "#FF6B6B", "#6A5ACD", "#9333ea"];
const EYE_COLORS = ["#2C3E50", "#27AE60", "#2980B9", "#8E44AD", "#E67E22", "#1ABC9C"];
const CLOTHING_COLORS = ["#4F46E5", "#E74C3C", "#2ECC71", "#F39C12", "#1ABC9C", "#9B59B6", "#34495E"];
const ACCESSORIES = [
    { id: "none", label: "None" },
    { id: "glasses", label: "Glasses" },
    { id: "sunglasses", label: "Shades" },
    { id: "earrings", label: "Earrings" },
    { id: "hat", label: "Cap" },
];
const BG_COLORS = ["#1A1D29", "#12141C", "#1E2233", "#16213E", "#0F3460", "#1B1F3B"];

function UserSettingsModal({ isOpen, onClose }) {
    const [authUser, setAuthUser] = useAuth();
    const { selectedConversation, setSelectedConversation, setMessage } = useConversation();
    const [allUsers] = useGetAllusers();

    // Tabs: 'profile' | 'avatar' | 'chats' | 'danger'
    const [activeTab, setActiveTab] = useState('profile');

    // Profile form state
    const [fullname, setFullname] = useState(authUser?.user?.fullname || "");
    const [bio, setBio] = useState(authUser?.user?.bio || "Hey there! I am using NexChat.");
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Avatar state
    const defaultAvatarConfig = authUser?.user?.avatar?.config || {
        skinColor: "#FDDBB4",
        hairStyle: "short",
        hairColor: "#36251D",
        eyeColor: "#2C3E50",
        clothingColor: "#4F46E5",
        accessory: "none",
        bgColor: "#1A1D29",
    };
    const [avatarConfig, setAvatarConfig] = useState(defaultAvatarConfig);
    const [isSavingAvatar, setIsSavingAvatar] = useState(false);

    // Chat deletion state
    const [chatToDelete, setChatToDelete] = useState(null);
    const [isDeletingChat, setIsDeletingChat] = useState(false);

    // Account deletion state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteInputText, setDeleteInputText] = useState("");
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    if (!isOpen) return null;

    // Helper: Randomize Avatar
    const handleRandomizeAvatar = () => {
        const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
        setAvatarConfig({
            skinColor: rand(SKIN_COLORS),
            hairStyle: rand(HAIR_STYLES).id,
            hairColor: rand(HAIR_COLORS),
            eyeColor: rand(EYE_COLORS),
            clothingColor: rand(CLOTHING_COLORS),
            accessory: rand(ACCESSORIES).id,
            bgColor: rand(BG_COLORS),
        });
    };

    // Save Profile (Fullname & Bio)
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!fullname.trim()) {
            toast.error("Name cannot be empty");
            return;
        }
        setIsSavingProfile(true);
        try {
            const res = await axios.put("/api/user/profile", {
                fullname: fullname.trim(),
                bio: bio.trim(),
            });

            const updatedUser = { ...authUser, user: res.data.user };
            setAuthUser(updatedUser);
            localStorage.setItem("chatapp", JSON.stringify(updatedUser));
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error.response?.data?.error || "Failed to update profile");
        } finally {
            setIsSavingProfile(false);
        }
    };

    // Save Avatar
    const handleSaveAvatar = async () => {
        setIsSavingAvatar(true);
        try {
            const newAvatar = {
                seed: authUser?.user?._id || "user",
                style: "pixel",
                config: avatarConfig,
            };

            const res = await axios.put("/api/user/profile", {
                avatar: newAvatar,
            });

            const updatedUser = { ...authUser, user: res.data.user };
            setAuthUser(updatedUser);
            localStorage.setItem("chatapp", JSON.stringify(updatedUser));
            toast.success("Avatar saved successfully!");
        } catch (error) {
            console.error("Error saving avatar:", error);
            toast.error(error.response?.data?.error || "Failed to save avatar");
        } finally {
            setIsSavingAvatar(false);
        }
    };

    // Delete Chat with specific user
    const handleDeleteChat = async (targetUser) => {
        setIsDeletingChat(true);
        try {
            await axios.delete(`/api/message/delete/${targetUser._id}`);
            if (selectedConversation?._id === targetUser._id) {
                setMessage([]);
            }
            toast.success(`Chat with ${targetUser.fullname} deleted`);
            setChatToDelete(null);
        } catch (error) {
            console.error("Error deleting chat:", error);
            toast.error(error.response?.data?.error || "Failed to delete chat");
        } finally {
            setIsDeletingChat(false);
        }
    };

    // Delete Account
    const handleDeleteAccount = async () => {
        if (deleteInputText !== "DELETE") {
            toast.error("Please type DELETE to confirm");
            return;
        }
        setIsDeletingAccount(true);
        try {
            await axios.delete("/api/user/delete-account");
            localStorage.removeItem("chatapp");
            localStorage.removeItem("chatapp_favorites");
            Cookies.remove("jwt");
            toast.success("Account deleted. Farewell!");
            window.location.reload();
        } catch (error) {
            console.error("Error deleting account:", error);
            toast.error(error.response?.data?.error || "Failed to delete account");
            setIsDeletingAccount(false);
        }
    };

    // Member since date formatting
    const memberSince = authUser?.user?.createdAt
        ? new Date(authUser.user.createdAt).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
          })
        : "Recent";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-sm animate-fade-in">
            <div
                className="bg-[#1A1D29] border border-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800/80 bg-[#12141C]/60 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                            <FiSettings className="text-xl" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white leading-tight">Settings</h2>
                            <p className="text-xs text-gray-400">Manage your profile, avatar, and account</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                        title="Close"
                    >
                        <FiX className="text-xl" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center border-b border-gray-800/80 bg-[#161823] px-3 gap-1 overflow-x-auto shrink-0 hide-scrollbar">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-2 px-3.5 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'profile'
                                ? 'border-indigo-500 text-indigo-400'
                                : 'border-transparent text-gray-400 hover:text-gray-200'
                        }`}
                    >
                        <FiUser className="text-base" />
                        Basic Details
                    </button>

                    <button
                        onClick={() => setActiveTab('avatar')}
                        className={`flex items-center gap-2 px-3.5 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'avatar'
                                ? 'border-indigo-500 text-indigo-400'
                                : 'border-transparent text-gray-400 hover:text-gray-200'
                        }`}
                    >
                        <IoColorPaletteOutline className="text-base" />
                        Avatar Studio
                    </button>

                    <button
                        onClick={() => setActiveTab('chats')}
                        className={`flex items-center gap-2 px-3.5 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'chats'
                                ? 'border-indigo-500 text-indigo-400'
                                : 'border-transparent text-gray-400 hover:text-gray-200'
                        }`}
                    >
                        <FiTrash2 className="text-base" />
                        Delete Chat
                    </button>

                    <button
                        onClick={() => setActiveTab('danger')}
                        className={`flex items-center gap-2 px-3.5 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'danger'
                                ? 'border-red-500 text-red-400'
                                : 'border-transparent text-gray-400 hover:text-red-300'
                        }`}
                    >
                        <FiAlertTriangle className="text-base" />
                        Delete Account
                    </button>
                </div>

                {/* Tab Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 hide-scrollbar">
                    {/* TAB 1: PROFILE & BASIC DETAILS */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleSaveProfile} className="space-y-5">
                            {/* User Overview Card */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#12141C] border border-gray-800">
                                <PixelAvatar
                                    avatar={authUser?.user?.avatar}
                                    name={authUser?.user?.fullname || "User"}
                                    size={64}
                                    isOnline={true}
                                />
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-base font-bold text-white truncate">
                                        {authUser?.user?.fullname}
                                    </h3>
                                    <p className="text-xs text-gray-400 truncate">{authUser?.user?.email}</p>
                                    <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-medium">
                                        Member since {memberSince}
                                    </span>
                                </div>
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={fullname}
                                    onChange={(e) => setFullname(e.target.value)}
                                    placeholder="Your name"
                                    className="w-full rounded-xl bg-[#252836] border border-gray-700/60 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                    required
                                />
                            </div>

                            {/* Bio / Status */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                                    Bio / Status
                                </label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell others what you are up to..."
                                    rows={2}
                                    maxLength={120}
                                    className="w-full rounded-xl bg-[#252836] border border-gray-700/60 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                                />
                                <span className="text-[11px] text-gray-500 float-right mt-1">
                                    {bio.length}/120
                                </span>
                            </div>

                            {/* Email (Read-Only) */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                                    Email Address (Protected)
                                </label>
                                <input
                                    type="email"
                                    value={authUser?.user?.email || ""}
                                    disabled
                                    className="w-full rounded-xl bg-[#12141C] border border-gray-800 px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
                                />
                            </div>

                            {/* Save Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSavingProfile}
                                    className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                                >
                                    {isSavingProfile ? (
                                        "Saving..."
                                    ) : (
                                        <>
                                            <FiCheck /> Save Profile
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* TAB 2: AVATAR STUDIO */}
                    {activeTab === 'avatar' && (
                        <div className="space-y-6">
                            {/* Live Preview & Randomize */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-[#12141C] border border-gray-800">
                                <div className="flex items-center gap-4">
                                    <PixelAvatar
                                        avatar={{ config: avatarConfig }}
                                        name={authUser?.user?.fullname || "?"}
                                        size={80}
                                        isOnline={true}
                                    />
                                    <div>
                                        <h4 className="text-sm font-bold text-white">Live Avatar Preview</h4>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Handcrafted 12x12 pixel-art portrait
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleRandomizeAvatar}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                                >
                                    <FiRefreshCw className="text-indigo-400" /> Randomise
                                </button>
                            </div>

                            {/* Hairstyle Selector */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-2">
                                    Hairstyle
                                </label>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                    {HAIR_STYLES.map((style) => (
                                        <button
                                            key={style.id}
                                            type="button"
                                            onClick={() => setAvatarConfig((prev) => ({ ...prev, hairStyle: style.id }))}
                                            className={`py-2 px-2 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                                                avatarConfig.hairStyle === style.id
                                                    ? 'bg-indigo-600 text-white shadow-sm'
                                                    : 'bg-[#252836] text-gray-300 hover:bg-gray-700'
                                            }`}
                                        >
                                            {style.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Hair Color */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-2">
                                    Hair Color
                                </label>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    {HAIR_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setAvatarConfig((prev) => ({ ...prev, hairColor: color }))}
                                            className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                                                avatarConfig.hairColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                                            }`}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Skin Tone */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-2">
                                    Skin Tone
                                </label>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    {SKIN_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setAvatarConfig((prev) => ({ ...prev, skinColor: color }))}
                                            className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                                                avatarConfig.skinColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                                            }`}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Clothing Color */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-2">
                                    Clothing Color
                                </label>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    {CLOTHING_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setAvatarConfig((prev) => ({ ...prev, clothingColor: color }))}
                                            className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                                                avatarConfig.clothingColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                                            }`}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Accessories */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-2">
                                    Accessories
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                    {ACCESSORIES.map((acc) => (
                                        <button
                                            key={acc.id}
                                            type="button"
                                            onClick={() => setAvatarConfig((prev) => ({ ...prev, accessory: acc.id }))}
                                            className={`py-2 px-3 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                                                avatarConfig.accessory === acc.id
                                                    ? 'bg-indigo-600 text-white shadow-sm'
                                                    : 'bg-[#252836] text-gray-300 hover:bg-gray-700'
                                            }`}
                                        >
                                            {acc.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Save Avatar */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleSaveAvatar}
                                    disabled={isSavingAvatar}
                                    className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                                >
                                    {isSavingAvatar ? (
                                        "Saving Avatar..."
                                    ) : (
                                        <>
                                            <FiCheck /> Save Avatar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: DELETE CHAT (MANAGE CHATS) */}
                    {activeTab === 'chats' && (
                        <div className="space-y-4">
                            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                                Delete all messages and clear conversation history with a specific contact. This action cannot be undone.
                            </div>

                            <div className="divide-y divide-gray-800">
                                {allUsers.length === 0 ? (
                                    <p className="text-center py-8 text-xs text-gray-500">No contacts available</p>
                                ) : (
                                    allUsers.map((user) => (
                                        <div
                                            key={user._id}
                                            className="flex items-center justify-between py-3 px-2 hover:bg-white/[0.02] rounded-xl transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <PixelAvatar
                                                    avatar={user.avatar}
                                                    name={user.fullname}
                                                    size={40}
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-200 truncate">
                                                        {user.fullname}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setChatToDelete(user)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 active:scale-95 transition-all cursor-pointer"
                                                title="Delete chat history"
                                            >
                                                <FiTrash2 /> Delete Chat
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 4: DANGER ZONE (DELETE ACCOUNT) */}
                    {activeTab === 'danger' && (
                        <div className="space-y-5">
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs leading-relaxed">
                                <div className="flex items-center gap-2 font-bold text-red-400 text-sm mb-1">
                                    <FiAlertTriangle className="text-base" /> Warning: Irreversible Action
                                </div>
                                Deleting your account will permanently wipe your profile, custom pixel avatar, and all message histories. You will be logged out immediately.
                            </div>

                            <div className="p-4 rounded-xl bg-[#12141C] border border-gray-800 space-y-3">
                                <h4 className="text-sm font-bold text-gray-200">Permanently Delete Account</h4>
                                <p className="text-xs text-gray-400">
                                    Once deleted, your account data cannot be recovered.
                                </p>

                                {!showDeleteConfirm ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-all active:scale-95 cursor-pointer"
                                    >
                                        I want to delete my account
                                    </button>
                                ) : (
                                    <div className="space-y-3 pt-2">
                                        <p className="text-xs font-medium text-gray-300">
                                            Type <span className="font-bold text-red-400">DELETE</span> below to confirm:
                                        </p>
                                        <input
                                            type="text"
                                            placeholder="Type DELETE"
                                            value={deleteInputText}
                                            onChange={(e) => setDeleteInputText(e.target.value)}
                                            className="w-full rounded-xl bg-[#252836] border border-red-500/50 px-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-red-500"
                                        />
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                disabled={deleteInputText !== "DELETE" || isDeletingAccount}
                                                onClick={handleDeleteAccount}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer ${
                                                    deleteInputText === "DELETE" && !isDeletingAccount
                                                        ? "bg-red-600 hover:bg-red-700 shadow-md active:scale-95"
                                                        : "bg-gray-800 text-gray-500 cursor-not-allowed opacity-50"
                                                }`}
                                            >
                                                {isDeletingAccount ? "Deleting..." : "Permanently Delete My Account"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowDeleteConfirm(false);
                                                    setDeleteInputText("");
                                                }}
                                                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-gray-800 bg-[#12141C]/60 flex justify-end shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold cursor-pointer transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>

            {/* CONFIRM DELETE CHAT MODAL */}
            {chatToDelete && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
                    <div className="bg-[#1A1D29] border border-gray-800 max-w-sm w-full p-5 rounded-2xl shadow-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-full bg-red-500/10 text-red-400">
                                <FiTrash2 className="text-xl" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">Delete Chat History?</h4>
                                <p className="text-xs text-gray-400">With {chatToDelete.fullname}</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">
                            Are you sure you want to delete all messages exchanged with {chatToDelete.fullname}? This cannot be undone.
                        </p>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setChatToDelete(null)}
                                className="px-3.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isDeletingChat}
                                onClick={() => handleDeleteChat(chatToDelete)}
                                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
                            >
                                {isDeletingChat ? "Deleting..." : "Delete Chat"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserSettingsModal;
