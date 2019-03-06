import React from 'react';
import { render } from 'testing-utils';

import { BasicButton } from '../';

describe('<Button/>', () => {
  test('snapshot', () => {
    const { container } = render(<BasicButton>123</BasicButton>);
    expect(container.firstChild).toMatchSnapshot();
  });
});
