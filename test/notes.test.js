'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');
const seedNotes = require('../db/seed/notes');

const expect = chai.expect;

describe.only('testing api endpoints', function() {

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI);
  });

  beforeEach(function() {
    // runs before each test in this block
    return Note.insertMany(seedNotes);
    // .then(() => { console.log('notes created');
    //   return Note.createIndexes();
    // });
      
  });

  afterEach(function() {
    // runs after each test in this block
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    // runs after all tests in this block
    return mongoose.disconnect();
  });

  // test cases
  //GET all notes test
  describe('GET /api/notes', function () {
    it('should return the correct number of Notes', function () {
      // 1) Call the database and the API
      const dbPromise = Note.find();
      const apiPromise = chai.request(app).get('/api/notes');
      // 2) Wait for both promises to resolve using `Promise.all`
      return Promise.all([dbPromise, apiPromise])
      // 3) **then** compare database results to API response
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });
  });

  describe('GET /api/notes/:id', function () {
    it('should return correct notes', function () {
      let data;
      // 1) First, call the database
      return Note.findOne().select('id title content')
        .then(_data => {
          data = _data;
          // 2) **then** call the API
          console.log(data);
          return chai.request(app).get(`/api/notes/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'created');

          // 3) **then** compare
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
        });
    });
  });

  describe('POST /api/notes', function () {
    it('should create and return a new item when provided valid data', function () {
      const newNote = {
        'title': 'Who doesn\'t love dogs??',
        'content': 'Bark, bark, bark...',
        'tags': []
      };
      let body;
      // 1) First, call the API
      return chai.request(app)
        .post('/api/notes')
        .send(newNote)
        .then(function (res) {
          body = res.body;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(body).to.be.a('object');
          expect(body).to.include.keys('id', 'title', 'content', 'created');
          return Note.findById(body.id);
        })
        .then(data => {
          expect(body.title).to.equal(data.title);
          expect(body.content).to.equal(data.content);
        });
    });
  });

  describe.only('PUT /api/notes', function () {
    it('should update and return a new item when provided valid data', function () {
      const updatedNote = {
        'title': 'Who doesn\'t love dogs!',
        'content': 'Bark, bark, bark...',
        'tags': []
      };
      return Note.findOne()
        .then(function(note) {
          updatedNote.id = note.id;
          return chai.request(app)
            .put(`/api/notes/${note.id}`)
            .send(updatedNote);
        })
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'title', 'content', 'created');

          return Note.findById(updatedNote.id);
        })
      // 3) **then** compare
        .then(function(note) {
          expect(note.title).to.equal(updatedNote.title);
          expect(note.content).to.equal(updatedNote.content);
        });

    });
  });
  

  //delete tests
  // describe('DELETE /api/notes/:id', function () {
  //   it('should delete an item by id', function () {
  //     let data;
  //     return Note.findOne()
  //   })
  // })

});


