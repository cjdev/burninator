const defaultTheme = {
  burnie: {
    red: '#e06c6b',
  },
  body: {
    color: '#333',
    bg: '#f6f6f6',
  },
  a: {
    color: '#023',
    borderBottom: '1px solid rgba(0,0,0,.05)',
  },
  aHover: {
    color: '#036',
    borderBottom: '1px solid rgba(0,0,0,.1)',
  },
  danger: {
    color: '#fff',
    // color: '#fed78f',
    // bg: 'rgba(244,67,54,1)',
    bg: '#e06c6b',
  },
  issueList: {
    blue: {
      bg: 'rgba(33,150,243, .1)',
      border: '3px solid rgba(33,150,243, .3)',
    },
    green: {
      bg: 'rgba(76,175,80, .1)',
      border: '3px solid rgba(76,175,80, .7)',
    },
    red: {
      bg: 'rgba(244,67,54,.1)',
      border: '3px solid rgba(244,67,54,.5)',
      color: 'rgba(244,67,54,1)',
    },
    yellow: {
      bg: 'rgba(255,235,59,.1)',
      border: '3px solid rgba(255,235,59,.7)',
    },
  },
  comparinator: {
    later: {
      color: 'inherit',
      weight: '400',
      bg: 'rgba(244,67,54,0.2)',
      border: '3px solid rgba(244,67,54,.5)',
    },
    done: {
      color: 'inherit',
      weight: '600',
      bg: 'rgba(76,175,80,.5)',
      border: '3px solid rgba(76,175,80, .7)',
    },
    new: {
      color: 'inherit',
      weight: '400',
      bg: 'rgba(33,150,243,0.3)',
      border: '3px solid rgba(33,150,243, .7)',
    },
    zero: {
      color: 'inherit',
      weight: '400',
      bg: 'inherit',
      border: '0',
    },
    earlier: {
      color: 'inherit',
      weight: '400',
      bg: 'rgba(76,175,80,.2)',
      border: '3px solid rgba(76,175,80, .7)',
    },
    default: {
      color: 'inherit',
      weight: '400',
      bg: 'inherit',
      border: '0',
    },
  },
};

export const getTheme = () => defaultTheme;
