const express = require('express');

const router = express.Router();
const authenticate = require('../middleware/authenticate');
const db = require('../dbconn');


router.get('/', authenticate.employee, (req, res) => {
  db.query(`
    SELECT 
    departments.dept_id, 
    departments.dept_name, 
    job_roles.job_id, 
    job_roles.job_title 
    FROM job_roles 
    LEFT JOIN departments 
    ON job_roles.dept_id = departments.dept_id
  `).then((result) => {
    const r = result.rows;
    const d = {};
    r.forEach((dept) => {
      if (d[dept.dept_id]) {
        d[dept.dept_id].jobRoles.unshift({
          title: dept.job_title,
          id: dept.job_id,
        });
      } else {
        d[dept.dept_id] = {
          name: dept.dept_name,
          jobRoles: [{
            title: dept.job_title,
            id: dept.job_id,
          }],
        };
      }
    });

    res.status(200).json({
      status: 'success',
      data: d,
    });
  }).catch((error) => {
    console.log("error at getting company's job roles ", error);
    res.status(500).json({
      status: 'error',
      error: 'Sorry, we couldn\'t complete your request please try again',
    });
  });
});
module.exports = router;
