function getLanes(req, res, next) {
    const laneData = {
        laneName: 'lane 1',
        cards: {cardName: 'card 1', cardDescr: 'card 2'},
    }

    console.log(laneData)
    res.send(JSON.stringify(laneData))

    next()
}

module.exports = (server) => {
    server.get('/lanes', getLanes)
}
