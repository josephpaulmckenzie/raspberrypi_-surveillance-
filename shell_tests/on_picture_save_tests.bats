#!/usr/bin/env bats
PROJECT_ROOT="${HOME}/code/raspberrypi_surveillance"

onPictureSaveScript="${PROJECT_ROOT}/on_picture_save.sh"
debug_file="${PROJECT_ROOT}/debug.log"
flag_file="${PROJECT_ROOT}/flag.txt"
echo $flag_file
picture_file="${PROJECT_ROOT}/08112023152315-02.jpg"
echo $picture_file

@test "Flag file found and processed" {
  touch $flag_file # Create the flag file
  run bash $onPictureSaveScript $picture_file
  [ "$status" -eq 0 ] # Check if the script exited without errors
  [ "$(grep -c "Flag file found" $debug_file)" -eq 1 ] 
}

@test "Flag file not found" {
  rm -f $flag_file 
  run bash $onPictureSaveScript $picture_file
  [ "$status" -eq 0 ] # Check if the script exited without errors
  [ "$(grep -c "Flag file not found" $debug_file)" -eq 1 ] # Check if the log file contains the message
}

@test "Environment variables are set correctly" {
  run bash -c 'source ${HOME}/code/raspberrypi_surveillance/.env && echo $ADMIN_EMAIL'
  [ "$output" = $ADMIN_EMAIL ] 
}
