const errors = require('restify-errors')

const Board = require('../models/board')
const Lane = require('../models/lane')
const Card = require('../models/card')

function addCard(req, res, next) {
    if (!req.is('application/json')) {
        return next(
            new errors.InvalidContentError("Expects 'application/json'")
        )
    }

    let data = req.body

    Board.findById(req.params.boardId, (err, board) => {
        if (err) {
            console.error(err)
            next(new errors.InternalError(err.message))
        } else {
            const lane = board.lanes.id(req.params.laneId)

            data.sequence = lane.cards.length
            let card = new Card(data)
            lane.cards.push(card)

            board.save(function (err) {
                if (err) {
                    console.error(err)
                    return next(new errors.InternalError(err.message))
                }

                res.setHeader('Access-Control-Allow-Origin', '*')
                res.send(201, {cardId: card._id})
                next()
            })
        }
    })
}

function getCards(req, res, next) {
    Board.findById(req.params.boardId, (err, board) => {
        if (err) {
            console.error(err)
            next(new errors.InternalError(err.message))
        } else {
            const lane = board.lanes.id(req.params.laneId)

            Lane.sequenceCards(lane)
            res.send(lane.cards)
            next()
        }
    })
}

function updateCard(req, res, next) {
    if (!req.is('application/json')) {
        return next(
            new errors.InvalidContentError("Expects 'application/json'")
        )
    }

    let data = req.body

    Lane.findById(req.params.laneId, (err, lane) => {
        if (err) {
            console.error(err)
            next(new errors.InternalError(err.message))
        } else {
            // -- unimplemented

            res.send(204)
            next()
        }
    })
}

function deleteCard(req, res, next) {
    Board.findById(req.params.boardId, (err, board) => {
        if (err) {
            console.error(err)
            next(new errors.InternalError(err.message))
        } else {
            const lane = board.lanes.id(req.params.laneId)
            lane.cards.id(req.params.cardId).remove()

            board.save(function (err) {
                if (err) {
                    console.error(err)
                    return next(new errors.InternalError(err.message))
                }

                res.setHeader('Access-Control-Allow-Origin', '*')
                res.send(204)
                next()
            })
        }
    })
}

module.exports = (server) => {
    server.post('/boards/:boardId/lanes/:laneId/cards', addCard)
    server.get('/boards/:boardId/lanes/:laneId/cards', getCards)
    server.patch('/boards/:boardId/lanes/:laneId/cards/:cardId', updateCard)
    server.del('/boards/:boardId/lanes/:laneId/cards/:cardId', deleteCard)
}
