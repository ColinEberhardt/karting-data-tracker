# Tyre Data Upload Script

This script reads the CSV file `Logbook - Tyres.csv` and uploads the data to your Firestore database.

## Setup

1. Install dependencies:
   ```bash
   cd upload
   npm install
   ```

2. **Set up Firebase Service Account** (REQUIRED):
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `karting-tracker-59e58`
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key" to download a service account JSON file
   - **IMPORTANT**: Save it as `service-account-key.json` in this directory
   - **SECURITY**: This file is automatically ignored by git (.gitignore) - NEVER commit it!

## Usage

### Get Your User ID

First, you need to get your user ID from the Firebase Auth console or by logging into your app and checking the browser console where `auth.currentUser.uid` is logged.

### Run the Upload

```bash
node upload-tyres.js YOUR_USER_ID_HERE
```

Example:
```bash
node upload-tyres.js "abc123def456ghi789"
```

## What the Script Does

1. **Reads** the CSV file with your tyre data
2. **Converts** the data to match your Firestore schema:
   - `ID` → `name` (tyre identifier)
   - `Make` → `make` (manufacturer)
   - `Type` → `type` (Slick, Wet, etc.)
   - `Description` → `description`
   - `retired` (Y/N) → `retired` (boolean)
3. **Adds** required fields:
   - `userId` (links to your account)
   - `createdAt` (timestamp)
   - `importedFrom` and `importedAt` (for tracking)
4. **Uploads** all records to Firestore in a batch

## Data Mapping

Your CSV columns are mapped as follows:

| CSV Column | Firestore Field | Type | Notes |
|------------|----------------|------|-------|
| ID | name | string | Tyre identifier (e.g., "#010") |
| Make | make | string | Manufacturer (Maxxi, Mojo) |
| Type | type | string | Tyre type (Slick, Wet, Dry) |
| Description | description | string | Additional details |
| retired | retired | boolean | Y → true, N → false |

## Security Notes

- **CRITICAL**: The `service-account-key.json` file contains sensitive credentials
- This file is automatically excluded from git via `.gitignore`
- NEVER commit or share this file publicly
- The script requires authentication via service account for security
- All uploaded tyres will be associated with the provided user ID
- The script uses batch writes for efficiency and atomicity

## Troubleshooting

- **Permission denied**: Make sure your service account has Firestore write permissions
- **Service account file not found**: Ensure `service-account-key.json` exists in the upload directory
- **User ID not found**: Double-check the user ID from Firebase Auth console
- **CSV parsing errors**: Ensure the CSV file is properly formatted with commas as separators
- **Connection errors**: Check your internet connection and Firebase credentials