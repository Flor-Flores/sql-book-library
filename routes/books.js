var express = require('express');
var router = express.Router();
var Book = require("../models").Book;

// Handler function to wrap each route. 
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      next(error);

    }
  }
}

/* GET test 500 error page. */
router.get('/error', (req, res, next) => {
  const error = new Error();
  error.message = 'Custom 500 error thrown'
  error.status = 500;
  throw error;
})

router.get('/search/', asyncHandler(async (req, res ) => {
    const Pagination = require('../utils/pagination')
    const search = req.query.search;
    let page_id = 1;

    if(req.query.curentPage){
      page_id = req.query.curentPage;
    }

    let offset = 0;
    let currentPage = page_id;
    let pageUri = `/search?search=${search}&curentPage=`;
    let limit = 5;
    offset = 0 + (page_id - 1) * limit;
    const { Op } = require("sequelize");
  
    const results = await Book
    .findAndCountAll({
      where: {
        [Op.or]: [
          { title:  {[Op.substring]: search }},
          { author:  {[Op.substring]: search} },
          { genre:  {[Op.substring]: search }},
          { year:  {[Op.substring]: search }},
        ]
      },
        offset: offset,
      limit: 5
    })  
  
    let books = results.rows;
    const perPage = limit;
    let totalCount = results.count;
    // Instantiate Pagination class
    const Paginate = new Pagination(totalCount,currentPage,pageUri,perPage);
    let pagination = Paginate;
    res.render('search',{books, pagination });
    }));

router.get('/new', (req, res) => {
  res.render('new-book', {myBook: {}, title: "New Book Entry"})
})

// post create new book Entry with validation
router.post('/new', asyncHandler(async (req, res) => {
  let myBook;
  try {
    myBook = await Book.create(req.body);
    // res.redirect('/books/'+ myBook.id)
    res.redirect('/books/')
  } catch (error) {
    if(error.name === "SequelizeValidationError") { // checking the error
      myBook = await Book.build(req.body);
      res.render("new-book", { myBook, errors: error.errors, title:'New Book Entry "please check your for errors on your submisions"'})
    } else {
      throw error; // error caught in the asyncHandler's catch block
    }  
  }
}))

// edit book entry form.
router.get('/:id/edit', asyncHandler(async (req, res) => {
  const myBook = await Book.findByPk(req.params.id);
  if(myBook) {
    res.render("update-book", { myBook, title: "Edit Book" });      
  } else {
    throw error; // error caught in the asyncHandler's catch block
  }
}))

// update book entry w error handling
router.post('/:id/edit', asyncHandler(async (req, res) => {
  let myBook;
  try {
    myBook = await Book.findByPk(req.params.id);
    if(myBook) {
      await myBook.update(req.body);
      res.redirect("/books/"); 
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      myBook = await Book.build(req.body); 
      myBook.id = req.params.id; // make sure correct article gets updated
      res.render("update-book", { myBook, errors: error.errors, title: "Edit Book Entry" })
    } else {
      throw error;
    }
  }
}))

// delete book entry form
router.get('/:id/delete', asyncHandler(async (req, res) => {
  const myBook = await Book.findByPk(req.params.id);
  if(myBook) {
    res.render('update-book', { myBook, title:'Delete Book Entry'});
  } else {
    res.sendStatus(404);
  }
}))

// delete book entry 
router.post('/:id/delete', asyncHandler(async (req, res) => {
  const myBook = await Book.findByPk(req.params.id);
  if(myBook) {
    await myBook.destroy();
    res.redirect('/books');
  } else {
    res.sendStatus(404);
  }
}))

/* GET individual article. */
router.get('/:id', asyncHandler(async (req, res, next) => {
  const myBook = await Book.findByPk(req.params.id);
  if(myBook) {
    res.render('update-book', { myBook, title: myBook.title})
    } else {
    const error = new Error();
    error.status = 404;
    error.message = `Looks like we don\'t have that book you are looking for. :(`
    next(error);
  }
}));

module.exports = router;
