import apiClient from '../apiClient';
import { API_ENDPOINTS } from '../endpoints';

/* -------------------------------------------------------------------------- */
/* INTERFACES                                                                 */
/* -------------------------------------------------------------------------- */

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  duration: string;
  description?: string;
  is_active: boolean;
  durations?: any[];
}

export interface Coupon {
  id: number;
  code: string;
  type: 'flat' | 'percent';
  value: number;
  min_amount: number;
  per_user_limit: number;
  used_global: number;
  remaining_global: number;
  expires_at: string | null;
  is_expired: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ApplyCouponResponse {
  success: boolean;
  message: string;
  original_price: string;
  discount: string;
  final_price: number;
  coupon: {
    code: string;
    type: string;
    value: number;
  };
}

export interface RazorpayInitiateResponse {
  success: boolean;
  order_id: string;
  amount: number;
  key: string;
  user: {
    name: string;
    email: string;
    contact: string;
  };
}

export interface RazorpayVerifyPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  plan_id: number;
  duration_id: number;
  coupon_code?: string | null;
}

export interface CurrentSubscription {
  success: boolean;
  subscription: {
    id: number;
    user_id: number;
    service_plan_id: number;
    start_date: string;
    end_date: string;
    status: string;
    plan?: any;
    duration?: any;
  } | null;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  amount: number;
  currency: string;
  invoice_date: string;
  subscription?: {
    plan?: { name: string };
    duration?: { duration: string };
  };
}

export interface CheckLockResponse {
  success: boolean;
  is_locked: boolean;
  can_pay: boolean;
  status: string;
  message: string;
  user?: {
    id: number;
    name: string;
  };
}

/* -------------------------------------------------------------------------- */
/* SERVICE METHODS                                                            */
/* -------------------------------------------------------------------------- */

const subscriptionService = {

  getPlans: async (): Promise<{ success: boolean; plans: SubscriptionPlan[]; kyc_status: string }> => {
    const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTION.PLANS);
    return response.data;
  },

  getCoupons: async (): Promise<{ success: boolean; data: Coupon[] }> => {
    const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTION.COUPONS);
    return response.data;
  },

  applyCoupon: async (
    code: string,
    durationId: number
  ): Promise<ApplyCouponResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.SUBSCRIPTION.APPLY_COUPON, {
      coupon_code: code,
      duration_id: durationId,
    });
    return response.data;
  },

  initiateRazorpay: async (
    planId: number,
    durationId: number,
    couponCode?: string | null
  ): Promise<RazorpayInitiateResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.SUBSCRIPTION.RAZORPAY.INITIATE, {
      plan_id: planId,
      duration_id: durationId,
      coupon_code: couponCode,
    });
    return response.data;
  },

  verifyRazorpay: async (
    payload: RazorpayVerifyPayload
  ): Promise<{ success: boolean; subscription_id: number; invoice_number: string; message?: string }> => {
    const response = await apiClient.post(API_ENDPOINTS.SUBSCRIPTION.RAZORPAY.VERIFY, payload);
    return response.data;
  },

  getCurrentSubscription: async (): Promise<CurrentSubscription> => {
    const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTION.CURRENT);
    return response.data;
  },

  getInvoices: async (): Promise<{ success: boolean; data: Invoice[] }> => {
    const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTION.INVOICES.LIST);
    return response.data;
  },

  downloadInvoice: async (invoiceId: number | string): Promise<Blob> => {
    const response = await apiClient.get(
      API_ENDPOINTS.SUBSCRIPTION.INVOICES.DOWNLOAD(invoiceId),
      { responseType: 'blob' }
    );
    return response.data;
  },

  getInvoiceDownloadUrl: async (invoiceId: number | string): Promise<{ success: boolean; download_url: string }> => {
    const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTION.INVOICES.DOWNLOAD(invoiceId));
    return response.data;
  },

  checkLock: async (
    planId: number | string, 
    durationId: number | string
  ): Promise<CheckLockResponse> => {
    const response = await apiClient.get(
      API_ENDPOINTS.SUBSCRIPTION.CHECK_LOCK(planId, durationId)
    );
    return response.data;
  },
};

export default subscriptionService;