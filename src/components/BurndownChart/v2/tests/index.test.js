import React from 'react';
import { render } from 'testing-utils';

import V2Chart from '../';

import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { ThemeProvider } from 'styled-components/macro';

const customRender = (node, customState, ...options) => {
  const mockReducer = (state, action) => state;
  const initialState = {
    burndown: {
      currentBoard: {
        boardData: {
          processed: {
            enhancedIssueList: [
              // issue
              {
                isFinalInVersion: true,
                key: 'issue-1',
                pointsRemainingAfterMe: 1,
                version: 'v1',
              },
            ],
            v2ChartData: {
              outsideVersionRefLines: [],
              chartData: [],
            },
            velocityData: {
              overridden: false,
            },
            opts: {
              computedConfig: {
                scopeGrowth: {
                  isOverridden: false,
                },
              },
            },
          },
        },
      },
    },
  };
  const mockStore = createStore(mockReducer, { ...initialState, ...customState });
  const mockTheme = {};
  return render(
    <Provider store={mockStore}>
      <ThemeProvider theme={mockTheme}>{node}</ThemeProvider>
    </Provider>,
    ...options
  );
};

describe('<V2Chart />', () => {
  test('snapshot:issues', () => {
    const { container } = customRender(<V2Chart />, {});
    expect(container.firstChild).toMatchSnapshot();
  });
  test('snapshot:versions', () => {
    const { container } = customRender(<V2Chart display="versions" />, {});
    expect(container.firstChild).toMatchSnapshot();
  });
});
