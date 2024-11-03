export interface ProcedureOption {
    billing_code: string;
    plain_language_description: string;
  }
  
  export interface PriceResult {
    organization_name: string;
    address_line_1: string;
    city: string;
    state: string;
    zip_code: string;
    negotiated_rate: number;
    billing_class: string;
    billing_code_modifier: string;
  }
  
  export const INSURANCE_PLANS = [
    'Cigna_LocalPlus',
    'Cigna_OAP',
    'Cigna_PPO',
    'United_Choice_Plus_PPO',
    'United_Options_PPO',
  ] as const;
  
  export type InsurancePlan = typeof INSURANCE_PLANS[number];