import React, { useRef, useState } from 'react';

interface AccordionProps {
  title: React.ReactNode;
  content: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({ title, content }) => {
  const [active, setActive] = useState(false);
  const [height, setHeight] = useState('0px');
  const [rotate, setRotate] = useState('transform duration-700 ease');

  const contentSpace = useRef(null);

  const toggleAccordion = () => {
    setActive((prevState) => !prevState);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setHeight(active ? '0px' : `${contentSpace.current.scrollHeight}px`);
    setRotate(
      active
        ? 'transform duration-700 ease'
        : 'transform duration-700 ease rotate-180'
    );
  };

  return (
    <div className="flex flex-col">
      <button
        className="py-2 box-border appearance-none cursor-pointer focus:outline-none flex items-center justify-between"
        onClick={toggleAccordion}
      >
        <p className="inline-block text-footnote light text-h5 uppercase text-black dark:text-white bold">
          {title}
        </p>
        <svg
          width="30"
          height="30"
          aria-label="Chevron icon"
          className={`${rotate} inline-block fill-current`}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="3" y="12" width="2" height="2" />
          <rect x="5" y="10" width="2" height="2" />
          <rect x="7" y="8" width="2" height="2" />
          <rect x="9" y="6" width="2" height="2" />
          <rect x="11" y="8" width="2" height="2" />
          <rect x="13" y="10" width="2" height="2" />
          <rect x="15" y="12" width="2" height="2" />
        </svg>
      </button>
      <div
        ref={contentSpace}
        style={{ maxHeight: `${height}` }}
        className="overflow-auto transition-max-height duration-700 ease-in-out"
      >
        <div className="pb-5">{content}</div>
      </div>
    </div>
  );
};
