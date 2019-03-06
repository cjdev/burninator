import * as R from 'ramda';

const defaults = {
  iterationHistory: { abbr: 'history', default: false },
  showComparinator: { abbr: 'c', default: true },
  uncertaintyCone: { abbr: 'u', default: 0.3 },
  velocityLookbackCount: { abbr: 'vl', default: 12 },
  velocityOverride: { abbr: 'v', default: 0 },
  version: { abbr: 'version', default: 'current' },
};

const equalsTrue = v => v === true || v === 'true';
const exists = str => R.not(R.or(R.isNil(str), R.isEmpty(str)));
const valueOrUndefined = str => (exists(str) ? str : undefined);

const parsedOrUndefined = (str, parser) => {
  const v = valueOrUndefined(str);
  if (v === undefined) return undefined;
  const i = parser(v);
  return isNaN(i) ? undefined : i;
};
const intOrUndefined = str => parsedOrUndefined(str, v => parseInt(v, 10));
const floatOrUndefined = str => parsedOrUndefined(str, v => parseFloat(v, 10));

const computeLookbackConfig = (defaults, urlOptions) => {
  // possible scenarios:
  // - calculated based on default lookback
  // - calculated based on overridden lookback
  // -- overridden by url
  const value = {
    computed: defaults.velocityLookbackCount.default,
    default: defaults.velocityLookbackCount.default,
    isOverridden: false,
  };
  const maybeLookbackOverride = intOrUndefined(urlOptions[defaults.velocityLookbackCount.abbr]);
  if (maybeLookbackOverride) {
    value.computed = value.override = maybeLookbackOverride;
    value.isOverridden = true;
  }
  // console.log('finalLookbackConfig: ', value);
  return value;
};

const computeVelocityOverride = (defaults, boardConfig, urlOptions) => {
  const value = {
    isConfigured: false,
    isOverridden: false,
  };
  const configVelocity = intOrUndefined(boardConfig.velocity);
  if (configVelocity) {
    value.computed = value.configured = configVelocity;
    value.isConfigured = true;
  }
  const overrideVelocity = intOrUndefined(urlOptions[defaults.velocityOverride.abbr]);
  if (overrideVelocity) {
    // clobber the computed value from above, as override trumps configured
    value.computed = value.urlOverride = overrideVelocity;
    value.isOverridden = true;
  }
  // console.log('finalVelocityOverrideConfig: ', value);
  return value;
};

const computeScopeGrowth = (defaults, boardConfig, urlOptions) => {
  const value = {
    computed: defaults.uncertaintyCone.default,
    default: defaults.uncertaintyCone.default,
    isConfigured: false,
    isOverridden: false,
  };
  const configuredScopeGrowth = floatOrUndefined(boardConfig.scopeGrowth);
  // console.log('configuredScopeGrowth: ', configuredScopeGrowth);
  if (configuredScopeGrowth) {
    value.computed = value.configured = configuredScopeGrowth;
    value.isConfigured = true;
  }
  const overrideScopeGrowth = floatOrUndefined(urlOptions[defaults.uncertaintyCone.abbr]);
  // console.log('overrideScopeGrowth: ', overrideScopeGrowth);
  if (overrideScopeGrowth) {
    value.computed = value.override = overrideScopeGrowth;
    value.isOverridden = true;
  }
  return value;
};

export default function getOptions(boardConfig, urlOptions = {}, exceptedIssues = []) {
  // console.log('urlOptions: ', urlOptions);
  const d = defaults;
  const opts = R.map(val => R.propOr(val.default, val.abbr, urlOptions))(d);
  opts.iterationHistory = equalsTrue(opts.iterationHistory);
  opts.showComparinator = equalsTrue(opts.showComparinator);
  opts.uncertainty = {
    value: parseFloat(opts.uncertaintyCone),
    override: parseFloat(opts.uncertaintyCone) !== d.uncertaintyCone.default,
  };
  delete opts.uncertaintyCone;

  // ===========================================================
  opts.computedConfig = {
    scopeGrowth: computeScopeGrowth(d, boardConfig, urlOptions),
    velocity: {
      lookback: computeLookbackConfig(d, urlOptions),
      override: computeVelocityOverride(d, boardConfig, urlOptions),
    },
    stalled: boardConfig.stalled || {},
  };
  opts.exceptedIssues = exceptedIssues;
  return opts;
}
