/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const ObjectId = require('mongoose').Types.ObjectId;

chai.use(chaiHttp);

suite('Functional Tests', function () {
  let requester = chai.request(server).keepOpen();
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  test('#example Test GET /api/books', function (done) {
    requester.get('/api/books').end(function (err, res) {
      assert.equal(res.status, 200);
      assert.isArray(res.body, 'response should be an array');
      assert.property(
        res.body[0],
        'commentcount',
        'Books in array should contain commentcount'
      );
      assert.property(
        res.body[0],
        'title',
        'Books in array should contain title'
      );
      assert.property(res.body[0], '_id', 'Books in array should contain _id');
      done();
    });
  });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite('Routing tests', function () {
    suite(
      'POST /api/books with title => create book object/expect book object',
      function () {
        test('Test POST /api/books with title', function (done) {
          const sampleBook = { title: 'my book' };
          requester
            .post('/api/books')
            .send(sampleBook)
            .end((err, res) => {
              assert.equal(
                res.status,
                201,
                'correct status response should be returned'
              );
              assert.propertyVal(
                res.body,
                'title',
                sampleBook.title,
                'sent book title should be returned in response'
              );
              assert.property(
                res.body,
                '_id',
                'created book id should be returned'
              );
              done();
            });
        });

        test('Test POST /api/books with no title given', function (done) {
          requester
            .post('/api/books')
            .send()
            .end((err, res) => {
              console.log(res.body);
              assert.equal(res.status, 200);
              assert.equal(res.text, 'missing required field title');
              done();
            });
        });
      }
    );

    suite('GET /api/books => array of books', function () {
      test('Test GET /api/books', function (done) {
        requester.get('/api/books').end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body, '*Array* of issues should be returned');
          assert.property(res.body[0], '_id', 'books should contain _id field');
          assert.property(
            res.body[0],
            'title',
            'books should contain field field'
          );
          assert.property(
            res.body[0],
            'commentcount',
            'books should contain commentcount field'
          );
          done();
        });
      });
    });

    suite('GET /api/books/[id] => book object with [id]', function () {
      test('Test GET /api/books/[id] with id not in db', function (done) {
        requester.get('/api/books/' + getInvalidBookId()).end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'no book exists');
          done();
        });
      });

      test('Test GET /api/books/[id] with valid id in db', function (done) {
        getValidBookId().then((validId) => {
          requester.get('/api/books/' + validId).end((err, res) => {
            assert.equal(res.status, 200);
            assert.propertyVal(
              res.body,
              '_id',
              validId,
              'book should contain requested _id field'
            );
            assert.property(
              res.body,
              'title',
              'book should contain title field'
            );
            assert.property(
              res.body,
              'comments',
              'book should contain comments field'
            );
            assert.isArray(
              res.body.comments,
              'comments field should be an Array'
            );
            done();
          });
        });
      });
    });

    suite(
      'POST /api/books/[id] => add comment/expect book object with id',
      function () {
        test('Test POST /api/books/[id] with comment', function (done) {
          getValidBookId().then((id) => {
            requester
              .post('/api/books/' + id)
              .send({
                comment: 'sample comment',
              })
              .end((err, res) => {
                assert.equal(res.status, 201);
                assert.propertyVal(
                  res.body,
                  '_id',
                  id,
                  'response should contain requested book _id'
                );
                assert.property(
                  res.body,
                  'title',
                  'response should contain book title'
                );
                assert.isArray(
                  res.body.comments,
                  'book comments in the response should be an array'
                );
                done();
              });
          });
        });

        test('Test POST /api/books/[id] without comment field', function (done) {
          getValidBookId().then((id) => {
            requester
              .post('/api/books/' + id)
              .send()
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'missing required field comment');
                done();
              });
          });
        });

        test('Test POST /api/books/[id] with comment, id not in db', function (done) {
          requester
            .post('/api/books/' + getInvalidBookId())
            .send({
              comment: 'test comment',
            })
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.text, 'no book exists');
              done();
            });
        });
      }
    );

    suite('DELETE /api/books/[id] => delete book object id', function () {
      test('Test DELETE /api/books/[id] with valid id in db', function (done) {
        getValidBookId().then((id) => {
          requester.delete('/api/books/' + id, (err, res) => {
            assert.equal(res.status, '201');
            assert.equal(res.text, 'delete successful');
            done();
          });
        });
      });

      test('Test DELETE /api/books/[id] with  id not in db', function (done) {
        requester.delete('/api/books/' + getInvalidBookId()).end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'no book exists');
          done();
        });
      });
    });
  });
});

function getValidBookId() {
  return new Promise((resolve, reject) => {
    chai
      .request(server)
      .post('/api/books')
      .send({
        title: 'helper book',
      })
      .end((err, res) => {
        if (!res.body._id) {
          reject(
            'failed to obtain book id. POST /api/books should work properly in order to be able to get valid book id'
          );
          return;
        }
        resolve(res.body._id);
      });
  });
}

function getInvalidBookId() {
  return new ObjectId();
}
