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

const Browser = require("zombie");

Browser.site = "https://FreeCodeCampQualityAssurance.curryfriedrice.repl.co";
var browser = new Browser();


chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        console.log(res.body[0]);
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  
});
  /*
  * ----[END of EXAMPLE TEST]----
  */


  let formData = {  //The reason why this is made out here is so we can reference it and PUT it later
      title: "This is a test Title"
    }
  suite('Routing tests', function() {

    suite('POST /api/books with title => create book object/expect book object', function() {
      test('Test POST /api/books with title', function(done) {
  
      chai
      .request(server)
      .post("/api/books")
      .type('form')
      .send(formData)
      .end(function (err, res){
        assert.equal(res.status, 200);
        //console.log(res.body);
        assert.isObject(res.body, 'response should be an array');
        assert.property(res.body, 'comments', 'Created Book should have comments');
        assert.property(res.body, 'title', 'Created Book should contain title');
        assert.property(res.body, '_id', 'Created Book should contain _id');
        formData['_id'] = res.body._id; 
        //assert.deepEqual(JSON.parse(res.text), formData, "Form Data does not match");
        done();
      });
        
      });
      
      test('Test POST /api/books with no title given', function(done) {
        //done();
        chai
          .request(server)
          .post("/api/books")
          .send()
          .end(function (err, res){ 
            assert.equal(res.status, 200);
            //console.log(res.body);
            assert.equal(res.body, 'missing required field title', "Created Book Should not have a title");
            done();
          });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai
          .request(server)
          .get('/api/books')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, "Getting without ID should Return array of books");
            // Make sure it has the right properties;
            assert.property(res.body[0], 'commentcount', 'Gotten Books should have comment Count');
            //assert.isArray(res.body[0], 'Comments should be an Array');
            assert.property(res.body[0], 'title', 'Gotten Books should contain title');
            assert.property(res.body[0], '_id', 'Gotten Books should contain _id');
        done();
          });
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai
          .request(server)
          .get('/api/books/DOES_NOT_EXIST')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body,  'no book exists', 'The book should not exist');
            done();
          });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
         
         chai
          .request(server)
          .get('/api/books/' + formData._id)
          .end(function (err, res) {
            assert.equal(res.status, 200);

            assert.isObject(res.body, 'response should be an array');
            assert.property(res.body, 'comments', 'Created Book should have comments');
            assert.isArray(res.body.comments, 'Comments is not an array');
            assert.property(res.body, 'title', 'Created Book should contain title');
            assert.property(res.body, '_id', 'Created Book should contain _id');
            done();
          });
          
        //done();
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai
          .request(server)
          .post('/api/books/'+ formData._id)
          .type('form')
          .send({comment: "this is a comment"})
          .end(function(err, res){
            let data = res.body;
            assert.equal(res.status, 200);
            assert.isObject(data, 'response should be an object');
            assert.property(data, 'comments', 'Created Book should have comments');
            assert.isArray(data.comments, 'Comments is not an array');
            assert.property(data, 'title', 'Created Book should contain title');
            assert.property(data, '_id', 'Created Book should contain _id');
            assert.include(data.comments, "this is a comment", "comment does not contain sent comment");
            done();
          });
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        chai
          .request(server)
          .post('/api/books/' + formData._id)
          .type('form')
          .send()
          .end(function(err, res){
            assert.equal(res.status, 200);
         
            assert.equal(res.text, 'missing required field comment', 'The response for missing comment is not matching');
            done();
          });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
         chai
          .request(server)
          .post('/api/books/DOES_NOT_EXIST')
          .type('form')
          .send({comment: "Stub comment doesn't matter"})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists', 'The response for missing ID is not matching');
            done();
          });
      });
      
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        chai
          .request(server)
          .delete('/api/books/' + formData._id)
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'delete successful', 'Unable to Delete the item');
            done();
          });
      });

      test('Test DELETE /api/books/[id] with  id not in db', function(done){
          chai
          .request(server)
          .delete('/api/books/' + formData._id)
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists', 'Unable to Delete the item');
            done();
          });
        //done();
      });

    });
  });
