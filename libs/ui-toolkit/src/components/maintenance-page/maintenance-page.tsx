import { t } from '@vegaprotocol/react-helpers';
import { ExternalLink } from '../link';
import { BackgroundVideo } from '../background-video';

const BLOG_URL = 'https://blog.vega.xyz/';

export const MaintenancePage = () => {
  return (
    <div className="flex flex-col w-full min-h-full justify-center items-center dark:bg-black dark:text-white">
      <div className="max-w-[540px] w-[80%]">
        <div className="pb-[24.6944444%] relative w-full mb-6">
          <div className="absolute inset-px">
            <BackgroundVideo />
          </div>
          <div className="absolute w-full h-full">
            <svg
              viewBox="0 0 1080 266.7"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-0 right-0 block w-full h-auto"
            >
              <path
                className="dark:fill-black fill-white"
                d="M0,0v265.7h93c73.7-25.9,101.2-167.1,190.5-176.5c55-5.8,71.3,43.1,150.2,46c145.6,5.4,162.8-114.5,276.1-121.6 c146.7-9.2,199.8,222.9,274.4,252.1h95.8V0H0z"
              ></path>
              <g className="dark:fill-white fill-black">
                <path d="M992.6,129.3H990v2.6h2.6V129.3z"></path>
                <path d="M995.2,126.7h-2.6v2.6h2.6V126.7z"></path>
                <path d="M995.2,131.9h-2.6v2.6h2.6V131.9z"></path>
                <path d="M997.9,129.3h-2.6v2.6h2.6V129.3z"></path>
                <path d="M574.6,5.3H572v2.6h2.6V5.3z"></path>
                <path d="M577.2,2.7h-2.6v2.6h2.6V2.7z"></path>
                <path d="M577.2,7.9h-2.6v2.6h2.6V7.9z"></path>
                <path d="M579.9,5.3h-2.6v2.6h2.6V5.3z"></path>
                <path d="M384,53.7h-3v3h3V53.7z"></path>
                <path d="M387,50.7v-3h-3v3v3h3V50.7z"></path>
                <path d="M381,56.7h-6v3h6V56.7z"></path>
                <path d="M384,59.7h-3v3h3V59.7z"></path>
                <path d="M387,62.7h-3v6h3V62.7z"></path>
                <path d="M390,59.7h-3v3h3V59.7z"></path>
                <path d="M395.9,56.7h-6v3h6V56.7z"></path>
                <path d="M390,53.7h-3v3h3V53.7z"></path>
                <path d="M130,158.7h-3v3h3V158.7z"></path>
                <path d="M133,155.7v-3h-3v3v3h3V155.7z"></path>
                <path d="M127,161.7h-6v3h6V161.7z"></path>
                <path d="M130,164.7h-3v3h3V164.7z"></path>
                <path d="M133,167.7h-3v6h3V167.7z"></path>
                <path d="M136,164.7h-3v3h3V164.7z"></path>
                <path d="M141.9,161.7h-6v3h6V161.7z"></path>
                <path d="M136,158.7h-3v3h3V158.7z"></path>
                <path d="M751.6,55.3H749v2.6h2.6V55.3z"></path>
                <path d="M754.2,52.7h-2.6v2.6h2.6V52.7z"></path>
                <path d="M754.2,57.9h-2.6v2.6h2.6V57.9z"></path>
                <path d="M756.9,55.3h-2.6v2.6h2.6V55.3z"></path>
                <path d="M720,85.7h-3v3h3V85.7z"></path>
                <path d="M723,82.7v-3h-3v3v3h3V82.7z"></path>
                <path d="M717,88.7h-6v3h6V88.7z"></path>
                <path d="M720,91.7h-3v3h3V91.7z"></path>
                <path d="M723,94.7h-3v6h3V94.7z"></path>
                <path d="M726,91.7h-3v3h3V91.7z"></path>
                <path d="M731.9,88.7h-6v3h6V88.7z"></path>
                <path d="M726,85.7h-3v3h3V85.7z"></path>
                <polyline points="0,266.7 1080,266.7 1080,264.7 0,264.7"></polyline>
              </g>
              <defs>
                <svg
                  id="screw"
                  width="64"
                  height="68"
                  viewBox="0 0 32 34"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g className="dark:fill-white fill-black animate-rotate">
                    <path d="M28.6963 19.8359C28.9074 18.9106 29.0218 17.9742 29.0218 17C29.0218 16.0258 28.9074 15.0738 28.6963 14.1475C28.5949 13.7212 28.8023 13.2405 29.1846 13.0196L32 11.4248L28.8749 6.05954L26.0595 7.6543C25.6809 7.8716 25.1629 7.81635 24.8392 7.52539C23.4338 6.24001 21.7345 5.26493 19.8585 4.68945C19.4381 4.55963 19.1256 4.1416 19.1256 3.70608V0.5H12.8753V3.70608C12.8753 4.1416 12.5628 4.55963 12.1424 4.68945C10.2655 5.26493 8.56713 6.24001 7.16175 7.52539C6.83808 7.81635 6.32001 7.87068 5.94146 7.6543L3.12606 6.05954L0 11.4248L2.8154 13.0196C3.19767 13.2405 3.40509 13.7212 3.30371 14.1475C3.09257 15.0729 2.97817 16.0258 2.97817 17C2.97817 17.9742 3.09257 18.9106 3.30371 19.8359C3.40509 20.2623 3.19767 20.7429 2.8154 20.9639L0 22.5586L3.12513 27.9239L5.94053 26.3291C6.3228 26.1164 6.84087 26.1781 7.16082 26.4737C8.5662 27.7591 10.2655 28.7185 12.1415 29.2931C12.5665 29.4247 12.88 29.851 12.8744 30.2921V33.4982H19.1247V30.2921C19.1182 29.851 19.4316 29.4238 19.8576 29.2931C21.7345 28.7176 23.4329 27.7591 24.8382 26.4737C25.1591 26.1781 25.6772 26.1164 26.0585 26.3291L28.8739 27.9239L31.9991 22.5586L29.1837 20.9639C28.8014 20.7429 28.594 20.2623 28.6954 19.8359H28.6963ZM16.0005 23.7031C12.2485 23.7031 9.22936 20.7143 9.22936 17C9.22936 13.2857 12.2485 10.2969 16.0005 10.2969C19.7525 10.2969 22.7716 13.2857 22.7716 17C22.7716 20.7143 19.7525 23.7031 16.0005 23.7031Z" />
                  </g>
                </svg>
                <svg
                  id="screw-reverse"
                  width="64"
                  height="68"
                  viewBox="0 0 32 34"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g className="dark:fill-white fill-black animate-rotate-back">
                    <path d="M28.6963 19.8359C28.9074 18.9106 29.0218 17.9742 29.0218 17C29.0218 16.0258 28.9074 15.0738 28.6963 14.1475C28.5949 13.7212 28.8023 13.2405 29.1846 13.0196L32 11.4248L28.8749 6.05954L26.0595 7.6543C25.6809 7.8716 25.1629 7.81635 24.8392 7.52539C23.4338 6.24001 21.7345 5.26493 19.8585 4.68945C19.4381 4.55963 19.1256 4.1416 19.1256 3.70608V0.5H12.8753V3.70608C12.8753 4.1416 12.5628 4.55963 12.1424 4.68945C10.2655 5.26493 8.56713 6.24001 7.16175 7.52539C6.83808 7.81635 6.32001 7.87068 5.94146 7.6543L3.12606 6.05954L0 11.4248L2.8154 13.0196C3.19767 13.2405 3.40509 13.7212 3.30371 14.1475C3.09257 15.0729 2.97817 16.0258 2.97817 17C2.97817 17.9742 3.09257 18.9106 3.30371 19.8359C3.40509 20.2623 3.19767 20.7429 2.8154 20.9639L0 22.5586L3.12513 27.9239L5.94053 26.3291C6.3228 26.1164 6.84087 26.1781 7.16082 26.4737C8.5662 27.7591 10.2655 28.7185 12.1415 29.2931C12.5665 29.4247 12.88 29.851 12.8744 30.2921V33.4982H19.1247V30.2921C19.1182 29.851 19.4316 29.4238 19.8576 29.2931C21.7345 28.7176 23.4329 27.7591 24.8382 26.4737C25.1591 26.1781 25.6772 26.1164 26.0585 26.3291L28.8739 27.9239L31.9991 22.5586L29.1837 20.9639C28.8014 20.7429 28.594 20.2623 28.6954 19.8359H28.6963ZM16.0005 23.7031C12.2485 23.7031 9.22936 20.7143 9.22936 17C9.22936 13.2857 12.2485 10.2969 16.0005 10.2969C19.7525 10.2969 22.7716 13.2857 22.7716 17C22.7716 20.7143 19.7525 23.7031 16.0005 23.7031Z" />
                  </g>
                </svg>
              </defs>
              <use xlinkHref="#screw" x="301" y="200"></use>
              <use xlinkHref="#screw-reverse" x="381" y="200"></use>
              <use xlinkHref="#screw" x="521" y="200"></use>
              <use xlinkHref="#screw-reverse" x="721" y="200"></use>
              <svg
                x="580"
                y="32"
                width="146"
                height="247"
                viewBox="0 0 56 85"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g>
                  <path d="M19 60.5H17V84.5H19V60.5Z" fill="black" />
                  <path d="M41 0.5H3V60.5H41V0.5Z" fill="white" />
                  <path d="M15 18.5H13V20.5H15V18.5Z" fill="black" />
                  <path d="M17 20.5H15V22.5H17V20.5Z" fill="black" />
                  <path d="M19 18.5H17V20.5H19V18.5Z" fill="black" />
                  <path d="M15 22.5H13V24.5H15V22.5Z" fill="black" />
                  <path d="M19 22.5H17V24.5H19V22.5Z" fill="black" />
                  <path d="M29 28.5H15V30.5H29V28.5Z" fill="black" />
                  <path d="M27 18.5H25V20.5H27V18.5Z" fill="black" />
                  <path d="M29 20.5H27V22.5H29V20.5Z" fill="black" />
                  <path d="M31 18.5H29V20.5H31V18.5Z" fill="black" />
                  <path d="M27 22.5H25V24.5H27V22.5Z" fill="black" />
                  <path d="M31 22.5H29V24.5H31V22.5Z" fill="black" />
                  <path d="M31 26.5H29V28.5H31V26.5Z" fill="black" />
                  <path d="M27 60.5H25V62.5H27V60.5Z" fill="black" />
                  <path d="M27 60.5H25V84.5H27V60.5Z" fill="black" />
                  <path d="M19 60.5H17V84.5H19V60.5Z" fill="black" />
                  <path d="M27 60.5H25V62.5H27V60.5Z" fill="black" />
                  <path d="M27 60.5H25V84.5H27V60.5Z" fill="black" />
                  <path d="M27 60.5H25V62.5H27V60.5Z" fill="black" />
                  <path
                    d="M3 42.5V58.64V60.5V64.5H21V60.5H23V64.5H41V60.5V58.64V42.5H3Z"
                    fill="#00F780"
                  />
                  <path d="M35 46.5H41V42.5H3V46.5H31H35Z" fill="#00D16C" />
                  <path
                    d="M3 32.32V29.5L0 32.5V60.5H2V33.33L3 32.32Z"
                    fill="black"
                  />
                  <path
                    d="M41 31.8V29.49L54.79 21.53L55.79 23.26L41 31.8Z"
                    fill="black"
                  />
                  <path d="M36 54.5H35V55.5H36V54.5Z" fill="black" />
                  <path d="M35 53.5H34V54.5H35V53.5Z" fill="black" />
                  <path d="M34 48.5H33V53.5H34V48.5Z" fill="black" />
                  <path d="M38 48.5H37V52.5H38V48.5Z" fill="black" />
                  <path d="M37 53.5H36V54.5H37V53.5Z" fill="black" />
                  <path d="M39 52.5H38V53.5H39V52.5Z" fill="black" />
                </g>
              </svg>
              <svg
                x="699"
                y="61"
                width="29"
                height="44"
                viewBox="0 0 11 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  style={{ transformOrigin: 'bottom right' }}
                  className="animate-wave"
                  d="M10.79 16.27L8.05998 15.54L0.0999756 1.75L1.82998 0.75L10.79 16.27Z"
                  fill="black"
                />
              </svg>
              <svg
                x="639"
                y="28"
                width="109"
                height="65"
                viewBox="0 0 42 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g
                  style={{ transformOrigin: '50px 29px' }}
                  className="animate-wave"
                >
                  <path
                    transform="translate(6, 4) scale(0.8)"
                    d="M9.19758 10.4284L30.461 19.6961C30.7275 21.4423 31.8514 23.0054 33.5831 23.7591C36.2712 24.9284 39.4029 23.7006 40.5721 21.0125C41.7414 18.3245 40.5136 15.1928 37.8256 14.0235C36.0939 13.2697 34.1773 13.5089 32.7222 14.5012L11.4589 5.23339C11.1923 3.48724 10.0684 1.92415 8.33672 1.17039C6.21236 0.242586 3.8207 0.809016 2.3249 2.41195L7.84213 4.81833L6.43125 8.06016L0.914027 5.65377C0.757196 7.83641 1.9699 9.97822 4.08426 10.9062C5.81592 11.6599 7.7325 11.4208 9.18758 10.4285L9.19758 10.4284ZM33.1119 17.7656L35.3963 16.0607L37.9937 17.1913L38.2969 20.027L36.0126 21.732L33.4151 20.6013L33.1119 17.7656Z"
                    fill="#A6A6A6"
                  />
                </g>
              </svg>
            </svg>
          </div>
        </div>
      </div>
      <div className="flex mb-2">
        <span className="font-alpha uppercase text-xl text-center">
          {t("We're doing some maintenance right now, check back later")}
        </span>
      </div>
      <p>
        <span className="text-neutral-500 dark:text-neutral-400">
          {t('Learn more on')}
        </span>{' '}
        <ExternalLink href={BLOG_URL}>{t('our blog')}</ExternalLink>
      </p>
    </div>
  );
};
