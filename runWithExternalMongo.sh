export HOSTNAME=`hostname`

if [ $HOSTNAME == "guia.erogenafm.com" ]; then
    echo RUNNING APPLICATION IN PRODUCTION MODE
    export ROOT_URL=http://guia.erogenafm.com
    export MONGO_URL=mongodb://guia.erogenafm.com:27017/guiaerogena
    meteor --production --port 80 run
else
    echo RUNNING APPLICATION IN DEVELOPMENT MODE
    export ROOT_URL=http://localhost:3000
    export MONGO_URL=mongodb://localhost:27017/guiaerogena
    meteor --port 3000 run
fi
