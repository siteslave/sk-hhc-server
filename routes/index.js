var express = require('express');
var router = express.Router();
var moment = require('moment');
var gcm = require('node-gcm');

var Service = require('../models/service');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send({ ok: true, msg: 'Welcome' });
});
router.get('/test', function(req, res, next) {

    req.hosPool.getConnection((err, conn) => {
      if (err) {
        res.send({err: err})
      } else {
        conn.query(process.env.SQL_SELECT, ['1334NAT'], (err, rows) => {
          if (err) { 
            res.send({ok: false, err: err})
          } else {
            res.send({ok: true, rows: rows})
          }
        });
        conn.release();
      }
    });

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

router.post('/register-device', function (req, res, next) {
  let deviceToken = req.body.deviceToken;
  let username = req.body.username;

  Service.saveDeviceToken(req.hosPool, username, deviceToken)
    .then(() => {
      res.send({ ok: true });
    }, (err) => {
      res.send({ ok: false, error: err });
    });
});

router.post('/send-alert', function (req, res, next) {
  let username = req.body.username;
  let msg = req.body.msg;

  Service.getDeviceToken(req.hosPool, username)
    .then((rows) => {
      let tokens = [];
      rows.forEach(v => {
        tokens.push(v.device_token);
      });

      var message = new gcm.Message();
      message.addData('title', 'ข่าว');
      message.addData('message', msg);
      message.addData('content-available', true);
      message.addData('chat', { "username": "Satit", "message": "Hello world" });
      // message.addData('notId', 2);
      // message.addData('image', 'http://res.cloudinary.com/demo/image/upload/w_133,h_133,c_thumb,g_face/bike.jpg');
      message.addData('image', 'http://www.pro.moph.go.th/w54/images/ICT/loadlogomoph.png');
      
      // Set up the sender with you API key, prepare your recipients' registration tokens. 
      var sender = new gcm.Sender('AAAAHaGNsA0:APA91bHxmpyw06spVJLL90Zms_vnPKykweTvgcRllxPG22BJuWiiwBTHI4qPQ8I480eMpehd_gJn6sk4eaDSnmfohbr5oCZQG-RBaKRcRTqYJIEKvcLm0egv9SxCC0fJnqXApa8TAy0nefi6Buax-LxDxwckLsVoeA');
      
      sender.send(message, { registrationTokens: tokens }, function (err, response) {
        if (err) {
          console.log(err);
          res.send({ ok: false, error: err });
        } else {
          console.log(response);
          res.send({ ok: true });
        }
      });
      
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

router.post('/users-list', function (req, res, next) {
  Service.getUsers(req.hosPool)
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
