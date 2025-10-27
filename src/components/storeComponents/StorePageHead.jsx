import Image from "next/image";
import React from "react";

function StorePageHead() {
  return (
    <div className="h-[500px] flex flex-col md:flex-row">
      <div className="w-full h-full">
        <Image
          src="/menu.png"
          alt="Store Banner"
          width={1339}
          height={651}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

export default StorePageHead;
