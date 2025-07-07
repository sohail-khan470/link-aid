export interface Incident {
  id: string;
  userId: string;
  vehicle: string;
  description: string;
  userEmail: string;
  dateTime: string;
  location: string;
  geo: null | string;
  document: string;
  timestamp: any;
  regdate: string;
}
