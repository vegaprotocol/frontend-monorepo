import { type SVGAttributes } from 'react';
import { EmblemSvg } from '../emblem-svg';

export const NEB = (props: SVGAttributes<SVGElement>) => {
  return (
    <EmblemSvg {...props} viewBox="0 0 32 32" className="p-0.5">
      <title>NEB logo</title>
      <g id="NEB_Token_Icon" clipPath="url(#clip0_9399_50281)">
        <g id="Gradient BG">
          <rect width="32" height="32" fill="white" />
          <rect width="32" height="32" fill="url(#paint0_radial_9399_50281)" />
          <rect
            width="32"
            height="32"
            fill="url(#paint1_radial_9399_50281)"
            fillOpacity="0.2"
          />
          <rect width="32" height="32" fill="url(#paint2_radial_9399_50281)" />
          <rect width="32" height="32" fill="url(#paint3_radial_9399_50281)" />
        </g>
        <g id="N" filter="url(#filter0_d_9399_50281)">
          <path
            d="M9 24.1138V7H12.2801L19.7199 18.4092V7H23V24.1138H19.7199L12.2801 12.7046V24.1138H9Z"
            fill="white"
            shapeRendering="crispEdges"
          />
          <path
            d="M9 24.1138V7H12.2801L19.7199 18.4092V7H23V24.1138H19.7199L12.2801 12.7046V24.1138H9Z"
            fill="url(#paint4_linear_9399_50281)"
            shapeRendering="crispEdges"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_d_9399_50281"
          x="9"
          y="6"
          width="16"
          height="19.1137"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="1" />
          <feGaussianBlur stdDeviation="0.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.12549 0 0 0 0 0.133333 0 0 0 0 0.152941 0 0 0 0.04 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_9399_50281"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_9399_50281"
            result="shape"
          />
        </filter>
        <radialGradient
          id="paint0_radial_9399_50281"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(6.45455 -7.25) rotate(96.9694) scale(40.1453 32.5125)"
        >
          <stop stopColor="white" stopOpacity="0.2" />
          <stop offset="1" stopColor="#B8FF20" />
        </radialGradient>
        <radialGradient
          id="paint1_radial_9399_50281"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(16 5.5) rotate(90) scale(26.5 35.2727)"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.2" />
        </radialGradient>
        <radialGradient
          id="paint2_radial_9399_50281"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(31.4167 0.598642) rotate(135.014) scale(44.4191 36.4399)"
        >
          <stop stopColor="#00BFA5" stopOpacity="0.8" />
          <stop offset="1" stopColor="#00BFA5" stopOpacity="0.06" />
        </radialGradient>
        <radialGradient
          id="paint3_radial_9399_50281"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(10.8182 35) rotate(-48.4127) scale(28.0769 33.2981)"
        >
          <stop stopColor="#0075FF" stopOpacity="0.8" />
          <stop offset="0.953677" stopColor="#0075FF" stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id="paint4_linear_9399_50281"
          x1="16"
          y1="7"
          x2="16"
          y2="24.1138"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" stopOpacity="0" />
          <stop offset="1" stopColor="white" />
        </linearGradient>
        <clipPath id="clip0_9399_50281">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </EmblemSvg>
  );
};
