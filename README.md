# Slack Reminders

This is a little app to manage your slack reminders. Add your slack token in `.env` and you're good to go.

* It allows you to mark a reminder as complete or delete it
* Right now it loads all reminders at once. No pagination
* There is no way to "snooze" a reminder for later. Slack does not expose that through it's API
* If a reminder is just a link to another slack message, you can't really see it. I didn't find a good way to grab that message and display it


## Glitch info

On the front-end,
- edit `public/client.js`, `public/style.css` and `views/index.html`
- drag in `assets`, like images or music, to add them to your project

On the back-end,
- your app starts at `server.js`
- add frameworks and packages in `package.json`
- safely store app secrets in `.env` (nobody can see this but you and people you invite)
