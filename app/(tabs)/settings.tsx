import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Buffer } from 'buffer';

import customerProfileServices from '@/services/api/methods/profileService';
import kycService from '@/services/api/methods/kycService';

(global as any).Buffer = (global as any).Buffer || Buffer;

// --- Types ---
interface MenuItem {
  id: number;
  icon: any;
  text: string;
  type: 'ionic' | 'material' | 'fontAwesome';
  color?: string;
  route?: string;
}

interface KycApiResponse {
  success?: boolean;
  kyc_status?: string;
  status?: string;
  document_id?: string;
  has_signature?: boolean;
  has_selfie?: boolean;
  completed_at?: string;
  kyc_data?: any;
  message?: string;
  error?: string;
  details?: string;
}

interface KycMediaState {
  signature?: string | null;
  selfie?: string | null;
}

const { width } = Dimensions.get('window');
const KYC_REFRESH_INTERVAL_MS = 8000;

const SettingsPage = () => {
  const router = useRouter();
  const mountedRef = useRef(true);
  const hasLoadedOnceRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [userData, setUserData] = useState<any>(null);
  const [kycResponse, setKycResponse] = useState<KycApiResponse | null>(null);
  const [kycMedia, setKycMedia] = useState<KycMediaState>({
    signature: null,
    selfie: null,
  });

  const getLast4Chars = (
    str: string | null | undefined,
    type: 'pan' | 'aadhar'
  ) => {
    if (!str || typeof str !== 'string' || str.length < 4) {
      return type === 'pan' ? '----------' : '---- ---- ----';
    }

    const last4 = str.slice(-4);

    if (type === 'pan') {
      return `******${last4}`;
    }
    return `**** **** ${last4}`;
  };

  const getKycData = (user: any) => {
    const kycActions = user?.kyc?.raw_response?.actions;
    if (Array.isArray(kycActions)) {
      const digilockerData = kycActions.find((a: any) => a.type === 'digilocker');
      return digilockerData?.details || {};
    }
    return {};
  };

  const getFormattedDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const isApprovedStatus = (status?: string | null) => {
    if (!status) return false;
    const s = status.toLowerCase();
    return (
      s === 'approved' ||
      s === 'verified' ||
      s === 'completed' ||
      s === 'success'
    );
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer | SharedArrayBuffer) => {
    const bytes = new Uint8Array(buffer as ArrayBufferLike);
    let binary = '';
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }

    return Buffer.from(binary, 'binary').toString('base64');
  };

  const blobToDataUri = (blob: Blob): Promise<string | null> => {
    return new Promise((resolve) => {
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result;
          resolve(typeof result === 'string' ? result : null);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      } catch {
        resolve(null);
      }
    });
  };

  const normalizeMediaResponse = async (data: any): Promise<string | null> => {
    if (!data) return null;

    if (typeof data === 'string') {
      if (data.startsWith('data:')) return data;
      if (data.startsWith('http')) return data;
      return `data:image/jpeg;base64,${data}`;
    }

    if (data instanceof Blob) {
      return await blobToDataUri(data);
    }

    if (data instanceof ArrayBuffer) {
      return `data:image/jpeg;base64,${arrayBufferToBase64(data)}`;
    }

    if (ArrayBuffer.isView(data)) {
      const view = data as ArrayBufferView;
      const buffer = view.buffer.slice(
        view.byteOffset,
        view.byteOffset + view.byteLength
      );
      return `data:image/jpeg;base64,${arrayBufferToBase64(buffer)}`;
    }

    if (data?.file_in_base64) {
      return `data:image/jpeg;base64,${data.file_in_base64}`;
    }

    if (data?.base64) {
      return `data:image/jpeg;base64,${data.base64}`;
    }

    if (data?.data) {
      if (typeof data.data === 'string') {
        if (data.data.startsWith('data:')) return data.data;
        return `data:image/jpeg;base64,${data.data}`;
      }

      if (data.data instanceof Blob) {
        return await blobToDataUri(data.data);
      }

      if (data.data instanceof ArrayBuffer) {
        return `data:image/jpeg;base64,${arrayBufferToBase64(data.data)}`;
      }

      if (ArrayBuffer.isView(data.data)) {
        const view = data.data as ArrayBufferView;
        const buffer = view.buffer.slice(
          view.byteOffset,
          view.byteOffset + view.byteLength
        );
        return `data:image/jpeg;base64,${arrayBufferToBase64(buffer)}`;
      }
    }

    return null;
  };

  const fetchProfile = useCallback(async () => {
    const response: any = await customerProfileServices.getAllProfiles();
    if (!mountedRef.current) return;

    const user = response?.user ?? response?.data?.user ?? response ?? {};
    setUserData(user);
  }, []);

  const fetchKycMedia = useCallback(async (documentId: string) => {
    const nextMedia: KycMediaState = {
      signature: null,
      selfie: null,
    };

    const jobs = [
      kycService
        .getKycMedia(documentId, 'signature')
        .then(normalizeMediaResponse)
        .then((uri) => {
          nextMedia.signature = uri;
        })
        .catch((err) => {
          console.warn('Signature media fetch error:', err);
        }),

      kycService
        .getKycMedia(documentId, 'selfie')
        .then(normalizeMediaResponse)
        .then((uri) => {
          nextMedia.selfie = uri;
        })
        .catch((err) => {
          console.warn('Selfie media fetch error:', err);
        }),
    ];

    await Promise.allSettled(jobs);

    if (!mountedRef.current) return;

    setKycMedia({
      signature: nextMedia.signature,
      selfie: nextMedia.selfie,
    });
  }, []);

  const fetchKycStatus = useCallback(async () => {
    try {
      const response: KycApiResponse = await kycService.getKycStatus();
      if (!mountedRef.current) return;

      setKycResponse(response);

      const status = (
        response?.kyc_status ||
        response?.status ||
        'pending'
      ).toLowerCase();

      if (isApprovedStatus(status) && response?.document_id) {
        await fetchKycMedia(response.document_id);
      } else {
        setKycMedia({
          signature: null,
          selfie: null,
        });
      }
    } catch (err) {
      console.warn('KYC status fetch error:', err);
    }
  }, [fetchKycMedia]);

  const loadData = useCallback(
    async (showRefreshing = false) => {
      if (!mountedRef.current) return;

      if (!hasLoadedOnceRef.current) {
        setLoading(true);
      } else if (showRefreshing) {
        setRefreshing(true);
      }

      try {
        await Promise.allSettled([fetchProfile(), fetchKycStatus()]);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setRefreshing(false);
          hasLoadedOnceRef.current = true;
        }
      }
    },
    [fetchProfile, fetchKycStatus]
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const run = async () => {
        if (!active) return;
        await loadData(false);
      };

      run();

      const interval = setInterval(() => {
        if (!active) return;

        const currentStatus = (
          kycResponse?.kyc_status ||
          kycResponse?.status ||
          'pending'
        ).toLowerCase();

        const shouldRefresh =
          ['pending', 'initiated', 'processing', 'in_review', 'none'].includes(
            currentStatus
          ) ||
          (isApprovedStatus(currentStatus) &&
            (!kycMedia.signature || !kycMedia.selfie));

        if (shouldRefresh) {
          fetchKycStatus();
        }
      }, KYC_REFRESH_INTERVAL_MS);

      return () => {
        active = false;
        clearInterval(interval);
      };
    }, [
      loadData,
      fetchKycStatus,
      kycResponse?.kyc_status,
      kycResponse?.status,
      kycMedia.signature,
      kycMedia.selfie,
    ])
  );

  const onRefresh = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  const bsmrId = userData?.bsmr_id || '-';
  const userName = userData?.name || 'User';
  const userEmail = userData?.email || '-';
  const userPhone = userData?.phone || '-';
  const isEmailVerified = !!userData?.email_verified_at;

  const kycDetails = getKycData(userData);

  let profileImageSource: { uri: string } = {
    uri: 'https://randomuser.me/api/portraits/men/32.jpg',
  };

  if (userData?.profile_image_url) {
    profileImageSource = { uri: userData.profile_image_url };
  } else if (kycDetails?.aadhaar?.profile_image_url) {
    const base64String = kycDetails.aadhaar.image;
    profileImageSource = { uri: `data:image/jpeg;base64,${base64String}` };
  }

  const panNumberRaw = userData?.pan_card || kycDetails?.pan?.id_number;
  const aadharNumberRaw = userData?.adhar_card || kycDetails?.aadhaar?.id_number;

  const panMasked = getLast4Chars(panNumberRaw, 'pan');
  const aadharMasked = getLast4Chars(aadharNumberRaw, 'aadhar');

  const subscription = userData?.subscription;
  const hasActivePlan = subscription?.status === 'active';
  const planName =
    userData?.plan?.name || (hasActivePlan ? 'Standard Plan' : 'No Active Plan');
  const validityStart = getFormattedDate(subscription?.start_date);
  const validityEnd = getFormattedDate(subscription?.end_date);

  const kycStatus = (
    kycResponse?.kyc_status ||
    kycResponse?.status ||
    userData?.kyc?.status ||
    'pending'
  ).toLowerCase();

  const isKycVerified = kycStatus === 'verified' || kycStatus === 'approved';

  const menuItems: MenuItem[] = [
    {
      id: 1,
      icon: 'card-outline',
      text: 'Payment & Invoices',
      type: 'ionic',
      route: '/pages/settingsInnerPages/paymentAndInvoices',
    },
    {
      id: 2,
      icon: 'file-text-o',
      text: 'KYC & Agreement',
      type: 'fontAwesome',
      route: '/pages/kyc/agreementList',
    },
    {
      id: 3,
      icon: 'help-circle-outline',
      text: 'Support',
      type: 'ionic',
      route: '/pages/support/SupportPage',
    },
    {
      id: 4,
      icon: 'delete-outline',
      text: 'Delete Account',
      type: 'material',
      color: '#FF3B30',
    },
  ];

  const renderIcon = (item: MenuItem) => {
    const iconColor = item.color || '#000';
    switch (item.type) {
      case 'ionic':
        return <Ionicons name={item.icon} size={22} color={iconColor} />;
      case 'material':
        return <MaterialIcons name={item.icon} size={24} color={iconColor} />;
      case 'fontAwesome':
        return <FontAwesome name={item.icon} size={20} color={iconColor} />;
      default:
        return null;
    }
  };

  const getKycStatusStyle = () => {
    switch (kycStatus) {
      case 'approved':
      case 'verified':
      case 'completed':
      case 'success':
        return styles.kycStatusGreen;
      case 'pending':
      case 'initiated':
      case 'processing':
      case 'in_review':
        return styles.kycStatusOrange;
      case 'rejected':
      case 'failed':
      case 'declined':
        return styles.kycStatusRed;
      default:
        return styles.kycStatusRed;
    }
  };

  const getKycStatusLabel = () => {
    if (!kycStatus) return 'Pending';
    return kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#005BC1" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#005BC1"
            colors={['#005BC1']}
            title="Pull to refresh"
            titleColor="#6B7280"
          />
        }
      >
        <Text style={styles.headerTitle}>Settings</Text>

        {/* --- Profile Section --- */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeaderRow}>
            <View style={styles.avatarWrapper}>
              <Image
                source={profileImageSource}
                style={styles.avatar}
                resizeMode="cover"
              />
              <Text style={styles.userName} numberOfLines={1}>
                {userName}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => router.push('/pages/profile/profileDetails')}
            >
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <View style={styles.infoCol}>
                <Text style={styles.label}>BSMR ID</Text>
                <Text style={styles.value}>{bsmrId}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.emailRow}>
                  <Text
                    style={[styles.value, styles.emailText]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {userEmail}
                  </Text>
                  <View
                    style={[
                      styles.verifiedBadge,
                      { backgroundColor: isEmailVerified ? '#DCFCE7' : '#FEE2E2' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.verifiedText,
                        { color: isEmailVerified ? '#16A34A' : '#EF4444' },
                      ]}
                    >
                      {isEmailVerified ? 'Verified' : 'Unverified'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoCol}>
                <Text style={styles.label}>Phone Number</Text>
                <Text style={styles.value}>{userPhone}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.label}>Pan Number</Text>
                <Text style={styles.value}>{panMasked}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.label}>Aadhar Number</Text>
                <Text style={styles.value}>{aadharMasked}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* --- KYC / Plan Section --- */}
        <View style={styles.planSection}>
          <View style={styles.planDetailRow}>
            <Text style={styles.planLabel}>KYC Status</Text>
            <Text style={getKycStatusStyle()}>{getKycStatusLabel()}</Text>
          </View>

          <View style={styles.planDetailRow}>
            <Text style={styles.planLabel}>Plan</Text>
            <Text style={styles.planValue}>{planName}</Text>
          </View>

          <View style={styles.planDetailRow}>
            <Text style={styles.planLabel}>Start Date</Text>
            <Text style={styles.planValue}>{validityStart}</Text>
          </View>

          <View style={styles.planDetailRow}>
            <Text style={styles.planLabel}>End Date</Text>
            <Text style={styles.planValue}>{validityEnd}</Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionBtnBlue}
              onPress={() => router.push('/pages/settingsInnerPages/pricingPlans')}
            >
              <Text style={styles.actionBtnText}>Upgrade Plan</Text>
            </TouchableOpacity>

            <View style={{ width: 12 }} />

            {!isKycVerified && (
              <TouchableOpacity
                style={styles.actionBtnBlue}
                onPress={() => router.push('/pages/kyc/kycAgreement')}
              >
                <Text style={styles.actionBtnText}>Complete KYC</Text>
              </TouchableOpacity>
            )}

            {isKycVerified && (
              <TouchableOpacity
                style={[styles.actionBtnBlue, { backgroundColor: '#E5E7EB' }]}
                disabled
              >
                <Text style={[styles.actionBtnText, { color: '#9CA3AF' }]}>
                  KYC Completed
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* --- KYC Media Section --- */}
        {/* {isApprovedStatus(kycStatus) && (
          <View style={styles.mediaSection}>
            <Text style={styles.sectionTitle}>KYC Media</Text>

            <View style={styles.mediaGrid}>
              <View style={styles.mediaCard}>
                <Text style={styles.mediaLabel}>Signature</Text>
                {kycMedia.signature ? (
                  <Image
                    source={{ uri: kycMedia.signature }}
                    style={styles.mediaImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.mediaEmptyText}>
                    Signature will appear after the server sync completes.
                  </Text>
                )}
              </View>

              <View style={styles.mediaCard}>
                <Text style={styles.mediaLabel}>Selfie</Text>
                {kycMedia.selfie ? (
                  <Image
                    source={{ uri: kycMedia.selfie }}
                    style={styles.mediaImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.mediaEmptyText}>
                    Selfie will appear after the server sync completes.
                  </Text>
                )}
              </View>
            </View>
          </View>
        )} */}

        {/* --- Menu Section --- */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => {
                if (item.route) {
                  router.push(item.route as any);
                } else {
                  console.log(`Clicked ${item.text}`);
                }
              }}
            >
              <View style={styles.menuIconContainer}>
                {renderIcon(item)}
              </View>
              <Text style={[styles.menuText, item.color ? { color: item.color } : {}]}>
                {item.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

/* ================== STYLES ================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingBottom: 20,
    paddingTop: 10,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
  },

  profileSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eee',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  userName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
    maxWidth: width * 0.4,
  },
  editBtn: {
    backgroundColor: '#005BC1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  editBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },

  infoGrid: {
    marginTop: 0,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoCol: {
    flex: 1,
    paddingRight: 10,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  value: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
  },

  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  emailText: {
    marginRight: 6,
    maxWidth: '65%',
  },
  verifiedBadge: {
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
  },

  planSection: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  planDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  planLabel: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },
  planValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  kycStatusRed: {
    fontSize: 15,
    color: '#EF4444',
    fontWeight: '600',
  },
  kycStatusGreen: {
    fontSize: 15,
    color: '#16A34A',
    fontWeight: '600',
  },
  kycStatusOrange: {
    fontSize: 15,
    color: '#F59E0B',
    fontWeight: '600',
  },

  actionsRow: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
  },
  actionBtnBlue: {
    flex: 1,
    backgroundColor: '#005BC1',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  mediaSection: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  mediaGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#FAFAFA',
    minHeight: 180,
  },
  mediaLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
  },
  mediaImage: {
    width: '100%',
    height: 130,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  mediaEmptyText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 20,
    lineHeight: 18,
  },

  menuSection: {
    marginTop: 5,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuIconContainer: {
    width: 30,
    alignItems: 'flex-start',
    marginRight: 8,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
});

export default SettingsPage;