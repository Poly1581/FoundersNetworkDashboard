USAGE="Usage: ./rebuild.sh ?[ frontend / f / backend / b / test]"

# Stop and rebuild
if [ "$#" -eq 0 ]; then
    docker compose stop
    docker compose build --progress=plain
elif [ "$#" -eq 1 ]; then
    if [ $1 = "frontend" ] || [ $1 = "f" ]; then
		!./rebuild.fish
		SERVICE="frontend"
    elif [ $1 = "backend" ] || [ $1 = "b" ]; then
		SERVICE="backend"
    elif [ $1 = "test" ]; then
        echo "Running backend tests..."
        docker compose exec backend python manage.py test --parallel
        exit 0
    else
        echo -e $USAGE
        exit 0
    fi
	docker stop $SERVICE
	docker compose build $SERVICE --progress=plain
else
    echo -e $USAGE
    exit 0
fi

# Relaunch
docker compose up -d
