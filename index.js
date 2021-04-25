const http = require('http');
const querystring = require('querystring');
const port = 3000;
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'nodejs-mongo';
const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const server = http.createServer((request, response) => {
    // Extrear el contenido de la petición
    const {
        headers,
        method,
        url
    } = request;
    console.log('headers: ', headers);
    console.log('method: ', method);
    console.log('url: ', url);
    let body = [];
    request.on('error', (err) => {
        console.error(err);
    }).on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        console.log('body: ', body);
        let user = querystring.decode(body);
        client.connect().then(async () => {
            const db = client.db(dbName);
            const collection = db.collection('usuarios');
            const insertResult = await collection.insertOne(user);
            const findResult = await collection.find({}).toArray();
            console.log('Usuario insertado: ', insertResult.result);

            //Para borrar los registros
            //const deleteUsers = await collection.deleteMany({});
            //console.log("Resultado del borrado ", deleteUsers.result);

            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            
            response.write(JSON.stringify(findResult));
            response.end();
        }).catch((error) => {
            console.log("Se produjo algún error en las operaciones con la base de datos: " + error);
            client.close();
        });
    });
});

server.listen(port, () => {
    console.log('Servidor ejecutándose...');
    console.log('Abrir en un navegador http://localhost:3000');
});