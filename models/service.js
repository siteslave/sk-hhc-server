let Q = require('q');

module.exports = {
  getService(db) {
    let q = Q.defer();

    let sql = `
    select o.vstdate, o.vsttime, 
    concat(p.pname, p.fname, " ", p.lname) as ptname, 
    p.sex 
    from ovst as o
    inner join person as p on p.patient_hn=o.hn
    where o.vstdate="2016-01-01"
    limit 10
    `;

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
  }
}