import apiClient from '../apiClient';
import { API_ENDPOINTS } from '../endpoints';

export interface PlanData {
  id: number;
  name: string;
}

export interface DurationData {
  id: number;
  label: string;
}

export interface PricingData {
  amount: number;
  formatted_amount: string;
  coupon_applied: boolean;
  coupon: any | null;
}

export interface UserData {
  aadhaar_masked: string;
}

export interface EsignData {
  status: 'draft' | 'pending' | 'signed' | 'expired' | 'failed' | string;
  document_id: string | null;
  request_id: string | null;
  esign_url: string | null;
  completed_at: string | null;
  is_signed: boolean;
}

export interface PdfData {
  url: string | null;
}

export interface StatusData {
  current: 'draft' | 'pending' | 'active' | 'expired' | 'cancelled' | string;
  is_expired: boolean;
  expires_at: string | null;
}

export interface TimestampsData {
  created_at: string;
  updated_at: string;
}

export interface AgreementDraft {
  id: number;
  agreement_no: string;
  plan: PlanData;
  duration: DurationData;
  pricing: PricingData;
  user: UserData;
  esign: EsignData;
  pdf: PdfData;
  features: string[];
  snapshots: {
    user: any | null;
    kyc: any | null;
  };
  status: StatusData;
  timestamps: TimestampsData;
}

export interface GetDraftsResponse {
  success: boolean;
  total: number;
  data: AgreementDraft[];
}

export interface CreateDraftRequest {
  plan_id: number;
  duration_id: number;
  coupon_code?: string | null;
}

export interface CreateDraftResponse {
  success: boolean;
  message?: string;
  data?: AgreementDraft; 
}

export interface AgreementStatusResponse {
  success: boolean;
  status: string; // e.g., 'signed', 'expired', 'pending'
  data?: AgreementDraft; // Might return the updated agreement
}

// --- NEW INTERFACES FOR AGREEMENTS LIST ---

export interface SignedAgreementUser {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface SignedAgreementPlan {
  plan_id: number | null;
  duration_id: number | null;
  amount: string | null;
}

export interface SignedAgreementInvoice {
  invoice_id: number;
  invoice_number: string;
  amount: string;
  currency: string;
  payment_gateway: string;
  invoice_date: string;
  start_date: string;
  end_date: string;
}

export interface SignedAgreementCoupon {
  id: number | null;
  code: string | null;
}

export interface SignedAgreement {
  agreement_id: number;
  agreement_no: string;
  status: string;
  is_signed: boolean;
  signed_at: string;
  user: SignedAgreementUser;
  plan: SignedAgreementPlan;
  invoice: SignedAgreementInvoice;
  pdf: PdfData;
  coupon: SignedAgreementCoupon;
  snapshots: {
    user: any | null;
    kyc: any | null;
  };
  created_at: string;
}

export interface GetAgreementsListResponse {
  success: boolean;
  total: number;
  data: SignedAgreement[];
}

// --- Service Implementation ---

const AgreementService = {
  createDraft: async (payload: CreateDraftRequest): Promise<CreateDraftResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AGREEMENTS.CREATE_DRAFT, payload);
    return response.data;
  },

  getDrafts: async (): Promise<GetDraftsResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.AGREEMENTS.GET_DRAFTS);
    return response.data;
  },

  checkStatus: async (id: number | string): Promise<AgreementStatusResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.AGREEMENTS.STATUS(id));
    return response.data;
  },

  submitManualPayment: async (payload: FormData): Promise<any> => {
    const response = await apiClient.post(
      API_ENDPOINTS.AGREEMENTS.MANUAL_PAYMENT,
      payload,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        // This prevents Axios from attempting to run JSON.stringify on the FormData object
        transformRequest: (data) => data,
      }
    );
    return response.data;
  },

  // NEW METHOD FOR FETCHING LIST
  getAgreementsList: async (): Promise<GetAgreementsListResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.AGREEMENTS.LIST);
    return response.data;
  },
};

export default AgreementService;