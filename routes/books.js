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
  console.log("custom error error route called");
  const error = new Error();
  error.message = 'Custom 500 error thrown'
  error.status = 500;
  throw error;
})



router.get('/search/', asyncHandler(async (req, res ) => {
    const Pagination = require('../utils/pagination')
    const search = req.query.search;
    let page_id = 1;
    if(req.query.curentPage < 1){
      console.log(req.query.curentPage)
      page_id = 1;
    }else{
      page_id = parseInt(req.query.curentPage);
  
    }
    let currentPage = 1;
    currentPage = page_id > 0 ? page_id : currentPage;
    let pageUri = `/search/?search=${search}&curentPage=`;
    let limit = 5
    // let offset = 0 + (page_id - 1) * limit
    let offset = 0 ;
    const { Op } = require("sequelize");
  
    const results = await Book
    .findAndCountAll({
      where: {
          title: {
            [Op.substring]: search
          }
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
  res.render('new-book', {mybook: {}, title: "New Book Entry"})
})


// post create new book Entry with validation
router.post('/new', asyncHandler(async (req, res) => {
  let mybook;
  try {
    mybook = await Book.create(req.body);
    // res.redirect('/books/'+ mybook.id)
    res.redirect('/books/')
  } catch (error) {
    if(error.name === "SequelizeValidationError") { // checking the error
      mybook = await Book.build(req.body);
      console.log(mybook +" insise the post routhe like 55")
      res.render("new-book", { mybook, errors: error.errors, title:'New Book Entry "please check your for errors on your submisions"'})
    } else {
      throw error; // error caught in the asyncHandler's catch block

    }  


  }

  
}))



// edit book entry form.
router.get('/:id/edit', asyncHandler(async (req, res) => {
  const mybook = await Book.findByPk(req.params.id);

  if(mybook) {
    res.render("update-book", { mybook, title: "Edit Book" });      
  } else {
    // res.sendStatus(404);
    throw error; // error caught in the asyncHandler's catch block

  }

}))


// update book entry w error handling
router.post('/:id/edit', asyncHandler(async (req, res) => {
  let mybook;
  try {
    mybook = await Book.findByPk(req.params.id);
    if(mybook) {
      await mybook.update(req.body);
      // res.redirect("/books/" + mybook.id); 
      res.redirect("/books/"); 
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      mybook = await Book.build(req.body);
      mybook.id = req.params.id; // make sure correct article gets updated
      res.render("update-book", { mybook, errors: error.errors, title: "Edit Book Entry" })
    } else {
      throw error;
    }
  }
}))





// delete book entry form
router.get('/:id/delete', asyncHandler(async (req, res) => {
  const mybook = await Book.findByPk(req.params.id);
  if(mybook) {
    res.render('update-book', { mybook, title:'Delete Book Entry'});
  } else {
    res.sendStatus(404);
  }

}))

// delete book entry 
router.post('/:id/delete', asyncHandler(async (req, res) => {
  const mybook = await Book.findByPk(req.params.id);

  if(mybook) {
    await mybook.destroy();
    res.redirect('/books');
  } else {
    res.sendStatus(404);
  }

}))


/* GET individual article. */
router.get('/:id', asyncHandler(async (req, res, next) => {
  const mybook = await Book.findByPk(req.params.id);

  if(mybook) {
    console.log("we have that book!!")
    res.render('update-book', { mybook, title: mybook.title})
  } else {
    res.sendStatus(404);
  }

  //   } else {
  //   console.log("i am in the else statemen")
  //   const error = new Error();
  //   error.status = 404;
  //   error.message = 'Looks like we don\'t have that book you are looking for. :('
  //   res.render('error', { mybook, error, title: "Ooops!"})
  // }




}));



module.exports = router;
