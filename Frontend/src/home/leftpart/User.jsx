import React from 'react'

 function User() {
  return (
    <div>
             <div className="flex space-x-4 px-6 py-3 hover:bg-gray-600 duration-300 cursor-pointer border-[1px] border-[#1A1D29] rounded-md  ">
                <div className="avatar avatar-placeholder">
                    <div className="bg-gray-300 text-neutral-content w-12 rounded-full p-1 text-center">
                        <span className="text-3xl text-black">n</span>
                    </div>
                </div>

                <div >
                    <h1 >
                        name
                    </h1>
                    <span >
                        name@email
                    </span>
                </div>
            </div>
    </div>
  )
}

export default User