const url = require('url')
const { WebClient } = require('@slack/client')
const Linkify = require('linkify-it')

const linkifier = Linkify()

// An access token (from your Slack app or custom integration - xoxp, xoxb, or xoxa)
const token = process.env.SLACK_TOKEN
const web = new WebClient(token)
const listAPIDefaults = {
  limit: 100  
}

function linkifyText(text) {
  if(!linkifier.test(text)) { return text }

  const matches = linkifier.match(text)
  for(let i = matches.length; i>=0; --i) {
    let match = matches[i]
    if(match) {
      console.log(match)
      text = text.replace(match.raw, `<a href="${match.raw}" target="_blank">${match.raw}</a>`) 
    }
  }
  return text
}

function extractCid(urlText) {
  let cid = null
  let urlObj = url.parse(urlText)
  
  if(!urlObj.hostname || !urlObj.hostname.test(/\bslack\.com$/)) { return cid }

  if(urlObj.searchParams && urlObj.searchParams.cid) {
    cid = urlObj.searchParams.cid
  }
  
  return cid
}

function getAttachments(reminder, allPromises) {
  const matches = linkifier.match(reminder.text)
  let slackLinks = matches.reduce((links, match) => {
    const cid = extractCid(match.raw)
    if(cid) { links.push({ cid: cid, textUrl: match.raw }) }
    
    return links
  }, [])
}

const API = {
  messages: {
    get: function(id) {
      return web.messages.info() 
    }
  },
  reminders: {
    get: function(id) {
      return web.reminders.info({ reminder: id })
        .catch(console.error)
    },
    
    list: function(opts) {
      opts = Object.assign({}, listAPIDefaults, opts)
      return web.reminders.list(opts)
        .then(function(res) {
          // filter for only non-recurring and non-complete reminders
          res.reminders = res.reminders.filter((reminder) => { return (!reminder.recurring && !reminder.complete_ts) })
          return res
        })
        .then(function(res) {
          res.reminders.forEach((reminder) => {
            // linkify urls
            reminder.richText = linkifyText(reminder.text)
          })
          return res
        })
        .catch(console.error)
    },
    
    listAll: function(opts) {
      opts = Object.assign({}, listAPIDefaults, opts)

      let allReminders = []

      return new Promise(function(resolve, reject) {
        // Collect reminders in shared array
        // Check cursor and making successive API calls to get all reminders
        function moreReminders(res) {
          allReminders = allReminders.concat(res.reminders)
          
          if (res.response_metadata && res.response_metadata.next_cursor && res.response_metadata.cursor !== '') {
            let nextOpts = Object.assign({}, opts, { cursor: res.response_metadata.next_cursor })
            return API.reminders.list(nextOpts)
              .then(moreReminders)
              .catch(function(err) { return reject(err) })
          } else {
            return resolve({
              count: allReminders.length,
              reminders: allReminders
            })
          }
        }
        
        API.reminders.list(opts)
          .then(moreReminders)
          .catch(function(err) { return reject(err) })
          
      })
    },

    create: function(text, time) {
      return web.reminders.add({text: text, time: time || 'tomorrow'})
        .catch(console.error)
    },
    
    complete: function(id) {
      return web.reminders.complete({ reminder: id })
        .catch(console.error)
    },

    delete: function(id) {
      return web.reminders.delete({ reminder: id })
        .catch(console.error)
    }
  }
}

module.exports = API
