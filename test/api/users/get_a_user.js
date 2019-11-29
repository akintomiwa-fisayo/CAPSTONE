/* eslint-disable no-undef */
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../app');
const { users: { user } } = require('../samples');

describe('GET /user/:id', () => {
  it('Should get a user', (done) => {
    request(app).get(`/api/v1/users/${user.id}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${user.token}`)
      .send()
      .then((res) => {
        const { body, status } = res;
        expect(status).to.equal(200);
        expect(body).to.contain.property('status').to.equal('success');
        expect(body).to.contain.property('data');
        expect(body.data).to.contain.property('id');
        expect(body.data).to.contain.property('firstName');
        expect(body.data).to.contain.property('lastName');
        expect(body.data).to.contain.property('email');
        expect(body.data).to.contain.property('jobRole');
        expect(body.data).to.contain.property('department');
        expect(body.data).to.contain.property('passportUrl');
        expect(body.data).to.contain.property('hiredOn');
        done();
      })
      .catch((error) => done(error));
  }).timeout(6000);

  it('Should get a user (only columns requested)', (done) => {
    request(app).get(`/api/v1/users/${user.id}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${user.token}`)
      .query({
        columns: 'firstName,lastName',
      })
      .send()
      .then((res) => {
        const { body, status } = res;
        expect(status).to.equal(200);
        expect(body).to.contain.property('status').to.equal('success');
        expect(body).to.contain.property('data');
        expect(body.data).to.eql({
          firstName: user.firstName,
          lastName: user.lastName,
        });
        done();
      })
      .catch((error) => done(error));
  }).timeout(6000);
});
