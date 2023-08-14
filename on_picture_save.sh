#!/bin/bash
echo "Script started" >> /home/josephmckenzie/motion/debug.log

FLAG_FILE=/home/josephmckenzie/motion/debug.log
PICTURE_FILE=$1

echo "Checking for flag file $FLAG_FILE" >> /home/josephmckenzie/motion/debug.log

if [ -f "$FLAG_FILE" ]; then
  echo "Flag file found" >> /home/josephmckenzie/motion/debug.log
  # Perform the desired action with the picture file, e.g. send a push notification
  ts-node /home/josephmckenzie/code/raspberrypi_surveillance/src/handleEvents.ts onPictureSave $1

  # Remove the flag file
  rm "$FLAG_FILE"
else
  echo "Flag file not found" >> /home/josephmckenzie/motion/debug.log
  
fi
