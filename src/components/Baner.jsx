import React from 'react'
import baner from "../assets/baner.png"

const Baner = () => {
    return (
        <div className='flex w-full items-center justify-center'><img src={baner} alt="Baner" className='w-full object-cover scale-dow' /></div>
    )
}

export default Baner