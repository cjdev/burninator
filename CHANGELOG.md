# 3.12.4 (2019.01.31)

## Fixed

- General: side navigation expand hover color

## Changed

- Burninator: issue list layout improvements
- Snapshots: list layout improvements
- General: continued refactoring to functional components / hooks

# 3.12.3 (2019.01.30)

## Fixed

- General: side navigation bug after icon update
- General: better loading state in snapshot selector
- Synopsis: fixed loading bug

## Removed

- General: unnecessary global CSS

# 3.12.2 (2019.01.29)

## Added

- Server: primitive server profile logging

## Fixed

- Server: server ignoring log level config

# 3.12.1 (2019.01.29)

## Added

- General: environment variable to control socket connection method.

# 3.12.0 (2019.01.28)

## Added

- Burninator: Sync/Reset with incremental status updates
- Burninator: Issue list release focus overlay
- Comparinator: Add button to expand release details
- About: Trogdor

## Changed

- General: Font sizes
- General: Icons/spinner
- General: API error handling improvements
- General: Front end error handling improvements
- General: Migrate icons from mdi-react to @mdi/react and @mdi/js
- Burninator: Issue list layout improvements
- Burninator: Invalid board panel improvements
- About: Add Board improvements
- Changelog: Changed format of updates to group by types of changes
  - https://keepachangelog.com/en/1.0.0/

## Removed

- Build: git commit hooks
- General: Move Jira URL to environment variable

## Fixed

- Burninator: post-sync config bug
- Burninator: stale relative age in release panel

# 3.11.0 (2019.01.24)

## General

- Swap polished.normalize for `styled-normalize`
- Upgrade `visual-stack` to 3.1.0
- Refactor to VS Buttons
- Consistent API error handling / reporting

## Burninator

- Redo layout in CSS Grid
- Small chart improvements
- Change history link to button
- Fix velocity graph bug
- Fix archive bug
- Fix config saving bug

## Chores

- Remove legacy file migration on startup
- Refactor actions to `redux-actions` lib
- Refactor reducers to `redux-actions` lib
- Improve `server:dev` script to watch less files
- Refactor server-side logging for clarity, consistency
- Move sync code under server directory
- Refactor database api for better encapsulation

- Upgrade

# 3.10.0 (2019.01.03)

## Burninator

- Fix alignment of key in mobile view
- Make history view available via link on iterations panel

## Chores

- Fix stop/start scripts to interact with `forever` cleanly

# 3.9.0 (2018.12.12)

## Burninator

- Update the invalid board messaging to warn about board permissions
- Fix `history` secret menu option

## Comparinator

- Remove green color when dates are the same across snapshots

## Chores

- Fix more React DOM warnings
- Standardize on npm / package-lock.json over yarn / yarn.lock
- Switch from enzyme to react-testing-library in prep for more UI tests
- Update deps: ramda, eslint-plugin-jest, mdi-react

# 3.8.0 (2018.11.05)

## Burninator

- Stalled stories now only counts weekdays
- Improve tooltip on stalled story alert
- Constant chart bar height for clarity

## Boards List

- Add standard page-level spinner while board list is loading

## Synopsis

- Brought Synopsis UI in line with the rest of the app.

## Chores

- Fix React DOM warnings
- Simplify redux state schema
- Introduce redux-actions to reduce redux boilerplate
- Introduce react-testing-ilbrary, jest-dom, jest-styled-components
- Introduce eslint plugins for hooks, jest

# 3.7.1 (2018.11.02)

- Update start script to use npm.

# 3.7.0 (2018.11.02)

Stalled Stories

As we all know, stories sometime take longer than estimated. They are, after all, estimates. Occasionally, a story will go way beyond the estimate and we've noticed that teams often lose track of the time these **_stalled_** stories sit on their board.

When thinking about the problem, the definition of stalled is not only a function of the original estimate and the velocity of the team, but also team-specific culture. Even for teams with the same velocity, the idea of when to consider a 5 point story stalled varies.

The stalled stories feature attempts to highlight these stories by comparing how long a story is "in progress" against board-specific configured values. This gives the team an ability to express their idea of when the tool should highlight a stalled story to them.

