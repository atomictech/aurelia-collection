import { autoinject } from 'aurelia-framework';
import { HttpClient } from 'aurelia-fetch-client';
import { ITransporter, RequestInit } from './transporter';

@autoinject()
export class FetchTransporter implements ITransporter {
  constructor(private transporter: HttpClient) {}

  fetch(input: Request | string, init?: RequestInit): Promise<any> {
    return this.transporter.fetch(input, init);
  }
}
