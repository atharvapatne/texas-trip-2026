# Texas x F1 trip site (toon edition)

Plain HTML, CSS and JS. Pages: index, schedule, crew, info, cota, texas, cocktails, play, photos, leaderboard, after.

## Update the site (easiest)
Unzip, then upload EVERYTHING in this folder again, replacing the old files.
- Drag and drop: Netlify > your site > Deploys > drag the whole unzipped folder onto the deploy box.
- GitHub: open your repo > Add file > Upload files > drop everything from this folder > Commit.

## Things you can change
- hero.jpg: add a wide landscape photo with this exact name next to index.html and it replaces the cartoon car on the home page.
- cocktails.js: your cocktail menu (4 drinks). Photos are in the img folder; swap a file with the same name to change one.
- app.js: the TRIP block near the top has address, phone, plate and Wi-Fi.

## Shared board
Votes, quests, photos and notes are shared between phones only if the site is deployed from GitHub (so the function in
netlify/functions/trip.mjs is built). Drag-and-drop deploys still work, but each phone then keeps its own data.
Host notes and journal posts are also sent to Netlify Forms (Site > Forms).
Anyone with the link can write to the board, so only share the link with the group.
