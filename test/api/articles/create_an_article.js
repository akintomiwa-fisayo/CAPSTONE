/* eslint-disable no-multi-str */
/* eslint-disable no-undef */
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../app');
const { users: { user } } = require('../samples');

describe('POST /articles', () => {
  it('Should create an article', (done) => {
    request(app).post('/articles')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        title: 'post title',
        article: 'the main write up content of the article',
      })
      .then((res) => {
        const { body, status } = res;
        expect(status).to.equal(201);
        expect(body).to.contain.property('status').to.equal('success');
        expect(body).to.contain.property('data');
        expect(body.data).to.contain.property('message');
        expect(body.data).to.contain.property('articleId');
        expect(body.data).to.contain.property('createdOn');
        expect(body.data).to.contain.property('title');
        done();
      })
      .catch((error) => done(error));
  }).timeout(6000);
});
