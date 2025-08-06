#!/usr/bin/fish
set USAGE "Usage: ./rebuild.sh ?[ frontend / f / backend / b]"

# Stop and rebuild
if test (count $argv) -eq 0
    docker compose stop
    docker compose build --progress=plain
else if test (count $argv) -eq 1
    if string match -q $argv[1] "frontend"; or string match -q $argv[1] "f"
		set SERVICE "frontend"
    else if string match -q $argv[1] "backend"; or string match -q $argv[1] "b"
		set SERVICE "backend"
    else 
        echo -e $USAGE
        exit 0
    end
	docker compose stop $SERVICE
	docker compose build $SERVICE --progress=plain
else
    echo -e $USAGE
    exit 0
end

# Relaunch
docker compose up -d
