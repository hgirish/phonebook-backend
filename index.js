const express = require('express')
const morgan = require('morgan')

app = express()
app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', function (req, res) {return JSON.stringify( req.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

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

app.get('/info', (request, response) => {
    const peopleCount = persons.length;
    const now = new Date();
    const result = `<div>Phonebook has info for ${peopleCount} people</div>
    <p>${now}</p>`
    response.end(result)
})

app.get('/api/persons/:id', (request, response) => {
    const id = (request.params.id)
    const person = persons.find(person => person.id === id)
    response.json(person)
})


app.delete('/api/persons/:id', (request, response) => {
    const id = (request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body
   
    if (!body.name){
      return  response.status(400).json({
            error: 'name missing'
        })
    }
    if (!body.number){
        return  response.status(400).json({
              error: 'number missing'
          })
      }
    const existing = persons.findIndex(person => person.name.trim().toLocaleLowerCase() === body.name.trim().toLocaleLowerCase())
    if (existing !== -1){
        return  response.status(400).json({
            error: 'name must be unique'
        })
    }
    const id = Math.floor(Math.random() * 1000,0)
    const person = {
       ...body,
       id: String(id)         
    }
    persons = persons.concat(person)

    response.json(person)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})