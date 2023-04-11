import { useState } from 'react';
import { Pagination } from './pagination';

import type { ComponentStory, ComponentMeta } from '@storybook/react';
export default {
  title: 'Pagination',
  component: Pagination,
} as ComponentMeta<typeof Pagination>;

const Template: ComponentStory<typeof Pagination> = (args) => {
  const MAX_PAGE = 3;
  const [page, setPage] = useState(1);

  return (
    <div>
      <Pagination
        hasPrevPage={page !== 1}
        hasNextPage={page < MAX_PAGE}
        onBack={() => setPage(Math.max(1, page - 1))}
        onNext={() => setPage(Math.min(MAX_PAGE, page + 1))}
      >
        Page {page}
      </Pagination>
    </div>
  );
};

export const Default = Template.bind({});
