#!/usr/bin/fish
set USAGE "Usage: ./rebuild.sh ?[OPTION]\nOPTION may be one of the following\n\t- frontend OR f\n\t- backend OR b"
if test (count $argv) -eq 0
    docker compose stop
    docker compose build --no-cache
else if test (count $argv) -eq 1
    if string match -q $argv[1] "frontend"; or string match -q $argv[1] "f"
        docker compose stop frontend
        docker compose build frontend
    else if string match -q $argv[1] "backend"; or string match -q $argv[1] "b"
        docker compose stop backend
        docker compose build --no-cache backend
    else 
        echo -e $USAGE
        exit 0
    end
else
    echo -e $USAGE
    exit 0
end
docker compose up -d
