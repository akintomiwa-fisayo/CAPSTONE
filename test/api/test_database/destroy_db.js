/* eslint-disable no-multi-str */
/* eslint-disable no-undef */
const db = require('../../../dbconn');

describe('Test database', () => {
  it('Should destroy test database', (done) => {
    const destroySequences = () => new Promise((resolve, reject) => {
      db.query('\
        DROP SEQUENCE public."commentId-increment";\
        DROP SEQUENCE public."postId-increment";\
        DROP SEQUENCE public."userId-increment";\
        DROP SEQUENCE public."flagId-increment";\
      ').then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const destroyDepartmentsTable = () => new Promise((resolve, reject) => {
      db.query('DROP TABLE public.departments')
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const destroyPostsAndCommentsFlags = () => new Promise((resolve, reject) => {
      db.query('DROP TABLE public.posts_and_comments_flags')
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const destroyJobRolesTable = () => new Promise((resolve, reject) => {
      db.query('DROP TABLE public.job_roles')
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const destroyUsersTable = () => new Promise((resolve, reject) => {
      db.query('DROP TABLE public.users')
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const destroyPostsTable = () => new Promise((resolve, reject) => {
      db.query('DROP TABLE public.posts')
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const destroyArticlesTable = () => new Promise((resolve, reject) => {
      db.query('DROP TABLE public.articles')
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const destroyGifsTable = () => new Promise((resolve, reject) => {
      db.query('DROP TABLE public.gifs')
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const destroyCommentsTable = () => new Promise((resolve, reject) => {
      db.query('DROP TABLE public.post_comments')
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const destroyDepartmentManagersTable = () => new Promise((resolve, reject) => {
      db.query('DROP TABLE public.department_managers')
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    /* ORDER OF EXECUTION IS !IMPORTANT AS SOME TABLES RELY ON OTHERS */
    console.log('Destroying Test Database...');
    destroyDepartmentManagersTable().then(() => {
      console.log('  - Destroyed "department_managers" table successfully');
      destroyPostsAndCommentsFlags().then(() => {
        console.log('  - Destroyed "posts_and_comments_flags" table successfully');
        destroyCommentsTable().then(() => {
          console.log('  - Destroyed "post_comments" table successfully');
          destroyGifsTable().then(() => {
            console.log('  - Destroyed "gifs" table successfully');
            destroyArticlesTable().then(() => {
              console.log('  - Destroyed "articles" table successfully');
              destroyPostsTable().then(() => {
                console.log('  - Destroyed "posts" table successfully');
                destroyUsersTable().then(() => {
                  console.log('  - Destroyed "users" table successfully');
                  destroyJobRolesTable().then(() => {
                    console.log('  - Destroyed "job_roles" table successfully');
                    destroyDepartmentsTable().then(() => {
                      console.log('  - Destroyed "departments" table successfully');
                      destroySequences().then(() => {
                        console.log('  - Destroyed sequences successfully');
                        console.log('Destroy Completed');
                        done();
                        if (process.env.TEST_ENV === 'CI') process.exit();
                      }).catch((error) => console.log('    ** Failed destroying sequences', error));
                    }).catch((error) => console.log('  ** Failed destroying "departments" table', error));
                  }).catch((error) => console.log('  ** Failed destroying "job_roles" table', error));
                }).catch((error) => console.log('  ** Failed destroying "users" table', error));
              }).catch((error) => console.log('  ** Failed destroying "posts" table', error));
            }).catch((error) => console.log('  ** Failed destroying "articles" table', error));
          }).catch((error) => console.log('  ** Failed destroying "gifs" table', error));
        }).catch((error) => console.log('  ** Failed destroying "post_comments" table', error));
      }).catch((error) => console.log('  ** Failed destroying "posts_and_comments_flags" table', error));
    }).catch((error) => console.log('  ** Failed destroying "department_managers" table', error));
  });
});
