import React from "react";
import { FaSearch } from "react-icons/fa";

function Search() {
  return (
    <div className=" h-[10vh]">
   <div className="h-16 bg-[#1A1D29] px-4 flex items-center">
  <form className="w-full">
    <div className="flex gap-2 ">
      <input
        type="search"
        placeholder="Search"
        className="flex-1 rounded-lg bg-[#333846] px-3 py-2 outline-none text-gray-300 input-borderd w-full "
      />

      <button type="submit">
        <FaSearch className="text-4xl p-2 hover:bg-gray-500 text-white rounded-full duration-300" />
      </button>
    </div>
  </form>
</div>
    </div>
  )

}
export default Search