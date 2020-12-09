var express = require('express');
var router = express.Router();
var Book = require("../models").Book;


// Handle function to wrap each route. 
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch (err) {
      res.status(500).send(err)
    }
  }
}

/* GET home page. */
// router.get('/', asyncHandler(async (req, res) => {
//   const books = await Book.findAll();
//   res.render('index', {books, title: 'MY home!'})
// }))
router.get('/', (req, res) =>{
  res.redirect('/books')
})

/* GET books page. */
router.get('/books', asyncHandler(async (req, res) => {
  const books = await Book.findAll();
  res.render('index', {books, title: 'babel library'})
}))


// router.get('/', function(req, res, next) {
//   // res.render('index', { title: 'Express' });
  
// });

module.exports = router;
