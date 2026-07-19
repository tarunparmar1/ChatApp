import React from 'react'
import Chatuser from './Chatuser'
import Messeges from './Messeges'
import Typesend from './Typesend'

export function Right() {
  return (
    <div className=" w-[70%] border border-black bg-[#12141C]">
      <Chatuser />
      <Messeges />
      <Typesend />
    </div>
    )
  }

export default Right
