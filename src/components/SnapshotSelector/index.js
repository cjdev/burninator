import React from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import styled from 'styled-components/macro';
import ReactSelector from 'react-select';
import { format, getRelativeTime } from '../../utils';

const containsSnapshot = (snapshot, disabledLastUpdateValues) =>
  R.contains('' + snapshot.lastUpdate, disabledLastUpdateValues);

const Select = styled(ReactSelector)`
  margin: 4px 4px;
`;

const displayVersionSelector = boardVersions =>
  boardVersions && boardVersions.data && boardVersions.data.length > 0;

const formatVersionDate = millis => {
  const mm = parseInt(millis, 10);
  return `${getRelativeTime(mm)} ${format(mm, 'M/D/YY HH:mm:ss')}`;
};

const buildOptionLabel = v => {
  if (v.versionName) {
    return `${v.versionName} (${formatVersionDate(v.lastUpdate)})${
      v.versionArchive ? ' [Archived]' : ''
    }`;
  } else {
    return `${formatVersionDate(v.lastUpdate)}${v.versionArchive ? ' [Archived]' : ''}`;
  }
};

const SnapshotSelector = ({
  boardVersions,
  value,
  disableOptions = [],
  onChange,
  placeholder = 'Select...',
  includeArchived = false,
}) => {
  if (!boardVersions.loading && !displayVersionSelector(boardVersions)) {
    return 'No saved versions';
  }
  if (boardVersions.loading) {
    return <Select disabled={true} placeholder={'Loading...'} name="version" />;
  }

  const options =
    boardVersions.data.length === 0
      ? []
      : R.pipe(
          R.filter(v => includeArchived || v.versionArchive !== true),
          R.sortBy(R.props('lastUpdate')),
          R.reverse,
          R.map(v => ({
            value: v.lastUpdate,
            label: buildOptionLabel(v),
            disabled: containsSnapshot(v, disableOptions),
          }))
        )(boardVersions.data);

  return (
    <Select
      placeholder={placeholder}
      name="version"
      clearable={false}
      searchable={false}
      options={options}
      optionClassName="select-option"
      onChange={onChange}
      value={value}
    />
  );
};
SnapshotSelector.propTypes = {
  boardVersions: PropTypes.object.isRequired,
  disableOptions: PropTypes.array,
  includeArchived: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.number,
};
export default SnapshotSelector;
