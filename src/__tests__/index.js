import { Observable as O } from 'rxjs'
import nock from 'nock'

import request from '../'

describe('request', () => {
  it('should make a GET request by default', () => {
    expect.assertions(3)
    const url = 'https://1.example.com'
    nock(url)
      .get('/')
      .reply(200, 'YOLO')
    return request(url)
      .do(res => {
        expect(res.status).toBe(200)
        expect(res.body).toBe('YOLO')
        expect(typeof res.headers).toBe('object')
      })
      .toPromise()
  })

  it('should send headers', () => {
    expect.assertions(3)
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
        expect(res.status).toBe(200)
        expect(res.body).toBe('YOLO')
        expect(typeof res.headers).toBe('object')
      })
      .toPromise()
  })

  it('should pass the response headers to the subscriber', () => {
    expect.assertions(1)
    const url = 'https://3.example.com'
    nock(url)
      .get('/')
      .reply(200, 'YOLO', { 'X-Yolo': 'Manchmal...' })
    return request(url)
      .do(res => {
        expect(res.headers['x-yolo']).toBe('Manchmal...')
      })
      .toPromise()
  })

  it('should throw if the response status code is non 2xx', () => {
    expect.assertions(1)
    const url = 'https://4.example.com'
    nock(url)
      .get('/')
      .reply(500, 'ERROR!')
    return request(url)
      .catch(err => {
        expect(err.response.body).toBe('ERROR!')
        return O.empty()
      })
      .toPromise()
  })

  // XXX: this test doesn't actually test if the HTTP request is canceled.
  it('should cancel the request if the observable is unsubscribed from.',
    done => {
      const url = 'https://5.example.com'
      nock(url)
        .get('/')
        .delay(100)
        .reply(200, '123')
      const sub = request(url)
        .do((res) => {
          done.fail()
        })
        .subscribe()
      setTimeout(() => {
        sub.unsubscribe()
        done()
      }, 50)
    }
  )

  it('should use the specified method', () => {
    expect.assertions(1)
    const url = 'https://4.example.com'
    nock(url)
      .post('/')
      .reply(200, 'TROLOLO')
    return request(url, { method: 'POST' })
      .do((res) => { expect(res.body).toBe('TROLOLO') })
      .toPromise()
  })

  it('should send the specified body along with the request', () => {
    expect.assertions(1)
    const url = 'https://4.example.com'
    nock(url)
      .post('/', { x: true })
      .reply(200, 'TROLOLO')
    return request(url, { method: 'POST', body: { x: true } })
      .do((res) => { expect(res.body).toBe('TROLOLO') })
      .toPromise()
  })

  it('should should use the passed instance of superagent', () => {
    const superagent = jest.fn()
    superagent.mockReturnValue({
      send: jest.fn(),
      end: jest.fn(),
      set: jest.fn(),
    })
    request('https://example.com', {}, superagent).subscribe()
    expect(superagent).toBeCalled()
  })
})
