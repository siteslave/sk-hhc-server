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
  }
}