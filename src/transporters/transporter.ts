export interface ITransporter {
  fetch(endpoint: string, options: any): Promise<any>;
}
