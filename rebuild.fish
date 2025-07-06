#!/usr/bin/fish
docker compose stop
docker compose build
docker compose up -d
