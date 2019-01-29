import { autoinject } from 'aurelia-framework';
import { HttpClient } from 'aurelia-fetch-client';
import { ITransporter } from './transporter';

@autoinject()
export class FetchTransporter implements ITransporter {
  constructor(private transporter: HttpClient) {}

  fetch(input: Request | string, options?: any): Promise<any> {
    return this.transporter.fetch(input, options);
  }
}
