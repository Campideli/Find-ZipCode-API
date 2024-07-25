import { randomUUID } from "crypto";
import fetch from 'node-fetch';
import pkg from 'pg'
import 'dotenv/config'

const { Client } = pkg

const client = new Client({
    host: process.env.POSTGRESQL_HOST,
    user: process.env.POSTGRESQL_USER,
    port: process.env.POSTGRESQL_PORT,
    password: process.env.POSTGRESQL_PASSWORD,
    database: process.env.POSTGRESQL_DATABASE
});

client.connect()

export const sql = async (strings, ...values) => {
    const query = strings.reduce((prev, next, i) => {
        return prev + next + (values[i] || '')
    }, '')

    const { rows } = await client.query(query)
    return rows
}


export class dataBasePostgres {
    async search(cep) {
        const endereco = await sql`
            SELECT * FROM endereco 
            WHERE cep = '${cep}'
        `
        if (endereco.length === 0) {
            return this.adiciona(cep)
        }
        else{
            if (await this.verifica_data(endereco[0].created_at)){
                this.apaga(cep)
                this.adiciona(cep)
                return endereco
            }
            else{
                return endereco
            }
        }}
    
    async apaga(cep) {
        await sql`
            DELETE FROM endereco
            WHERE cep = '${cep}'
        `
    }

    async verifica_data(created_at){
        const data_bd = new Date(created_at.getTime() - (created_at.getTimezoneOffset() * 60000))
        const data_atual = new Date()
        const diferenca_horas = (data_atual - data_bd) / 3600000

        if (diferenca_horas > 24){
            return true
        }
        else{
            return false
        }
    }   

    async adiciona(cep){
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        const endereco = await response.json()
        const data = new Date().toISOString()
        await sql`
            INSERT INTO endereco
            VALUES (
            '${randomUUID()}',
            '${endereco.cep}', 
            '${endereco.logradouro}', 
            '${endereco.complemento}', 
            '${endereco.unidade}', 
            '${endereco.bairro}', 
            '${endereco.localidade}', 
            '${endereco.uf}',
            '${endereco.ibge}', 
            '${endereco.gia}', 
            '${endereco.ddd}', 
            '${endereco.siafi}',
            '${data}'
        )
        `
        return endereco
    }
}