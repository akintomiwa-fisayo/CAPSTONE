/* eslint-disable no-undef */
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../app');
const { users: { user }, posts: { articles } } = require('../samples');

describe('DELETE /articles/:id', () => {
  it('Should delete an article', (done) => {
    request(app).delete(`/articles/${articles.postId}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send()
      .then((res) => {
        const { body, status } = res;
        expect(status).to.equal(200);
        expect(body).to.contain.property('status').to.equal('success');
        expect(body).to.contain.property('data');
        expect(body.data).to.contain.property('message');
        done();
      })
      .catch((error) => done(error));
  }).timeout(6000);
});
