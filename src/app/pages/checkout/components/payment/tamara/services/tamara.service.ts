import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TamaraService {
  private _http = inject(HttpClient);

  environment: string = 'https://api.tamara.co/checkout';
  apiKey: string =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhY2NvdW50SWQiOiI4MTY1MGYyZS0xNDBlLTQyZTItYjViMi0xYzY0ODc5ZGJmM2EiLCJ0eXBlIjoibWVyY2hhbnQiLCJzYWx0IjoiMmNjYmFmZTktMDdlYi00YjNjLWJiNzktZWFmMDg0MTYyYmJiIiwicm9sZXMiOlsiUk9MRV9NRVJDSEFOVCJdLCJpc010bHMiOmZhbHNlLCJpYXQiOjE3NTA3NjE1MTAsImlzcyI6IlRhbWFyYSBQUCJ9.Fo_2bZF1EuVg4y5vX-88Q9TW1o6s1SpnnZuibB7nDGU868QfST6hgEqaZQdgvXaeB41uU5qWoEh05LUtM1gv3_vImtXUEQ3rG4Ok7lNqM4KpjP28ASAzQOWJc3Qky040hoq8MdLilkxpjmPd3IuP_Vl8Xemdlh9FuFjJLcYjG1wECeshE1Ml3-Fd7wQcNPJ5EWxJIQnTfBIzn5nPz7MOvSiWa1exOrMqyHxqBnbX7eWFYXke5tTtOc03OM-q4sGsbFQrkqgtz637KCuOSuqV3uKFh-7_Yrda-EKeJB9YjCAwJMSSbEpPuyJpZIP60VFhan4qooxMJGIr17hQuqfzzw';
  constructor() {}

  createPaymentSession(tamaraPaymentRequest: any): Observable<any> {
    return this._http.post(this.environment, tamaraPaymentRequest, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
  }
}
