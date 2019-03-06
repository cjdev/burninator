import * as R from 'ramda';
import moment from 'moment';
import { stati } from '../core';

const unsorted = [
  { key: '0', jiraOrder: 0, status: { name: 'Needs Demo' }, summary: 'third' },
  { key: '1', jiraOrder: 1, status: { name: 'Open' }, summary: 'fourth' },
  {
    key: '2',
    jiraOrder: 2,
    status: { name: 'Closed' },
    resolution: { date: '2018-03-28T18:49:17.000Z' },
    summary: 'second',
  },
  {
    key: '3',
    jiraOrder: 3,
    status: { name: 'Closed' },
    resolution: { date: '2018-03-27T18:49:17.000Z' },
    summary: 'first',
  },
];

const statusProp = R.view(R.lensPath(['status', 'name']));
const byStatus = issue => R.findIndex(R.equals(statusProp(issue)))(stati);

const getResolutionDate = R.view(R.lensPath(['resolution', 'date']));
const byResDate = dateStr => (dateStr ? moment(dateStr).valueOf() : 0);
const byResolutionDate = issue => {
  return byResDate(getResolutionDate(issue));
};

const sorted = R.sortWith([
  R.ascend(byStatus),
  R.ascend(byResolutionDate),
  R.ascend(R.prop('jiraOrder')),
])(unsorted);

sorted.map(i => console.log(i.key, i.summary, i.status.name, getResolutionDate(i)));
