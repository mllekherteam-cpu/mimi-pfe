# Sync this Mimi folder with the website (GitHub repo).
# Pulls what Mimi added on the site, then pushes what changed here.
Set-Location $PSScriptRoot
git pull --rebase --autostash
git add -A
$changes = git status --porcelain
if ($changes) {
  git commit -m ("Omar PC sync " + (Get-Date -Format "yyyy-MM-dd HH:mm"))
}
git push
Write-Host "Done: folder and website are in sync." -ForegroundColor Green
