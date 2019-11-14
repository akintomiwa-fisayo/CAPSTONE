/* eslint-disable no-undef */
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../app');
const { users: { user }, posts: { gifs } } = require('../samples');

describe('GET /gifs/:id', () => {
  it('Should get a gif', (done) => {
    request(app).get(`/gifs/${gifs.postId}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${user.token}`)
      .send()
      .then((res) => {
        const { body, status } = res;
        expect(status).to.equal(200);
        expect(body).to.contain.property('status').to.equal('success');
        expect(body.data).to.contain.property('id');
        expect(body.data).to.contain.property('createdOn');
        expect(body.data).to.contain.property('title');
        expect(body.data).to.contain.property('url');
        expect(body.data).to.contain.property('comments').to.be.an('array');
        for (let i = 0; i < body.data.comments.length; i++) {
          expect(body.data.comments[i]).to.contain.property('commentId');
          expect(body.data.comments[i]).to.contain.property('comment');
          expect(body.data.comments[i]).to.contain.property('authorId');
        }
        done();
      })
      .catch((error) => done(error));
  }).timeout(6000);
});
