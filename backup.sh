#!/bin/bash

# Värvid terminali väljundi jaoks
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# --- KONFIGURATSIOON ---
# Loome backup kausta, kui see ei eksisteeri
BACKUP_DIR="backups"
MAX_LOCAL_BACKUPS=3 # Mitu lokaalset ajatempliga varukoopiat säilitada
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

# --- GITHUB RELEASE UPLOAD ---
# Kontrollime, kas GitHub CLI (gh) on paigaldatud
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}Warning: GitHub CLI 'gh' not found. Skipping remote backup.${NC}"
    echo "To enable remote backups, install gh: https://cli.github.com/"
else
    # Kontrollime, kas oleme autenditud
    if gh auth status &> /dev/null; then
        echo -e "${YELLOW}Uploading backup to GitHub Releases...${NC}"
        
        # Loome release'i sildiga, mis vastab failinimele (ilma laiendita)
        RELEASE_TAG="${FILENAME%.tar.gz}"
        
        # Kasutame --clobber, et 'stable' release'i saaks üle kirjutada
        gh release create "$RELEASE_TAG" "$BACKUP_PATH" --title "Backup $RELEASE_TAG" --notes "Automated backup created on $(date)" --clobber > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Successfully uploaded to GitHub Releases.${NC}"
        else
            echo -e "${RED}Error: Failed to upload to GitHub Releases. Check permissions.${NC}"
        fi
    else
        echo -e "${YELLOW}Warning: Not logged in to GitHub CLI. Skipping remote backup.${NC}"
        echo "Run 'gh auth login' to enable remote backups."
    fi
fi

# --- LOKAALNE PUHASTUS (hoiab viimased MAX_LOCAL_BACKUPS koopiat) ---
echo -e "${YELLOW}Cleaning up old local backups...${NC}"
# Leiame ainult ajatempliga varukoopiad, sorteerime aja järgi (uuemad ees)
files=($(ls -t "$BACKUP_DIR"/backup-*.tar.gz 2>/dev/null))
count=${#files[@]}

if [ "$count" -gt "$MAX_LOCAL_BACKUPS" ]; then
    echo "Found $count timestamped backups. Keeping the latest $MAX_LOCAL_BACKUPS."
    # Kustutame vanimad failid (mis on listi lõpus)
    for (( i=$MAX_LOCAL_BACKUPS; i<$count; i++ )); do
        echo "Deleting old backup: ${files[$i]}"
        rm "${files[$i]}"
    done
    echo -e "${GREEN}Cleanup complete.${NC}"
else
    echo "No old backups to clean up."
fi