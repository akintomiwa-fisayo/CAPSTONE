/* eslint-disable no-undef */
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../app');
const { users: { user } } = require('./samples');


describe('GET /feed', () => {
  it('Should get all posts', (done) => {
    request(app).get('/feed')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${user.token}`)
      .send()
      .then((res) => {
        const { body, status } = res;
        expect(status).to.equal(200);
        expect(body).to.contain.property('status').to.equal('success');
        expect(body).to.contain.property('data').to.be.an('array');
        for (let i = 0; i < body.data.length; i++) {
          expect(body.data[i]).to.contain.property('id');
          expect(body.data[i]).to.contain.property('createdOn');
          expect(body.data[i]).to.contain.property('authorId');
          expect(body.data[i]).to.contain.property('title');
          expect(body.data[i]).to.contain.property('type');
          expect(body.data[i]).to.have.any.keys('url', 'article');
        }
        done();
      })
      .catch((error) => done(error));
  }).timeout(6000);
});
