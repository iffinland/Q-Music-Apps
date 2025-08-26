#!/bin/bash

# Värvid terminali väljundi jaoks
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Loome backup kausta, kui see ei eksisteeri
BACKUP_DIR="backups"
mkdir -p $BACKUP_DIR

# Määrame failinime vastavalt argumendile
if [ "$1" == "stable" ]; then
  FILENAME="stable-backup.tar.gz"
  echo -e "${YELLOW}Creating STABLE backup...${NC}"
else
  TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
  FILENAME="backup-${TIMESTAMP}.tar.gz"
  echo -e "${YELLOW}Creating timestamped backup...${NC}"
fi

BACKUP_PATH="$BACKUP_DIR/$FILENAME"

# Pakime failid, välistades ebavajalikud kaustad.
# Jätame .git kausta sisse, et säilitada versiooniajalugu.
tar -czvf "$BACKUP_PATH" \
  --exclude='./dist' \
  --exclude='./node_modules' \
  --exclude="./${BACKUP_DIR}" \
  . > /dev/null 2>&1

# Kontrollime, kas pakkimine õnnestus
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Backup successfully created at: ${BACKUP_PATH}${NC}"
else
  echo -e "\033[0;31mError: Backup creation failed.${NC}"
  exit 1
fi