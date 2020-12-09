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


router.get('/new', (req, res) => {
  res.render('new-book', {mybook: {}, title: "New Book Entry"})
})

// post create new book Entry
// router.post('/', asyncHandler(async (req, res) => {
//   const mybook = await Book.create(req.body)
//   res.redirect('/books/' + mybook.id)

// }))

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
      console.log('Fuck')
      // console.log(error.errors.length)
      // console.log(error.errors[0].message)
    } else {
      throw error; // error caught in the asyncHandler's catch block

    }  


  }

  
}))



// edit book entry form.
router.get('/:id/edit', asyncHandler(async (req, res) => {
  const mybook = await Book.findByPk(req.params.id);

  if(mybook) {
    res.render("book_detail", { mybook, title: "Edit Book" });      
  } else {
    res.sendStatus(404);
  }

  // res.render("book_detail", { mybook,  title: "Edit Book Entry"})
}))

// // update book entry 
// router.post('/:id/edit', asyncHandler(async (req, res) => {
//   const mybook = await Book.findByPk(req.params.id);
//   await mybook.update(req.body);

//   if(mybook) {
//     await mybook.update(req.body);
//     res.redirect("/books/" + mybook.id);      
//   } else {
//     res.sendStatus(404);
//   }

// }))

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
      res.render("book_detail", { mybook, errors: error.errors, title: "Edit Book Entry" })
    } else {
      throw error;
    }
  }
}))





// delete book entry form
router.get('/:id/delete', asyncHandler(async (req, res) => {
  const mybook = await Book.findByPk(req.params.id);
  if(mybook) {
    res.render('book_detail', { mybook, title:'Delete Book Entry'});
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
    res.render('book_detail', { mybook, title: "this is my single book view"})
  } else {
    console.log("i am in the else statemen")
    const error = new Error();
    error.status = 404;
    error.message = 'Looks like we don\'t have that book you are looking for. :('
    res.render('error', { mybook, error, title: "this is an errrooooorrr"})


  }




  // if(mybook) {
  //   res.render('book_detail', { mybook, title: "this is my single book view"})
  // } else {
  //   res.sendStatus(404);
  // }
}));

// // get individual book route 
// router.get('/:id', asyncHandler(async (req, res, next) => {
//   console.log(req.params.id);
//   const mybook = await Book.findByPk(req.params.id);
//   console.log("title" +    mybook.title);
//   console.log(mybook +"im next to mybook before looking")

//   if(mybook) {
//     console.log("we have that book!!")
//     res.render('book_detail', { mybook, title: "this is my single book view"})
//   } else {
//     console.log("i am in the else statemen")
//     alert("i am in the else statemen")
//     const err = new Error();
//     err.status = 404;
//     err.message = 'Looks like we don\'t have that book you are looking for. :('
//     // res.render('page_not_found', { err,  title: "we dont have book with id" + req.params.id})
//     next(err);


//   }

// }))


module.exports = router;
