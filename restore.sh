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

# --- KOGUME VARUKOOPIAD ---
all_backups=()
local_backups=()

# 1. Lokaalsed varukoopiad
echo -e "${YELLOW}Searching for local backups...${NC}"
# Kasutame `find` et vältida probleeme, kui faile pole
shopt -s nullglob
for file in "$BACKUP_DIR"/*.tar.gz; do
    all_backups+=("$file (local)")
    local_backups+=("$file")
done
shopt -u nullglob

# 2. Kaughaldusega varukoopiad (GitHub Releases)
if command -v gh &> /dev/null && gh auth status &> /dev/null; then
    echo -e "${YELLOW}Searching for remote backups on GitHub...${NC}"
    # Kasutame while read, et vältida probleeme tühikutega failinimedes
    while IFS= read -r tag; do
        backup_path="$BACKUP_DIR/${tag}.tar.gz"
        # Kontrollime, kas see remote backup on juba lokaalselt olemas
        is_local=false
        for local_file in "${local_backups[@]}"; do
            if [[ "$local_file" == "$backup_path" ]]; then
                is_local=true
                break
            fi
        done
        
        if ! $is_local; then
            all_backups+=("$backup_path (remote)")
        fi
    done < <(gh release list --json tagName -q '.[].tagName' 2>/dev/null)
fi

# Sorteerime tulemused, et uuemad oleks eespool (pööratud sort)
IFS=$'\n' all_backups=($(sort -r <<<"${all_backups[*]}"))
unset IFS

# Kontrollime, kas backupe on
if [ ${#all_backups[@]} -eq 0 ]; then
    echo -e "${RED}Error: No local or remote backups found.${NC}"
    exit 1
fi

# Kuvame valikud interaktiivses menüüs
echo -e "${YELLOW}Please choose a backup to restore:${NC}"
PS3="Enter a number (or any other key to quit): "
select choice in "${all_backups[@]}"; do
  if [[ -n "$choice" ]]; then
    # Eemaldame "(local)" või "(remote)" markeri, et saada puhas failitee
    backup_file_path=$(echo "$choice" | sed -E 's/ \((local|remote)\)$//')
    echo -e "You have chosen to restore: ${GREEN}$backup_file_path${NC}"

    # Kui on remote, laeme selle esmalt alla
    if [[ "$choice" == *"(remote)"* ]]; then
        tag_to_download=$(basename "$backup_file_path" .tar.gz)
        echo -e "${YELLOW}This is a remote backup. Downloading from GitHub...${NC}"
        if ! gh release download "$tag_to_download" --pattern "*.tar.gz" --dir "$BACKUP_DIR" --clobber; then
            echo -e "${RED}Error: Failed to download backup from GitHub.${NC}"
            exit 1
        fi
        echo -e "${GREEN}Download complete.${NC}"
    fi

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
      tar -xzf "$backup_file_path" -C .

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
