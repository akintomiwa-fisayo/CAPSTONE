const jwt = require('jsonwebtoken');

const userPassword = '$2b$10$NJKkups9jG6D4ZV7s8y7tOtvtuR5jgtPA6xuJgGzx2Xf3rnrNOIky';
const user = {
  id: 1067,
  firstName: 'name',
  lastName: 'name',
  email: 'user@gmail.com',
  password: userPassword,
  passwordText: 'password',
  gender: 'male',
  jobRole: 'j1003',
  department: 'd1002',
  address: 'address',
  passport: 'https://res.cloudinary.com/capstone-backend/image/upload/v1573054820/gkascktgwbavuemvjy4v.jpg',
  token: jwt.sign({
    userId: 1067,
    email: 'user@gmail.com',
    password: userPassword,
  }, process.env.USERS_TOKEN_SECRET, {
    expiresIn: '24h',
  }),
};

const reportsComp = {
  posts: {
    postId: 19991,
    postType: 'article',
    postAuthor: user.id,
    title: 'report sample title',
    article: 'report sample lorem article',
  },
};
reportsComp.comments = {
  commentId: 19991,
  postId: reportsComp.posts.postId,
  authorId: user.id,
  comment: 'report article comment content',
};
reportsComp.reports = {
  posts: {
    contentType: reportsComp.posts.postType,
    contentId: reportsComp.posts.postId,
    flag: 'inappropriate',
    reason: 'it is quit lame',
    reporter: user.id,
    reportId: 1991,
  },
  comments: {
    contentType: 'comment',
    contentId: reportsComp.comments.commentId,
    flag: 'inappropriate',
    reason: 'it is quit lame',
    reporter: user.id,
    reportId: 1992,
  },
};


// //////////////////////////////////////////////////////////////////////
exports.users = {
  admin: {
    ...user,
    id: 1065,
    email: 'admin@gmail.com',
    jobRole: 'j1001',
    department: 'd1002',
    token: jwt.sign({
      userId: 1065,
      email: 'admin@gmail.com',
      password: userPassword,
    }, process.env.USERS_TOKEN_SECRET, {
      expiresIn: '24h',
    }),
  },
  user,
};

exports.posts = {
  articles: {
    postId: 10001,
    postType: 'article',
    postAuthor: user.id,
    title: 'sample title',
    article: 'sample lorem article',
  },
  gifs: {
    postId: 10002,
    postType: 'gif',
    postAuthor: user.id,
    title: 'sample title',
    imageUrl: 'https://res.cloudinary.com/capstone-backend/image/upload/v1573444709/yi7iws2r2jwbimlhlrmd.gif',

  },
};

exports.comments = {
  articles: {
    commentId: 10001,
    postId: exports.posts.articles.postId,
    authorId: user.id,
    comment: 'article comment content',
  },
  gifs: {
    commentId: 10002,
    postId: exports.posts.gifs.postId,
    authorId: user.id,
    comment: 'gif comment content',
  },
};

exports.reportsComp = reportsComp;
