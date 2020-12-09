var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const Sequelize = require('sequelize');

const routes = require('./routes/index');
const books = require('./routes/books');

// var Book = require("./models/book")
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'library.db'
});


app.use('/', routes);
app.use('/books', books);


//error handlers

// 404 handler
// app.use((req, res, next) => {
//   console.log('404 error handler called')

//   res.status(404).render('page_not_found')
// })


// global error handler
app.use((error, req, res, next) => {
  
  if (error){
    console.log('global error handler called', error);
  }

  if (error.status === 404){
    res.status(404).render('page_not_found', {error});
  } else {
    error.message = error.message || 'oops looks like something went wrong on the server';
    res.status(error.status || 500).render('error', { error });
  }
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
