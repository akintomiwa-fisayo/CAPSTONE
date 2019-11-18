/* eslint-disable no-undef */
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../app');
const { users: { user }, posts: { articles } } = require('../samples');

describe('PATCH /articles/:id', () => {
  it('Should edit an article', (done) => {
    request(app).patch(`/articles/${articles.postId}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        title: 'new post title',
        article: 'new write up content of the article',
      })
      .then((res) => {
        const { body, status } = res;
        expect(status).to.equal(201);
        expect(body).to.contain.property('status').to.equal('success');
        expect(body).to.contain.property('data');
        expect(body.data).to.contain.property('message');
        expect(body.data).to.contain.property('article');
        expect(body.data).to.contain.property('title');
        done();
      })
      .catch((error) => done(error));
  }).timeout(6000);
});
