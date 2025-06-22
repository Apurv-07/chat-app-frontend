import React from "react";
const Search = () => {
  return (
    <div className="flex items-center justify-center px-2 py-2">
      <div className="relative w-[10px] h-[15px] ml-1">
        <div className="absolute top-[-px] -translate-y-[1px] left-[2px] -translate-x-1/2 w-[12px] h-[12px] border-[3px] border-gray-700 rounded-full bg-white mt-[1.5px]"></div>
        <div className="absolute bottom-0 left-[4px] top-[10px] w-[3px] h-[7px] bg-gray-700 -rotate-45 origin-top-left"></div>
      </div>
    </div>
  );
};

export default Search;
