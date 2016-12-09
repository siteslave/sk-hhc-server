var express = require('express');
var router = express.Router();
var moment = require('moment');

var Service = require('../models/service');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send({ ok: true, msg: 'Welcome' });
});

router.post('/services', function (req, res, next) {
  let vstdate = req.body.vstdate; // $_POST['vstdate']

  Service.getService(req.hosPool, vstdate)
    .then((rows) => {
      let services = [];
      rows.forEach(v => {
        let obj = {};
        obj.hn = v.hn;
        obj.vn = v.vn;
        obj.vstdate = `${moment(v.vstdate).format('D')} ${moment(v.vstdate).locale('th').format('MMMM')} ${moment(v.vstdate).get('year') + 543}`;
        obj.vsttime = v.vsttime;
        obj.ptname = v.ptname;
        obj.sex = v.sex;
        services.push(obj);
      });
      res.send({ ok: true, rows: services });
    }, (err) => {
      res.send({ ok: false, error: err });
    });
});

router.post('/comlist', function (req, res, next) {
  Service.getCommunityServiceList(req.hosPool)
    .then((rows) => {
      res.send({ ok: true, rows: rows });
    }, (err) => {
      res.send({ ok: false, error: err });
    });
});

router.post('/doctorlist', function (req, res, next) {
  Service.getDoctorList(req.hosPool)
    .then((rows) => {
      res.send({ ok: true, rows: rows });
    }, (err) => {
      res.send({ ok: false, error: err });
    });
});

router.post('/getimage', function (req, res, next) {
  let vn = req.body.vn;

  Service.getImage(req.hosPool, vn)
    .then((image) => {
      if (image) {
        res.send({ ok: true, rows: image.toString() });
      } else {
        res.send({ ok: false });
      }
    }, (err) => {
      res.send({ ok: false, error: err });
    });
});

router.post('/remove-image', function (req, res, next) {
  let vn = req.body.vn;

  Service.removeImage(req.hosPool, vn)
    .then((image) => {
      res.send({ ok: true });
    }, (err) => {
      res.send({ ok: false, error: err });
    });
});

router.post('/save', function (req, res, next) {
  let vn = req.body.vn;
  let image = req.body.image;

  // check duplicated
  Service.checkImage(req.hosPool, vn)
    .then((total) => {
      if (total) return Service.updateImage(req.hosPool, vn, image);
      else return Service.saveImage(req.hosPool, vn, image);
    })
    .then(() => {
      res.send({ ok: true });
    }, (err) => {
      res.send({ ok: false, error: err });
    });
});

module.exports = router;
