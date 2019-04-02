import React from 'react';
import { ThemeProvider } from 'styled-components/macro';
import IssueList from '../IssueList';
import { render } from '../../../testing/testing-utils';
import { getTheme } from '../../../themes';
const theme = getTheme();

describe('<IssueList/>', () => {
  test('should render', () => {
    const props = {
      comparinator: {
        versions: [
          {
            boardIx: '12345',
            boardData: {
              lastUpdate: new Date('2001-01-01').getTime(),
            },
            enhancedIssueList: [
              {
                key: '1',
                completedWeekPadded: '2001-02-02',
                ordinal: 1,
              },
            ],
          },
          {
            boardIx: '54321',
            boardData: {
              lastUpdate: new Date('2002-02-02').getTime(),
            },
            enhancedIssueList: [
              {
                key: '1',
                completedWeekPadded: '2002-02-02',
                ordinal: 1,
              },
            ],
          },
        ],
      },
    };
    const result = render(
      <ThemeProvider theme={theme}>
        <IssueList {...props} />
      </ThemeProvider>
    );
    expect(result).not.toBeNull();
  });
});
