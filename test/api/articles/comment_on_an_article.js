/* eslint-disable no-undef */
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../app');
const { users: { user }, posts: { articles } } = require('../samples');

describe('POST /articles/:id/comment', () => {
  it('Should create an article comment', (done) => {
    request(app).post(`/articles/${articles.postId}/comment`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ comment: 'new comment' })
      .then((res) => {
        const { body, status } = res;
        expect(status).to.equal(201);
        expect(body).to.contain.property('status').to.equal('success');
        expect(body).to.contain.property('data');
        expect(body.data).to.contain.property('message');
        expect(body.data).to.contain.property('createdOn');
        expect(body.data).to.contain.property('articleTitle');
        expect(body.data).to.contain.property('article');
        expect(body.data).to.contain.property('comment');
        expect(body.data).to.contain.property('commentId');
        done();
      })
      .catch((error) => done(error));
  }).timeout(6000);
});
