import { Inject, Injectable, Optional } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';

import { BaseService } from '../api.base.service';
import { Configuration } from '../configuration';
import { BASE_PATH } from '../variables';
import { SubcategoryDto } from '../model/subcategoryDto';

@Injectable({
  providedIn: 'root'
})
export class SubcategoryControllerService extends BaseService {

  constructor(
    protected httpClient: HttpClient,
    @Optional() @Inject(BASE_PATH) basePath: string | string[],
    @Optional() configuration?: Configuration
  ) {
    super(basePath, configuration);
  }

  private buildUrl(path: string): string {
    const basePath = this.configuration.basePath ?? '';
    const trimmedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
    const normalizedPath = path.startsWith('/') ? path : '/' + path;
    return trimmedBase + normalizedPath;
  }

  findAll(options?: { context?: HttpContext }): Observable<SubcategoryDto[]> {
    const url = this.buildUrl('/api/v1/subcategories');
    const { withCredentials } = this.configuration;

    return this.httpClient.get<SubcategoryDto[]>(url, {
      context: options?.context,
      ...(withCredentials ? { withCredentials } : {})
    });
  }

  findById(id: string, options?: { context?: HttpContext }): Observable<SubcategoryDto> {
    const url = this.buildUrl('/api/v1/subcategories/' + encodeURIComponent(id));
    const { withCredentials } = this.configuration;

    return this.httpClient.get<SubcategoryDto>(url, {
      context: options?.context,
      ...(withCredentials ? { withCredentials } : {})
    });
  }

  create(dto: SubcategoryDto, options?: { context?: HttpContext }): Observable<SubcategoryDto> {
    const url = this.buildUrl('/api/v1/subcategories');
    const { withCredentials } = this.configuration;

    return this.httpClient.post<SubcategoryDto>(url, dto, {
      context: options?.context,
      ...(withCredentials ? { withCredentials } : {})
    });
  }

  update(id: string, dto: SubcategoryDto, options?: { context?: HttpContext }): Observable<SubcategoryDto> {
    const url = this.buildUrl('/api/v1/subcategories/' + encodeURIComponent(id));
    const { withCredentials } = this.configuration;

    return this.httpClient.put<SubcategoryDto>(url, dto, {
      context: options?.context,
      ...(withCredentials ? { withCredentials } : {})
    });
  }

  delete(id: string, options?: { context?: HttpContext }): Observable<void> {
    const url = this.buildUrl('/api/v1/subcategories/' + encodeURIComponent(id));
    const { withCredentials } = this.configuration;

    return this.httpClient.delete<void>(url, {
      context: options?.context,
      ...(withCredentials ? { withCredentials } : {})
    });
  }
}
