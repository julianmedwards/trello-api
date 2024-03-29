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
            return next(new errors.InternalError(err.message))
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
            return next(new errors.InternalError(err.message))
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

    Board.findById(req.params.boardId, (err, board) => {
        if (err) {
            console.error(err)
            return next(new errors.InternalError(err.message))
        } else {
            const lane = board.lanes.id(req.params.laneId)
            const updatedCard = lane.cards.id(req.params.cardId)

            if (data.cardName) {
                updatedCard.cardName = data.cardName
            }
            if (data.cardDescr) {
                updatedCard.cardDescr = data.cardDescr
            }

            if (data.sequenceShift) {
                Card.shiftSequence(lane, updatedCard, data.sequenceShift)
            }

            board.markModified('lanes')
            board.save(function (err) {
                if (err) {
                    console.error(err)
                    return next(new errors.InternalError(err.message))
                }

                res.send(204)
                next()
            })
        }
    })
}

function moveCardToLane(req, res, next) {
    Board.findById(req.params.boardId, (err, board) => {
        if (err) {
            console.error(err)
            return next(new errors.InternalError(err.message))
        } else {
            const startLane = board.lanes.id(req.params.laneId)
            const destLane = board.lanes.id(req.params.destinationLaneId)
            const card = startLane.cards.id(req.params.cardId)
            const cardSequence = card.sequence

            startLane.cards.pull(req.params.cardId)
            destLane.cards.push(card.toObject())

            // Change sequence to end of new lane
            destLane.cards.id(req.params.cardId).sequence =
                destLane.cards.length - 1

            // Shift any cards in starting lane after moved card by 1
            Card.resequence(startLane.cards, cardSequence)

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

function deleteCard(req, res, next) {
    Board.findById(req.params.boardId, (err, board) => {
        if (err) {
            console.error(err)
            return next(new errors.InternalError(err.message))
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
    server.patch(
        '/boards/:boardId/lanes/:laneId/cards/:cardId/move-to-lane/:destinationLaneId',
        moveCardToLane
    )
    server.del('/boards/:boardId/lanes/:laneId/cards/:cardId', deleteCard)
}
