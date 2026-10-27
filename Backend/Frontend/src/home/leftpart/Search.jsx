import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import useConversation from "../../zustand/userConversation";
import useGetAllusers from "../../context/useGetAllusers.jsx";
import toast from "react-hot-toast";

function Search() {
    const [search, setSearch] = useState("");
    const [allUsers] = useGetAllusers();
    const { setSelectedConversation } = useConversation();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!search.trim()) return;

        const conversation = allUsers.find((user) =>
            user.fullname?.toLowerCase().includes(search.toLowerCase().trim())
        );

        if (conversation) {
            setSelectedConversation(conversation);
            setSearch("");
        } else {
            toast.error("User not found");
        }
    };

    return (
        <div className="h-16 bg-[#1A1D29] px-3 md:px-4 flex items-center border-b border-gray-800 shrink-0">
            <form className="w-full" onSubmit={handleSubmit}>
                <div className="relative flex items-center">
                    <input
                        type="search"
                        placeholder="Search contacts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl bg-[#252836] border border-gray-700/60 pl-10 pr-3 py-2 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button
                        type="submit"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        title="Search"
                    >
                        <FaSearch className="text-sm" />
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Search;