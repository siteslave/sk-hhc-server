let Q = require('q');

module.exports = {
  getService(db, vstdate) {
    let q = Q.defer();

    let sql = `
    select o.hn, o.vn, o.vstdate, o.vsttime, 
    concat(p.pname, p.fname, " ", p.lname) as ptname, 
    p.sex 
    from ovst as o
    inner join person as p on p.patient_hn=o.hn
    where o.vstdate=?
    limit 10
    `;

    db.getConnection((err, conn) => {
      if (err) {
        q.reject(err);
      } else {
        conn.query(sql, [vstdate], (err, rows) => {
          if (err) q.reject(err);
          else q.resolve(rows);
        });
        conn.release();
      }
    });

    return q.promise;
  },

  getCommunityServiceList(db) {
    let q = Q.defer();

    let sql = `
select ovst_community_service_type_code as code, ovst_community_service_type_name as name,
ovst_community_service_type_id as id
from ovst_community_service_type
where (ovst_community_service_type_code like '1A%') or (ovst_community_service_type_code like '1D%')
order by ovst_community_service_type_name`;

    db.getConnection((err, conn) => {
      if (err) {
        q.reject(err);
      } else {
        conn.query(sql, [], (err, rows) => {
          if (err) q.reject(err);
          else q.resolve(rows);
        });
        conn.release();
      }
    });

    return q.promise;
  },

  getDoctorList(db) {
    let q = Q.defer();

    let sql = `select code, name from doctor order by name`;

    db.getConnection((err, conn) => {
      if (err) {
        q.reject(err);
      } else {
        conn.query(sql, [], (err, rows) => {
          if (err) q.reject(err);
          else q.resolve(rows);
        });
        conn.release();
      }
    });

    return q.promise;
  },

  saveImage(db, vn, image) {
    let q = Q.defer();

    let sql = `insert into sk_hhc_image(vn, image) values(?, ?)`;

    db.getConnection((err, conn) => {
      if (err) {
        q.reject(err);
      } else {
        conn.query(sql, [vn, image], (err) => {
          if (err) q.reject(err);
          else q.resolve();
        });
        conn.release();
      }
    });

    return q.promise;
  },

  updateImage(db, vn, image) {
    let q = Q.defer();

    let sql = `update sk_hhc_image set image=? where vn=?`;

    db.getConnection((err, conn) => {
      if (err) {
        q.reject(err);
      } else {
        conn.query(sql, [image, vn], (err) => {
          if (err) q.reject(err);
          else q.resolve();
        });
        conn.release();
      }
    });

    return q.promise;
  },

  checkImage(db, vn) {
    let q = Q.defer();

    let sql = `select count(*) as total from sk_hhc_image where vn=?`;

    db.getConnection((err, conn) => {
      if (err) {
        q.reject(err);
      } else {
        conn.query(sql, [vn], (err, rows) => {
          if (err) q.reject(err);
          else {
            q.resolve(rows[0].total);
          }
        });
        conn.release();
      }
    });

    return q.promise;
  },

  getImage(db, vn) {
    let q = Q.defer();

    let sql = `select image from sk_hhc_image where vn=?`;

    db.getConnection((err, conn) => {
      if (err) {
        q.reject(err);
      } else {
        conn.query(sql, [vn], (err, rows) => {
          if (err) q.reject(err);
          else {
            let image = rows.length ? rows[0].image : null;
            q.resolve(image);
          }
        });
        conn.release();
      }
    });

    return q.promise;
  },

  removeImage(db, vn) {
    let q = Q.defer();

    let sql = `delete from sk_hhc_image where vn=?`;

    db.getConnection((err, conn) => {
      if (err) {
        q.reject(err);
      } else {
        conn.query(sql, [vn], (err, rows) => {
          if (err) q.reject(err);
          else {
            q.resolve();
          }
        });
        conn.release();
      }
    });

    return q.promise;
  }
}