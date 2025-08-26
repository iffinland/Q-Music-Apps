#!/bin/bash

# Värvid terminali väljundi jaoks
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BACKUP_DIR="backups"

# Kontrollime, kas backup kaust eksisteerib
if [ ! -d "$BACKUP_DIR" ]; then
  echo -e "${RED}Error: Backup directory '$BACKUP_DIR' not found.${NC}"
  exit 1
fi

# Leiame kõik .tar.gz backup failid
backups=("$BACKUP_DIR"/*.tar.gz)

# Kontrollime, kas backupe on
if [ ${#backups[@]} -eq 0 ] || [ ! -e "${backups[0]}" ]; then
    echo -e "${RED}Error: No backups found in '$BACKUP_DIR'.${NC}"
    exit 1
fi

# Kuvame valikud interaktiivses menüüs
echo -e "${YELLOW}Please choose a backup to restore:${NC}"
PS3="Enter a number (or any other key to quit): "
select backup_file in "${backups[@]}"; do
  if [[ -n "$backup_file" ]]; then
    echo -e "You have chosen to restore: ${GREEN}$backup_file${NC}"

    # Küsime kinnitust
    read -p "Are you sure? This will overwrite your current files. (y/N) " -n 1 -r
    echo # lisame reavahetuse

    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${YELLOW}Restoring...${NC}"

      # Teeme igaks juhuks praegusest seisust kiire varukoopia
      PRE_RESTORE_FILE="$BACKUP_DIR/pre-restore-$(date +"%Y-%m-%d_%H-%M-%S").tar.gz"
      echo "Creating a pre-restore backup at $PRE_RESTORE_FILE..."
      tar -czvf "$PRE_RESTORE_FILE" --exclude="./${BACKUP_DIR}" . > /dev/null 2>&1

      # Pakime valitud backupi lahti praegusesse kausta, kirjutades failid üle
      tar -xzf "$backup_file" -C .

      echo -e "${GREEN}Restore complete!${NC}"
      echo "It is recommended to run 'npm install' to restore dependencies."
      break
    else
      echo "Restore cancelled."
      break
    fi
  else
    echo "Quitting."
    break
  fi
done
