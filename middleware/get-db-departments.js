const db = require('../dbconn');

module.exports = (req, res, next) => {
  // Get and save company job roles and departments
  db.query('SELECT departments.dept_id AS dept, job_roles.job_id FROM job_roles LEFT JOIN departments ON job_roles.dept_id = departments.dept_id').then((result) => {
    const r = result.rows;
    const d = {};
    let i = r.length;
    for (i; i--; d[r[i].dept] ? d[r[i].dept].unshift(r[i].job_id) : d[r[i].dept] = [r[i].job_id]);

    db.$departments = d;
    next();
  }).catch((error) => {
    console.log("error at getting company's job roles ", error);
    res.status(500).json({
      status: 'error',
      error: 'Sorry, we couldn\'t complete your request please try again',
    });
  });
};
