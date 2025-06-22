import React from 'react'

const Menu = ({children}) => {
  return (
    <div className='bg-white p-5 absolute top-0 right-0 w-fit h-fit rounded-md text-black text-nowrap'>
        {children}
    </div>
  )
}

export default Menu