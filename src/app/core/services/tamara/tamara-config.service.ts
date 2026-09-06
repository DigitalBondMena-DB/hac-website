import { Injectable } from '@angular/core';

export interface TamaraConfig {
  publicKey: string;
  country: string;
}

@Injectable({
  providedIn: 'root',
})
export class TamaraConfigService {
  private config: TamaraConfig;

  constructor() {
    this.config = {
      publicKey: 'eb371cbf-c5d1-4dde-8a3f-99beb8dcfa5e',
      country: 'SA',
    };
  }

  /**
   * Get the current Tamara configuration
   */
  getConfig(): TamaraConfig {
    return { ...this.config };
  }

  /**
   * Get the public key for widgets
   */
  getPublicKey(): string {
    return this.config.publicKey;
  }

  /**
   * Get the country code
   */
  getCountry(): string {
    return this.config.country;
  }

  /**
   * Update configuration (useful for testing or dynamic configuration)
   */
  updateConfig(newConfig: Partial<TamaraConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
