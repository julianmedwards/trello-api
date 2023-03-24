module.exports = (server) => {
    require('./lanes')(server)
    require('./boards')(server)
    require('./cards')(server)
}
