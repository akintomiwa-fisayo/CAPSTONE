/* eslint-disable no-undef */
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../app');
const { users: { user } } = require('../samples');

describe('GET /user/:id/articles', () => {
  it('Should get a user articles', (done) => {
    request(app).get(`/users/${user.id}/articles`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${user.token}`)
      .send()
      .then((res) => {
        const { body, status } = res;
        expect(status).to.equal(200);
        expect(body).to.contain.property('status').to.equal('success');
        expect(body).to.contain.property('data').to.be.an('array');
        let comment = null;
        body.data.forEach((article) => {
          expect(article).to.contain.property('id');
          expect(article).to.contain.property('createdOn');
          expect(article).to.contain.property('title');
          expect(article).to.contain.property('article');
          expect(article).to.contain.property('authorId');
          expect(article).to.contain.property('comments').to.be.an('array');
          Object.keys(article.comments).forEach((i) => {
            comment = article.comments[i];
            expect(comment).be.an('object');
            expect(comment).to.contain.property('commentId');
            expect(comment).to.contain.property('comment');
            expect(comment).to.contain.property('authorId');
            expect(comment).to.contain.property('createdOn');
          });
        });
        done();
      })
      .catch((error) => done(error));
  }).timeout(6000);
});
