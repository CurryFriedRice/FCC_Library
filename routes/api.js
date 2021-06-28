/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mySecret = process.env['MONGO_URI'];

mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true });

let BookListing;

const bookSchema = new Schema({
  title : {type: String, required: true} ,
  comments : [String],
});

BookListing = mongoose.model("BookList", bookSchema);

const makeNewBook = function(_title, done){
  //console.log(_title);
    if(typeof _title != typeof "String")
    { 
      done(null, 'missing required field title');  
    }
    else{
      
      BookListing.findOne({title : _title}, function(err, bookListing){
        //console.log(libList);
        if(bookListing == null){
          //console.log(_title + "does not Exists making new book");
          let NewBook = new BookListing({
            title: _title,
            comments : []
          });
          NewBook.save(function(err, book){
            if(err) return console.log(err);
            done(null, book);
          });
        }
        else{
          //console.log(_title + " does Exist");
          done(null, bookListing);
        }
      });

    }
}

const getAllBooks = function(done){
  let retVal = [];
  BookListing.find({}, function(err, bookListing){
    bookListing.forEach(function(book){
      let basicData = {
        title: book.title,
        _id: book._id,
        commentcount: book.comments.length
      }
      
      retVal.push(basicData);
    });
   
    done(null, retVal);
  });
}

const getBookById = function(bookID, done){

  BookListing.findOne({_id: bookID}, function(err, bookListing){
    //console.log("potato");
    if(bookListing == null) done(null, 'no book exists');
    else 
    {
      let retVal = 
        {
          _id: bookListing['_id'],
          title: bookListing['title'],
          comments: bookListing['comments']
        }
      done(null, retVal);
      }
  });
}

const findAndCommentOnBook = function(bookid, comment, done){
  if(typeof comment != typeof 'undefined' || comment == '' || comment == null)done('missing required field comment', null);
  else{
    BookListing.findOne({_id: bookid}, null, function(err, bookListing){
        /*console.log("======");
        console.log(bookListing);
        console.log(comment);
        console.log(typeof bookListing);
        console.log(typeof bookListing == typeof undefined);
        console.log(typeof bookListing == typeof null);
        console.log("======");*/
      if(typeof bookListing == typeof undefined) { done('no book exists', null);}
      else {
        //console.log(foundProject);
        if(bookListing == null)done('no book exists', null);
        else{
        bookListing['comments'].push(comment);
        bookListing.save();
        let retVal = 
        {
          _id: bookListing['_id'],
          title: bookListing['title'],
          comments: bookListing['comments']
        }
        done(null, retVal);
        }
      }
    });
  }
}

const deleteAll = function(done){
  //console.log(LibList.count());
  BookListing.deleteMany({}, null, function(err, bookListing){
    //console.log("=============");
    //console.log(bookListing);
    //console.log(err);
    //console.log("DID WE NUKE RIGHT");
  });

    done(null, 'complete delete successful');

  //console.log(LibList.count());
}   

const deleteBook = function(bookid, done){
  BookListing.findOneAndDelete({_id: bookid}, null, function(err, bookListing){
      /*
      if(err)  done(null, "no book exists");
      else done(null, 'delete successful');
      */
      /*
      console.log("Looking for one to Delete");
      console.log(bookListing);
      console.log(typeof bookListing);
      console.log(typeof bookListing == typeof {_id: "rweoprisdfop"} );
      console.log(typeof bookListing == typeof undefined );
      console.log(typeof bookListing == undefined );
       --->console.log(bookListing === null);
      console.log(typeof bookListing === null);
      */
      //if(typeof bookListing['title'] ) done(null, "no book exists");
      //else 
      if(bookListing === null)done(null, "no book exists");
      else done(null, 'delete successful');
      
  });
}
module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //console.log("ATTEMPTING TO GET BOOK LIST");
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      getAllBooks(function(err, list){
      
      return res.json(list);
      });
    })
    
    .post(function (req, res){
      //console.log("ATTEMPTING TO POST NEW BOO");
      let title = req.body.title;
      makeNewBook(title, function(err, book){
          if (err) return res.send (err);
          return res.json(book);
      });
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
      //console.log("ATTEMPTING FULL LIBRARY DELETION");
      //if successful response will be 'complete delete successful'
      deleteAll(function(err, response){
        if(err)console.error(err);
        else res.send(response);
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      //console.log("ATTEMPTING TO GET SPECIFIC BOOK");
      let bookid = req.params.id;
      //console.log(bookid);
      getBookById(bookid, function(err, book){
        if(err != null) res.send(err);
        else res.json(book);
      });
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      //console.log("ATTEMPTING TO POST A COMMENT TO A BOOK");
      let bookid = req.params.id;
      let comment = req.body.comment;
      findAndCommentOnBook(bookid, comment, function(err,book){
        if(err) res.send(err);
        else res.json(book);
      });
      //json res format same as .get
    })
    
    .delete(function(req, res){
      //console.log("ATTEMPTING TO DELETE SPECIFIC BOOK");
      let bookid = req.params.id;
      deleteBook(bookid, function(err, response){
        if(err) console.error(err);
        else res.send(response);
      });
      //if successful response will be 'delete successful'
    });
  
};
