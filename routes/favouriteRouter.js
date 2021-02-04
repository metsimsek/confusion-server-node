const express = require('express');
const bodyParser = require('body-parser');
const Favourites = require('../models/favourite');
var authenticate = require('../authenticate');
const cors = require('./cors');
const Dishes = require('../models/dishes');

const favouriteRouter = express.Router();

favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favourites.find({})
            .populate('user')
            .populate('dishes')
            .then((favourites) => {
                if (favourites) {
                    userFavourites = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
                    if(!userFavourites) {
                        var err = new Error('You have no favourite dish!');
                        err.status = 404;
                        return next(err);
                    }
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(userFavourites);
                } else {
                    var err = new Error('You have no favourite dish!');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favourites.find({})
            .populate('user')
            .populate('dishes')
            .then((favourites) => {
                var user;
                if(favourites)
                    user = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
                if(!user) 
                    user = new Favourites({user: req.user.id, dishes : []});
                for(let key of Object.keys(req.body)){
                    if(user.dishes.find((dish) => {
                        if(dish._id){
                            return dish._id.toString() === req.body[key]._id.toString();
                        }
                    }))
                        continue;
                    user.dishes.push(req.body[key]._id);
                }
                user.save()
                    .then((userFavourites) => {
                        res.statusCode = 201;
                        res.setHeader("Content-Type", "application/json");
                        res.json(userFavourites);
                    }, (err) => next(err))
                    .catch((err) => next(err));
            })
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation is not supported on /favourites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favourites.find({})
            .then((favourites) => {
                var favouritesToDelete;
                if (favourites) {
                    favouritesToDelete = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
                }
                if(favouritesToDelete){
                    favouritesToDelete.remove()
                        .then((result) => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(result);
                        }, (err) => next(err));
                } else {
                    var err = new Error('You do not have any favourites !');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

    favouriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favourites.find({})
            .populate('user')
            .populate('dishes')
            .then((favourites) => {
                if (favourites) {
                    const favs = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
                    const dish = favs.dishes.filter(dish => dish.id === req.params.dishId)[0];
                    if(dish) {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(dish);
                    } else {
                        var err = new Error('You do not have dish ' + req.params.dishId);
                        err.status = 404;
                        return next(err);
                    }
                } else {
                    var err = new Error('You do not have any favourites!');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, 
        (req, res, next) => {
            Favourites.find()
                .populate('user')
                .populate('dishes')
                .then((favourites) => {
                    var user;
                    if(favourites)
                        user = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
                    if(!user) 
                        user = new Favourites({user: req.user.id, dishes : []});
                    
                    if(!user.dishes.find((dishId) => {
                        if(dishId._id)
                            return dishId._id.toString() === req.params.dishId.toString();
                    }))
                        user.dishes.push(req.params.dishId);
                    
                    user.save()
                        .then((userFavourites) => {
                            res.statusCode = 201;
                            res.setHeader("Content-Type", "application/json");
                            res.json(userFavourites);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                })
                .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation is not supported on /favourites/:dishId');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favourites.find({})
            .then((favourites) => {
                var user;
                if(favourites)
                    user = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
                if(user){
                    user.dishes = user.dishes.filter((dishid) => dishid._id.toString() !== req.params.dishId);
                    user.save()
                        .then((result) => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(result);
                        }, (err) => next(err));
                } else {
                    var err = new Error('You do not have any favourites!');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

module.exports = favouriteRouter;