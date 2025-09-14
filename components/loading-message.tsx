import type React from "react";

const LoadingMessage: React.FC = () => {
  return (
    <div className="text-sm">
      <div className="flex flex-col">
        <div className="flex">
          <div className="mr-4 rounded-[16px] bg-white px-4 py-2 font-light text-black md:mr-24">
            <div className="h-3 w-3 animate-pulse rounded-full bg-black" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;
