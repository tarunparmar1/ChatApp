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
            user.fullname?.toLowerCase().includes(search.toLowerCase())
        );

        if (conversation) {
            setSelectedConversation(conversation);
            setSearch("");
        } else {
            toast.error("User not found");
        }
    };

    return (
        <div className="h-[10vh]">
            <div className="h-16 bg-[#1A1D29] px-4 flex items-center">
                <form
                    className="w-full"
                    onSubmit={handleSubmit}
                >
                    <div className="flex gap-2">

                        <input
                            type="search"
                            placeholder="Search"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            className="flex-1 rounded-lg bg-[#333846] px-3 py-2 outline-none text-gray-300 input-borderd w-full"
                        />

                        <button type="submit">
                            <FaSearch className="text-4xl p-2 hover:bg-gray-500 text-white rounded-full duration-300" />
                        </button>

                    </div>
                </form>
            </div>
        </div>
    );
}

export default Search;