For stories estimated from 1 - 13 points, teams can define a number of days to consider a stalled threshold. Stories in progress beyond this time will be highlighted in the issue list. When a board does not have a threshold for a point estimate value, the system will not highlight stories for that estimate value.

![stalled stories configuration](/images/changelog/stalled-stories-config.png)

![stalled stories data](/images/changelog/stalled-stories-data.png)

![stalled stories highlighting](/images/changelog/stalled-stories-highlight.png)

## Burninator

- Stalled stories configuration
- Stalled stories highlighting in issue list
- Better indication of backlog table async loading
- Move button to exclude story to specific icon

## Snapshots

- Tweak layout and colors of snapshot action buttons

## General

- Improved start / stop deployment scripts
- Fixed React warning about non-standard DOM attributes
- Fixed PropType warnings
- Lots of dependency upgrades: React, Babel, etc.

# 3.6.1 (2018.10.11)

- Fix Changelog

# 3.6.0 (2018.10.11)

More small, mostly behind the scenes changes, including refactoring, server improvements, dependency upgrades, etc.

A few visible features:

Clicking on the version title in the versions table in Burninator will now navigate to the screen in Jira for that version.

The Burninator charts will now not show tooltips by default. Each chart now has a checkbox to enable the tooltips.

The Comparinator expanded view has been revamped to show total points, remaining points and story count more clearly.

## General

- Upgrade dependencies: ramda, visual-stack, redux, winston, axios, etc.
- Server logging improvements
- Fixed server logging of options on startup
- Refactored to isolate / dedupe the Jira server URL
- Updated README with up to date local dev instructions
- Refactor to isolate usage to momentjs
- Added test coverage to date / time utilities
- Added missing propTypes

## Burninator

- Version table links to Jira screen
- Added toggle to charting tooltips
- Error screen improvements

## Comparinator

- Better formatting of points / stories in expanded view

## Snapshots

- Add navigation back to Burninator for board

# 3.5.0 (2018.08.29)

Small, mostly behind the scenes update, including updating library dependencies. There is one visible change.

## Boards List

The home screen that lists the available boards has been tweaked to show a more accurate age and reformatted columns.

# 3.4.0 (2018.04.28)

This release features many small tweaks and bug fixes in addition to a couple of bigger features.

## Snapshot management

The Burninator snapshot panel now has a 'manage' link to a snapshot management screen. This screen allows for archiving and unarchiving snapshots. Archived snapshots will not appear in the snapshot selector on both the Burninator and Comparinator screens. Snapshots can also be given names. This could be handy to note snapshots as used in product update meetings, after significant release planning sessions, etc.

## No More Latest/Current Board

Previously, Burninator had the notion of the 'latest' board in the snapshot selector and, similarly, a 'current' version used in URls and other parts of the code. This has been removed. Now, all urls will either explicitly state the version or no version at all. The app will figure out the latest/current when needed.

This will help with deterministic behavior of bookmarked / pasted URLs that formerly would change over time. Thanks for Greg Wiley for the suggestion.

## Snapshots

- Spinner panel during shap shot loading
- (Re)name a snapshot
- Archive / unarchive snapshots
- List view of snapshots

## Burninator

- Fix version table sorting to consult order of relevant stories when two version have same date
- Add 'Needs SOX' to the zero points categories
- Version table shows correct points when excluding stories
- Page/Tab titles
- Show snapshot name in selector
- Filter archived snapshots in selector
- Data: Store all data in history directory; remove the distinction between current and history
- Data: File migration job invoked through server command line option
- Issue List: Line-through the points field for stories not part of the date calculations (closed, etc.)
- Bug: reset the list of excluded stories when switching snapshots
- Remove current/latest from snapshot selector
- Make all panel title text the same size

## Comparinator

- Add hours,minutes,seconds to time stamp for each version
- Tighten comparison table header structure
- Show snapshot name in selector
- Filter archived snapshots in selector
- Remove current/latest from snapshot selector
- Remove old V1 Comparinator tables

## About

- Move about box above changlelog
- Fixed 3.3.0 changelog date

# 3.3.0 (2018.04.13)

