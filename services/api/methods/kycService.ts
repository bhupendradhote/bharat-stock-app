import apiClient from '../apiClient';
import { API_ENDPOINTS } from '../endpoints';

export interface KycStartResponse {
  message: string;
  status: string;
  reference_id?: string;
}

export interface KycStatusResponse {
  status: 'pending' | 'approved' | 'rejected' | 'none';
  message?: string;
  reason?: string;
  updated_at?: string;
  document_id?: string;
  has_signature?: boolean;
  has_selfie?: boolean;
  completed_at?: string;
  kyc_data?: any;
}

const kycService = {

  // ✅ Start KYC
  startKyc: async (): Promise<KycStartResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.KYC.START
    );
    return response.data;
  },

  // ✅ Get KYC Status
  getKycStatus: async (): Promise<KycStatusResponse> => {
    const response = await apiClient.get(
      API_ENDPOINTS.KYC.STATUS
    );
    return response.data;
  },

  // ✅ Get KYC Media (signature/selfie)
  getKycMedia: async (
    requestId: string,
    type: 'signature' | 'selfie'
  ): Promise<Blob> => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.KYC.MEDIA}/${requestId}/${type}`,
      {
        responseType: 'blob', // important for image/file
      }
    );
    return response.data;
  },

  // ✅ KYC Callback (usually backend/internal, but added if needed)
  kycCallback: async (payload: {
    digio_doc_id: string;
    status: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(
      API_ENDPOINTS.KYC.CALLBACK,
      payload
    );
    return response.data;
  },
};

export default kycService;