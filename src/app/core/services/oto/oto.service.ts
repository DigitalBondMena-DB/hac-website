import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IYotoPlaced } from '@core/interfaces/iyoto';

@Injectable({
  providedIn: 'root',
})
export class OtoService {
  apiKey =
    'eyJhbGciOiJSUzI1NiIsImtpZCI6IjZkZTQwZjA0ODgxYzZhMDE2MTFlYjI4NGE0Yzk1YTI1MWU5MTEyNTAiLCJ0eXAiOiJKV1QifQ.eyJjb21wYW55SWQiOiIxMDI1MTMiLCJjbGllbnRUeXBlIjoiRnJlZVBhY2thZ2UiLCJtYXJrZXRQbGFjZU5hbWUiOiJvdG9hcGkiLCJ1c2FnZU1vZGUiOiJyZWFsIiwic3RvcmVOYW1lIjoiSEFDIENvc21ldGljcyIsInVzZXJUeXBlIjoic2FsZXNDaGFubmVsIiwic2NjSWQiOiIyMjUxOSIsInVzZXJJZCI6IjExMDg1MCIsImVtYWlsIjoiMTAyNTEzLTIyNTE5LW90b2FwaUB0cnlvdG8uY29tIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL290by1yZXN0LWFwaSIsImF1ZCI6Im90by1yZXN0LWFwaSIsImF1dGhfdGltZSI6MTc1MjEzNTYxNSwidXNlcl9pZCI6Im5vdkZPb2FwMUdUNVJWQkJvd1RZaDNnOWRjNzMiLCJzdWIiOiJub3ZGT29hcDFHVDVSVkJCb3dUWWgzZzlkYzczIiwiaWF0IjoxNzUzMTAyMzk0LCJleHAiOjE3NTMxMDU5OTQsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyIxMDI1MTMtMjI1MTktb3RvYXBpQHRyeW90by5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.E2WaIQD57DJnC3uXjahAiiGZTgmBvFC33WKbwQlvzxIBpknIqfmON8ZAY6e8w8VWjyKNecMrYzdKEQ92Hd2xPRTMi3v8yri8WErcM6g8FZ84zNm_zDM55JPqkTBc8lRKoRoHgVE6FAWESWzUy1Tv_ao8MBwGNdiitGiuhafZwre3a4PqNWXFrJEnpHbgs_SqwDf5dD6X0qrmBPZo6F08NrBuCXPUxypMs6Ra25C0aEN4K5qa3KmmKFFWSXM0l1VXEDypVC0ZZcsr6HIHrwkMrpO1f75R2ZPKc6NnZxz2Zu5QFHrMQpY5HtG01m6a_278Kvuk6M-J9Y_Y8m0yU1A08A';
  constructor(private http: HttpClient) {}
  createORder(order: IYotoPlaced) {
    const baseReqData = {
      ...order,
      customer: {
        name: 'Mohamed Dawoud',
        email: 'm.dawoud@hayatalafkar.com',
        mobile: '+966 545372774',
        address: 'Al Olaya',
        city: 'Riyadh',
        country: 'Saudi Arabia',
        postcode: '12241',
      },
    };
    return this.http.post<IYotoPlaced>(
      'https://api.tryoto.com/rest/v2/createOrder',
      baseReqData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );
  }
}