The main feature in this release is the ability to "exclude" stories in the issue list. Clicking on the row number for an
issue will exclude the story and recalculate all the dates for the entire backlog. Clicking again will re-include the
story. NOTE that this is not stateful! Refreshing the page will reset all exclusions. Note also that the version table
will display a warning that stories are excluded and the dates are not real.

The feature is intended for a couple of use cases:

## Scope Cutting Scenarios

Understand the impact of cutting scope on estimates. Click the stories under consideration and the dates will all
recalculate.

## Dev Done Stories

As stories near completion, counting their full points can distort the estimate dates negatively. Carefully excluding these stories from the list will help correct this distortion.

## Burninator

- Issue List: Allow stories to temporarily be "excluded" from estimate calculations
- Issue List: Display "closed" issues in the current iteration
- Issue List: Handle no outside date for closed issues
- Issue List: Sorting for current iteration issues includes date within a status
- Release Panel: Back off age warning from 4 hours to 24 hours
- Test coverage for function that builds issue list
- Minor changes to the spacing of labels in the version burndown
- Upgrade dependencies: react, react-dom, react-scripts, etc.

# 3.2.0 (2018.03.31)

This is a big release with significant changes to Comparinator based on usage and feedback. The tool now supports more than two comparison versions, allows users to add and remove versions dynamically, sorts left to right, and focusses on each version's outside dates, rather than confusing delta calculations. Hopefully the streamlined format is more understandable and usable in product update and director sync meetings. The issue list has been similarly restructured and is also always displayed now.

Small changes to the main Burninator screen includes highighting a release in the issue list (by clicking on the release name), more links back to Jira where appropriate, and some formatting tweaks and fixes.

This release also contains updates to some key dependencies, including React 16.3. Burninator continues to be a testing
ground for new and updated versions of libs we depend on in our production systems.

## Comparinator

- Issue list visible by default
- Add issue and total point counts to description row
- Rewrite comparison algorithm for simplicity
- Add a version to the comparison list dynamically via drop down
- Click to remove a version from comparison list
- Add header link to Jira board
- Always sort versions based on time, regardless of order in URL
- Allow filtering to first N rows of release plan
- Show description of a single row
- Handle comparison of > 2 versions
- Move old Comparinator format to secret menu ('v1')

## Burninator

- Highlight the release plan section title when a board is stale (older than 4 hours)
- Sort release plan versions by outside date
- Toggle version highlighting in issue list
- Handle overflow better in issue list
- Fix issue history table widths
- Add Jira links to key and summary of issue history

## About

- Fix new board form width

## General

- Tweak sync color buttons
- Better consistency of loading / spinner usage
- Fix color consistency with theme
- Update dependencies

# 3.1.0 (2018.01.22)

## General

- Fixed velocity chart date sorting. Closes #43.
- Changed existing Table to use visual-stack Table components.
- Upgraded dependencies.
- Removed 'New' label from secret menu item

# 3.0.0 (2017.12.21)

## Comparinator

Comparinator gets a big upgrade in an effort for emphasize outside dates over inside dates and support progress reporting by team leads. Going forward, snapshots will include complete version objects, including id fields. When comparinator encounters two snapshots that both have these objects, it will compare based on the ids. This will better handle version name changes.

- Move inside dates behind checkbox
- Add version descriptions, behind checkbox
- Simplify colors indicating +/- timelines
- Removed issue list by default - available by adding 'issues' to the query string of the screen.
- Added initial support for tracking versions by id rather than name.

## Burninator

- Enlarge left column to allow more space for version names.
- Move version table to top of left column.
- Remove inside date reference line from version burndown chart.
- Change color of version burndown outside date reference line.
- Change number of past iterations shown in the iteration table to 10.

## About

- Add changelog.

# 2.3.2 (2017.12.15)

## Burninator

- Fix broken weekly velocity graph.

# 2.3.1 (2017.12.11)

## Burninator

- Fix velocity graph when no data.

# 2.3.0 (2017.12.11)

## Burninator

- Add tests to the core calculations.

# 2.2.0 (2017.12.08)

- Upgrade dependences

## Burninator

- Tweak version chart layout for readability:
  - Shrink bars to half height.
  - Move version name above bar.
  - Increase Y-axis to give room to versions up at the top.
  - Increase Y-axis to give room to versions up at the top.
