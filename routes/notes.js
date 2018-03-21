'use strict';

const express = require('express');
const mongoose = require('mongoose');

// Create an router instance (aka "mini-app");
// const mongoose = require('mongoose');
const Note = require('../models/note');
const router = express.Router();

/* ========== GET/READ ALL ITEM ========== */
router.get('/notes', (req, res, next) => {

  const searchTerm = req.query.searchTerm;
  let filter = {};

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.title = { $regex: re };
  }

  return Note.find(filter)
    .sort('created')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});


/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/notes/:id', (req, res, next) => {
   Note.findById(req.params.id)
    .then( note => {
      res.json(note);
      console.log(res.location);
    })
    .catch(err => {
      next(err);
    });
  // console.log('Get a Note');
  // res.json({ id: 2 });
  

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/notes', (req, res, next) => {
  const {title, content} = req.body;
  const newNote = {title, content};
  if(!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  console.log(newNote);
  return create(newNote)
    .then(result => {
      res.location(`${req.originalURL}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(next);
  // console.log('Create a Note');
  // res.location('path/to/new/document').status(201).json({ id: 2 });

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {
  const {title, content} = req.body;
  const {id} = req.params;
  const updateNote = {title, content};
  console.log(updateNote);
  if(!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  return findByIdAndUpdate(id, updateNote, {new: true})
    .then( result => {
      if(result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(next);
  // console.log('Update a Note');
  // res.json({ id: 2 });

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/notes/:id', (req, res, next) => {
  Note
  .findByIdAndRemove(req.params.id)
    .then( count => {
      if(count) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch(next);

  // console.log('Delete a Note');
  // res.status(204).end();

});

module.exports = router;