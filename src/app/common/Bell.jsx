import React from "react";

const Bell = ({ count, click }) => {
  return (
    <div className="flex items-center justify-center" onClick={click}>
      <div className="absolute top-5 md:right-[30px] right-[18px] w-4 h-4 bg-red-600 text-white text-[10px] flex items-center justify-center rounded-full z-30">
        {count}
      </div>
      <div className="relative w-[20px] h-[25px] -mt-1.5">
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[20px] h-[20px] z-20 bg-yellow-500 rounded-full border-[5px] border-yellow-600"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[10px] h-[5px] bg-yellow-600 rounded-t-full"></div>
        <div className="absolute bottom-[-3px] left-1/2 -translate-x-1/2 w-[10px] h-[10px] bg-gray-300 rounded-full z-10 top-[20px]"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[24px] h-[5px] bg-yellow-700 rounded-full z-10"></div>
        <div className="w-0 h-0 border-l-[15px] absolute bottom-0 left-1/2 -translate-x-1/2 border-l-transparent border-r-[15px] border-r-transparent border-b-[20px] border-yellow-600 z-10 rounded-bl-md rounded-br-md"></div>
      </div>
    </div>
  );
};

export default Bell;
