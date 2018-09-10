// client-side js
// run by the browser each time your view template is loaded


let gridController = {
    loadData: function(filter) {
      // Load data
      return fetch('/api/reminders/all')
        .then((res) => res.json())
        .then((data) => data.reminders)
        .catch(console.error)
    },
    
    insertItem: function(item) {
      return fetch('/api/reminders', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          data: {
            text: item.text,
            time: item.time
          }
        })
        .then((res) => res.json())
        .then((data) => data.reminder)
        .catch(console.error)
    },
    
    updateItem: function(item) {
      throw new Error('Updates not allowed')
    },

    deleteItem: function(item) {
      if(item.completed) { return this.completeItem(item) }

      return fetch('/api/reminders/'+item.id, {
          method: 'DELETE',
          headers: {
            'content-type': 'application/json',
          }
        })
        .catch(console.error)
    },

    completeItem: function(item) {
      return fetch('/api/reminders/'+item.id+'/complete', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          }
        })
        .catch(console.error)
    }
}

function initGrid(reminders) {
  var grid = $('#reminderList')
  grid.jsGrid({
    width: "100%",

    inserting: false,
    editing: false,
    sorting: false,
    paging: false,
  
    autoload: true,
    controller: gridController,
    fields: [
      {name: "richText", type: "text"},
      {
        name: "",
        itemTemplate: function(_, item) {
          return $('<a href="#">Complete</a>').attr('data-id', item.id)
            .on("click", function (ev) {
              ev.preventDefault()
            
              // set a completed flag and then call deleteItem
              // This is a hack since deleteItem is the only way to remove the row
              item.completed = true
              grid.jsGrid('deleteItem', item)    
            });
        },
        align: "center",
        width: 50
      },
      {type: "control", editButton: false, width: 50}
    ]
  })
}

document.addEventListener("DOMContentLoaded", function(event) {
  initGrid()
})
