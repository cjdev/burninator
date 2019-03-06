# Burninator

Jira-driven burndowns.

#### Installation

Run `yarn install` in the root directory.

If the first time installing, create a `data` directory on the root directory.

#### Running the app locally

Concurrently, in separate consoles, run:

`yarn run server:dev` (hot reloads the server) or `yarn run server`

`yarn run client`

Navigate to http://localhost:3000 (or your port if modified in package.json).

#### Connecting to Jira

The server reads Jira configuration from a `./.env` file that defines environment variables:

```
JIRA_ROOT_URL=https://jira.somewhere.com
JIRA_USERNAME='<username>'
JIRA_PASSWORD='<password>'
```

Note that `.env` is in the `.gitignore` and will not be committed. See the `.env.sample` as a starter.

#### Assumptions

Burninator makes some assumptions about the shape of your Jira board:

- Scrum board, not Kanban
- Only sprints that were created via the board can be included
  - It turns out that sprints can be created on one board and appear in another!?!?!
  - Try not to do that
- The start date of the earliest sprint is appropriate to use for calculating the burndown
- ~~Release blocks exist in Jira as Versions~~

##### Install and Run

From the burninator directory:

```
./scripts/start.sh
```

##### Stop

```
./scripts/stop.sh
```

Unfortunately, the servers don't always exit cleanly and ports are blocked. This script will output the PIDs of the offending processes. Kill the PIDs on the far right that match the ports.

```
$ ./scripts/stop.sh
(node:6793) DeprecationWarning: Using Buffer without `new` will soon stop working. Use `new Buffer()`, or preferably `Buffer.from()`, `Buffer.allocUnsafe()` or `Buffer.alloc()` instead.
info:    Forever stopped processes:
data:        uid  command        script forever pid  id logfile                                   uptime
data:    [0] wKup yarn run start        6135    6151    logs/burn.log 0:0:7:30.613
(Not all processes could be identified, non-owned process info
 will not be shown, you would have to be root to see it all.)
tcp        0      0 :::3000                     :::*                        LISTEN      6243/node
tcp        0      0 :::3001                     :::*                        LISTEN      6237/node
$ kill 6243 6237
```
