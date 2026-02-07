export interface Property {
  propertyName: string;
  price: string;
  bhk: string;
  locality: string;
  area: string;
  developer: string;
  status: string;
  regDate: string;
  link: string;
  propertyType: string;
  city: string;
  furnishing: string;
  fomo: string;
  source: '99acres' | 'VitalSpace' | 'Other' | string;
  isNew?: boolean; // Track new properties for badge display
}

export interface WebhookResponse {
  success: boolean;
  data?: Property[];
  errors?: unknown[];
}
