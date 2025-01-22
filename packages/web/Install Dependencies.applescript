-- Install Dependencies Script
-- This script will install all pnpm dependencies for the project

-- Get the path to the project directory
set projectPath to POSIX path of (choose folder with prompt "Select the project folder containing package.json")

-- Open Terminal and run commands
tell application "Terminal"
    activate
    do script "cd " & quoted form of projectPath & " && pnpm install"
end tell

-- Show completion message
display dialog "Dependencies installation started in Terminal. Please wait for it to complete." buttons {"OK"} default button "OK"
