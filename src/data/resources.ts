export type ResourceCategory =
  | "Support Group"
  | "Treatment Center"
  | "Counseling"
  | "Financial Aid"
  | "Hospice"
  | "Transportation";

export interface Resource {
  id: string;
  name: string;
  category: ResourceCategory;
  lat: number;
  lng: number;
  address: string;
  city: string;
  state?: string;
  country: string;
  phone?: string;
  website?: string;
}

export const resources: Resource[] = [

];
