import React from 'react';
import Video from '../header/video';
import Comet from '../header/comet';
import Star from '../icons/star';

const Baubles = () => {
  return (
    <aside className="relative right-0 top-0 h-[700px] hidden md:block md:w-1/2 overflow-hidden">
      <div className="absolute top-[100px] w-[393px] left-[19%] h-[517px]">
        <div className="absolute top-[82px] right-[34px] w-[100px] h-[100px] clip-path-rounded">
          <Video />
        </div>
        <div className="absolute bottom-[100px] left-[59px] w-[200px] h-[200px] clip-path-rounded">
          <Video />
        </div>
        <div className="absolute w-[118px] h-[85px] right-0 bottom-[178px]">
          <Comet />
        </div>
        <div className="absolute w-[118px] h-[82px] left-0 bottom-[120px]">
          <Comet />
        </div>
        <div className="absolute w-[20px] h-[20px] top-0 left-[49px]">
          <Star />
        </div>
        <div className="absolute w-[20px] h-[20px] top-[89px] left-[184px]">
          <Star />
        </div>
        <div className="absolute w-[10px] h-[10px] bottom-0 right-[137px]">
          <Star />
        </div>
      </div>
    </aside>
  );
};

export default Baubles;
