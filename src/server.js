import express from 'express'
import { dataBasePostgres } from './db.js'

const server = express()
const database = new dataBasePostgres()

server.use(express.json())

server.get('/endereco', async (req, reply) => {
    const {cep} = req.body
    const endereco = await database.search(cep)
    reply.json(endereco)
})

server.listen(3000, () => {
    console.log('Server is running on port 3000')
})
