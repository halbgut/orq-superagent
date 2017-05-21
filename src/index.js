import superagent from 'superagent'
import { Observable as O } from 'rxjs/Observable'

type RequestOptions = {
  method?: string,
  headers?: {
    [string]: string,
  },
  body?: any,
}

const defaults = {
  method: 'GET',
}

const request = (url: string, options: ?RequestOptions):
  rxjs$Observable<any> =>
    O.create(o => {
      const { headers, method, body } = Object.assign({}, defaults, options)
      const request = superagent(method, url)
      if (headers) request.set(headers)
      if (body) request.send(body)
      request.end((err, res) => {
        if (err) return o.error(new HttpRequestError(res))
        o.next(getResponseProps(res))
        o.complete()
      })
      return () => {
        if (!request.response) {
          request.abort()
        }
      }
    })

const getResponseProps = res => {
  const body = Object.keys(res.body).length
    ? res.body
    : res.text
  return {
    status: res.status,
    headers: res.headers,
    body,
  }
}

function HttpRequestError(res) {
  this.message = 'HTTP request failed.'
  this.response = getResponseProps(res)
}

(HttpRequestError: any).prototype = Error.prototype

export default request
