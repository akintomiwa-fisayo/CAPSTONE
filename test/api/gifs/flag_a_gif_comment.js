/* eslint-disable no-undef */
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../app');
const { users: { user }, posts: { gifs }, comments: { gifs: gifsComment } } = require('../samples');

describe('POST /gifs/:id/comment/:commentId/flag', () => {
  it('Should flag a gif comment', (done) => {
    request(app).post(`/gifs/${gifs.postId}/comment/${gifsComment.commentId}/flag`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        flag: 'inappropriate',
        reason: 'reason for flag',
      })
      .then((res) => {
        const { body, status } = res;
        expect(status).to.equal(201);
        expect(body).to.contain.property('status').to.equal('success');
        expect(body).to.contain.property('data');
        expect(body.data).to.contain.property('message');
        expect(body.data).to.contain.property('reportId');
        expect(body.data).to.contain.property('contentType');
        expect(body.data).to.contain.property('contentId');
        expect(body.data).to.contain.property('flag');
        expect(body.data).to.contain.property('reason');
        expect(body.data).to.contain.property('reportedOn');
        done();
      })
      .catch((error) => done(error));
  }).timeout(6000);
});
