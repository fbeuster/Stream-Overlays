param (
  [switch]$b = $false # build flag
)

# build client
if ($b) {
  Write-Host "Building client"
  cd client
  ng build
  cd ..
}

cd server

# build server
if ($b) {
  Write-Host "Building server..."
  npm run build_server
}

# start server
Write-Host "Starting server..."
npm run run_server