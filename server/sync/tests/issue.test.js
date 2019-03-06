import * as R from 'ramda';
import moment from 'moment';
import { toIssues } from '../issue';
import { storyPointsField } from '../jira';

const defaultInputIssue = {
  key: 'CJPM-9999',
  fields: {
    summary: 'SUMMARY',
    [storyPointsField]: 99,
    sprint: { notsure: 'doesnt matter?' },
    closedSprints: [{ notsure: 'doesnt matter?' }],
    resolution: {
      name: 'RESOLUTION_NAME',
    },
    resolutiondate: '2016-01-01T00:00:00.000+0000',
    status: {
      name: 'NOTResolved',
      statusCategory: {
        name: 'STATUS_STATUSCATEGORY_NAME',
      },
    },
  },
};

const buildInputIssue = () => R.clone(defaultInputIssue);

describe('issue', () => {
  describe('#toIssues', () => {
    it('should return empty array when given no issues', () => {
      const res = toIssues(null, null);
      expect(res).not.toBeNull();
      expect(res).toHaveLength(0);
    });

    it('should return an issue for each input', () => {
      const input = [buildInputIssue(), buildInputIssue()];
      const res = toIssues(input, null);
      expect(res).toHaveLength(2);
    });

    it('should parse the key', () => {
      const input = buildInputIssue();
      const res = toIssues([input], null)[0];
      expect(res.key).toBe(input.key);
    });

    it('should parse the summary', () => {
      const input = buildInputIssue();
      const res = toIssues([input], null)[0];
      expect(res.summary).toBe(input.fields.summary);
    });

    it('should parse the points', () => {
      const input = buildInputIssue();
      const res = toIssues([input], null)[0];
      expect(res.points).toBe(input.fields[storyPointsField]);
    });

    it('should parse the current sprint', () => {
      const input = buildInputIssue();
      const res = toIssues([input], null)[0];
      expect(res.currentSprint).toBe(input.fields.sprint);
    });

    it('should parse the closed sprints', () => {
      const input = buildInputIssue();
      const res = toIssues([input], null)[0];
      expect(res.currentSprint).toBe(input.fields.sprint);
    });

    it('should parse the status', () => {
      const input = buildInputIssue();
      const res = toIssues([input], null)[0];
      expect(res.status).toMatchObject({
        name: input.fields.status.name,
        category: input.fields.status.statusCategory.name,
      });
    });

    it('should parse the epic when exists', () => {
      const input = buildInputIssue();
      input.fields.epic = { name: 'EPIC_NAME', id: 7777 };

      const res = toIssues([input], null)[0];
      expect(res.epic).toMatchObject({ name: input.fields.epic.name, id: input.fields.epic.id });
    });

    it('should default the epic when it does not exist', () => {
      const input = buildInputIssue();
      const res = toIssues([input], null)[0];
      expect(res.epic).toMatchObject({ name: '', id: -1 });
    });

    it('should parse the resolution when exists', () => {
      const input = buildInputIssue();
      const res = toIssues([input], null)[0];
      expect(res.resolution).toMatchObject({
        name: input.fields.resolution.name,
        date: moment(input.fields.resolutiondate),
      });
    });

    it('should return empty resolution when none given', () => {
      const input = buildInputIssue();
      input.fields.resolution = null;
      input.resolutiondate = null;

      const res = toIssues([input], null)[0];
      expect(res.resolution).toMatchObject({ name: null, date: null });
    });

    it('should return resolvedInCurrent false when no given sprint', () => {
      const input = buildInputIssue();
      const res = toIssues([input], null)[0];
      expect(res.resolvedInSprint).toBe(false);
    });

    it('should return resolvedInCurrent false when resolutiondate outside of sprint', () => {
      const input = buildInputIssue();
      const sprint = {
        startDate: moment(input.resolutiondate).add(1, 'days'),
        completeDate: moment(input.resolutiondate).add(2, 'days'),
      };
      const res = toIssues([input], sprint)[0];
      expect(res.resolvedInSprint).toBe(false);
    });

    it('should return resolvedInCurrent true when resolutiondate inside of sprint', () => {
      const input = buildInputIssue();
      const sprint = {
        startDate: moment(input.fields.resolutiondate).subtract(1, 'days'),
        completeDate: moment(input.fields.resolutiondate).add(1, 'days'),
      };
      const res = toIssues([input], sprint)[0];
      expect(res.resolvedInSprint).toBe(true);
    });

    it('should return resolvedInCurrent false when outside sprint, status !resolved', () => {
      const input = buildInputIssue();
      input.fields.resolution = null;
      input.resolutiondate = null;

      const sprint = {
        startDate: moment(input.fields.resolutiondate).subtract(1, 'days'),
        completeDate: moment(input.fields.resolutiondate).add(2, 'days'),
      };
      const res = toIssues([input], sprint)[0];
      expect(res.resolvedInSprint).toBe(false);
    });

    it(`should return resolvedInCurrent false when outside sprint,
            status resolved, currentsprint exists`, () => {
      const input = buildInputIssue();
      input.fields.status.name = 'Resolved';
      input.fields.resolution = null;

      const sprint = {
        startDate: moment(input.fields.resolutiondate).add(1, 'days'),
        completeDate: moment(input.fields.resolutiondate).add(2, 'days'),
      };

      const res = toIssues([input], sprint)[0];
      expect(res.resolvedInSprint).toBe(false);
    });

    it(`should return resolvedInCurrent false when outside sprint,
            status resolved, no currentsprint, no closed sprints`, () => {
      const input = buildInputIssue();
      input.fields.status.name = 'Resolved';
      input.fields.resolution = null;
      input.fields.sprint = null;
      input.fields.closedSprints = [];

      const sprint = {
        startDate: moment(input.fields.resolutiondate).add(1, 'days'),
        completeDate: moment(input.fields.resolutiondate).add(2, 'days'),
      };

      const res = toIssues([input], sprint)[0];
      expect(res.resolvedInSprint).toBe(false);
    });

    it(`should return resolvedInCurrent false when outside sprint,
            status resolved, no currentsprint, latest closed sprints !== given sprint`, () => {
      const input = buildInputIssue();
      input.fields.status.name = 'Resolved';
      input.fields.resolution = null;
      input.fields.sprint = null;
      input.fields.closedSprints = [{ id: 9999 }];

      const sprint = {
        id: -1,
        startDate: moment(input.fields.resolutiondate).add(1, 'days'),
        completeDate: moment(input.fields.resolutiondate).add(2, 'days'),
      };

      const res = toIssues([input], sprint)[0];
      expect(res.resolvedInSprint).toBe(false);
    });

    it(`should return resolvedInCurrent true when outside sprint,
            status resolved, no currentsprint, latest closed sprint === given sprint`, () => {
      const input = buildInputIssue();
      input.fields.status.name = 'Resolved';
      input.fields.resolution = null;
      input.fields.sprint = null;
      input.fields.closedSprints = [{ id: 9999 }];

      const sprint = {
        id: 9999,
        startDate: moment(input.fields.resolutiondate).add(1, 'days'),
        completeDate: moment(input.fields.resolutiondate).add(2, 'days'),
      };

      const res = toIssues([input], sprint)[0];
      expect(res.resolvedInSprint).toBe(true);
    });
  });

  describe('#toSummaryString', () => {
    it('should return string containing issue data', () => {
      const res = toIssues([buildInputIssue()], null)[0].toSummaryString();
      expect(res).toEqual(expect.stringMatching(defaultInputIssue.key));
      expect(res).toEqual(expect.stringMatching(defaultInputIssue.fields.resolution.name));
      expect(res).toEqual(expect.stringMatching(defaultInputIssue.fields.status.name));
      expect(res).toEqual(
        expect.stringMatching(defaultInputIssue.fields.status.statusCategory.name)
      );
    });
  });
});
