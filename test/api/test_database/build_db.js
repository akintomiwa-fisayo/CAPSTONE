/* eslint-disable no-multi-str */
/* eslint-disable no-undef */
const db = require('../../../dbconn');
const {
  users: { user, admin },
  posts: { articles, gifs },
  comments: {
    gifs: gifsComment,
    articles: articlesComment,
  },
  reportsComp,
} = require('../samples');


describe('Test database', () => {
  it('Should build test database', (done) => {
    const buildSequences = () => new Promise((resolve, reject) => {
      db.query('\
        CREATE SEQUENCE public."commentId-increment"\
          INCREMENT 1\
          START 100\
          MINVALUE 100\
          MAXVALUE 99999999999999\
          CACHE 1;\
        \
        CREATE SEQUENCE public."postId-increment"\
          INCREMENT 1\
          START 100\
          MINVALUE 100\
          MAXVALUE 99999999999999\
          CACHE 1;\
        \
        CREATE SEQUENCE public."reportId-increment"\
          INCREMENT 1\
          START 1\
          MINVALUE 1\
          MAXVALUE 99999999999999\
          CACHE 1;\
        \
        CREATE SEQUENCE public."userId-increment"\
          INCREMENT 1\
          START 1000\
          MINVALUE 1000\
          MAXVALUE 99999999999999\
          CACHE 1;\
      ').then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const buildDepartmentsTable = () => new Promise((resolve, reject) => {
      db.query('\
        CREATE TABLE public.departments (\
          dept_name text COLLATE pg_catalog."C" NOT NULL,\
          dept_desks integer NOT NULL,\
          dept_floor integer NOT NULL,\
          dept_id text COLLATE pg_catalog."C" NOT NULL,\
          CONSTRAINT department_pkey PRIMARY KEY (dept_id)\
        )\
      ').then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const fillDepartmentsTable = () => new Promise((resolve, reject) => {
      db.query('\
        INSERT INTO departments ("dept_name", "dept_desks", "dept_floor", "dept_id")\
        VALUES\
        (\'sales\', 14, 2, \'d1001\'),\
        (\'administration\', 5, 6, \'d1002\'),\
        (\'finance\', 8, 5, \'d1003\'),\
        (\'marketing\', 12, 3, \'d1004\'),\
        (\'production\', 20, 4, \'d1005\'),\
        (\'human_resources\', 15, 1, \'d1006\')\
        ')
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const buildJobRolesTable = () => new Promise((resolve, reject) => {
      db.query('\
        CREATE TABLE public.job_roles (\
          job_title text COLLATE pg_catalog."C" NOT NULL,\
          dept_id text COLLATE pg_catalog."C" NOT NULL,\
          job_id text COLLATE pg_catalog."C" NOT NULL,\
          CONSTRAINT job_roles_pkey PRIMARY KEY (job_id),\
          CONSTRAINT department_fkey FOREIGN KEY (dept_id)\
            REFERENCES public.departments (dept_id) MATCH SIMPLE\
            ON UPDATE NO ACTION\
            ON DELETE CASCADE\
        )\
      ').then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const fillJobRolesTable = () => new Promise((resolve, reject) => {
      db.query('\
        INSERT INTO job_roles ("job_title", "dept_id", "job_id")\
        VALUES\
        (\'accountant\', \'d1003\', \'j1004\'),\
        (\'admin\', \'d1002\', \'j1001\'),\
        (\'director\', \'d1001\', \'j1002\'),\
        (\'director\', \'d1002\', \'j1005\'),\
        (\'director\', \'d1003\', \'j1006\'),\
        (\'director\', \'d1004\', \'j1007\'),\
        (\'director\', \'d1005\', \'j1008\'),\
        (\'director\', \'d1006\', \'j1009\'),\
        (\'receptionist\', \'d1002\', \'j1003\')\
        ')
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const buildUsersTable = () => new Promise((resolve, reject) => {
      db.query('\
        CREATE TABLE public.users (\
          first_name text COLLATE pg_catalog."default" NOT NULL,\
          last_name text COLLATE pg_catalog."default" NOT NULL,\
          email text COLLATE pg_catalog."default" NOT NULL,\
          password text COLLATE pg_catalog."default" NOT NULL,\
          gender text COLLATE pg_catalog."default" NOT NULL,\
          job_role text COLLATE pg_catalog."default" NOT NULL,\
          department text COLLATE pg_catalog."default" NOT NULL,\
          address text COLLATE pg_catalog."default" NOT NULL,\
          hired_on timestamp with time zone NOT NULL DEFAULT timezone(\'utc\'::text, now()),\
          user_id bigint NOT NULL DEFAULT nextval(\'"userId-increment"\'::regclass),\
          passport_url text COLLATE pg_catalog."default" NOT NULL,\
          token text COLLATE pg_catalog."default" NOT NULL,\
          CONSTRAINT employees_pkey PRIMARY KEY (user_id),\
          CONSTRAINT email_ukey UNIQUE (email),\
          CONSTRAINT "jobRole_fkey" FOREIGN KEY (job_role)\
              REFERENCES public.job_roles (job_id) MATCH SIMPLE\
              ON UPDATE NO ACTION\
              ON DELETE NO ACTION\
        )\
      ').then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const fillUsersTable = () => new Promise((resolve, reject) => {
      db.query(`\
      INSERT INTO users ("user_id", "passport_url", "first_name", "last_name", "email", "password", "gender", "job_role", "department", "address", "token")\
      VALUES\
      (\
        '${admin.id}',
        '${admin.passport}',
        '${admin.firstName}',
        '${admin.lastName}',
        '${admin.email}',
        '${admin.password}',
        '${admin.gender}',
        '${admin.jobRole}',
        '${admin.department}',
        '${admin.address}',
        '${admin.token}'
      ),
      (
        '${user.id}',
        '${user.passport}',
        '${user.firstName}',
        '${user.lastName}',
        '${user.email}',
        '${user.password}',
        '${user.gender}',
        '${user.jobRole}',
        '${user.department}',
        '${user.address}',
        '${user.token}'
      )
    `).then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const buildPostsTable = () => new Promise((resolve, reject) => {
      db.query('\
        CREATE TABLE public.posts (\
          post_id bigint NOT NULL DEFAULT nextval(\'"postId-increment"\'::regclass),\
          post_type text COLLATE pg_catalog."C" NOT NULL,\
          post_author integer NOT NULL,\
          created_on timestamp with time zone NOT NULL DEFAULT timezone(\'utc\'::text, now()),\
          CONSTRAINT posts_pkey PRIMARY KEY (post_id),\
          CONSTRAINT author_fkey FOREIGN KEY (post_author)\
            REFERENCES public.users (user_id) MATCH SIMPLE\
            ON UPDATE NO ACTION\
            ON DELETE CASCADE\
        )\
      ').then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const fillPostsTable = () => new Promise((resolve, reject) => {
      db.query(`\
      INSERT INTO posts ("post_id", "post_type", "post_author")\
      VALUES\
      (\
        '${articles.postId}',
        '${articles.postType}',
        '${articles.postAuthor}'
      ),
      (
        '${gifs.postId}',
        '${gifs.postType}',
        '${gifs.postAuthor}'
      ),
      (
        '${reportsComp.posts.postId}',
        '${reportsComp.posts.postType}',
        '${reportsComp.posts.postAuthor}'
      )
    `).then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const buildArticlesTable = () => new Promise((resolve, reject) => {
      db.query('\
        CREATE TABLE public.articles (\
          post_id integer NOT NULL,\
          title text COLLATE pg_catalog."default" NOT NULL,\
          article text COLLATE pg_catalog."default" NOT NULL,\
          CONSTRAINT articles_pkey PRIMARY KEY (post_id),\
          CONSTRAINT "postId_fkey" FOREIGN KEY (post_id)\
            REFERENCES public.posts (post_id) MATCH SIMPLE\
            ON UPDATE NO ACTION\
            ON DELETE CASCADE\
        )\
      ').then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const fillArticlesTable = () => new Promise((resolve, reject) => {
      db.query(`\
      INSERT INTO articles ("post_id", "title", "article")\
      VALUES 
      ( 
        '${articles.postId}', 
        '${articles.title}', 
        '${articles.article}' 
      ),
      ( 
        '${reportsComp.posts.postId}', 
        '${reportsComp.posts.title}', 
        '${reportsComp.posts.article}' 
      )
    `).then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const buildGifsTable = () => new Promise((resolve, reject) => {
      db.query('\
        CREATE TABLE public.gifs (\
          post_id integer NOT NULL,\
          image_url text COLLATE pg_catalog."default" NOT NULL,\
          title text COLLATE pg_catalog."default",\
          CONSTRAINT gifs_pkey PRIMARY KEY (post_id),\
          CONSTRAINT "imageUrl_ukey" UNIQUE (image_url),\
          CONSTRAINT "postId_fkey" FOREIGN KEY (post_id)\
            REFERENCES public.posts (post_id) MATCH SIMPLE\
            ON UPDATE NO ACTION\
            ON DELETE CASCADE\
        )\
      ').then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const fillGifsTable = () => new Promise((resolve, reject) => {
      db.query(`\
      INSERT INTO gifs ("post_id", "title", "image_url")\
      VALUES ( '${gifs.postId}', '${gifs.title}', '${gifs.imageUrl}' )
    `).then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const buildCommentsTable = () => new Promise((resolve, reject) => {
      db.query('\
        CREATE TABLE public.post_comments (\
          comment_id integer NOT NULL DEFAULT nextval(\'"commentId-increment"\'::regclass),\
          post_id integer NOT NULL,\
          author_id integer NOT NULL,\
          comment text COLLATE pg_catalog."default" NOT NULL,\
          created_on timestamp with time zone NOT NULL DEFAULT timezone(\'utc\'::text, now()),\
          CONSTRAINT comments_pkey PRIMARY KEY (comment_id),\
          CONSTRAINT "authorId_fkey" FOREIGN KEY (author_id)\
            REFERENCES public.users (user_id) MATCH SIMPLE\
            ON UPDATE NO ACTION\
            ON DELETE CASCADE,\
          CONSTRAINT "postId_fkey" FOREIGN KEY (post_id)\
            REFERENCES public.posts (post_id) MATCH SIMPLE\
            ON UPDATE NO ACTION\
            ON DELETE CASCADE\
        )\
      ').then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const fillCommentsTable = () => new Promise((resolve, reject) => {
      db.query(`\
        INSERT INTO post_comments ("comment_id", "post_id", "author_id", "comment")\
        VALUES 
        ( 
          '${gifsComment.commentId}', 
          '${gifsComment.postId}', 
          '${gifsComment.authorId}', 
          '${gifsComment.comment}' 
        ),
        ( 
          '${articlesComment.commentId}', 
          '${articlesComment.postId}', 
          '${articlesComment.authorId}', 
          '${articlesComment.comment}' 
        ),
        ( 
          '${reportsComp.comments.commentId}', 
          '${reportsComp.comments.postId}', 
          '${reportsComp.comments.authorId}', 
          '${reportsComp.comments.comment}' 
        )
      `).then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const buildPostsAndCommentsFlagsTable = () => new Promise((resolve, reject) => {
      db.query(`
        CREATE TABLE public.posts_and_comments_flags (
          content_type text COLLATE pg_catalog."default" NOT NULL,
          content_id integer NOT NULL,
          flag text COLLATE pg_catalog."default" NOT NULL,
          reason text COLLATE pg_catalog."default" NOT NULL,
          reporter integer NOT NULL,
          reported_on timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
          report_id integer NOT NULL DEFAULT nextval('"reportId-increment"'::regclass),
          CONSTRAINT posts_and_comments_flags_pkey PRIMARY KEY (report_id),
          CONSTRAINT reporter_fkey FOREIGN KEY (reporter)
              REFERENCES public.users (user_id) MATCH SIMPLE
              ON UPDATE NO ACTION
              ON DELETE NO ACTION
        )
      `).then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const fillPostsAndCommentsFlagsTable = () => new Promise((resolve, reject) => {
      db.query(`\
        INSERT INTO posts_and_comments_flags ("content_type", "content_id", "flag", "reason", "reporter", "report_id")\
        VALUES 
        ( 
          '${reportsComp.reports.posts.contentType}', 
          '${reportsComp.reports.posts.contentId}', 
          '${reportsComp.reports.posts.flag}', 
          '${reportsComp.reports.posts.reason}', 
          '${reportsComp.reports.posts.reporter}', 
          '${reportsComp.reports.posts.reportId}'
        ),
        ( 
          '${reportsComp.reports.comments.contentType}', 
          '${reportsComp.reports.comments.contentId}', 
          '${reportsComp.reports.comments.flag}', 
          '${reportsComp.reports.comments.reason}', 
          '${reportsComp.reports.comments.reporter}', 
          '${reportsComp.reports.comments.reportId}'
        )       
      `).then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    const buildDepartmentManagersTable = () => new Promise((resolve, reject) => {
      db.query('\
        CREATE TABLE public.department_managers (\
          from_date timestamp with time zone NOT NULL,\
          to_date timestamp with time zone NOT NULL,\
          user_id bigint NOT NULL,\
          dept_id text COLLATE pg_catalog."C" NOT NULL,\
          CONSTRAINT department_managers_pkey PRIMARY KEY (dept_id),\
          CONSTRAINT dept_id FOREIGN KEY (dept_id)\
              REFERENCES public.departments (dept_id) MATCH SIMPLE\
              ON UPDATE NO ACTION\
              ON DELETE CASCADE,\
          CONSTRAINT "userId_fkey" FOREIGN KEY (user_id)\
              REFERENCES public.users (user_id) MATCH SIMPLE\
              ON UPDATE NO ACTION\
              ON DELETE CASCADE\
        )\
      ').then((result) => resolve(result))
        .catch((error) => reject(error));
    });

    /* ORDER OF EXECUTION IS !IMPORTANT AS SOME TABLES RELY ON OTHERS */
    console.log('Building Test Database...');
    buildSequences().then(() => {
      console.log('  - Built sequences successfully');
      buildDepartmentsTable().then(() => {
        console.log('  - Built "departments" table successfully');
        fillDepartmentsTable().then(() => {
          console.log('    - Inserted data into "departments" table successfully');
          buildJobRolesTable().then(() => {
            console.log('  - Built "job_role" table successfully');
            fillJobRolesTable().then(() => {
              console.log('    - Inserted data into "job_roles" table successfully');
              buildUsersTable().then(() => {
                console.log('  - Built "users" table successfully');
                fillUsersTable().then(() => {
                  console.log('    - Inserted data into "users" table successfully');
                  buildPostsTable().then(() => {
                    console.log('  - Built "posts" table successfully');
                    fillPostsTable().then(() => {
                      console.log('    - Inserted data into "posts" table successfully');
                      buildArticlesTable().then(() => {
                        console.log('  - Built "articles" table successfully');
                        fillArticlesTable().then(() => {
                          console.log('    - Inserted data into "articles" table successfully');
                          buildGifsTable().then(() => {
                            console.log('  - Built "gifs" table successfully');
                            fillGifsTable().then(() => {
                              console.log('    - Inserted data into "gifs" table successfully');
                              buildCommentsTable().then(() => {
                                console.log('  - Built "post_comments" table successfully');
                                fillCommentsTable().then(() => {
                                  console.log('    - Inserted data into "post_comments" table successfully');
                                  buildPostsAndCommentsFlagsTable().then(() => {
                                    console.log('  - Built "posts_and_comments_flags" table successfully');
                                    fillPostsAndCommentsFlagsTable().then(() => {
                                      console.log('    - Inserted data into "posts_and_comments_flags" table successfully');
                                      buildDepartmentManagersTable().then(() => {
                                        console.log('  - Built "department_managers" table successfully');
                                        console.log('Build Completed');
                                        done();
                                      }).catch((error) => console.log('  ** Failed building "department_managers" table', error));
                                    }).catch((error) => console.log('    ** Failed inserting data into "posts_and_comments_flags" table', error));
                                  }).catch((error) => console.log('  ** Failed building "posts_and_comments_flags" table', error));
                                }).catch((error) => console.log('    ** Failed inserting data into "post_comments" table', error));
                              }).catch((error) => console.log('  ** Failed building "post_comments" table', error));
                            }).catch((error) => console.log('    ** Failed inserting data into "gifs" table', error));
                          }).catch((error) => console.log('  ** Failed building "gifs" table', error));
                        }).catch((error) => console.log('    ** Failed inserting data into "articles" table', error));
                      }).catch((error) => console.log('  ** Failed building "articles" table', error));
                    }).catch((error) => console.log('    ** Failed inserting data into "posts" table', error));
                  }).catch((error) => console.log('  ** Failed building "posts" table', error));
                }).catch((error) => console.log('    ** Failed inserting data into "users" table', error));
              }).catch((error) => console.log('  ** Failed building "users" table', error));
            }).catch((error) => console.log('    ** Failed inserting data into "job_roles" table', error));
          }).catch((error) => console.log('  ** Failed building "job_roles" table', error));
        }).catch((error) => console.log('    ** Failed inserting data into "departments" table', error));
      }).catch((error) => console.log('  ** Failed building "departments" table', error));
    }).catch((error) => console.log('  ** Failed building sequences', error));
  }).timeout(6000);
});
