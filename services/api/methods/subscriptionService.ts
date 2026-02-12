import apiClient from '../apiClient';
import { API_ENDPOINTS } from '../endpoints';

/* -------------------------------------------------------------------------- */
/* INTERFACES                                 */
/* -------------------------------------------------------------------------- */

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  duration: string;
  description?: string;
  is_active: boolean;
  durations?: any[]; // For the with('durations.features') relation
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
  final_price: string;
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
  download_url?: string;
  subscription?: any;
}

/* -------------------------------------------------------------------------- */
/* SERVICE METHODS                               */
/* -------------------------------------------------------------------------- */

const subscriptionService = {
  /**
   * 1️⃣ GET PLANS
   */
  getPlans: async (): Promise<{ success: boolean; plans: SubscriptionPlan[]; kyc_status: string }> => {
    const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTION.PLANS);
    return response.data;
  },

  /**
   * 2️⃣ GET ALL AVAILABLE COUPONS
   */
  getCoupons: async (): Promise<{ success: boolean; data: Coupon[] }> => {
    const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTION.COUPONS);
    return response.data;
  },

  /**
   * 3️⃣ APPLY COUPON
   * Note: Backend expects duration_id
   */
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

  /**
   * 4️⃣ INITIATE RAZORPAY ORDER
   * Note: Includes optional coupon_code as per your backend controller
   */
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

  /**
   * 5️⃣ VERIFY RAZORPAY PAYMENT
   * Required fields: order_id, payment_id, signature, plan_id, duration_id
   */
  verifyRazorpay: async (
    payload: RazorpayVerifyPayload
  ): Promise<{ success: boolean; subscription_id: number; invoice_number: string; message?: string }> => {
    const response = await apiClient.post(API_ENDPOINTS.SUBSCRIPTION.RAZORPAY.VERIFY, payload);
    return response.data;
  },

  /**
   * 6️⃣ CURRENT SUBSCRIPTION
   */
  getCurrentSubscription: async (): Promise<CurrentSubscription> => {
    const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTION.CURRENT);
    return response.data;
  },

  /**
   * 7️⃣ INVOICE LIST
   */
  getInvoices: async (): Promise<{ success: boolean; data: Invoice[] }> => {
    const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTION.INVOICES.LIST);
    return response.data;
  },

  /**
   * 8️⃣ DOWNLOAD INVOICE (BLOB)
   */
  downloadInvoice: async (invoiceId: number | string): Promise<Blob> => {
    const response = await apiClient.get(
      API_ENDPOINTS.SUBSCRIPTION.INVOICES.DOWNLOAD(invoiceId),
      { responseType: 'blob' }
    );
    return response.data;
  },

  /**
   * 9️⃣ GET INVOICE DOWNLOAD URL (from backend route)
   */
  getInvoiceDownloadUrl: async (invoiceId: number | string): Promise<{ success: boolean; download_url: string }> => {
    const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTION.INVOICES.DOWNLOAD(invoiceId));
    return response.data;
  }
};

export default subscriptionService;