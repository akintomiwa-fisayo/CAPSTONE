const db = require('../dbconn');

exports.getAll = (req, res) => {
  // Get all reported contents
  const offset = req.query.offset && !isNaN(req.query.offset) ? req.query.offset : 0;
  const limit = req.query.limit && !isNaN(req.query.limit) ? req.query.limit : 'ALL';
  db.query(`
    SELECT *
    FROM posts_and_comments_flags 
    OFFSET ${offset}
    LIMIT ${limit}
  `).then(({ rowCount, rows: rawReports }) => {
    if (rowCount === 0) {
      res.status(404).json({
        status: 'error',
        error: 'No report found',
      });
    } else {
      const reports = [];
      const rawReportsLen = rowCount - 1;
      let counter = -1;
      const parseReports = () => new Promise((resolve, reject) => {
        const deleteReport = (report) => {
          db.query(`DELETE 
            FROM posts_and_comments_flags 
            WHERE report_id = $1`, [
            report.report_id,
          ]).then(() => {
            // Continue parsing after delete
            parseReports().then(resolve);
          }).catch((error) => reject(error));
        };
        const getUser = (userId) => new Promise((uResolve, uReject) => {
          // Get users details
          db.query(`
            SELECT user_id, first_name, last_name, passport_url
            FROM users
            WHERE user_id = $1 
          `, [
            userId,
          ]).then(({ rowCount: userCount, rows }) => {
            const result = userCount > 0 ? rows[0] : false;
            if (result) result.user_id = parseInt(result.user_id, 10);
            uResolve(result);
          }).catch((error) => {
            uReject(error);
          });
        });
        const getPost = (postType, postId) => new Promise((pResolve, pReject) => {
          // Get users details
          const dest = postType === 'article' ? 'articles' : 'gifs';
          db.query(`
            SELECT *
            FROM posts 
            INNER JOIN ${dest} 
            ON posts.post_id = ${dest}.post_id
            WHERE posts.post_id = $1
          `, [
            postId,
          ]).then(({ rowCount: postCount, rows }) => {
            pResolve(postCount > 0 ? rows[0] : false);
          }).catch((error) => {
            pReject(error);
          });
        });

        counter++;
        if (counter <= rawReportsLen) {
          const report = rawReports[counter];
          // Get reporter's details
          getUser(report.reporter).then((reporter) => {
            if (reporter) {
              // Now that we have all we need on reporter, we get info on the content reported
              // If reported content is a post
              if (report.content_type === 'article' || report.content_type === 'gif') {
                getPost(report.content_type, report.content_id).then((content) => {
                  if (content) {
                    // Now we get content author's info
                    getUser(content.post_author).then((contentAuthor) => {
                      if (contentAuthor) {
                        const parsedReport = {
                          reportId: report.report_id,
                          contentType: report.content_type,
                          flag: report.flag,
                          reason: report.reason,
                          reporter: {
                            id: reporter.user_id,
                            firstName: reporter.first_name,
                            lastName: reporter.last_name,
                            passportUrl: reporter.passport_url,
                          },
                          reportedOn: report.reported_on,
                        };
                        parsedReport[report.content_type] = {
                          id: content.post_id,
                          title: content.title,
                          createdOn: content.created_on,
                          author: {
                            id: contentAuthor.user_id,
                            firstName: contentAuthor.first_name,
                            lastName: contentAuthor.last_name,
                            passportUrl: contentAuthor.passport_url,
                          },
                        };

                        if (report.content_type === 'article') {
                          parsedReport[report.content_type].article = content.article;
                        } else parsedReport[report.content_type].imageUrl = content.image_url;

                        reports.push(parsedReport);
                        /* Now that we have successfully parse this report we will recall
                          the handler to parse the next report (if theres any) */
                        parseReports().then(resolve).catch(reject);
                      } else {
                        /* If content author no longer exist delete report, and continue parsing */
                        deleteReport(report);
                      }
                    }).catch((error) => reject(error));
                  } else {
                    /* If content reported no longer exist delete report,
                      and continue parsing */
                    deleteReport(report);
                  }
                }).catch((error) => reject(error));
              } else if (report.content_type === 'comment') {
                // If content reported is a comment
                db.query(`
                  SELECT comm.comment_id, comm.author_id, comm.comment, comm.created_on, posts.post_id, posts.post_type
                  FROM post_comments comm
                  INNER JOIN posts 
                  ON posts.post_id = comm.post_id
                  WHERE comm.comment_id = $1
                `, [
                  report.content_id,
                ]).then(({ rowCount: commCount, rows: comRows }) => {
                  if (commCount === 0) {
                    // If the Comment no longer exists, delete the report and continue parsing
                    deleteReport(report);
                  } else {
                    const content = comRows[0];
                    // Get info on the author of the comment
                    getUser(content.author_id).then((contentAuthor) => {
                      if (contentAuthor) {
                        // Get the post to which the comment is was made
                        getPost(content.post_type, content.post_id).then((post) => {
                          if (post) {
                            // Now we get post author's info
                            getUser(post.post_author).then((postAuthor) => {
                              if (postAuthor) {
                                const parsedReport = {
                                  reportId: report.report_id,
                                  contentType: report.content_type,
                                  flag: report.flag,
                                  reason: report.reason,
                                  reporter: {
                                    id: reporter.user_id,
                                    firstName: reporter.first_name,
                                    lastName: reporter.last_name,
                                    passportUrl: reporter.passport_url,
                                  },
                                  reportedOn: report.reported_on,
                                };
                                parsedReport[report.content_type] = {
                                  id: content.comment_id,
                                  comment: content.comment,
                                  createdOn: content.created_on,
                                  author: {
                                    id: contentAuthor.user_id,
                                    firstName: contentAuthor.first_name,
                                    lastName: contentAuthor.last_name,
                                    passportUrl: contentAuthor.passport_url,
                                  },
                                  post: {
                                    id: post.post_id,
                                    type: post.post_type,
                                    title: post.title,
                                    createdOn: post.created_on,
                                    author: {
                                      id: postAuthor.user_id,
                                      firstName: postAuthor.first_name,
                                      lastName: postAuthor.last_name,
                                      passportUrl: postAuthor.passport_url,
                                    },
                                  },
                                };

                                if (post.post_type === 'article') {
                                  parsedReport[report.content_type].post.article = post.article;
                                } else {
                                  parsedReport[report.content_type].post.imageUrl = post.image_url;
                                }

                                reports.push(parsedReport);
                                /* Now that we have successfully parse this report we will recall
                                the handler to parse the next report (if theres any) */
                                parseReports().then(resolve).catch(reject);
                              } else {
                                /* If post author no longer exist (which should never happen
                                since users table is cascaded whenever a post is deleted) */
                                deleteReport(report);
                              }
                            }).catch((error) => reject(error));
                          } else {
                            /* If post to which comment was made no longer exist (which should never
                            happen since comments table is cascaded whenever a post or
                            user is deleted) */
                            deleteReport(report);
                          }
                        }).catch((error) => reject(error));
                      } else {
                        /* If comment author no longer exist (which should never happen
                        since comment table is cascaded whenever a user is deleted) */
                        deleteReport(report);
                      }
                    }).catch((error) => reject(error));
                  }
                }).catch((error) => reject(error));
              } else {
                // If reported content type is not expected (which should never happen)
                deleteReport(report);
              }
            } else {
              /* If the Reporter no longer exists (which should never happen since posts and
              comments flag table is cascaded whennever a user is deleted) */
              deleteReport(report);
            }
          }).catch((error) => reject(error));
        } else {
          // All reports has been parsed so we exist loop
          resolve();
        }
      });

      parseReports().then(() => {
        res.status(200).json({
          status: 'success',
          data: reports,
        });
      }).catch((error) => {
        console.log(error);
        res.status(500).json({
          status: 'error',
          error: 'Sorry, we couldn\'t complete your request please try again',
        });
      });
    }
  }).catch((error) => {
    console.log(error);
    res.status(500).json({
      status: 'error',
      error: 'Sorry, we couldn\'t complete your request please try again',
    });
  });
};
