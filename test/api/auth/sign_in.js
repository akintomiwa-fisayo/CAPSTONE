/* eslint-disable no-multi-str */
/* eslint-disable no-undef */
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../app');
const { users: { user } } = require('../samples');


describe('POST /auth/signin', () => {
  it('Should sign user in', (done) => {
    request(app).post('/auth/signin')
      .set('Content-Type', 'application/json')
      .send({ password: user.password_text, email: user.email })
      .then((res) => {
        const { body, status } = res;
        expect(status).to.equal(200);
        expect(body).to.contain.property('status').to.equal('success');
        expect(body).to.contain.property('data');
        expect(body.data).to.contain.property('token');
        expect(body.data).to.contain.property('userId');
        done();
      })
      .catch((error) => done(error));
  }).timeout(6000);
});
