#!/bin/bash
source /home/josephmckenzie/code/raspberrypi_surveillance/.env
PROJECT_ROOT="${HOME}/code/raspberrypi_surveillance"
LOG_FILE=$PROJECT_ROOT/debug.log
FLAG_FILE=$PROJECT_ROOT/flag.txt
PICTURE_FILE=$1

echo "Script started" >> $LOG_FILE
echo "Checking for flag file $FLAG_FILE" >> $LOG_FILE
echo "ADMIN_EMAIL: $ADMIN_EMAIL"

if [ ! -f "$PICTURE_FILE" ]; then
  echo "Picture file not found" >> $LOG_FILE
  exit 1
fi

if [ -f "$FLAG_FILE" ]; then
  echo "Flag file found" >> $LOG_FILE
    ts-node /home/josephmckenzie/code/raspberrypi_surveillance/src/handleEvents.ts onPictureSave $1

  rm "$FLAG_FILE"
else
  echo "Flag file not found" >> $LOG_FILE
fi

# Rest of the script

