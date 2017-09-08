import { Observable as O } from 'rxjs'
import test from 'ava'
import nock from 'nock'
import sinon from 'sinon'

import request from '../'

test('request should make a GET request by default', t => {
  t.plan(3)
  const url = 'https://1.example.com'
  nock(url)
    .get('/')
    .reply(200, 'YOLO')
  return request(url)
    .do(res => {
      t.is(res.status, 200)
      t.is(res.body, 'YOLO')
      t.is(typeof res.headers, 'object')
    })
})

test('request should send headers', t => {
  t.plan(3)
  const url = 'https://2.example.com'
  nock(url, {
    reqheaders: {
      'X-Yolo': 'IMMER!',
    }
  })
    .get('/')
    .reply(200, 'YOLO')
  return request(url, { headers: { 'X-Yolo': 'IMMER!' } })
    .do(res => {
      t.is(res.status, 200)
      t.is(res.body, 'YOLO')
      t.is(typeof res.headers, 'object')
    })
})

test('request should pass the response headers to the subscriber', t => {
  t.plan(1)
  const url = 'https://3.example.com'
  nock(url)
    .get('/')
    .reply(200, 'YOLO', { 'X-Yolo': 'Manchmal...' })
  return request(url)
    .do(res => {
      t.is(res.headers['x-yolo'], 'Manchmal...')
    })
})

test('request should throw if the response status code is non 2xx', t => {
  t.plan(1)
  const url = 'https://4.example.com'
  nock(url)
    .get('/')
    .reply(500, 'ERROR!')
  return request(url)
    .catch(err => {
      t.is(err.response.body, 'ERROR!')
      return O.empty()
    })
})

// XXX: this test doesn't actually test if the HTTP request is canceled.
test.cb('request should cancel the request if the observable is unsubscribed from.', t => {
  const url = 'https://5.example.com'
  nock(url)
    .get('/')
    .delay(100)
    .reply(200, '123')
  const sub = request(url)
    .do((res) => {
      t.fail()
    })
    .subscribe()
  setTimeout(() => {
    sub.unsubscribe()
    t.pass()
    t.end()
  }, 50)
})

test('request should use the specified method', t => {
  t.plan(1)
  const url = 'https://4.example.com'
  nock(url)
    .post('/')
    .reply(200, 'TROLOLO')
  return request(url, { method: 'POST' })
    .do((res) => { t.is(res.body, 'TROLOLO') })
})

test('request should send the specified body along with the request', t => {
  t.plan(1)
  const url = 'https://4.example.com'
  nock(url)
    .post('/', { x: true })
    .reply(200, 'TROLOLO')
  return request(url, { method: 'POST', body: { x: true } })
    .do((res) => { t.is(res.body, 'TROLOLO') })
})

test('request should use passed instance of superagent', t => {
  const superagent = sinon.stub()
  superagent.returns({
    send: sinon.stub(),
    end: sinon.stub(),
    set: sinon.stub(),
  })
  request('https://example.com', {}, superagent).subscribe()
  t.true(superagent.called)
})
