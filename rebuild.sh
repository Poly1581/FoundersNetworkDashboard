USAGE="Usage: ./rebuild.sh ?[OPTION]\nOPTION may be one of the following\n\t- frontend OR f\n\t- backend OR b"
if [ "$#" -eq 0 ]; then
    # Rebuild everything
    docker compose stop
    docker compose build --no-cache
elif [ "$#" -eq 1 ]; then
    if [ $1 = "frontend" ] || [ $1 = "f" ]; then
        # Only rebuild frontend
        docker stop frontend
        docker compose build frontend
    elif [ $1 = "backend" ] || [ $1 = "b" ]; then
        # Only rebuild backend
        docker stop backend
        docker compose build --no-cache backend
    else
        echo -e $USAGE
        exit 0
    fi
else
    echo -e $USAGE
    exit 0
fi
# Restart
docker compose up -d
