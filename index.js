const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json()) 
app.use(express.static('dist'))
app.use(express.static('build')) 
app.use(morgan('tiny'))

const morganFormat = morgan((tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens.method(req, res) === 'POST' ? JSON.stringify(req.body) : ''
    ].join(' ')
})
  
app.use(morganFormat)

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
    
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body
  
    if (!body.name || !body.number) {
      return response.status(400).json({ 
        error: 'name or number missing' 
      })
    }

    const samePerson = persons.some(person => person.name.toLowerCase() === body.name.toLowerCase())
    
    if (samePerson) {
        return response.status(400).json({ 
          error: 'name must be unique'
        })
    }
  
    const generateId = Math.floor(Math.random() * 1000000).toString()

    const person = {
      id: generateId,
      name: body.name,
      number: body.number
    }
  
    persons = persons.concat(person)
  
    response.status(201).json(person)
})

app.get('/info', (req, res) => {
    const personsEntries = persons.length;
    const date = new Date();
  
    const message = `
      <p>Phonebook has info for ${personsEntries} people</p>
      <p>${date}</p>
    `;
  
    res.send(message);
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
  
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})