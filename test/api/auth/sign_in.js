/* eslint-disable no-multi-str */
/* eslint-disable no-undef */
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../app');
const { users: { user } } = require('../samples');


describe('POST /auth/signin', () => {
  it('Should sign user in', (done) => {
    request(app).post('/api/v1/auth/signin')
      .set('Content-Type', 'application/json')
      .send({ password: user.passwordText, username: user.email })
      .then((res) => {
        const { body, status } = res;
        expect(status).to.equal(200);
        expect(body).to.contain.property('status').to.equal('success');
        expect(body).to.contain.property('data');
        expect(body.data).to.contain.property('token');
        expect(body.data).to.contain.property('userId');
        expect(body.data).to.contain.property('firstName');
        expect(body.data).to.contain.property('lastName');
        expect(body.data).to.contain.property('email');
        expect(body.data).to.contain.property('gender');
        expect(body.data).to.contain.property('jobRole');
        expect(body.data).to.contain.property('department');
        expect(body.data).to.contain.property('address');
        expect(body.data).to.contain.property('passportUrl');
        expect(body.data).to.contain.property('hiredOn');
        done();
      })
      .catch((error) => done(error));
  }).timeout(6000);
});
