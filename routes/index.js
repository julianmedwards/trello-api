module.exports = (server) => {
    require('./boards/lanes')(server)
    require('./boards')(server)
}
