# Founders Network Dashboard

A centralized platform observability dashboard for admins to look at in the founders network site.

## 💻 Installation

Both frontend and backend are launched via docker compose. To start both, execute `docker compose up -d` in the project directory. Only one `.env` file is required - place it in the project root directory.

Rebuild scripts are included for fish and bash and are used to rebuild one (or both) docker containers during development. To rebuild both containers, run `./rebuild.sh`, to rebuild the frontend run `./rebuild.sh frontend` or `./rebuild.sh f`, and to rebuild the backend run `./rebuild.sh backend` or `./rebuild.sh b` (replace `./rebuild.sh` with `./rebuild.fish` if using fish).


## Core Design Principles (from Slack chat with Kevin: https://foundersnetwork.slack.com/archives/C090W77DRA8/p1750195343184929)
Internal tool that gives immediate visibility into FN’s integrations **before they impact** members

**Real-time** Internal Monitoring

**Automatic**ally detects problems through **health checks**

**Monitors** FN’s actual API **endpoints**

**Tracks** response **times** and error **patterns** specific to FN’s platform

Designed around FN’s **specific integrations** (customized to Sentry’s specific information)
