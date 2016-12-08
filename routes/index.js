var express = require('express');
var router = express.Router();

var Service = require('../models/service');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send({ ok: true, msg: 'Welcome' });
});

router.get('/services', function(req, res, next) {
  Service.getService(req.hosPool)
    .then((rows) => {
      res.send({ ok: true, rows: rows });
    }, (err) => {
      res.send({ ok: false, error: err });
    });
});

module.exports = router;
