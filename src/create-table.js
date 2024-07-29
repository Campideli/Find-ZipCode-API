import { sql } from './db.js'

sql`
CREATE TABLE IF NOT EXISTS endereco (
    id TEXT PRIMARY KEY,
    cep VARCHAR(9),
    logradouro VARCHAR(255),
    complemento VARCHAR(255),
    unidade VARCHAR(255),
    bairro VARCHAR(255),
    localidade VARCHAR(255),
    uf VARCHAR(2),
    ibge VARCHAR(255),
    gia VARCHAR(255),
    ddd VARCHAR(255),
    siafi VARCHAR(255),
    created_at TIMESTAMP
)
`
.then(() => console.log('Table created successfully'))