/* eslint-disable no-multi-str */
/* eslint-disable no-undef */
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../app');
const { users: { user } } = require('../samples');


describe('PATCH /auth/password', () => {
  it('Should chnage user\'s password in', (done) => {
    request(app).patch('/auth/password')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        oldPassword: user.passwordText,
        newPassword: `new_${user.passwordText}`,
      })
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
