/* eslint-disable no-undef */
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../app');
const { users: { admin }, reportsComp } = require('../samples');

describe('PATCH /reports/:id', () => {
  it('Should attend to a report (ignore)', (done) => {
    request(app).patch(`/reports/${reportsComp.reports.posts.reportId}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ action: 'ignore' })
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
