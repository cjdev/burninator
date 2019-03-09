import React from 'react';
import * as R from 'ramda';
import moment from 'moment';
import dateFnsFormat from 'date-fns/format';
import differenceInDays from 'date-fns/difference_in_days';
import isWeekend from 'date-fns/is_weekend';
import eachDay from 'date-fns/each_day';
import qs from 'qs';

export const JIRA_WEB_URL = process.env.REACT_APP_JIRA_ROOT_URL;
export const mapIndex = R.addIndex(R.map);

export const toTitleCase = str =>
  str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

export const format = (m, formatString = 'YYYY-MM-DDTHH:mm:ssZ', altText = '') =>
  m ? dateFnsFormat(m, formatString) : altText;

export const formatIso = m => format(m);
export const formatOrEmpty = m => format(m, 'MM/DD/YYYY');

export const formatDate = m => format(m, 'M/D/YY', '--');

export const formatLongDate = m => (m ? moment(m).format('MM/DD/YYYY H:mm:ss') : '--');
export const formatShortDate = m => (m ? moment(m).format('MM/D/YY H:mm') : '--');
export const formatTs = m => moment(m).format('YYYYMMDD_HH:mm:ss');
export const diffDates = (a, b, unit) => moment(a).diff(moment(b), unit);

export const daysSince = date => differenceInDays(new Date(), date);
export const weekDaysBetween = (start, end) =>
  R.filter(d => R.not(isWeekend(d)))(eachDay(start, end)).length;

export const sortByCompletedDate = (a, b) => moment(b.completeDate) - moment(a.completeDate);
export const getRelativeTime = m => moment(m).fromNow(true);
export const getHoursDiffFromNow = time => moment(time).diff(moment(), 'hours');

export const getUTCDate = (dateString = Date.now()) => {
  const date = new Date(dateString);
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
};

export const dateIndicatesStaleBoard = time => getHoursDiffFromNow(time) < -24;
export const equalsTrue = val => val === true || val === 'true';
export const parseQuery = queryString => qs.parse(queryString, { ignoreQueryPrefix: true });

export const getJiraBoardLink = boardId =>
  `${JIRA_WEB_URL}/secure/RapidBoard.jspa?rapidView=${boardId}`;

export const getJiraBoardVersionLink = (boardId, versionId, text) => (
  <a
    href={`${JIRA_WEB_URL}/secure/RapidBoard.jspa?rapidView=${boardId}&view=planning.nodetail&selectedVersion=${versionId}`}
    target="_blank"
    rel="noopener noreferrer"
  >
    {text}
  </a>
);

export const getJiraIssueLink = (issue, prop) => (
  <a href={`${JIRA_WEB_URL}/browse/${issue.key}`} target="_blank" rel="noopener noreferrer">
    {R.prop(prop)(issue)}
  </a>
);

export const getJiraCompletedIterationLink = iteration => (
  <a
    target="_blank"
    rel="noopener noreferrer"
    href={`${JIRA_WEB_URL}/secure/RapidBoard.jspa?rapidView=${
      iteration.originBoardId
    }&view=reporting&chart=sprintRetrospective&sprint=${iteration.id}`}
  >
    {iteration.name}
  </a>
);

export const getBurnieBoardVersionLink = board =>
  `/board/${board.boardId}/history/${board.basisDate}`;

export function logIf(...args) {
  if (args[0]) {
    // eslint-disable-next-line no-console
    console.log(...Array.prototype.slice.call(args, 1));
  }
}

export function tableIf(...args) {
  if (args[0]) {
    // eslint-disable-next-line no-console
    console.table(...Array.prototype.slice.call(args, 1));
  }
}

export const noName = n => n === undefined || n === 'undefined' || n === '';
