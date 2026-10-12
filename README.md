# Texas F1 trip site

Plain HTML, CSS and JS. Eight pages: index, schedule, crew, info, cota, texas, play, after.

## Two ways to put it on Netlify

**A. Quickest (drag and drop).** Go to app.netlify.com/drop and drop this folder. Everything works, but the
interactive parts (votes, journals, flight details) are saved on each person's own phone only.
Journal posts are also sent to Netlify Forms, so you can read them in Site > Forms.

**B. Shared board (everyone sees the same votes, journals and flight details).** Deploy with Git or the CLI so the
function in `netlify/functions/trip.mjs` is built:
1. Push this folder to a GitHub repo, then in Netlify choose "Add new site > Import from Git". No build command needed.
   Or: `npm i -g netlify-cli && npm i && netlify deploy --prod`.
2. Open the site. The pill on the Crew and After pages changes from "Saved on this device only" to "Shared board on".

Anyone with the link can write to the board, so only share the link with the group.

## Things to fill in
- Host details: your address, phone and plate are already in the `TRIP` block near the top of app.js. Add wifi and note there and redeploy. Everyone then sees them even without the shared board. 
- Flight and bus details: each person taps Edit on the Crew page.
- Schedule: edit the `EV` list near the top of app.js.
