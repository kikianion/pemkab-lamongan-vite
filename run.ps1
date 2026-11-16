# Navigate to your project folder
Set-Location -Path "K:\+_WORKING_++++++++++++++\pemkab-lamongan-vite"

# Optional: Set the window title
$Host.UI.RawUI.WindowTitle = "rumah layanan 2"

# Run the dev server
npm run dev

# Keep the window open if the server crashes or stops
Read-Host -Prompt "Server stopped. Press Enter to exit"