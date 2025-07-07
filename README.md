# Founders Network Dashboard

A centralized platform observability dashboard for admins to look at in the founders network site.

## 💻 Installation

Both frontend and backend are launched via docker compose. To start both, execute `docker compose up -d` in the project directory. Only one `.env` file is required - place it in the project root directory.

Rebuild scripts are included for fish and bash and are used to rebuild one (or both) docker containers during development. To rebuild both containers, run `./rebuild.sh`, to rebuild the frontend run `./rebuild.sh frontend` or `./rebuild.sh f`, and to rebuild the backend run `./rebuild.sh backend` or `./rebuild.sh b` (replace `./rebuild.sh` with `./rebuild.fish` if using fish).
