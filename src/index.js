import superagent from 'superagent'
import { Observable as O } from 'rxjs/Observable'

type RequestOptions = {
  method?: string,
  headers?: {
    [string]: string,
  },
  body?: any,
}

const request = (url: string, options: ?RequestOptions):
  rxjs$Observable<any> => {}

export default request
