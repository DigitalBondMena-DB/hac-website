import { inject, Injectable } from '@angular/core';
import { CommonService } from '@core/services/common/common.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private commonService = inject(CommonService);

  getHomeData(): Observable<any> {
    // Use the CommonService which now has caching
    return this.commonService.getHomeData();
  }
}
