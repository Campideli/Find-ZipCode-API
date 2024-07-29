import 'dotenv/config'
import { Sequelize } from 'sequelize'
import { randomUUID } from 'crypto'
import {differenceInDays} from 'date-fns'
import axios from 'axios'

const sequelize = new Sequelize(`postgres://${process.env.POSTGRESQL_USER}:${process.env.POSTGRESQL_PASSWORD}@${process.env.POSTGRESQL_HOST}:${process.env.POSTGRESQL_PORT}/${process.env.POSTGRESQL_DATABASE}`, { define: {
    define: {
        freezeTableName: true,
        logging: console.log,
    }
}
})

const Endereco = sequelize.define('endereco', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true
    },
    cep: {
        type: Sequelize.STRING
    },
    logradouro: {
        type: Sequelize.STRING
    },
    complemento: {
        type: Sequelize.STRING
    },
    unidade: {
        type: Sequelize.STRING
    },
    bairro: {
        type: Sequelize.STRING
    },
    localidade: {
        type: Sequelize.STRING
    },
    uf: {
        type: Sequelize.STRING
    },
    ibge: {
        type: Sequelize.STRING
    },
    gia: {
        type: Sequelize.STRING
    },
    ddd: {
        type: Sequelize.STRING
    },
    siafi: {
        type: Sequelize.STRING
    }
})

await Endereco.sync()

export class dataBasePostgres {
    async search(cep_param) {
        const endereco = await Endereco.findOne({
            where: {
                cep: cep_param
            }
        })
        if (endereco === null) {
            return this.adiciona(cep_param)
        }
        else{
            if (await this.verifica_data(endereco.createdAt)){
                this.apaga(cep_param)
                this.adiciona(cep_param)
                return endereco
            }
            else{
                return endereco
            }
        }
    }

    async apaga(cep_param) {
        await Endereco.destroy({
            where: {
                cep: cep_param
            }
        })
    }

    async verifica_data(createdAt){
        const data_atual = new Date()
        const diferenca_dias = differenceInDays(data_atual, createdAt)
        return !!diferenca_dias
    }   

    async adiciona(cep){
        const response = await axios.get(`${process.env.VIACEP_URL}/${cep}/json/`)
        const endereco = await response.data
        const cep_formatado = endereco.cep.replace('-', '')
        await Endereco.create({
            id: randomUUID(),
            cep: cep_formatado,
            logradouro: endereco.logradouro,
            complemento: endereco.complemento,
            unidade: endereco.unidade,
            bairro: endereco.bairro,
            localidade: endereco.localidade,
            uf: endereco.uf,
            ibge: endereco.ibge,
            gia: endereco.gia,
            ddd: endereco.ddd,
            siafi: endereco.siafi,
            createdAt: endereco.createdAt
        })
        return endereco
    }
}