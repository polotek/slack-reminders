const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const API = require('./slack-api')

app.use(express.static('public'))
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.get("/", (request, response) => {
  response.sendFile(__dirname + '/views/index.html')
})

app.get('/api/reminders', (req, res) => {
  API.reminders.list()
    .then((reminders) => res.json(reminders))
    .catch((err) => res.sendStatus(500))
})

app.get('/api/reminders/all', (req, res) => {
  API.reminders.listAll()
    .then((reminders) => res.json(reminders))
    .catch((err) => res.sendStatus(500))
})

app.get('/api/reminders/:id', (req, res) => {
  API.reminders.get(req.params.id)
    .then((reminder) => res.json(reminder))
    .catch((err) => res.sendStatus(500))
})

app.post('/api/reminders/:id/complete', (req, res) => {
  API.reminders.complete(req.params.id)
    .then(() => res.send(''))
    .catch((err) => res.sendStatus(500))
})

app.post('/api/reminders', (req, res) => {
  let text = req.body.text
  let time = req.body.time

  if(!text) { return res.sendStatus(400, 'Reminder text is required') }

  API.reminders.create(text, time)
    .then((reminder) => res.json(reminder))
    .catch((err) => res.sendStatus(500))
})

app.delete('/api/reminders/:id', (req, res) => {
  API.reminders.delete(req.params.id)
    .then(() => res.send(''))
    .catch((err) => res.sendStatus(500))
})

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})
