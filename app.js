require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');

// Database and passport configuration
require('./app_api/models/db');
require('./app_api/config/passport');

const usersRouter = require('./app_server/routes/users');
const apiRouter = require('./app_api/routes/index');

const app = express();

// // CORS 설정 (가장 위에 위치)
// const cors = require('cors');
// app.use(cors({
//   origin: 'http://localhost:4200', // 허용할 프론트엔드 URL
//   methods: ['GET', 'POST', 'PUT', 'DELETE'], // 허용할 HTTP 메서드
//   allowedHeaders: ['Content-Type', 'Authorization'], // 허용할 헤더
// }));
// app.options('*', cors()); // 모든 OPTIONS 요청 허용

// // View engine setup
// app.set('views', path.join(__dirname, 'app_server', 'views'));
// app.set('view engine', 'pug');

// // Middleware
// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// // Static files for Angular application
// app.use(express.static(path.join(__dirname, 'app_public', 'build')));

// // Passport initialization
// app.use(passport.initialize());

//19 ~42 대체 이다 
const cors = require('cors');
const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));

app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-with, Content-type, Accept, Authorization');
  next();
});

app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'app_public', 'build')));
app.use(passport.initialize());
//19 ~42 대체 이다 

// Routes
app.use('/users', usersRouter);
app.use('/api', apiRouter);

// Angular fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'app_public', 'build', 'index.html'));
});

// JWT 인증 에러 핸들러
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ "message": err.name + ": " + err.message });
  }
  next(err);
});

// General error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

module.exports = app;



// require('dotenv').config();
// const createError = require('http-errors');
// const express = require('express');
// const path = require('path');
// const cookieParser = require('cookie-parser');
// const logger = require('morgan');
// const passport = require('passport');
// require('./app_api/models/db')
// require('./app_api/config/passport');

// const usersRouter = require('./app_server/routes/users');
// const apiRouter = require('./app_api/routes/index');
// const cors = require('cors');

// var app = express();

// // view engine setup
// app.set('views', path.join(__dirname, 'app_server', 'views'));
// app.set('view engine', 'pug');

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
// // Static files for Angular application
// app.use(express.static(path.join(__dirname, 'app_public', 'build')));
// app.use(passport.initialize());
// // API routes
// app.use('/users', usersRouter);
// app.use('/api', apiRouter);

// app.use('/api', (req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//   next();
// });

// CORS 설정 추가
// app.use(cors({
//   origin: 'http://localhost:4200', // 허용할 프론트엔드 URL
//   methods: ['GET', 'POST', 'PUT', 'DELETE'], // 허용할 HTTP 메서드
//   allowedHeaders: ['Content-Type', 'Authorization'], // 허용할 헤더
// }));
// app.options('*', cors()); // 모든 OPTIONS 요청 허용
// // Angular fallback route
// // app.get('*', (req, res) => {
// //   res.sendFile(path.join(__dirname, 'app_public', 'build', 'index.html'));
// // });
// app.get(/(\/about)|(\/location\/[a-z0-9]{24})/, function(req, res, next) {
//   res.sendFile(path.join(__dirname, 'app_public', 'build/browser', 'index.html'));
// });

// // // error handler ?????? 아래랑 다른거??
// // app.use(function(err, req, res, next) {
// //   // set locals, only providing error in development
// //   res.locals.message = err.message;
// //   res.locals.error = req.app.get('env') === 'development' ? err : {};

// //   // render the error page
// //   res.status(err.status || 500);
// //   res.render('error');
// // });
// // error handler
// // Catch unauthorised errors
// app.use((err, req, res, next) => {
//   if (err.name === 'UnauthorizedError') {
//     res
//       .status(401)
//       .json({"message" : err.name + ": " + err.message});
//   }
// })
// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// module.exports = app;
