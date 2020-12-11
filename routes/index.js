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

  const Pagination = require('../utils/pagination')
  let search = "";
  let page_id = 1;
  let currentPage = 1;
  let pageUri = `/search/?search=${search}&curentPage=`;
  let limit = 5
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
      res.render('search',{books, pagination, title: 'babel library' });

}))


module.exports = router;
