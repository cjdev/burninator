import React from 'react';
import PlaninatorContext from '../../context';
import { Child } from '../Child';
import { renderWithRedux } from '../../../../testing/testing-utils';

const reducer = (state, action) => state;
const settings = { monthWidthPx: 3, startDate: new Date('2001-01-01').getTime() };
const parentOffset = { left: 0, width: 100 };
const project = {};

const authProvider = {
  isAuthorized: () => true,
};

describe('<Child />', () => {
  test('should render', () => {
    const props = {
      data: {
        id: 'data.id',
        name: 'data.name',
        startDate: new Date('2001-01-01').getTime(),
        endDate: new Date('2002-02-02').getTime(),
        link: 'http://www.example.com',
      },
      track: {
        id: 'track.id',
      },
      project,
      settings,
      parentOffset,
    };

    const { getByTestId, getByText } = renderWithRedux(reducer)(
      <PlaninatorContext.Provider value={{ authProvider }}>
        <Child {...props} />
      </PlaninatorContext.Provider>
    );
    // console.log(debug());

    expect(getByTestId('buttonset-datalink')).toHaveAttribute('href', props.data.link);
    expect(getByText(props.data.name)).toBeInTheDocument();
    expect(getByText('2001-01-01 - 2002-02-02')).toBeInTheDocument();
  });

  test('should not render link button when no link data', () => {
    const props = {
      data: {
        id: 'data.id',
        name: 'data.name',
        startDate: new Date('2001-01-01').getTime(),
        endDate: new Date('2002-02-02').getTime(),
        // NO LINK
        //link: 'http://www.example.com',
      },
      track: {
        id: 'track.id',
      },
      project,
      settings,
      parentOffset,
    };

    const { queryByTestId } = renderWithRedux(reducer)(
      <PlaninatorContext.Provider value={{ authProvider }}>
        <Child {...props} />
      </PlaninatorContext.Provider>
    );
    expect(queryByTestId('buttonset-datalink')).not.toBeInTheDocument();
  });
  test('should adjust position ', () => {
    const props = {
      data: {
        id: 'data.id',
        name: 'data.name',
        startDate: new Date('2001-01-01').getTime(),
        endDate: new Date('2002-02-02').getTime(),
        // NO LINK
        //link: 'http://www.example.com',
      },
      track: {
        id: 'track.id',
      },
      project,
      settings,
      parentOffset,
    };

    const noAuthProvider = {
      isAuthorized: () => false,
    };

    const { queryByTestId } = renderWithRedux(reducer)(
      <PlaninatorContext.Provider value={{ authProvider: noAuthProvider }}>
        <Child {...props} />
      </PlaninatorContext.Provider>
    );
    expect(queryByTestId('child')).toHaveStyleRule('left', '3px');
  });

  test('should adjust position when natural width < min', () => {
    const props = {
      data: {
        id: 'data.id',
        name: 'data.name',
        startDate: new Date('2001-01-01').getTime(),
        endDate: new Date('2001-02-02').getTime(),
        link: 'http://www.example.com',
      },
      track: {
        id: 'track.id',
      },
      project,
      settings: { monthWidthPx: 1, startDate: new Date('2001-01-01').getTime() },
      parentOffset: { left: 0, width: 1 },
    };

    const noAuthProvider = {
      isAuthorized: () => false,
    };

    const { queryByTestId } = renderWithRedux(reducer)(
      <PlaninatorContext.Provider value={{ authProvider: noAuthProvider }}>
        <Child {...props} />
      </PlaninatorContext.Provider>
    );
    expect(queryByTestId('child')).toHaveStyleRule('left', '-31px');
  });

  test('should not render settings button when not authorized', () => {
    const props = {
      data: {
        id: 'data.id',
        name: 'data.name',
        startDate: new Date('2001-01-01').getTime(),
        endDate: new Date('2002-02-02').getTime(),
        // NO LINK
        //link: 'http://www.example.com',
      },
      track: {
        id: 'track.id',
      },
      project,
      settings,
      parentOffset,
    };

    const noAuthProvider = {
      isAuthorized: () => false,
    };

    const { queryByTestId } = renderWithRedux(reducer)(
      <PlaninatorContext.Provider value={{ authProvider: noAuthProvider }}>
        <Child {...props} />
      </PlaninatorContext.Provider>
    );
    expect(queryByTestId('buttonset-settingsbutton')).not.toBeInTheDocument();
  });
});
