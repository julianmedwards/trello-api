const errors = require('restify-errors')
const mongoose = require('mongoose')

const Board = require('../../models/board')
const Lane = require('../../models/lane')

function addLane(req, res, next) {
    if (!req.is('application/json')) {
        return next(
            new errors.InvalidContentError("Expects 'application/json'")
        )
    }

    let data = req.body
    console.log(typeof data)

    let getBoard = new Promise((resolve, reject) => {
        Board.findById(req.params.boardId, (err, docs) => {
            if (err) {
                reject(err)
            } else {
                resolve(docs)
            }
        })
    })

    getBoard.then(
        (board) => {
            data.sequence = board.lanes.length
            let lane = new Lane(data)
            board.lanes.push(lane)

            board.save(function (err) {
                if (err) {
                    console.error(err)
                    return next(new errors.InternalError(err.message))
                }

                res.setHeader('Access-Control-Allow-Origin', '*')
                res.send(201, {laneId: lane._id})
                next()
            })
        },
        (err) => {
            console.error(err)
            next(new errors.InternalError(err.message))
        }
    )
}

function getLanes(req, res, next) {
    // Still need to update sequence on move/delete.

    Board.getSequencedLanes(req.params.boardId, (err, docs) => {
        if (err) {
            console.error(err)
            next(new errors.InternalError(err.message))
        } else {
            res.send(docs[0])
            next()
        }
    })
}

function updateLane(req, res, next) {
    if (!req.is('application/json')) {
        return next(
            new errors.InvalidContentError("Expects 'application/json'")
        )
    }

    let data = req.body

    if (req.params.laneId !== data.laneId) {
        return next(
            new errors.InvalidContentError(
                'Mismatch between url and request id!'
            )
        )
    }

    let getBoard = new Promise((resolve, reject) => {
        Board.findById(req.params.boardId, (err, docs) => {
            if (err) {
                reject(err)
            } else {
                resolve(docs)
            }
        })
    })

    getBoard.then(
        (board) => {
            board.lanes.id(req.params.laneId).laneName = data.laneName
            board.markModified('lanes')
            board.save(function (err) {
                if (err) {
                    console.error(err)
                    return next(new errors.InternalError(err.message))
                }

                res.setHeader('Access-Control-Allow-Origin', '*')
                res.send(204)
                next()
            })
        },
        (err) => {
            console.error(err)
            next(new errors.InternalError(err.message))
        }
    )
}

function moveLane(req, res, next) {
    if (!req.is('application/json')) {
        return next(
            new errors.InvalidContentError("Expects 'application/json'")
        )
    }

    let data = req.body

    let getBoard = new Promise((resolve, reject) => {
        Board.findById(req.params.boardId, (err, docs) => {
            if (err) {
                reject(err)
            } else {
                resolve(docs)
            }
        })
    })

    getBoard.then(
        (board) => {
            board.updateOne('lanes', {
                $push: {
                    $each: [board.lanes.id(req.params.laneId)],
                    $position: data.newIndex,
                },
            })
            board.markModified('lanes')
            board.save(function (err) {
                if (err) {
                    console.error(err)
                    return next(new errors.InternalError(err.message))
                }

                res.setHeader('Access-Control-Allow-Origin', '*')
                res.send(204)
                next()
            })
        },
        (err) => {
            console.error(err)
            next(new errors.InternalError(err.message))
        }
    )
}

function deleteLane(req, res, next) {
    let getBoard = new Promise((resolve, reject) => {
        Board.findById(req.params.boardId, (err, docs) => {
            if (err) {
                reject(err)
            } else {
                resolve(docs)
            }
        })
    })

    getBoard.then(
        (board) => {
            board.lanes.id(req.params.laneId).remove()
            board.save(function (err) {
                if (err) {
                    console.error(err)
                    return next(new errors.InternalError(err.message))
                }

                res.setHeader('Access-Control-Allow-Origin', '*')
                res.send(204)
                next()
            })
        },
        (err) => {
            console.error(err)
            next(new errors.InternalError(err.message))
        }
    )
}

module.exports = (server) => {
    server.post('/boards/:boardId/lanes', addLane)
    server.get('/boards/:boardId/lanes', getLanes)
    server.patch('/boards/:boardId/lanes/:laneId', updateLane)
    server.put('/boards/:boardId/lanes/:laneId', moveLane)
    server.del('/boards/:boardId/lanes/:laneId', deleteLane)
}
