export type ResourceCategory =
  | "Support Group"
  | "Treatment Center"
  | "Counseling"
  | "Financial Aid"
  | "Hospice"
  | "Transportation";

export interface BusinessHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
  is24Hours?: boolean;
}

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
  hours?: BusinessHours;
}

export const resources: Resource[] = [

];
