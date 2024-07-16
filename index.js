require('dotenv').config()
const Person = require('./models/person')

const express = require('express')
const morgan = require('morgan')

const app = express()
app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', function (req) {return JSON.stringify( req.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))




app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(people => response.json(people))
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {

  Person.find({})
    .then(people => {
      const peopleCount = people.length
      const now = new Date()
      const result = `<div>Phonebook has info for ${peopleCount} people</div>
        <p>${now}</p>`
      response.end(result)
    })
    .catch(error => next(error))

})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person){
        response.json(person)
      }
      else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})


app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
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


  const newPerson = new Person({
    name: body.name,
    number: body.number
  })
  newPerson.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))


})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name,number },
    { new:true, runValidators:true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})