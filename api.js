/**
 * Module Dependencies
 */
const config = require('./config')
const restify = require('restify')
require('restify').plugins
const mongoose = require('mongoose')

/**
 * Initialize Server
 */
const server = restify.createServer({
    name: config.name,
    version: config.version,
})

/**
 * Middleware
 */
server.pre(function crossOrigin(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', '*')
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Methods'
    )
    return next()
})
server.opts('*', (req, res, next) => {
    res.header('Access-Control-Allow-Methods', '*')
    res.send(204)
    return next()
})
server.use(restify.plugins.jsonBodyParser({mapParams: true}))
server.use(restify.plugins.queryParser({mapParams: true}))

/**
 * Start Server, Connect to DB & Require Routes
 */
server.listen(config.port, () => {
    // establish connection to mongodb
    mongoose.Promise = global.Promise
    mongoose.set('strictQuery', true)
    mongoose.connect(config.db.uri, {useNewUrlParser: true})

    const db = mongoose.connection

    db.on('error', (err) => {
        console.error(err)
        process.exit(1)
    })

    db.once('open', () => {
        require('./routes/index')(server)
        console.log(`Server is listening on port ${config.port}`)
    })
})
