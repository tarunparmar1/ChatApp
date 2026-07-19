import React from 'react'
import { IoMdSend } from "react-icons/io";

function Typesend() {
    return (
        <div className=" flex space-x-2 h-[8vh] txet-center bg-[#1A1D29] items-center justify-center px-2 border-t-[1px] border-gray-800">
            <div className="w-[70%]">
                <input type="text" placeholder="Type here" className="input input-borderd w-full " />


            </div>
            <div>
                <button>
                     <IoMdSend className="text-3xl" />
                </button>
            </div>
        </div>

    )
}
export default Typesend