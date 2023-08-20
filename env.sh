#!/bin/bash

# Path to your .env file
env_file= '/home/josephmckenzie/code/raspberrypi_surveillance/.env'

# Temporary file to store the formatted output
temp_file=$(mktemp)

# Iterate through the .env file and remove spaces around the '=' sign
while IFS= read -r line
do
  key=$(echo "$line" | cut -d '=' -f 1 | tr -d ' ')
  value=$(echo "$line" | cut -d '=' -f 2- | tr -d ' ')
  echo "$key=$value" >> "$temp_file"
done < "$env_file"

# Replace the original .env file with the formatted content
mv "$temp_file" "$env_file"

# Provide information about the change
echo ".env file has been formatted successfully."
