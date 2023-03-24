const mongoose = require('mongoose')
const errors = require('restify-errors')

const Board = require('../models/board')

function addBoard(req, res, next) {
    if (!req.is('application/json')) {
        return next(
            new errors.InvalidContentError("Expects 'application/json'")
        )
    }

    let data = req.body

    let board = new Board(data)
    board.save(function (err) {
        if (err) {
            console.error(err)
            return next(new errors.InternalError(err.message))
        }

        res.setHeader('Access-Control-Allow-Origin', '*')
        res.send(201, {boardId: board._id})
        next()
    })
}

function getBoards(req, res, next) {
    Board.apiQuery(req.params, function (err, docs) {
        if (err) {
            console.error(err)
            return next(new errors.InvalidContentError(err.errors.name.message))
        }

        res.send(docs)
        next()
    })
}

function getBoard(req, res, next) {
    Board.findById(req.params.id, (err, board) => {
        if (err) {
            console.error(err)
            return next(new errors.InternalError(err.message))
        } else {
            if (!board) {
                res.send(404)
                return next()
            }
            Board.sequenceLanes(board)
            res.send(board)
            next()
        }
    })
}

function updateBoard(req, res, next) {
    if (!req.is('application/json')) {
        return next(
            new errors.InvalidContentError("Expects 'application/json'")
        )
    }

    let data = req.body

    Board.findById(req.params.id, (err, board) => {
        if (err) {
            console.error(err)
            return next(new errors.InternalError(err.message))
        } else {
            board.boardName = data.boardName
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

module.exports = (server) => {
    server.post('/boards', addBoard)
    server.get('/boards', getBoards)
    server.get('/boards/:id', getBoard)
    server.patch('/boards/:id', updateBoard)
}
