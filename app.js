/* Everything in between the //--// are from chatgpt */

//--//
const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const exphbs = require('express-handlebars');
const path = require('path');
const methodOverride = require('method-override');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride('_method'));

app.set('view engine', 'hbs');

const eventsFile = path.join(__dirname, 'events.json');

function readEvents() {
  if (!fs.existsSync(eventsFile)) {
    fs.writeFileSync(eventsFile, JSON.stringify([]));
  }
  const data = fs.readFileSync(eventsFile, 'utf8');
  if (!data.trim()) {  // if the file is empty or only whitespace
    return [];
  }
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error("Error parsing events.json. Resetting file.", err);
    fs.writeFileSync(eventsFile, JSON.stringify([]));
    return [];
  }
}

function writeEvents(events) {
    try {
      fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2));
      console.log("Successfully wrote events to", eventsFile);
    } catch (err) {
      console.error("Error writing events file:", err);
    }
  }
//--//

// GET Tasks //
// List all the events on the home page
app.get('/', (req, res) => {
  const events = readEvents();
  res.render('index', { events });
});

// Show details on a certain event
app.get('/event/:id', (req, res) => {
  const events = readEvents();
  const event = events.find(e => e.id == Number(req.params.id));
  if (!event) { // Error if event can't be found
    return res.status(404).send('Cannot find the event');
  }
  res.render('event', { event });
});

// GET events as JSON (for API or debugging)
app.get('/events', (req, res) => {
  const eventsData = readEvents();
  res.json(eventsData);
});

// GET /create - Display a form for creating a new event
app.get('/create', (req, res) => {
  res.send(`
      <h1>Create Event</h1>
      <form action="/events" method="POST">
        <label>Name: <input type="text" name="name" required></label><br>
        <label>Date: <input type="date" name="date" required></label><br>
        <label>Description: <textarea name="description" required></textarea></label><br>
        <button type="submit">Create Event</button>
      </form>
      <a href="/">Back to Events</a>
    `);
});

//--//
app.put('/events/:id', (req, res) => {
    let events = readEvents();
    const eventIndex = events.findIndex(e => e.id == req.params.id);
    if (eventIndex === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }
  
    const { name, date, description } = req.body;
    if (!name || !date || !description) {
      return res.status(400).json({ error: 'Name, date, and description are required' });
    }
    events[eventIndex].name = name;
    events[eventIndex].date = date;
    events[eventIndex].description = description;
  
    writeEvents(events);
  
    res.redirect('/');
});
  
app.get('/event/:id/edit', (req, res) => { //edit event
    const events = readEvents();
    const event = events.find(e => e.id == req.params.id);
    if (!event) {
      return res.status(404).send('Cannot find the event');
    }
    res.render('edit', { event });
  });
//--//

// POST Tasks //
// Create a new event
app.post('/events', (req, res) => {
  const events = readEvents();
  const { name, date, description } = req.body;
  if (!name || !date || !description) {
    return res.status(400).send('Cannot find all the required information');
  }
  const newId = events.length > 1 ? events[events.length - 1].id + 1 : 1;
  const newEvent = { id: newId, name, date, description, rsvps: [] };
  events.push(newEvent);
  writeEvents(events);
  res.redirect(`/`);
});

// Add an RSVP to an event (separate route)
app.post('/event/:id/rsvp', (req, res) => {
  const events = readEvents();
  const event = events.find(e => e.id == req.params.id);
  if (!event) {
    return res.status(404).send('Cannot find the event');
  }

  const name = req.body.name;
  if (!name) {
    return res.status(400).send('Name required');
  }
  event.rsvps = event.rsvps || [];
  event.rsvps.push(name);

  writeEvents(events);
  res.redirect(`/event/${event.id}`);
});

// PUT Tasks //
// Update an event
app.put('/event/:id', (req, res) => {
  let events = readEvents();
  const eventIndex = events.findIndex(e => e.id == req.params.id);
  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const { name, date, description } = req.body;
  if (!name || !date || !description) {
    return res.status(400).json({ error: 'Name, date, and description are required' });
  }
  events[eventIndex].name = name;
  events[eventIndex].date = date;
  events[eventIndex].description = description;

  writeEvents(events);

  res.json(events[eventIndex]);
});

// DELETE Tasks //
// Delete an event
app.delete('/event/:id', (req, res) => {
  let events = readEvents();
  const eventIndex = events.findIndex(e => e.id == req.params.id);

  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // Remove the event from the array
  const deletedEvent = events.splice(eventIndex, 1);
  writeEvents(events);

  res.json({ message: 'Event deleted successfully', event: deletedEvent[0] });
});
//--//

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}/ `);
});
//--//
