import getOptions from '../options';

describe('options', () => {
  test('should return defaults with no boardConfig, urlOptions, exceptedIssues', () => {
    const boardConfig = {};
    const result = getOptions(boardConfig);

    expect(result.iterationHistory).toEqual(false);
    expect(result.showComparinator).toEqual(true);
    expect(result.computedConfig.scopeGrowth.computed).toEqual(0.3);
    expect(result.velocityLookbackCount).toEqual(12);
    expect(result.velocityOverride).toEqual(0);
    expect(result.version).toEqual('current');
  });

  test('should take showComparinator value from urlOptions', () => {
    const boardConfig = {};
    const urlOptions = {
      c: false,
    };
    const result = getOptions(boardConfig, urlOptions);
    expect(result.showComparinator).toEqual(false);
  });

  test('should take interationHistory value from urlOptions', () => {
    const boardConfig = {};
    const urlOptions = {
      history: true,
    };
    const result = getOptions(boardConfig, urlOptions);
    expect(result.iterationHistory).toEqual(true);
  });

  test('should calculate default uncertaintyValue', () => {
    const boardConfig = {};
    const result = getOptions(boardConfig);
    expect(result.uncertainty).toEqual({
      override: false,
      value: 0.3,
    });
  });

  test('should calculate uncertaintyValue with override', () => {
    const boardConfig = {};
    const urlOptions = {
      u: 0.8,
    };
    const result = getOptions(boardConfig, urlOptions);
    expect(result.uncertainty).toEqual({
      override: true,
      value: 0.8,
    });
  });

  test('should calculate default computedConfig ', () => {
    const boardConfig = {};
    const urlOptions = {};
    const result = getOptions(boardConfig, urlOptions);
    expect(result.computedConfig).toEqual({
      scopeGrowth: {
        computed: 0.3,
        default: 0.3,
        isConfigured: false,
        isOverridden: false,
      },
      stalled: {},
      velocity: {
        lookback: {
          computed: 12,
          default: 12,
          isOverridden: false,
        },
        override: {
          isConfigured: false,
          isOverridden: false,
        },
      },
    });
  });

  test('should calculate scopeGrowth when boardConfig specifies value', () => {
    const boardConfig = {
      scopeGrowth: 0.8,
    };
    const urlOptions = {};
    const result = getOptions(boardConfig, urlOptions);
    expect(result.computedConfig.scopeGrowth).toEqual({
      computed: 0.8,
      configured: 0.8,
      default: 0.3,
      isConfigured: true,
      isOverridden: false,
    });
  });

  test('should calculate scopeGrowth when urlOptions specifies value', () => {
    const boardConfig = {};
    const urlOptions = {
      u: 0.7,
    };
    const result = getOptions(boardConfig, urlOptions);
    expect(result.computedConfig.scopeGrowth).toEqual({
      computed: 0.7,
      default: 0.3,
      override: 0.7,
      isConfigured: false,
      isOverridden: true,
    });
  });

  test('should calculate default velocity', () => {
    const boardConfig = {};
    const urlOptions = {};
    const result = getOptions(boardConfig, urlOptions);
    expect(result.computedConfig.velocity).toEqual({
      lookback: {
        computed: 12,
        default: 12,
        isOverridden: false,
      },
      override: {
        isConfigured: false,
        isOverridden: false,
      },
    });
  });

  test('should calculate velocity when urlOptions specifies lookback value', () => {
    const boardConfig = {};
    const urlOptions = {
      vl: 8,
    };
    const result = getOptions(boardConfig, urlOptions);
    expect(result.computedConfig.velocity).toEqual({
      lookback: {
        computed: 8,
        override: 8,
        default: 12,
        isOverridden: true,
      },
      override: {
        isConfigured: false,
        isOverridden: false,
      },
    });
  });

  test('should calculate velocity when urlOptions specifies override value', () => {
    const boardConfig = {};
    const urlOptions = {
      v: 20,
    };
    const result = getOptions(boardConfig, urlOptions);
    expect(result.computedConfig.velocity).toEqual({
      lookback: {
        computed: 12,
        default: 12,
        isOverridden: false,
      },
      override: {
        computed: 20,
        urlOverride: 20,
        isConfigured: false,
        isOverridden: true,
      },
    });
  });

  test('should calculate velocity when boardConfig specifies value', () => {
    const boardConfig = {
      velocity: 25,
    };
    const urlOptions = {};
    const result = getOptions(boardConfig, urlOptions);
    expect(result.computedConfig.velocity).toEqual({
      lookback: {
        computed: 12,
        default: 12,
        isOverridden: false,
      },
      override: {
        computed: 25,
        configured: 25,
        isConfigured: true,
        isOverridden: false,
      },
    });
  });

  test('should calculate default stalled config', () => {
    const boardConfig = {};
    const urlOptions = {};
    const result = getOptions(boardConfig, urlOptions);
    expect(result.computedConfig.stalled).toEqual({});
  });

  test('should return stalled config from boardConfig', () => {
    const boardConfig = {
      stalled: {
        1: 2,
      },
    };
    const urlOptions = {};
    const result = getOptions(boardConfig, urlOptions);
    expect(result.computedConfig.stalled).toEqual({ 1: 2 });
  });
});
