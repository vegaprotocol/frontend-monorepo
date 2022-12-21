/* eslint-disable jsx-a11y/accessible-emoji */
import type { ComponentStory, ComponentMeta } from '@storybook/react';
import { Intent } from '../../utils/intent';
import type { Toast } from './toast';
import { ToastsContainer } from './toasts-container';
import random from 'lodash/random';
import sample from 'lodash/sample';
import uniqueId from 'lodash/uniqueId';
import { useToasts } from './use-toasts';
import create from 'zustand';
import { useEffect } from '@storybook/addons';
import { formatNumber } from '@vegaprotocol/react-helpers';

export default {
  title: 'ToastContainer',
  component: ToastsContainer,
} as ComponentMeta<typeof ToastsContainer>;

const contents = [
  'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eaque consequatur minima fugit dolorum assumenda maxime. ',
  'Sint ut inventore voluptatem eos consectetur nesciunt corporis repudiandae fuga mollitia sit officia eum, ab hic nobis, velit et rem est vero!',
  'Veritatis sit adipisci est inventore id maiores eaque!',
  'Exercitationem, voluptatem voluptates animi est culpa dolorem sint, dicta aspernatur accusamus voluptatibus excepturi eius.',
  'Fuga assumenda minus maiores dolor asperiores, error molestiae aperiam porro consequuntur soluta earum enim exercitationem.',
  'Consequatur, voluptas sint ducimus excepturi sit totam itaque qui praesentium nobis optio blanditiis repellendus sunt ullam quaerat iste exercitationem fugiat fuga. Quia!',
];

const randomWords = [
  'advertise',
  'therapist',
  'toss',
  'beam',
  'worm',
  'solo',
  'soldier',
  'photography',
  'accountant',
  'satisfaction',
  'think',
  'suppress',
  'sentiment',
  'arise',
  'grant',
  'greeting',
  'diagram',
  'switch',
  'opposition',
  'destruction',
  'flush',
  'decline',
  'banana',
  'emotion',
  'inject',
  'avant-garde',
  'fill',
  'decay',
  'wound',
  'shelter',
];

const randomToast = (): Toast => {
  const content = sample(contents);
  return {
    id: String(uniqueId('toast_')),
    intent: sample<Intent>([
      Intent.None,
      Intent.Primary,
      Intent.Warning,
      Intent.Danger,
      Intent.Success,
    ]) as Intent,
    render: () => <p>{content}</p>,
    closeAfter: sample([undefined, random(1000, 5000)]),
  };
};

type PriceStore = { price: number; setPrice: (p: number) => void };
const usePrice = create<PriceStore>((set) => ({
  price: 0,
  setPrice: (p) => set((state) => ({ price: p })),
}));

const Template: ComponentStory<typeof ToastsContainer> = (args) => {
  const setPrice = usePrice((state) => state.setPrice);

  const { add, close, closeAll, update, remove, toasts } = useToasts(
    (state) => ({
      add: state.add,
      close: state.close,
      closeAll: state.closeAll,
      update: state.update,
      remove: state.remove,
      toasts: state.toasts,
    })
  );

  useEffect(() => {
    const i = setInterval(() => {
      setPrice(random(0, 30, true));
    }, 1000);
    return () => clearInterval(i);
  }, [setPrice]);

  const addRandomToast = () => {
    const t = randomToast();
    add({ ...t, onClose: () => remove(t.id) });
  };
  const addRandomToastWithAction = () => {
    const t = randomToast();
    const words = [
      sample(randomWords),
      sample(randomWords),
      sample(randomWords),
    ];
    add({
      ...t,
      render: ({ id }) => (
        <>
          <h1>{words[0]}</h1>
          <div>
            <button
              className="underline text-gray-600 mr-2"
              onClick={() => setTimeout(() => close(id), 500)}
            >
              {words[1]}
            </button>
            <button
              className="underline text-gray-600"
              onClick={() =>
                update(id, {
                  intent: sample([
                    Intent.Danger,
                    Intent.Warning,
                    Intent.Success,
                  ]) as Intent,
                })
              }
            >
              {words[2]}
            </button>
          </div>
        </>
      ),
      onClose: () => remove(t.id),
    });
  };

  const addRandomToastWithUpdatingData = () => {
    const t = randomToast();
    const ToastContent = () => {
      const { price } = usePrice();
      const getIcon = () => {
        if (price === 0) return '🤷';
        if (price > 20) return '💰';
        if (price > 10) return '📈';
        if (price < 10) return '📉';
        return '';
      };
      return (
        <p className="text-3xl font-mono">
          {getIcon()} {formatNumber(price, 5)}
        </p>
      );
    };
    add({
      ...t,
      render: () => <ToastContent />,
      onClose: () => remove(t.id),
    });
  };

  return (
    <div>
      <button
        className="bg-gray-200 dark:bg-gray-800 p-2 mr-2"
        onClick={() => addRandomToast()}
      >
        🥪
      </button>
      <button
        className="bg-orange-200 dark:bg-orange-800 p-2 mr-2"
        onClick={() => addRandomToastWithAction()}
      >
        🎬 + 🥪
      </button>
      <button
        className="bg-purple-200 dark:bg-purple-800 p-2 mr-2"
        onClick={() => addRandomToastWithUpdatingData()}
      >
        📈 + 🥪
      </button>
      <button
        className="bg-red-200 dark:bg-red-800 p-2 mr-2"
        onClick={() => closeAll()}
      >
        🧽
      </button>
      <ToastsContainer {...args} toasts={toasts} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  order: 'asc',
};
