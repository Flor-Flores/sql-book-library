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
router.get('/', (req, res) =>{
  res.redirect('/books')
})

/* GET books page. */
router.get('/books', asyncHandler(async (req, res) => {
  const Pagination = require('../utils/pagination')
  let search = "";
  let page_id = 1;
  let currentPage = 1;
  currentPage = page_id > 0 ? page_id : currentPage;
  let pageUri = `/search?search=${search}&curentPage=`;
  let limit = 5
  let offset = 0 + (page_id - 1) * limit

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
    limit: limit
  })  

  let books = results.rows;
  const perPage = limit;
  let totalCount = results.count;

  // Instantiate Pagination class
  const Paginate = new Pagination(totalCount,currentPage,pageUri,perPage);
  let pagination = Paginate;

  res.render('search',{books, pagination });

}))


module.exports = router;
