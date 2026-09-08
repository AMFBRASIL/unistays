const getDefaultApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalHost =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host.endsWith('.local');

    // Em produção no mesmo domínio, usar proxy reverso do Nginx em /api/v1
    if (!isLocalHost) {
      return '/api/v1';
    }
  }

  return 'http://localhost:3020/api/v1';
};

const normalizeApiBaseUrl = (rawUrl?: string): string => {
  let baseUrl = (rawUrl || getDefaultApiBaseUrl()).trim();

  // Suporta URL relativa (ex: /api/v1) para produção atrás do Nginx
  if (baseUrl.startsWith('/')) {
    baseUrl = baseUrl.replace(/\/+$/, '');
    if (!/\/api\/v\d+$/i.test(baseUrl)) {
      if (baseUrl.endsWith('/api')) {
        baseUrl = `${baseUrl}/v1`;
      } else if (!/\/api(\/|$)/i.test(baseUrl)) {
        baseUrl = `${baseUrl}/api/v1`;
      }
    }
    return baseUrl;
  }

  if (!/^https?:\/\//i.test(baseUrl)) {
    baseUrl = `https://${baseUrl}`;
  }

  baseUrl = baseUrl.replace(/\/+$/, '');

  // Garantir que a base sempre termine em /api/v1
  if (!/\/api\/v\d+$/i.test(baseUrl)) {
    if (baseUrl.endsWith('/api')) {
      baseUrl = `${baseUrl}/v1`;
    } else if (!/\/api(\/|$)/i.test(baseUrl)) {
      baseUrl = `${baseUrl}/api/v1`;
    }
  }

  return baseUrl;
};

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
  };
}

export interface LoginResponse {
  user: {
    id: number;
    uuid: string;
    email: string;
    name: string;
    role: string;
    avatar?: string | null;
  };
  token: string;
  refreshToken: string;
}

export type RegisterResponse = LoginResponse;

/** User/profile shape returned by profile and user endpoints */
export interface UserProfile {
  id?: number;
  uuid?: string;
  email?: string;
  name?: string;
  phone?: string | null;
  avatar?: string | null;
  role?: string;
  status?: string;
  groupId?: number;
  propertyIds?: number[];
}

/** Item do histórico de pontos de fidelidade do hóspede */
export interface GuestLoyaltyHistoryItem {
  id: number;
  uuid: string;
  guestId: number;
  operation: 'credit' | 'debit';
  points: number;
  balanceAfter: number;
  source: string;
  description: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdBy: number | null;
  createdAt: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private getGuestToken(): string | null {
    return localStorage.getItem('guestToken');
  }

  /**
   * @param guestPublicNoStaffToken — rotas públicas do portal do hóspede: não envia Bearer do usuário staff
   * (evita confusão com middleware e proxies; login/senha do hóspede não devem usar token do PMS).
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isJson: boolean = true,
    useGuestToken: boolean = false,
    guestPublicNoStaffToken: boolean = false
  ): Promise<ApiResponse<T>> {
    let token: string | null = null;
    if (useGuestToken) {
      token = this.getGuestToken();
    } else if (!guestPublicNoStaffToken) {
      token = this.getToken();
    }
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {
      ...options.headers,
    };

    // Só adiciona Content-Type JSON se não for FormData
    if (isJson && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // Only warn if we expected a token (auth endpoints don't need it)
      if (
        !endpoint.includes('/auth/login') &&
        !endpoint.includes('/auth/register') &&
        !endpoint.includes('/guests/login') &&
        !endpoint.includes('/guests/public/')
      ) {
        // console.warn('API Client: No token found for endpoint:', endpoint);
      }
    }

    console.log(`API Client: Requesting ${options.method || 'GET'} ${url}`);

    const requestToUrl = async (targetUrl: string): Promise<ApiResponse<T>> => {
      const response = await fetch(targetUrl, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Client: Error response:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
          url: targetUrl
        });
        const errMsg =
          data.error?.message ||
          (typeof data.error === 'string' ? data.error : undefined) ||
          data.message ||
          'Erro na requisição';
        return {
          success: false,
          error: {
            message: errMsg,
          },
        };
      }

      if (data.success && data.data) {
        return {
          success: true,
          data: data.data,
        };
      }

      return {
        success: true,
        data: data,
      };
    };

    try {
      return await requestToUrl(url);
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro de conexão',
        },
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async validateDiscountPassword(password: string): Promise<ApiResponse<{ valid: boolean }>> {
    return this.request<{ valid: boolean }>('/auth/validate-discount-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }): Promise<ApiResponse<RegisterResponse>> {
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  // User endpoints
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>('/users/profile', {
      method: 'GET',
    });
  }

  async updateProfile(data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUsers(): Promise<ApiResponse<{ users: UserProfile[] }>> {
    return this.request<{ users: UserProfile[] }>('/users', {
      method: 'GET',
    });
  }

  async createUser(data: {
    email: string;
    password: string;
    name: string;
    phone?: string | null;
    avatar?: string | null;
    status?: string;
    groupId?: number;
    propertyIds?: number[];
  }): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserById(id: number): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>(`/users/${id}`, {
      method: 'GET',
    });
  }

  async updateUser(id: number, data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async resetUserPassword(id: number, password: string): Promise<ApiResponse<void>> {
    return this.request(`/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async sendUserEmail(id: number, data: { subject: string, body: string }): Promise<ApiResponse<void>> {
    return this.request(`/users/${id}/send-email`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // User Groups endpoints
  async getUserGroups(): Promise<ApiResponse<{ groups: unknown[] }>> {
    return this.request('/user-groups', {
      method: 'GET',
    });
  }

  async getUserGroupById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/user-groups/${id}`, {
      method: 'GET',
    });
  }

  async createUserGroup(data: { name: string; description?: string; permissions?: unknown }): Promise<ApiResponse<unknown>> {
    return this.request('/user-groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUserGroup(id: number, data: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/user-groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateUserGroupPermissions(id: number, permissions: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/user-groups/${id}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissions }),
    });
  }

  async deleteUserGroup(id: number): Promise<ApiResponse<void>> {
    return this.request(`/user-groups/${id}`, {
      method: 'DELETE',
    });
  }

  async addUserToGroup(id: number, userId: number): Promise<ApiResponse<unknown>> {
    return this.request(`/user-groups/${id}/users`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async removeUserFromGroup(id: number, userId: number): Promise<ApiResponse<unknown>> {
    return this.request(`/user-groups/${id}/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Properties endpoints
  async getProperties(): Promise<ApiResponse<{ properties: unknown[] }>> {
    return this.request('/properties', {
      method: 'GET',
    });
  }

  async getPropertyById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/properties/${id}`, {
      method: 'GET',
    });
  }

  async createProperty(data: unknown): Promise<ApiResponse<unknown>> {
    return this.request('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProperty(id: number, data: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProperty(id: number): Promise<ApiResponse<void>> {
    return this.request(`/properties/${id}`, {
      method: 'DELETE',
    });
  }

  // Room Types endpoints
  async getRoomTypes(propertyId?: number): Promise<ApiResponse<{ roomTypes: unknown[] }>> {
    const query = propertyId ? `?propertyId=${propertyId}` : '';
    return this.request(`/room-types${query}`, {
      method: 'GET',
    });
  }

  async getRoomTypeById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/room-types/${id}`, {
      method: 'GET',
    });
  }

  async createRoomType(data: {
    propertyId: number;
    code: string;
    name: string;
    description?: string | null;
    propertyType: string;
    maxGuests: number;
    maxAdults: number;
    maxChildren: number;
    basePrice?: number | null;
    adultPrice?: number;
    childPrice?: number;
    infantPrice?: number;
    pricingStyle?: 'per_unit' | 'per_person';
    sizeM2?: number | null;
    images?: string[] | null;
    amenityIds?: number[];
    status?: string;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/room-types', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRoomType(id: number, data: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/room-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRoomType(id: number): Promise<ApiResponse<void>> {
    return this.request(`/room-types/${id}`, {
      method: 'DELETE',
    });
  }

  // Units (Rooms) endpoints
  async getUnits(propertyId?: number, status?: string, roomTypeId?: number): Promise<ApiResponse<{ units: unknown[] }>> {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId.toString());
    if (status) params.append('status', status);
    if (roomTypeId != null) params.append('roomTypeId', roomTypeId.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/units${query}`, {
      method: 'GET',
    });
  }

  async getUnitById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/units/${id}`, {
      method: 'GET',
    });
  }

  async getUnitSummary(id: number): Promise<ApiResponse<{
    unit: {
      id: number;
      number: string;
      name?: string | null;
      type: string;
      floor: number;
      capacity: number;
      maxCapacity: number;
      beds?: string | null;
      sizeM2?: number | null;
      status: string;
      view?: string | null;
      rates?: { daily?: number; weekly?: number; monthly?: number } | null;
      propertyId: number;
      propertyName: string;
      propertyType: string;
    };
    current: {
      id: number;
      reservationNumber: string;
      status: string;
      checkIn: string;
      checkOut: string;
      stayType: string;
      adults: number;
      children: number;
      guests: number;
      guestName: string;
      guestPhone?: string | null;
      guestEmail?: string | null;
      totalAmount: number;
      paidAmount: number;
      paymentStatus: string;
      channel?: string | null;
    } | null;
    scheduled: {
      count: number;
      totalGuests: number;
      totalRevenue: number;
      alreadyPaid: number;
      pendingToReceive: number;
      periodMonths: number;
      byMonth: Array<{
        month: string;
        label: string;
        count: number;
        revenue: number;
        pending: number;
      }>;
      reservations: Array<{
        id: number;
        reservationNumber: string;
        status: string;
        checkIn: string;
        checkOut: string;
        stayType: string;
        guests: number;
        guestName: string;
        totalAmount: number;
        paidAmount: number;
        pendingAmount: number;
        channel?: string | null;
      }>;
    };
    financial30d: {
      revenue: number;
      collected: number;
      pending: number;
      reservationsCount: number;
      avgDailyRate: number;
      occupiedNights: number;
      occupancyRate: number;
    };
    insights: {
      topChannel?: string | null;
      topChannelRevenue: number;
      activeTask?: {
        id: number;
        category: string;
        status: string;
        priority?: string;
        scheduledDate?: string;
      } | null;
      nextCheckIn?: string | null;
    };
    recentReservations: Array<{
      id: number;
      reservationNumber: string;
      status: string;
      checkIn: string;
      checkOut: string;
      guestName: string;
      totalAmount: number;
      paidAmount: number;
      channel?: string | null;
      stayType: string;
    }>;
  }>> {
    return this.request(`/units/${id}/summary`, {
      method: 'GET',
    });
  }

  async createUnit(data: {
    propertyId: number;
    number: string;
    name?: string | null;
    roomTypeId?: number | null;
    type: string;
    floor: number;
    capacity: number;
    maxCapacity: number;
    beds?: string | null;
    sizeM2?: number | null;
    amenities?: string[] | null;
    images?: string[] | null;
    status?: string;
    rates?: {
      daily?: number;
      weekly?: number;
      monthly?: number;
    } | null;
    notes?: string | null;
    view?: string | null;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/units', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUnit(id: number, data: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/units/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUnit(id: number): Promise<ApiResponse<void>> {
    return this.request(`/units/${id}`, {
      method: 'DELETE',
    });
  }

  // Supplier Categories endpoints
  async getSupplierCategories(status?: string): Promise<ApiResponse<{ categories: unknown[] }>> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    return this.request(`/supplier-categories?${params.toString()}`);
  }

  async getSupplierCategoryById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/supplier-categories/${id}`);
  }

  async createSupplierCategory(data: {
    code: string;
    name: string;
    icon?: string | null;
    colorFrom?: string | null;
    colorTo?: string | null;
    description?: string | null;
    sortOrder?: number;
    status?: string;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/supplier-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSupplierCategory(id: number, data: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/supplier-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSupplierCategory(id: number): Promise<ApiResponse<void>> {
    return this.request(`/supplier-categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Suppliers endpoints
  async getSuppliers(search?: string, categoryId?: number, status?: string, propertyId?: number): Promise<ApiResponse<{ suppliers: unknown[] }>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (status) params.append('status', status);
    if (propertyId) params.append('propertyId', propertyId.toString());
    return this.request(`/suppliers?${params.toString()}`);
  }

  async getSupplierById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/suppliers/${id}`);
  }

  async getSupplierProducts(id: number, propertyId?: number): Promise<ApiResponse<{ products: unknown[] }>> {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', String(propertyId));
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/suppliers/${id}/products${query}`);
  }

  async createSupplier(data: {
    propertyId?: number | null;
    code?: string;
    categoryId: number;
    name: string;
    tradeName?: string | null;
    cnpj?: string | null;
    stateRegistration?: string | null;
    email?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    website?: string | null;
    contactName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    zipCode?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    paymentTerms?: number | null;
    deliveryDays?: number | null;
    minOrderValue?: number | null;
    notes?: string | null;
    status?: string;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSupplier(id: number, data: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSupplier(id: number): Promise<ApiResponse<void>> {
    return this.request(`/suppliers/${id}`, {
      method: 'DELETE',
    });
  }

  // Rate Plans endpoints
  async getRatePlans(search?: string, propertyId?: number, type?: string, status?: string): Promise<ApiResponse<{ ratePlans: unknown[] }>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (propertyId) params.append('propertyId', propertyId.toString());
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    return this.request(`/rate-plans?${params.toString()}`);
  }

  async getRatePlanById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/rate-plans/${id}`);
  }

  async createRatePlan(data: {
    propertyId: number;
    name: string;
    code?: string;
    description?: string | null;
    type: string;
    currency?: string;
    baseRate?: number;
    discountPercentage?: number | null;
    minStay?: number | null;
    maxStay?: number | null;
    advanceBookingDays?: number | null;
    validFrom?: string | null;
    validTo?: string | null;
    propertyTypes?: string[] | null;
    stayTypes?: string[] | null;
    inclusions?: string[] | null;
    cancellationPolicy?: Record<string, unknown> | null;
    restrictions?: Record<string, unknown> | null;
    status?: string;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/rate-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRatePlan(id: number, data: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/rate-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRatePlan(id: number): Promise<ApiResponse<void>> {
    return this.request(`/rate-plans/${id}`, {
      method: 'DELETE',
    });
  }

  // Promotions endpoints
  async getPromotions(search?: string, propertyId?: number, type?: string, status?: string): Promise<ApiResponse<{ promotions: unknown[] }>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (propertyId) params.append('propertyId', propertyId.toString());
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    return this.request(`/promotions?${params.toString()}`);
  }

  async getPromotionById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/promotions/${id}`);
  }

  async createPromotion(data: {
    propertyId: number;
    code?: string;
    name: string;
    description?: string | null;
    type: string;
    discountValue?: number | null;
    discountPercentage?: number | null;
    minValue?: number | null;
    maxDiscount?: number | null;
    minStay?: number | null;
    maxStay?: number | null;
    validFrom?: string | null;
    validTo?: string | null;
    propertyTypes?: string[] | null;
    selectedDays?: string[] | null;
    applicableRatePlans?: number[] | null;
    applicableRoomTypes?: number[] | null;
    bookingWindowStart?: number | null;
    bookingWindowEnd?: number | null;
    usageLimit?: number | null;
    usesPerGuest?: number | null;
    showOnWebsite?: boolean;
    requireCoupon?: boolean;
    status?: string;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/promotions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePromotion(id: number, data: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/promotions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePromotion(id: number): Promise<ApiResponse<void>> {
    return this.request(`/promotions/${id}`, {
      method: 'DELETE',
    });
  }

  // Seasons endpoints
  async getSeasons(search?: string, propertyId?: number, type?: string, status?: string): Promise<ApiResponse<{ seasons: unknown[] }>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (propertyId) params.append('propertyId', propertyId.toString());
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    return this.request(`/seasons?${params.toString()}`);
  }

  async getSeasonById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/seasons/${id}`);
  }

  async createSeason(data: {
    propertyId: number;
    code: string;
    name: string;
    type: 'high' | 'medium' | 'low' | 'special' | 'holiday';
    startDate: string;
    endDate: string;
    priceMultiplier?: number;
    isRecurring?: boolean;
    recurrencePattern?: Record<string, unknown> | null;
    description?: string | null;
    status?: 'active' | 'inactive';
  }): Promise<ApiResponse<unknown>> {
    return this.request('/seasons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSeason(id: number, data: {
    propertyId?: number;
    code?: string;
    name?: string;
    type?: 'high' | 'medium' | 'low' | 'special' | 'holiday';
    startDate?: string;
    endDate?: string;
    priceMultiplier?: number;
    isRecurring?: boolean;
    recurrencePattern?: Record<string, unknown> | null;
    description?: string | null;
    status?: 'active' | 'inactive';
  }): Promise<ApiResponse<unknown>> {
    return this.request(`/seasons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSeason(id: number): Promise<ApiResponse<void>> {
    return this.request(`/seasons/${id}`, {
      method: 'DELETE',
    });
  }

  // Policies endpoints
  async getPolicies(
    search?: string,
    propertyId?: number,
    policyType?: string,
    status?: string
  ): Promise<ApiResponse<{ policies: unknown[] }>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (propertyId) params.append('propertyId', propertyId.toString());
    if (policyType) params.append('policyType', policyType);
    if (status) params.append('status', status);
    return this.request(`/policies?${params.toString()}`);
  }

  async getPolicyById(id: number): Promise<ApiResponse<{ policy: unknown }>> {
    return this.request(`/policies/${id}`);
  }

  async createPolicy(data: {
    propertyId: number;
    code?: string;
    name: string;
    policyType: 'cancellation' | 'checkin' | 'payment' | 'guest' | 'occupancy' | 'pets' | 'other';
    cancellationPolicy?: 'free' | 'flexible' | 'moderate' | 'strict' | 'non_refundable' | null;
    cancellationDeadline?: number | null;
    refundPercentage?: number | null;
    checkInTime?: string | null;
    checkOutTime?: string | null;
    minAge?: number | null;
    maxOccupancy?: number | null;
    childrenPolicy?: 'free' | 'discount' | 'full_price' | 'not_allowed' | null;
    petsAllowed?: boolean;
    petFee?: number | null;
    depositRequired?: boolean;
    depositType?: 'percentage' | 'fixed' | 'nights' | null;
    depositAmount?: number | null;
    description?: string | null;
    status?: 'active' | 'inactive';
  }): Promise<ApiResponse<unknown>> {
    return this.request('/policies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePolicy(
    id: number,
    data: {
      propertyId?: number;
      code?: string;
      name?: string;
      policyType?: 'cancellation' | 'checkin' | 'payment' | 'guest' | 'occupancy' | 'pets' | 'other';
      cancellationPolicy?: 'free' | 'flexible' | 'moderate' | 'strict' | 'non_refundable' | null;
      cancellationDeadline?: number | null;
      refundPercentage?: number | null;
      checkInTime?: string | null;
      checkOutTime?: string | null;
      minAge?: number | null;
      maxOccupancy?: number | null;
      childrenPolicy?: 'free' | 'discount' | 'full_price' | 'not_allowed' | null;
      petsAllowed?: boolean;
      petFee?: number | null;
      depositRequired?: boolean;
      depositType?: 'percentage' | 'fixed' | 'nights' | null;
      depositAmount?: number | null;
      description?: string | null;
      status?: 'active' | 'inactive';
    }
  ): Promise<ApiResponse<unknown>> {
    return this.request(`/policies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePolicy(id: number): Promise<ApiResponse<void>> {
    return this.request(`/policies/${id}`, {
      method: 'DELETE',
    });
  }

  // Extras endpoints
  async getExtras(search?: string, propertyId?: number, category?: string, status?: string): Promise<ApiResponse<{ extras: unknown[] }>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (propertyId) params.append('propertyId', propertyId.toString());
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    return this.request(`/extras?${params.toString()}`);
  }

  async getExtraById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/extras/${id}`);
  }

  async createExtra(data: {
    propertyId: number;
    code: string;
    name: string;
    category: 'amenities' | 'services' | 'experiences' | 'transport';
    description?: string | null;
    pricingType: 'fixed' | 'per_day' | 'per_person' | 'percentage';
    price?: number | null;
    percentage?: number | null;
    isTaxable?: boolean;
    requiresConfirmation?: boolean;
    status?: 'active' | 'inactive';
  }): Promise<ApiResponse<unknown>> {
    return this.request('/extras', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExtra(id: number, data: {
    propertyId?: number;
    code?: string;
    name?: string;
    category?: 'amenities' | 'services' | 'experiences' | 'transport';
    description?: string | null;
    pricingType?: 'fixed' | 'per_day' | 'per_person' | 'percentage';
    price?: number | null;
    percentage?: number | null;
    isTaxable?: boolean;
    requiresConfirmation?: boolean;
    status?: 'active' | 'inactive';
  }): Promise<ApiResponse<unknown>> {
    return this.request(`/extras/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteExtra(id: number): Promise<ApiResponse<void>> {
    return this.request(`/extras/${id}`, {
      method: 'DELETE',
    });
  }

  // Meals endpoints
  async getMeals(search?: string, propertyId?: number, mealType?: string, status?: string): Promise<ApiResponse<{ meals: unknown[] }>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (propertyId) params.append('propertyId', propertyId.toString());
    if (mealType) params.append('mealType', mealType);
    if (status) params.append('status', status);
    return this.request(`/meals?${params.toString()}`);
  }

  async getMealById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/meals/${id}`);
  }

  async createMeal(data: {
    propertyId: number;
    code: string;
    name: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'brunch';
    servingType: 'buffet' | 'a_la_carte' | 'room_service';
    description?: string | null;
    price: number;
    pricePerPerson?: boolean;
    startTime?: string | null;
    endTime?: string | null;
    status?: 'active' | 'inactive';
  }): Promise<ApiResponse<unknown>> {
    return this.request('/meals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMeal(id: number, data: {
    propertyId?: number;
    code?: string;
    name?: string;
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'brunch';
    servingType?: 'buffet' | 'a_la_carte' | 'room_service';
    description?: string | null;
    price?: number;
    pricePerPerson?: boolean;
    startTime?: string | null;
    endTime?: string | null;
    status?: 'active' | 'inactive';
  }): Promise<ApiResponse<unknown>> {
    return this.request(`/meals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMeal(id: number): Promise<ApiResponse<void>> {
    return this.request(`/meals/${id}`, {
      method: 'DELETE',
    });
  }

  // Parking endpoints
  async getParkings(search?: string, propertyId?: number, parkingType?: string, status?: string): Promise<ApiResponse<{ parkings: unknown[] }>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (propertyId) params.append('propertyId', propertyId.toString());
    if (parkingType) params.append('parkingType', parkingType);
    if (status) params.append('status', status);
    return this.request(`/parking?${params.toString()}`);
  }

  async getParkingById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/parking/${id}`);
  }

  async createParking(data: {
    propertyId: number;
    code: string;
    name: string;
    parkingType: 'covered' | 'uncovered' | 'valet' | 'garage';
    pricingType: 'per_day' | 'per_night' | 'fixed' | 'free';
    price?: number | null;
    capacity?: number | null;
    description?: string | null;
    isTaxable?: boolean;
    requiresReservation?: boolean;
    status?: 'active' | 'inactive';
  }): Promise<ApiResponse<unknown>> {
    return this.request('/parking', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateParking(id: number, data: {
    propertyId?: number;
    code?: string;
    name?: string;
    parkingType?: 'covered' | 'uncovered' | 'valet' | 'garage';
    pricingType?: 'per_day' | 'per_night' | 'fixed' | 'free';
    price?: number | null;
    capacity?: number | null;
    description?: string | null;
    isTaxable?: boolean;
    requiresReservation?: boolean;
    status?: 'active' | 'inactive';
  }): Promise<ApiResponse<unknown>> {
    return this.request(`/parking/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteParking(id: number): Promise<ApiResponse<void>> {
    return this.request(`/parking/${id}`, {
      method: 'DELETE',
    });
  }

  // Amenities endpoints
  async getAmenities(search?: string, category?: string, status?: string): Promise<ApiResponse<{ amenities: unknown[] }>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    return this.request(`/amenities?${params.toString()}`);
  }

  async getAmenityById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/amenities/${id}`);
  }

  async createAmenity(data: {
    code: string;
    name: string;
    category: 'comfort' | 'entertainment' | 'wellness' | 'convenience';
    icon?: string | null;
    description?: string | null;
    isChargeable?: boolean;
    price?: number | null;
    status?: 'active' | 'inactive';
  }): Promise<ApiResponse<unknown>> {
    return this.request('/amenities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAmenity(id: number, data: {
    code?: string;
    name?: string;
    category?: 'comfort' | 'entertainment' | 'wellness' | 'convenience';
    icon?: string | null;
    description?: string | null;
    isChargeable?: boolean;
    price?: number | null;
    status?: 'active' | 'inactive';
  }): Promise<ApiResponse<unknown>> {
    return this.request(`/amenities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAmenity(id: number): Promise<ApiResponse<void>> {
    return this.request(`/amenities/${id}`, {
      method: 'DELETE',
    });
  }

  // Units of Measure endpoints
  async getUnitsOfMeasure(search?: string, status?: string): Promise<ApiResponse<{ unitsOfMeasure: unknown[] }>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    return this.request(`/units-of-measure?${params.toString()}`);
  }

  async getUnitOfMeasureById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/units-of-measure/${id}`);
  }

  async createUnitOfMeasure(data: {
    code: string;
    name: string;
    abbreviation: string;
    description?: string | null;
    status?: 'active' | 'inactive';
  }): Promise<ApiResponse<unknown>> {
    return this.request('/units-of-measure', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUnitOfMeasure(id: number, data: {
    code?: string;
    name?: string;
    abbreviation?: string;
    description?: string | null;
    status?: 'active' | 'inactive';
  }): Promise<ApiResponse<unknown>> {
    return this.request(`/units-of-measure/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUnitOfMeasure(id: number): Promise<ApiResponse<void>> {
    return this.request(`/units-of-measure/${id}`, {
      method: 'DELETE',
    });
  }

  // Stock Config endpoints
  async getStockConfig(propertyId?: number): Promise<ApiResponse<unknown>> {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId.toString());
    return this.request(`/stock-config?${params.toString()}`);
  }

  // Product Groups endpoints
  async getProductGroups(search?: string, status?: string, parentGroupId?: number | null): Promise<ApiResponse<{ productGroups: unknown[] }>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (parentGroupId !== undefined) params.append('parentGroupId', parentGroupId === null ? 'null' : parentGroupId.toString());
    return this.request(`/product-groups?${params.toString()}`);
  }

  async getProductGroupById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/product-groups/${id}`);
  }

  async createProductGroup(data: {
    code: string;
    name: string;
    parentGroupId?: number | null;
    description?: string | null;
    status?: 'active' | 'inactive';
  }): Promise<ApiResponse<unknown>> {
    return this.request('/product-groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProductGroup(id: number, data: {
    code?: string;
    name?: string;
    parentGroupId?: number | null;
    description?: string | null;
    status?: 'active' | 'inactive';
  }): Promise<ApiResponse<unknown>> {
    return this.request(`/product-groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProductGroup(id: number): Promise<ApiResponse<void>> {
    return this.request(`/product-groups/${id}`, {
      method: 'DELETE',
    });
  }

  // Product Config endpoints
  async getProductConfig(propertyId?: number): Promise<ApiResponse<unknown>> {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId.toString());
    return this.request(`/product-config?${params.toString()}`);
  }

  // Product Categories endpoints
  async getProductCategories(search?: string, status?: string): Promise<ApiResponse<{ productCategories: unknown[] }>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    return this.request(`/product-categories?${params.toString()}`);
  }

  async getProductCategoryById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/product-categories/${id}`);
  }

  async createProductCategory(data: {
    code: string;
    name: string;
    description?: string | null;
    color?: string | null;
    icon?: string | null;
    parentId?: number | null;
    status?: 'active' | 'inactive';
  }): Promise<ApiResponse<unknown>> {
    return this.request('/product-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProductCategory(id: number, data: {
    code?: string;
    name?: string;
    description?: string | null;
    color?: string | null;
    icon?: string | null;
    parentId?: number | null;
    status?: 'active' | 'inactive';
  }): Promise<ApiResponse<unknown>> {
    return this.request(`/product-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProductCategory(id: number): Promise<ApiResponse<void>> {
    return this.request(`/product-categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Products endpoints
  async getProducts(search?: string, status?: string, categoryId?: number, productGroupId?: number, propertyId?: number): Promise<ApiResponse<{ products: unknown[] }>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (productGroupId) params.append('productGroupId', productGroupId.toString());
    if (propertyId) params.append('propertyId', propertyId.toString());
    return this.request(`/products?${params.toString()}`);
  }

  async getProductById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/products/${id}`);
  }

  async createProduct(data: {
    propertyId?: number | null;
    code: string;
    name: string;
    barcode?: string | null;
    categoryId?: number | null;
    category?: string | null;
    productGroupId?: number | null;
    unitId?: number | null;
    description?: string | null;
    costPrice?: number | null;
    salePrice?: number | null;
    stockQuantity?: number;
    minStock?: number;
    trackStock?: boolean;
    supplierId?: number | null;
    images?: string[] | null;
    status?: 'active' | 'inactive';
  }): Promise<ApiResponse<unknown>> {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: number, data: {
    propertyId?: number | null;
    code?: string;
    name?: string;
    barcode?: string | null;
    categoryId?: number | null;
    category?: string | null;
    productGroupId?: number | null;
    unitId?: number | null;
    description?: string | null;
    costPrice?: number | null;
    salePrice?: number | null;
    stockQuantity?: number;
    minStock?: number;
    trackStock?: boolean;
    supplierId?: number | null;
    images?: string[] | null;
    status?: 'active' | 'inactive';
  }): Promise<ApiResponse<unknown>> {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: number): Promise<ApiResponse<void>> {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Invoice Params endpoints
  async getInvoiceParams(propertyId?: number): Promise<ApiResponse<unknown>> {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId.toString());
    return this.request(`/invoice-params?${params.toString()}`);
  }

  async createOrUpdateInvoiceParams(data: {
    propertyId?: number | null;
    companyName?: string | null;
    cnpj?: string | null;
    stateRegistration?: string | null;
    municipalRegistration?: string | null;
    address?: string | null;
    number?: string | null;
    complement?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
    phone?: string | null;
    email?: string | null;
    certificatePath?: string | null;
    certificatePassword?: string | null;
    nfProvider?: 'sefaz' | 'nfcom';
    serie?: string;
    environment?: 'production' | 'homologation';
    autoEmit?: boolean;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/invoice-params', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Property Bank Accounts endpoints
  async getPropertyBankAccounts(propertyId?: number): Promise<ApiResponse<{ accounts: unknown[] }>> {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', String(propertyId));
    return this.request(`/property-bank-accounts?${params.toString()}`);
  }

  async createOrUpdatePropertyBankAccount(data: {
    id?: number;
    propertyId: number;
    bankName: string;
    accountHolder: string;
    holderDocument?: string | null;
    accountType: 'checking' | 'savings' | 'payment';
    branch?: string | null;
    accountNumber: string;
    accountDigit?: string | null;
    pixKeyType?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random' | null;
    pixKey?: string | null;
    isDefault?: boolean;
    isActive?: boolean;
    notes?: string | null;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/property-bank-accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deletePropertyBankAccount(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/property-bank-accounts/${id}`, {
      method: 'DELETE',
    });
  }

  async getFiscalParams(propertyId?: number): Promise<ApiResponse<unknown>> {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId.toString());
    return this.request(`/fiscal-params?${params.toString()}`);
  }

  async createOrUpdateFiscalParams(data: {
    propertyId?: number | null;
    taxRegime?: 'simples_nacional' | 'lucro_presumido' | 'lucro_real';
    icmsRate?: number | null;
    icmsIncluded?: boolean;
    ipiRate?: number | null;
    ipiIncluded?: boolean;
    pisRate?: number | null;
    pisIncluded?: boolean;
    cofinsRate?: number | null;
    cofinsIncluded?: boolean;
    issRate?: number | null;
    issIncluded?: boolean;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/fiscal-params', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // General Settings endpoints
  async getGeneralSettings(propertyId?: number): Promise<ApiResponse<unknown>> {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId.toString());
    return this.request(`/general-settings?${params.toString()}`);
  }

  async createOrUpdateGeneralSettings(data: {
    propertyId?: number | null;
    hotelName?: string | null;
    legalName?: string | null;
    cnpj?: string | null;
    address?: string | null;
    timezone?: string;
    currency?: string;
    language?: string;
    dateFormat?: string;
    timeFormat?: '12h' | '24h';
    fiscalYearStart?: string;
    fiscalYearEnd?: string;
    contactEmail?: string | null;
    contactPhone?: string | null;
    website?: string | null;
    instagram?: string | null;
    logoUrl?: string | null;
    businessHoursStart?: string | null;
    businessHoursEnd?: string | null;
    enableNotifications?: boolean;
    enableEmailNotifications?: boolean;
    enableSmsNotifications?: boolean;
    autoBackup?: boolean;
    backupFrequency?: 'hourly' | 'daily' | 'weekly' | 'monthly';
    currencySymbol?: string | null;
    currencyDecimalPlaces?: number;
    currencyThousandsSeparator?: string | null;
    currencyDecimalSeparator?: string | null;
    currencySymbolPosition?: 'before' | 'after';
  }): Promise<ApiResponse<unknown>> {
    return this.request('/general-settings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getChartOfAccounts(search?: string, accountType?: string, isActive?: boolean): Promise<ApiResponse<{ accounts: unknown[] }>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (accountType) params.append('accountType', accountType);
    if (isActive !== undefined) params.append('isActive', isActive.toString());
    return this.request(`/chart-of-accounts?${params.toString()}`);
  }

  async getChartOfAccountById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/chart-of-accounts/${id}`);
  }

  async createChartOfAccount(data: {
    code: string;
    name: string;
    accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
    category?: string | null;
    parentAccountId?: number | null;
    description?: string | null;
    allowSubAccounts?: boolean;
    allowTransactions?: boolean;
    isActive?: boolean;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/chart-of-accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateChartOfAccount(id: number, data: {
    code?: string;
    name?: string;
    accountType?: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
    category?: string | null;
    parentAccountId?: number | null;
    description?: string | null;
    allowSubAccounts?: boolean;
    allowTransactions?: boolean;
    isActive?: boolean;
  }): Promise<ApiResponse<unknown>> {
    return this.request(`/chart-of-accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteChartOfAccount(id: number): Promise<ApiResponse<void>> {
    return this.request(`/chart-of-accounts/${id}`, {
      method: 'DELETE',
    });
  }

  async getFinancialCategories(type?: 'income' | 'expense', isActive?: boolean): Promise<ApiResponse<{ categories: unknown[] }>> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (isActive !== undefined) params.append('isActive', isActive.toString());
    return this.request(`/financial-categories?${params.toString()}`);
  }

  async getFinancialCategoryById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/financial-categories/${id}`);
  }

  async createFinancialCategory(data: {
    name: string;
    type: 'income' | 'expense';
    icon?: string;
    color?: string;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/financial-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFinancialCategory(id: number, data: {
    name?: string;
    type?: 'income' | 'expense';
    icon?: string;
    color?: string;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<ApiResponse<unknown>> {
    return this.request(`/financial-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFinancialCategory(id: number): Promise<ApiResponse<void>> {
    return this.request(`/financial-categories/${id}`, {
      method: 'DELETE',
    });
  }

  async getBookingEngineConfig(propertyId?: number): Promise<ApiResponse<unknown>> {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId.toString());
    return this.request(`/booking-engine-config?${params.toString()}`);
  }

  async getWorkflows(propertyId?: number, status?: string, search?: string): Promise<ApiResponse<{ workflows: unknown[] }>> {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId.toString());
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    return this.request(`/workflows?${params.toString()}`);
  }

  async getWorkflowById(id: string | number): Promise<ApiResponse<unknown>> {
    return this.request(`/workflows/${id}`);
  }

  async createWorkflow(data: {
    name: string;
    description?: string | null;
    is_active?: boolean;
    isActive?: boolean;
    status?: 'active' | 'paused' | 'draft';
    steps?: Array<{
      stepType?: string;
      type?: string;
      triggerId?: string | null;
      actionId?: string | null;
      config?: unknown;
      delaySeconds?: number;
    }>;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWorkflow(id: string | number, data: {
    name?: string;
    description?: string | null;
    is_active?: boolean;
    isActive?: boolean;
    status?: 'active' | 'paused' | 'draft';
    steps?: Array<{
      stepType?: string;
      type?: string;
      triggerId?: string | null;
      actionId?: string | null;
      config?: unknown;
      delaySeconds?: number;
      retryCount?: number;
      retryDelaySeconds?: number;
    }>;
  }): Promise<ApiResponse<unknown>> {
    return this.request(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWorkflow(id: string | number): Promise<ApiResponse<void>> {
    return this.request(`/workflows/${id}`, {
      method: 'DELETE',
    });
  }

  async getWorkflowTriggerTypes(): Promise<ApiResponse<{ triggers: unknown[] }>> {
    return this.request('/workflows/trigger-types');
  }

  async getWorkflowActionTypes(): Promise<ApiResponse<{ actions: unknown[] }>> {
    return this.request('/workflows/action-types');
  }

  async getWorkflowExecutions(workflowId?: string | number, limit?: number): Promise<ApiResponse<{ executions: unknown[] }>> {
    const params = new URLSearchParams();
    if (workflowId != null) params.append('workflowId', String(workflowId));
    if (limit) params.append('limit', limit.toString());
    return this.request(`/workflows/executions?${params.toString()}`);
  }

  async getWorkflowStatus(propertyId?: number): Promise<ApiResponse<unknown>> {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId.toString());
    return this.request(`/workflows/status?${params.toString()}`);
  }

  async executeWorkflow(workflowId: string | number): Promise<ApiResponse<unknown>> {
    return this.request(`/workflows/${workflowId}/execute`, {
      method: 'POST',
    });
  }

  async rerunLastFailedWorkflow(workflowId: string | number): Promise<ApiResponse<unknown>> {
    return this.request(`/workflows/${workflowId}/rerun-last-failed`, {
      method: 'POST',
    });
  }

  async createOrUpdateBookingEngineConfig(data: {
    propertyId?: number | null;
    enabled?: boolean;
    websiteUrl?: string | null;
    bookingUrl?: string | null;
    defaultCurrency?: string;
    availableLanguages?: string[] | null;
    enableInstantBooking?: boolean;
    minAdvanceBooking?: number | null;
    maxAdvanceBooking?: number | null;
    requirePayment?: boolean;
    requireDeposit?: boolean;
    depositPercentage?: number | null;
    enableSearchFilters?: boolean;
    showPriceInclusive?: boolean;
    enableGuestReviews?: boolean;
    enableRecommendations?: boolean;
    mobileOptimized?: boolean;
    enableGoogleAnalytics?: boolean;
    googleAnalyticsId?: string | null;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/booking-engine-config', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createOrUpdateProductConfig(data: {
    propertyId?: number | null;
    defaultUnitId?: number | null;
    defaultProductGroupId?: number | null;
    defaultCategory?: string | null;
    enableBarcode?: boolean;
    enableImages?: boolean;
    enableVariations?: boolean;
    priceRounding?: number;
    enableTaxes?: boolean;
    defaultTaxRate?: number | null;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/product-config', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /** Schema 004: stock_configurations + alert + coding + fiscal */
  async createOrUpdateStockConfig(data: {
    propertyId: number;
    allowNegativeStock?: boolean;
    autoGenerateSKU?: boolean;
    trackExpirationDate?: boolean;
    trackBatchNumber?: boolean;
    defaultUnit?: 'un' | 'kg' | 'lt' | 'mt' | 'cx' | 'pc';
    defaultUnitId?: string | null;
    stockMethod?: 'fifo' | 'lifo' | 'average' | 'specific';
    defaultMinStock?: number;
    defaultMaxStock?: number;
    defaultReorderPoint?: number;
    autoReorder?: boolean;
    reorderLeadTime?: number;
    safetyStockPercent?: number;
    enableLowStockAlert?: boolean;
    enableExpirationAlert?: boolean;
    expirationAlertDays?: number;
    enableReorderAlert?: boolean;
    enableOverstockAlert?: boolean;
    alertEmail?: boolean;
    alertPush?: boolean;
    alertSMS?: boolean;
    skuPrefix?: string;
    skuDigits?: number;
    enableEAN?: boolean;
    eanPrefix?: string;
    enableQRCode?: boolean;
    qrCodeContent?: 'sku' | 'ean' | 'url' | 'json';
    defaultNCM?: string | null;
    defaultCFOP?: string;
    defaultICMS?: number;
    defaultPIS?: number;
    defaultCOFINS?: number;
    defaultIPI?: number;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/stock-config', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getReservationById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/reservations/${id}`);
  }

  async getReservationContractHtml(id: number): Promise<ApiResponse<{ html: string; reservationNumber: string }>> {
    return this.request(`/reservations/${id}/contract-html`);
  }

  async getContractTemplates(params?: { moduleKey?: string; propertyId?: number }): Promise<ApiResponse<{ contracts: unknown[] }>> {
    const search = new URLSearchParams();
    if (params?.moduleKey) search.append('moduleKey', params.moduleKey);
    if (params?.propertyId) search.append('propertyId', String(params.propertyId));
    return this.request(`/contract-templates?${search.toString()}`);
  }

  async createContractTemplate(data: unknown): Promise<ApiResponse<{ id: number; uuid: string }>> {
    return this.request('/contract-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContractTemplate(id: number, data: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/contract-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getReservations(data?: unknown): Promise<ApiResponse<{ reservations: unknown[] }>> {
    const params = new URLSearchParams();
    if (data) {
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          params.append(key, data[key].toString());
        }
      });
    }
    return this.request(`/reservations?${params.toString()}`);
  }

  async getReservationAvailability(params: { checkIn: string; checkOut: string }): Promise<ApiResponse<{ occupiedUnitIds: number[] }>> {
    const search = new URLSearchParams();
    if (params.checkIn) search.set('checkIn', params.checkIn.split('T')[0]);
    if (params.checkOut) search.set('checkOut', params.checkOut.split('T')[0]);
    return this.request(`/reservations/availability?${search.toString()}`);
  }

  async createReservation(data: unknown): Promise<ApiResponse<unknown>> {
    return this.request('/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReservation(id: number, data: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteReservation(id: number): Promise<ApiResponse<void>> {
    return this.request(`/reservations/${id}`, {
      method: 'DELETE',
    });
  }

  async checkInReservation(id: number): Promise<ApiResponse<void>> {
    return this.request(`/reservations/${id}/check-in`, {
      method: 'POST',
    });
  }

  async checkOutReservation(id: number): Promise<ApiResponse<void>> {
    return this.request(`/reservations/${id}/check-out`, {
      method: 'POST',
    });
  }

  async sendReservationDetails(
    id: number,
    channels: { email: boolean; whatsapp: boolean }
  ): Promise<ApiResponse<{ sent: { email: boolean; whatsapp: boolean } }>> {
    return this.request(`/reservations/${id}/send-details`, {
      method: 'POST',
      body: JSON.stringify({ channels }),
    });
  }

  // Email Config endpoints
  async getEmailConfigs(propertyId?: number, method?: string): Promise<ApiResponse<{ emailConfigs: unknown[] }>> {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId.toString());
    if (method) params.append('method', method);
    return this.request(`/email-configs?${params.toString()}`);
  }

  async getCurrentEmailConfig(propertyId?: number): Promise<ApiResponse<unknown>> {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId.toString());
    return this.request(`/email-configs/current?${params.toString()}`);
  }

  async getEmailConfigById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/email-configs/${id}`);
  }

  async createEmailConfig(data: {
    propertyId?: number | null;
    method: 'smtp' | 'api' | 'default';
    provider?: string | null;
    smtpServer?: string | null;
    smtpPort?: number | null;
    smtpSecurity?: 'none' | 'tls' | 'ssl' | null;
    smtpUsername?: string | null;
    smtpPassword?: string | null;
    apiKey?: string | null;
    apiDomain?: string | null;
    apiDailyLimit?: number | null;
    apiWebhookUrl?: string | null;
    fromEmail?: string | null;
    fromName?: string | null;
    replyTo?: string | null;
    defaultShowBranding?: boolean;
    isActive?: boolean;
    isDefault?: boolean;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/email-configs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmailConfig(id: number, data: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/email-configs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmailConfig(id: number): Promise<ApiResponse<void>> {
    return this.request(`/email-configs/${id}`, {
      method: 'DELETE',
    });
  }

  async testEmailConfig(id: number, testEmail: string): Promise<ApiResponse<unknown>> {
    return this.request(`/email-configs/${id}/test`, {
      method: 'POST',
      body: JSON.stringify({ testEmail }),
    });
  }

  // SMTP Config (smtp_configurations 004 - nova tela Configuração de E-mail)
  async getCurrentSmtpConfig(propertyId?: number): Promise<ApiResponse<unknown>> {
    const params = new URLSearchParams();
    if (propertyId != null) params.append('propertyId', propertyId.toString());
    return this.request(`/smtp-configs/current?${params.toString()}`);
  }

  async getSmtpConfigs(propertyId?: number): Promise<ApiResponse<unknown[]>> {
    const params = new URLSearchParams();
    if (propertyId != null) params.append('propertyId', propertyId.toString());
    return this.request(`/smtp-configs?${params.toString()}`);
  }

  async getSmtpConfigById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/smtp-configs/${id}`);
  }

  async createSmtpConfig(data: {
    propertyId: number;
    name?: string;
    providerType?: 'smtp' | 'api' | 'default';
    providerSlug?: string;
    smtpHost?: string | null;
    smtpPort?: number | null;
    smtpEncryption?: string | null;
    smtpUsername?: string | null;
    smtpPassword?: string | null;
    smtpTimeout?: number | null;
    fromEmail?: string | null;
    fromName?: string | null;
    replyTo?: string | null;
    dailyLimit?: number | null;
    apiKey?: string | null;
    apiDomain?: string | null;
    apiWebhookUrl?: string | null;
    trackOpens?: boolean;
    trackClicks?: boolean;
    lastTestEmail?: string | null;
    templateIds?: number[];
    isDefault?: boolean;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/smtp-configs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSmtpConfig(id: number, data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.request(`/smtp-configs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async testSmtpConfig(
    id: number,
    testEmail: string,
    overrides?: {
      apiKey?: string;
      apiDomain?: string;
      mailgunRegion?: string;
      mailgunKeyType?: string;
      providerSlug?: string;
      fromEmail?: string;
      fromName?: string;
      apiWebhookUrl?: string;
    }
  ): Promise<ApiResponse<unknown>> {
    return this.request(`/smtp-configs/${id}/test`, {
      method: 'POST',
      body: JSON.stringify({ testEmail, ...overrides }),
    });
  }

  async testSmtpConfigPreview(
    testEmail: string,
    data: {
      providerSlug: string;
      apiKey: string;
      apiDomain?: string;
      mailgunRegion?: string;
      mailgunKeyType?: string;
      fromEmail?: string;
      fromName?: string;
      apiWebhookUrl?: string;
    }
  ): Promise<ApiResponse<unknown>> {
    return this.request('/smtp-configs/test-preview', {
      method: 'POST',
      body: JSON.stringify({ testEmail, ...data }),
    });
  }

  async verifyMailgunCredentials(data: {
    apiKey?: string;
    mailgunRegion?: string;
    mailgunKeyType?: string;
    apiDomain?: string;
    apiWebhookUrl?: string;
    configId?: number;
  }): Promise<ApiResponse<{ valid: boolean; region?: string; domains?: string[]; message?: string }>> {
    const payload = {
      apiKey: data.apiKey,
      mailgunRegion: data.mailgunRegion,
      mailgunKeyType: data.mailgunKeyType,
      apiDomain: data.apiDomain,
      apiWebhookUrl: data.apiWebhookUrl,
      configId: data.configId,
    };

    const primary = await this.request<{ valid: boolean; region?: string; domains?: string[]; message?: string }>(
      '/smtp-configs/verify-mailgun',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );

    if (primary.success) return primary;

    const msg = primary.error?.message ?? '';
    if (!/não encontrada/i.test(msg)) return primary;

    if (data.configId) {
      return this.request(`/smtp-configs/${data.configId}/test`, {
        method: 'POST',
        body: JSON.stringify({
          verifyOnly: true,
          providerSlug: 'mailgun',
          apiDomain: data.apiDomain,
          mailgunKeyType: data.mailgunKeyType,
          ...payload,
        }),
      });
    }

    return this.request('/smtp-configs/test-preview', {
      method: 'POST',
      body: JSON.stringify({
        verifyOnly: true,
        providerSlug: 'mailgun',
        ...payload,
      }),
    });
  }

  // Email Templates (PMS schema: categories, variable groups, templates)
  async getEmailTemplateCategories(): Promise<ApiResponse<{ categories: unknown[] }>> {
    return this.request('/email-templates/categories');
  }

  async createEmailTemplateCategory(data: {
    name: string;
    description?: string | null;
    icon?: string;
    color?: string;
    bgColor?: string;
    sortOrder?: number;
  }): Promise<ApiResponse<{ category: unknown }>> {
    return this.request('/email-templates/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmailTemplateCategory(
    id: string,
    data: { name?: string; description?: string | null; icon?: string; color?: string; bgColor?: string; sortOrder?: number; isActive?: boolean }
  ): Promise<ApiResponse<{ category: unknown }>> {
    return this.request(`/email-templates/categories/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmailTemplateCategory(id: string): Promise<ApiResponse<void>> {
    return this.request(`/email-templates/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  async getEmailTemplateVariableGroups(): Promise<ApiResponse<{ variableGroups: unknown[]; variables: unknown[] }>> {
    return this.request('/email-templates/variable-groups');
  }

  async getEmailTemplates(categoryId?: string): Promise<ApiResponse<{ templates: unknown[] }>> {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    return this.request(`/email-templates?${params.toString()}`);
  }

  async getEmailTemplateById(id: string): Promise<ApiResponse<{ template: unknown }>> {
    return this.request(`/email-templates/${encodeURIComponent(id)}`);
  }

  async createEmailTemplate(data: {
    name: string;
    description?: string | null;
    subject: string;
    categoryId: string;
    contentHtml: string;
    contentText?: string | null;
    previewText?: string | null;
    fromName?: string | null;
    fromEmail?: string | null;
    replyTo?: string | null;
    isActive?: boolean;
    isDefault?: boolean;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/email-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmailTemplate(id: string, data: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/email-templates/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmailTemplate(id: string): Promise<ApiResponse<void>> {
    return this.request(`/email-templates/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // AI Config endpoints
  async getAiConfigs(provider?: string, propertyId?: number): Promise<ApiResponse<{ aiConfigs: unknown[] }>> {
    const params = new URLSearchParams();
    if (provider) params.append('provider', provider);
    if (propertyId) params.append('propertyId', propertyId.toString());
    return this.request(`/ai-configs?${params.toString()}`);
  }

  async getCurrentAiConfig(propertyId?: number): Promise<ApiResponse<unknown>> {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId.toString());
    return this.request(`/ai-configs/current?${params.toString()}`);
  }

  async getAiConfigById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/ai-configs/${id}`);
  }

  async createAiConfig(data: {
    propertyId?: number | null;
    provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'custom';
    name: string;
    apiKey?: string | null;
    apiEndpoint?: string | null;
    model?: string | null;
    temperature?: number | null;
    maxTokens?: number | null;
    organizationId?: string | null;
    projectId?: string | null;
    region?: string | null;
    customHeaders?: Record<string, unknown> | null;
    customParams?: Record<string, unknown> | null;
    isActive?: boolean;
    isDefault?: boolean;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/ai-configs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAiConfig(id: number, data: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/ai-configs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAiConfig(id: number): Promise<ApiResponse<void>> {
    return this.request(`/ai-configs/${id}`, {
      method: 'DELETE',
    });
  }

  async testAiConfig(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/ai-configs/${id}/test`, {
      method: 'POST',
    });
  }

  async generateEmailTemplate(data: {
    templateType: string;
    templateName?: string;
    categoryName?: string;
    subject?: string;
    additionalContext?: string;
    propertyId?: number;
  }): Promise<ApiResponse<{ bodyHtml: string; bodyText: string; subject: string }>> {
    const params = new URLSearchParams();
    if (data.propertyId) params.append('propertyId', data.propertyId.toString());
    return this.request(`/ai-configs/generate-email-template?${params.toString()}`, {
      method: 'POST',
      body: JSON.stringify({
        templateType: data.templateType,
        templateName: data.templateName,
        categoryName: data.categoryName,
        subject: data.subject,
        additionalContext: data.additionalContext,
      }),
    });
  }

  // Booking Channels (Canais de Venda - schema 005)
  async getBookingChannels(params?: { propertyId?: number; all?: boolean }): Promise<ApiResponse<{ channels: unknown[] }>> {
    const search = new URLSearchParams();
    if (params?.propertyId != null) search.set('propertyId', String(params.propertyId));
    if (params?.all) search.set('all', 'true');
    const q = search.toString();
    return this.request(`/booking-channels${q ? `?${q}` : ''}`);
  }

  // External integrations (Channel Manager — Channex)
  async getIntegrationProviders(): Promise<ApiResponse<{ providers: Array<{
    id: number;
    code: string;
    name: string;
    category: string;
    description: string | null;
    capabilities: Record<string, boolean>;
  }> }>> {
    return this.request('/integrations/providers');
  }

  async getIntegrationConnections(params?: { provider?: string }): Promise<ApiResponse<{ connections: Array<{
    id: number;
    uuid: string;
    providerCode: string;
    providerName: string;
    name: string;
    status: string;
    propertyId: number | null;
    settings: Record<string, unknown>;
    lastSyncAt: string | null;
    lastError: string | null;
    hasCredentials: boolean;
  }> }>> {
    const search = new URLSearchParams();
    if (params?.provider) search.set('provider', params.provider);
    const q = search.toString();
    return this.request(`/integrations/connections${q ? `?${q}` : ''}`);
  }

  async createIntegrationConnection(data: {
    providerCode: string;
    name: string;
    propertyId?: number | null;
    accessToken: string;
    settings?: Record<string, unknown>;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/integrations/connections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateIntegrationConnection(id: number, data: {
    name?: string;
    propertyId?: number | null;
    accessToken?: string;
    settings?: Record<string, unknown>;
    status?: string;
  }): Promise<ApiResponse<unknown>> {
    return this.request(`/integrations/connections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteIntegrationConnection(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/integrations/connections/${id}`, {
      method: 'DELETE',
    });
  }

  async testIntegrationConnection(id: number): Promise<ApiResponse<{
    ok: boolean;
    message: string;
    propertyCount?: number;
  }>> {
    return this.request(`/integrations/connections/${id}/test`, {
      method: 'POST',
    });
  }

  async getIntegrationExternalProperties(connectionId: number): Promise<ApiResponse<{
    properties: Array<{ externalId: string; title: string; address?: string | null }>;
  }>> {
    return this.request(`/integrations/connections/${connectionId}/external-properties`);
  }

  async getIntegrationExternalListings(connectionId: number): Promise<ApiResponse<{
    listings: Array<{ listingId: string; channelType: string; title?: string; propertyExternalId?: string }>;
  }>> {
    return this.request(`/integrations/connections/${connectionId}/external-listings`);
  }

  async getIntegrationMappings(connectionId: number, entityType: string = 'unit'): Promise<ApiResponse<{
    mappings: Array<{
      id: number;
      connectionId: number;
      entityType: string;
      localId: number;
      externalId: string;
      externalLabel: string | null;
      isActive: boolean;
    }>;
  }>> {
    const q = new URLSearchParams({ entityType });
    return this.request(`/integrations/connections/${connectionId}/mappings?${q.toString()}`);
  }

  async upsertIntegrationMapping(connectionId: number, data: {
    localId: number;
    externalId: string;
    externalLabel?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<ApiResponse<unknown>> {
    return this.request(`/integrations/connections/${connectionId}/mappings`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteIntegrationMapping(connectionId: number, mappingId: number): Promise<ApiResponse<unknown>> {
    return this.request(`/integrations/connections/${connectionId}/mappings/${mappingId}`, {
      method: 'DELETE',
    });
  }

  async deleteIntegrationMappingByExternal(connectionId: number, externalId: string): Promise<ApiResponse<unknown>> {
    return this.request(
      `/integrations/connections/${connectionId}/mappings/by-external/${encodeURIComponent(externalId)}`,
      { method: 'DELETE' },
    );
  }

  async registerIntegrationWebhook(connectionId: number): Promise<ApiResponse<{
    url: string;
    registered: boolean;
    message?: string;
  }>> {
    return this.request(`/integrations/connections/${connectionId}/register-webhook`, {
      method: 'POST',
    });
  }

  async getIntegrationExternalRoomTypes(connectionId: number, propertyId?: string): Promise<ApiResponse<{
    roomTypes: Array<{
      externalId: string;
      title: string;
      propertyExternalId: string;
      countOfRooms: number;
    }>;
  }>> {
    const q = propertyId ? `?propertyId=${encodeURIComponent(propertyId)}` : '';
    return this.request(`/integrations/connections/${connectionId}/external-room-types${q}`);
  }

  async pullIntegrationBookings(connectionId: number): Promise<ApiResponse<{
    processed: number;
    message: string;
  }>> {
    return this.request(`/integrations/connections/${connectionId}/pull-bookings`, {
      method: 'POST',
    });
  }

  async getIntegrationExternalRatePlans(connectionId: number, propertyId?: string): Promise<ApiResponse<{
    ratePlans: Array<{
      externalId: string;
      title: string;
      propertyExternalId: string;
      roomTypeExternalId: string;
      currency?: string;
    }>;
  }>> {
    const q = propertyId ? `?propertyId=${encodeURIComponent(propertyId)}` : '';
    return this.request(`/integrations/connections/${connectionId}/external-rate-plans${q}`);
  }

  async provisionIntegrationFromUnistays(
    connectionId: number,
    data: { propertyId: number; daysAhead?: number; currency?: string },
  ): Promise<ApiResponse<{
    propertyExternalId: string;
    roomTypesCreated: number;
    ratePlansCreated: number;
    unitsMapped: number;
    availability?: { ok: boolean; message: string };
    rates?: { ok: boolean; message: string };
  }>> {
    return this.request(`/integrations/connections/${connectionId}/provision`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async syncIntegrationAvailability(
    connectionId: number,
    data?: { daysAhead?: number },
  ): Promise<ApiResponse<{ ok: boolean; message: string; roomTypes: number }>> {
    return this.request(`/integrations/connections/${connectionId}/sync-availability`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async syncIntegrationRates(
    connectionId: number,
    data?: { daysAhead?: number },
  ): Promise<ApiResponse<{ ok: boolean; message: string; ratePlans: number }>> {
    return this.request(`/integrations/connections/${connectionId}/sync-rates`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async doctorIntegration(connectionId: number): Promise<ApiResponse<{
    ok: boolean;
    checks: Array<{ name: string; ok: boolean; detail: string }>;
    poller: {
      running: boolean;
      intervalMs: number;
      lastPollAt: string | null;
      consecutiveFailures: number;
    };
  }>> {
    return this.request(`/integrations/connections/${connectionId}/doctor`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async recoverIntegrationBookings(
    connectionId: number,
    data: { insertedAtGte: string },
  ): Promise<ApiResponse<{ created: number; message: string }>> {
    return this.request(`/integrations/connections/${connectionId}/recover-bookings`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getReservationChannelFlow(reservationId: number): Promise<ApiResponse<{
    reservation: {
      id: number;
      reservationNumber: string;
      status: string;
      channel: string | null;
      externalId: string | null;
      unitId: number | null;
      checkIn: string | null;
      checkOut: string | null;
      createdAt: string | null;
      agencyNotes: string | null;
      internalNotes: string | null;
      isFromChannex: boolean;
      overbooking: boolean;
      otaModification: boolean;
    };
    mapping: {
      connected: boolean;
      connectionId: number | null;
      connectionName: string | null;
      roomTypeExternalId: string | null;
      channexPropertyId: string | null;
      mappedUnits: number;
    } | null;
    summary: {
      overall: 'ok' | 'warning' | 'error' | 'idle' | 'inbound' | 'outbound';
      label: string;
      hasErrors: boolean;
      lastSyncAt: string | null;
      eventsCount: number;
    };
    timeline: Array<{
      id: string;
      at: string;
      title: string;
      description: string;
      status: 'success' | 'error' | 'skipped' | 'pending' | 'info';
      direction?: 'inbound' | 'outbound' | 'local';
      module?: string;
      action?: string;
      externalRef?: string | null;
      details?: Record<string, unknown> | null;
      errorMessage?: string | null;
    }>;
  }>> {
    return this.request(`/integrations/reservations/${reservationId}/channel-flow`);
  }

  // Outbound webhooks (Cadastros → Webhooks) — Unistays → sistemas externos
  async getOutboundWebhooks(): Promise<ApiResponse<{ webhooks: Array<{
    id: number;
    uuid: string;
    name: string;
    url: string;
    secret: string;
    events: string[];
    isActive: boolean;
    lastTriggeredAt: string | null;
    lastStatus: string | null;
    successCount: number;
    errorCount: number;
    successRate: number;
    totalCalls: number;
  }> }>> {
    return this.request('/outbound-webhooks');
  }

  async createOutboundWebhook(data: {
    name: string;
    url: string;
    events: string[];
    secret?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/outbound-webhooks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOutboundWebhook(id: number, data: {
    name?: string;
    url?: string;
    events?: string[];
    secret?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<unknown>> {
    return this.request(`/outbound-webhooks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOutboundWebhook(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/outbound-webhooks/${id}`, {
      method: 'DELETE',
    });
  }

  async testOutboundWebhook(id: number): Promise<ApiResponse<{
    ok: boolean;
    status?: number;
    message: string;
  }>> {
    return this.request(`/outbound-webhooks/${id}/test`, {
      method: 'POST',
    });
  }

  async getBookingChannelCatalog(): Promise<ApiResponse<{ catalog: unknown[] }>> {
    return this.request('/booking-channels/catalog');
  }

  async getBookingChannelById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/booking-channels/${id}`);
  }

  async createBookingChannel(data: {
    propertyId: number;
    name: string;
    slug: string;
    catalogCode?: string;
    type?: string;
    logo?: string | null;
    description?: string | null;
    color?: string;
    status?: string;
    commissionType?: string;
    commissionValue?: number;
    apiKey?: string | null;
    hotelId?: string | null;
    autoSync?: boolean;
    syncInterval?: number;
    syncPrices?: boolean;
    syncAvailability?: boolean;
    syncRestrictions?: boolean;
    paymentTerms?: string;
    applyToAllRates?: boolean;
    notifyTeamOnBooking?: boolean;
    activateNow?: boolean;
    testMode?: boolean;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/booking-channels', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBookingChannel(
    id: number,
    data: {
      name?: string;
      slug?: string;
      logo?: string | null;
      description?: string | null;
      type?: string;
      color?: string;
      status?: string;
      commissionType?: string;
      commissionValue?: number;
      apiKey?: string | null;
      hotelId?: string | null;
      autoSync?: boolean;
      syncInterval?: number;
      syncPrices?: boolean;
      syncAvailability?: boolean;
      syncRestrictions?: boolean;
      paymentTerms?: string;
    }
  ): Promise<ApiResponse<unknown>> {
    return this.request(`/booking-channels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBookingChannel(id: number): Promise<ApiResponse<void>> {
    return this.request(`/booking-channels/${id}`, { method: 'DELETE' });
  }

  // Payment Methods
  async getPaymentMethods(all?: boolean): Promise<ApiResponse<{ paymentMethods: unknown[] }>> {
    return this.request(`/payment-methods${all ? '?all=true' : ''}`);
  }

  // Companies endpoints
  async getCompanies(search?: string, type?: string, status?: string): Promise<ApiResponse<{ companies: unknown[] }>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/companies${query}`);
  }

  async getCompanyById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/companies/${id}`);
  }

  async createCompany(data: {
    type: string;
    name: string;
    tradeName?: string | null;
    cnpj?: string | null;
    stateRegistration?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    contactName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    zipCode?: string | null;
    address?: string | null;
    street?: string | null;
    number?: string | null;
    complement?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string;
    commissionPercentage?: number | null;
    paymentTerms?: string | null;
    notes?: string | null;
    status?: string;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCompany(id: number, data: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCompany(id: number): Promise<ApiResponse<void>> {
    return this.request(`/companies/${id}`, {
      method: 'DELETE',
    });
  }

  // Guests endpoints
  async getGuests(
    searchOrFilters?: string | {
      search?: string;
      tier?: string;
      page?: number;
      limit?: number;
      city?: string;
      nationality?: string;
      sort?: string;
    },
    tier?: string
  ): Promise<ApiResponse<{ guests: unknown[]; pagination: { page: number; perPage: number; totalItems: number; totalPages: number } }>> {
    const filters = typeof searchOrFilters === 'string'
      ? { search: searchOrFilters, tier }
      : (searchOrFilters || {});

    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.tier) params.append('tier', filters.tier);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.city) params.append('city', filters.city);
    if (filters?.nationality) params.append('nationality', filters.nationality);
    if (filters?.sort) params.append('sort', filters.sort);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/guests${query}`, {
      method: 'GET',
    });
  }

  async getGuestById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/guests/${id}`, {
      method: 'GET',
    });
  }

  async getGuestLoyaltyHistory(guestId: number): Promise<ApiResponse<{ history: GuestLoyaltyHistoryItem[] }>> {
    return this.request(`/guests/${guestId}/loyalty-history`, {
      method: 'GET',
    });
  }

  async addGuestLoyaltyPoints(
    guestId: number,
    data: { operation: 'credit' | 'debit'; points: number; source?: string; description?: string | null }
  ): Promise<ApiResponse<{ guestId: number; operation: string; points: number; previousBalance: number; newBalance: number }>> {
    return this.request(`/guests/${guestId}/loyalty-points`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createGuest(data: {
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    documentType?: string | null;
    documentNumber?: string | null;
    nationality?: string | null;
    birthDate?: string | null;
    gender?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
    country?: string | null;
    tier?: string;
    loyaltyPoints?: number;
    preferences?: string[] | null;
    tags?: string[] | null;
    notes?: string | null;
    marketingConsent?: boolean;
    type?: 'physical' | 'legal';
    whatsapp?: string | null;
    companyName?: string | null;
    tradeName?: string | null;
    stateRegistration?: string | null;
    cnpj?: string | null;
    contactName?: string | null;
    addressNumber?: string | null;
    addressComplement?: string | null;
    addressNeighborhood?: string | null;
    memberSince?: string | null;
    marketingEmail?: boolean;
    marketingSms?: boolean;
    marketingWhatsapp?: boolean;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    emergencyContactRelation?: string | null;
    occupation?: string | null;
    /** Senha do portal do hóspede (opcional). Mín. 6 caracteres no backend. */
    password?: string | null;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/guests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGuest(id: number, data: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/guests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGuest(id: number): Promise<ApiResponse<void>> {
    return this.request(`/guests/${id}`, {
      method: 'DELETE',
    });
  }

  // Upload endpoints
  async uploadImage(file: File, folder: string = 'guests'): Promise<ApiResponse<{ url: string; fullUrl: string; filename: string; originalName: string; size: number }>> {
    const formData = new FormData();
    formData.append('image', file);

    return this.request(`/upload/image?folder=${folder}`, {
      method: 'POST',
      body: formData,
      headers: {}, // Não definir Content-Type, deixar o navegador definir com boundary
    }, false); // false indica que não é JSON
  }

  async uploadCertificate(file: File): Promise<ApiResponse<{ path: string; filename: string; originalName: string; size: number }>> {
    const formData = new FormData();
    formData.append('certificate', file);

    return this.request('/upload/certificate', {
      method: 'POST',
      body: formData,
      headers: {}, // Não definir Content-Type, deixar o navegador definir com boundary
    }, false); // false indica que não é JSON
  }

  async uploadMultipleImages(files: File[], folder: string = 'units'): Promise<ApiResponse<{ files: Array<{ url: string; fullUrl: string; filename: string; originalName: string; size: number }> }>> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    return this.request(`/upload/images?folder=${folder}`, {
      method: 'POST',
      body: formData,
      headers: {}, // Não definir Content-Type
    }, false);
  }

  // Deletar imagem do storage
  async deleteImage(url: string): Promise<ApiResponse<{ message: string }>> {
    return this.request('/upload/image', {
      method: 'DELETE',
      body: JSON.stringify({ url }),
    });
  }

  // Storage Config endpoints
  async getStorageConfigs(propertyId?: number, provider?: string): Promise<ApiResponse<{ storageConfigs: unknown[] }>> {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId.toString());
    if (provider) params.append('provider', provider);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/storage-config${query}`, {
      method: 'GET',
    });
  }

  async getStorageConfigById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/storage-config/${id}`, {
      method: 'GET',
    });
  }

  async createStorageConfig(data: unknown): Promise<ApiResponse<unknown>> {
    return this.request('/storage-config', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStorageConfig(id: number, data: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/storage-config/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStorageConfig(id: number): Promise<ApiResponse<void>> {
    return this.request(`/storage-config/${id}`, {
      method: 'DELETE',
    });
  }
  // Campaigns endpoints
  async getCampaigns(search?: string, status?: string): Promise<ApiResponse<{ campaigns: unknown[] }>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    return this.request(`/campaigns?${params.toString()}`);
  }

  async getCampaignStats(): Promise<ApiResponse<unknown>> {
    return this.request('/campaigns/stats');
  }

  async getCampaignPerformance(): Promise<ApiResponse<unknown>> {
    return this.request('/campaigns/performance');
  }



  async getCampaignById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/campaigns/${id}`);
  }

  async createCampaign(data: unknown): Promise<ApiResponse<unknown>> {
    return this.request('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCampaign(id: number, data: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCampaign(id: number): Promise<ApiResponse<void>> {
    return this.request(`/campaigns/${id}`, {
      method: 'DELETE',
    });
  }

  async sendCampaign(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/campaigns/${id}/send`, {
      method: 'POST',
    });
  }
  // Email Automations
  async getEmailAutomations(): Promise<ApiResponse<{ automations: unknown[] }>> {
    return this.request('/email-automations');
  }

  async createEmailAutomation(data: unknown): Promise<ApiResponse<unknown>> {
    return this.request('/email-automations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmailAutomation(id: number, data: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/email-automations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmailAutomation(id: number): Promise<ApiResponse<void>> {
    return this.request(`/email-automations/${id}`, {
      method: 'DELETE',
    });
  }

  // Email Segments
  async getEmailSegments(): Promise<ApiResponse<{ segments: unknown[] }>> {
    return this.request('/email-segments');
  }

  async createEmailSegment(data: unknown): Promise<ApiResponse<unknown>> {
    return this.request('/email-segments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmailSegment(id: number, data: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/email-segments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmailSegment(id: number): Promise<ApiResponse<void>> {
    return this.request(`/email-segments/${id}`, {
      method: 'DELETE',
    });
  }


  async createPaymentMethod(data: unknown): Promise<ApiResponse<unknown>> {
    return this.request('/payment-methods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePaymentMethod(id: number, data: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/payment-methods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePaymentMethod(id: number): Promise<ApiResponse<void>> {
    return this.request(`/payment-methods/${id}`, {
      method: 'DELETE',
    });
  }

  async togglePaymentMethodStatus(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/payment-methods/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async getNavigation(): Promise<ApiResponse<unknown>> {
    return this.request('/pages/navigation');
  }



  // Unit Rates
  async getPricingMapData(params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<{
    units: unknown[];
    rates: unknown[];
    ratesByUnit: Record<number, unknown[]>;
    properties: unknown[];
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    return this.request(`/unit-rates/pricing-map?${queryParams.toString()}`);
  }

  async getUnitRates(params?: { unitId?: number; startDate?: string; endDate?: string }): Promise<ApiResponse<{ rates: unknown[] }>> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const endpoint = params?.unitId
      ? `/unit-rates/unit/${params.unitId}?${queryParams.toString()}`
      : `/unit-rates?${queryParams.toString()}`;

    return this.request(endpoint);
  }

  async upsertUnitRate(data: {
    unitId: number;
    date: string;
    dailyRate?: number;
    weeklyRate?: number;
    monthlyRate?: number;
    minStay?: number;
    maxStay?: number;
    available?: boolean;
    notes?: string;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/unit-rates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async bulkUpsertUnitRates(rates: Array<{
    unitId: number;
    date: string;
    dailyRate?: number;
    weeklyRate?: number;
    monthlyRate?: number;
    minStay?: number;
    maxStay?: number;
    available?: boolean;
    notes?: string;
  }>): Promise<ApiResponse<{ rates: unknown[]; count: number }>> {
    return this.request('/unit-rates/bulk', {
      method: 'POST',
      body: JSON.stringify({ rates }),
    });
  }

  async deleteUnitRate(id: number): Promise<ApiResponse<void>> {
    return this.request(`/unit-rates/${id}`, {
      method: 'DELETE',
    });
  }

  async getPages(): Promise<ApiResponse<unknown[]>> {
    return this.request('/pages');
  }

  // Housekeeping endpoints
  async getHousekeepingTasks(params?: {
    search?: string;
    propertyId?: number;
    category?: string;
    status?: string;
    assigneeId?: number;
  }): Promise<ApiResponse<{ tasks: unknown[] }>> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.propertyId) queryParams.append('propertyId', params.propertyId.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.assigneeId) queryParams.append('assigneeId', params.assigneeId.toString());

    return this.request(`/housekeeping?${queryParams.toString()}`);
  }

  async getHousekeepingTaskById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/housekeeping/${id}`);
  }

  async createHousekeepingTask(data: {
    propertyId: number;
    unitId: number;
    category: 'cleaning' | 'arrangement' | 'maintenance';
    type: string;
    description?: string | null;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    assigneeId?: number | null;
    estimatedTime?: string | null;
    notes?: string | null;
    scheduledAt?: string | null;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/housekeeping', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateHousekeepingTask(id: number, data: {
    propertyId?: number;
    unitId?: number;
    category?: 'cleaning' | 'arrangement' | 'maintenance';
    type?: string;
    description?: string | null;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    assigneeId?: number | null;
    estimatedTime?: string | null;
    notes?: string | null;
    scheduledAt?: string | null;
    status?: 'pending' | 'in_progress' | 'completed' | 'blocked';
    startedAt?: string | null;
    completedAt?: string | null;
  }): Promise<ApiResponse<unknown>> {
    return this.request(`/housekeeping/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteHousekeepingTask(id: number): Promise<ApiResponse<void>> {
    return this.request(`/housekeeping/${id}`, {
      method: 'DELETE',
    });
  }

  // Stock Locations
  async getStockLocations(params?: { propertyId?: number }): Promise<ApiResponse<unknown>> {
    const queryParams = new URLSearchParams();
    if (params?.propertyId) queryParams.append('propertyId', params.propertyId.toString());
    return this.request(`/stock-locations?${queryParams.toString()}`);
  }

  async createStockLocation(data: unknown): Promise<ApiResponse<unknown>> {
    return this.request('/stock-locations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStockLocation(id: number, data: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/stock-locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStockLocation(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/stock-locations/${id}`, {
      method: 'DELETE',
    });
  }

  // Storage Locations (storage_locations - Locais de Armazenamento)
  async getStorageLocations(params?: { propertyId?: number; status?: string }): Promise<ApiResponse<unknown[]>> {
    const queryParams = new URLSearchParams();
    if (params?.propertyId != null) queryParams.append('propertyId', params.propertyId.toString());
    if (params?.status) queryParams.append('status', params.status);
    return this.request(`/storage-locations?${queryParams.toString()}`);
  }

  async getStorageLocationById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/storage-locations/${id}`);
  }

  async createStorageLocation(data: {
    propertyId: number;
    code?: string;
    name: string;
    description?: string | null;
    type?: string;
    capacity?: number | null;
    temperatureControl?: string;
    temperatureMin?: number | null;
    temperatureMax?: number | null;
    isRestricted?: boolean;
    requiresApproval?: boolean;
    requiresCount?: boolean;
    countFrequencyDays?: number | null;
    allowNegativeStock?: boolean;
    fifoRequired?: boolean;
    status?: string;
    isDefault?: boolean;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/storage-locations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStorageLocation(id: number, data: Partial<{
    propertyId: number;
    code: string;
    name: string;
    description: string | null;
    type: string;
    capacity: number | null;
    temperatureControl: string;
    temperatureMin: number | null;
    temperatureMax: number | null;
    isRestricted: boolean;
    requiresApproval: boolean;
    requiresCount: boolean;
    countFrequencyDays: number | null;
    allowNegativeStock: boolean;
    fifoRequired: boolean;
    status: string;
    isDefault: boolean;
  }>): Promise<ApiResponse<unknown>> {
    return this.request(`/storage-locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStorageLocation(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/storage-locations/${id}`, {
      method: 'DELETE',
    });
  }

  // Inventory items
  async getInventoryItems(params?: { search?: string; propertyId?: number; category?: string }): Promise<ApiResponse<{ items: unknown[] }>> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.propertyId) queryParams.append('propertyId', params.propertyId.toString());
    if (params?.category) queryParams.append('category', params.category);
    return this.request(`/inventory-items?${queryParams.toString()}`);
  }

  async getInventoryItemById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/inventory-items/${id}`);
  }

  async createInventoryItem(data: {
    productId?: number;
    propertyId: number;
    name?: string;
    category?: string | null;
    sku?: string | null;
    barcode?: string | null;
    brand?: string | null;
    description?: string | null;
    model?: string | null;
    imageUrl?: string | null;
    unit?: string;
    currentStock?: number;
    minStock?: number;
    maxStock?: number | null;
    reorderPoint?: number | null;
    costPrice?: number | null;
    sellingPrice?: number | null;
    supplier?: string | null;
    location?: string | null;
    shelfPosition?: string | null;
    notes?: string | null;
    temperatureControl?: boolean;
    humidityControl?: boolean;
    trackBatch?: boolean;
    trackSerial?: boolean;
    expirationAlert?: boolean;
    expirationDays?: number | null;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/inventory-items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInventoryItem(id: number, data: Partial<{
    propertyId: number;
    name: string;
    category: string | null;
    sku: string | null;
    barcode: string | null;
    brand: string | null;
    description: string | null;
    model: string | null;
    imageUrl: string | null;
    unit: string;
    currentStock: number;
    minStock: number;
    maxStock: number | null;
    reorderPoint: number | null;
    costPrice: number | null;
    sellingPrice: number | null;
    supplier: string | null;
    location: string | null;
    shelfPosition: string | null;
    notes: string | null;
    temperatureControl: boolean;
    humidityControl: boolean;
    trackBatch: boolean;
    trackSerial: boolean;
    expirationAlert: boolean;
    expirationDays: number | null;
  }>): Promise<ApiResponse<unknown>> {
    return this.request(`/inventory-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInventoryItem(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/inventory-items/${id}`, {
      method: 'DELETE',
    });
  }

  // Inventory movements
  async getInventoryMovements(params?: { itemId?: number; type?: string; inventoryCountId?: number; limit?: number }): Promise<ApiResponse<{ movements: unknown[] }>> {
    const queryParams = new URLSearchParams();
    if (params?.itemId) queryParams.append('itemId', params.itemId.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.inventoryCountId) queryParams.append('inventoryCountId', params.inventoryCountId.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    return this.request(`/inventory-movements?${queryParams.toString()}`);
  }

  async createInventoryMovement(data: {
    itemId: number;
    type: 'in' | 'out' | 'transfer' | 'adjustment';
    quantity: number;
    unitCost?: number | null;
    reason?: string | null;
    reference?: string | null;
    notes?: string | null;
    inventoryCountId?: number | null;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/inventory-movements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /** Grava várias movimentações de uma vez; só grava se todas forem válidas (estoque, etc.). */
  async createInventoryMovementsBulk(data: {
    movements: Array<{
      itemId: number;
      type: 'in' | 'out' | 'transfer' | 'adjustment';
      quantity: number;
      reason?: string | null;
    }>;
  }): Promise<ApiResponse<{ count: number }>> {
    return this.request('/inventory-movements/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Inventory counts (histórico de contagens)
  async getInventoryCounts(params?: { propertyId?: number; limit?: number }): Promise<ApiResponse<{ counts: unknown[] }>> {
    const queryParams = new URLSearchParams();
    if (params?.propertyId) queryParams.append('propertyId', params.propertyId.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    return this.request(`/inventory-counts?${queryParams.toString()}`);
  }

  async getInventoryCountById(id: number): Promise<ApiResponse<{ id: string; protocol: string; name: string; propertyName?: string; propertyType?: string; responsible?: string | null; notes?: string | null; createdAt: string }>> {
    return this.request(`/inventory-counts/${id}`);
  }

  async getInventoryCountItems(countId: number): Promise<ApiResponse<{ items: Array<{
    id: string;
    itemId?: number | null;
    systemQuantity: number;
    countedQuantity: number | null;
    divergence: number;
    status: string;
    notes: string | null;
    itemName: string;
    itemSku: string;
    itemCategory: string;
  }> }>> {
    return this.request(`/inventory-counts/${countId}/items`);
  }

  async createInventoryCount(data: {
    propertyId: number;
    name: string;
    protocol: string;
    responsible?: string | null;
    notes?: string | null;
    blindCount?: boolean;
    totalItems?: number;
    countedItems?: number;
    divergentItems?: number;
    adjustedItems?: number;
    accuracyPercentage?: number | null;
    status?: 'draft' | 'completed' | 'cancelled';
    items?: Array<{
      itemId: number;
      systemQuantity: number;
      countedQuantity: number | null;
      status: 'pending' | 'counted' | 'divergent' | 'adjusted';
      notes?: string | null;
    }>;
  }): Promise<ApiResponse<{ id: string; protocol: string }>> {
    return this.request('/inventory-counts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Purchase orders
  async getPurchaseOrders(params?: { propertyId?: number; status?: string; limit?: number }): Promise<ApiResponse<{ orders: unknown[] }>> {
    const queryParams = new URLSearchParams();
    if (params?.propertyId) queryParams.append('propertyId', params.propertyId.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/purchase-orders${query}`);
  }

  async getPurchaseOrderById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/purchase-orders/${id}`);
  }

  async createPurchaseOrder(data: {
    propertyId: number;
    supplierId?: number | null;
    supplierName?: string | null;
    orderDate: string;
    expectedDeliveryDate?: string | null;
    deliveryAddress?: string | null;
    deliveryNotes?: string | null;
    paymentMethodId?: number | null;
    paymentInstallments?: number | null;
    notes?: string | null;
    items: Array<{ inventoryItemId: number; quantity: number; unitPrice: number; discountPercent?: number }>;
  }): Promise<ApiResponse<unknown>> {
    return this.request('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePurchaseOrderStatus(
    id: number,
    data: { status: string; notes?: string | null }
  ): Promise<ApiResponse<unknown>> {
    return this.request(`/purchase-orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Financial endpoints
  async getTransactions(params?: {
    search?: string;
    type?: string;
    status?: string;
    propertyId?: number;
    startDate?: string;
    endDate?: string;
    categoryId?: number;
  }): Promise<ApiResponse<{ transactions: unknown[] }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request(`/financial/transactions?${queryParams.toString()}`);
  }

  async getFinancialStats(params?: {
    propertyId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{ summary: unknown; chartData: unknown[] }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request(`/financial/transactions/stats?${queryParams.toString()}`);
  }

  async createTransaction(data: unknown): Promise<ApiResponse<unknown>> {
    return this.request('/financial/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTransaction(id: number, data: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/financial/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTransaction(id: number): Promise<ApiResponse<void>> {
    return this.request(`/financial/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadTransactionAttachments(files: File[]): Promise<ApiResponse<{ attachments: unknown[] }>> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    return this.request('/financial/transactions/upload-attachments', {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type header to let browser set it with boundary
      },
    });
  }

  // Dashboard
  async getDashboardStats(): Promise<ApiResponse<unknown>> {
    return this.request('/dashboard/stats');
  }

  // Maintenance
  async getMaintenanceOrders(params?: {
    search?: string;
    status?: string;
    priority?: string;
    type?: string;
    propertyId?: number;
  }): Promise<ApiResponse<{ maintenanceOrders: unknown[] }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request(`/maintenance?${queryParams.toString()}`);
  }

  async getMaintenanceStats(): Promise<ApiResponse<unknown>> {
    return this.request('/maintenance/stats');
  }

  async createMaintenanceOrder(data: unknown): Promise<ApiResponse<unknown>> {
    return this.request('/maintenance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMaintenanceOrder(id: number, data: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMaintenanceOrder(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/maintenance/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadFiles(files: File[]): Promise<ApiResponse<{ files: unknown[] }>> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    // Determine the base URL for the request to ensure headers are handled correctly
    // Since we are passing FormData, we should NOT set Content-Type manually to 'application/json'
    // The ApiClient.request method likely sets 'Content-Type': 'application/json' by default if body is init.
    // We need to override this behavior.

    // Assuming request method handles this or we can pass custom headers.
    // Let's modify request to handle FormData or use fetch directly if needed.
    // However, looking at the pattern, let's try passing the body and letting the browser handle Content-Type boundary.
    // NOTE: If this.request forces application/json, this will fail.

    // Let's check how this.request is implemented. I'll stick to inserting properly first.
    return this.request('/upload/images', {
      method: 'POST',
      body: formData,
    });
  }

  // Equipment Categories
  async getEquipmentCategories(): Promise<ApiResponse<{ equipmentCategories: unknown[] }>> {
    return this.request('/equipment-categories');
  }

  async getEquipmentLocations(propertyId?: number): Promise<ApiResponse<{ equipmentLocations: unknown[] }>> {
    const query = propertyId != null ? `?propertyId=${propertyId}` : '';
    return this.request(`/equipment-locations${query}`);
  }

  async createEquipmentCategory(data: unknown): Promise<ApiResponse<unknown>> {
    return this.request('/equipment-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEquipmentCategory(id: number, data: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/equipment-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEquipmentCategory(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/equipment-categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Equipments
  async getEquipments(params?: { categoryId?: number; propertyId?: number; status?: string; active?: boolean }): Promise<ApiResponse<{ equipments: unknown[] }>> {
    const queryParams = new URLSearchParams();
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId.toString());
    if (params?.propertyId) queryParams.append('propertyId', params.propertyId.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.active !== undefined) queryParams.append('active', params.active.toString());

    const query = queryParams.toString();
    return this.request(`/equipments${query ? `?${query}` : ''}`);
  }

  async getEquipmentById(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/equipments/${id}`);
  }

  async createEquipment(data: unknown): Promise<ApiResponse<unknown>> {
    return this.request('/equipments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEquipment(id: number, data: unknown): Promise<ApiResponse<unknown>> {
    return this.request(`/equipments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEquipment(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/equipments/${id}`, {
      method: 'DELETE',
    });
  }

  // Guest Portal Authentication
  async guestLogin(email: string, password: string): Promise<ApiResponse<{ token: string; guest: unknown }>> {
    return this.request(
      '/guests/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      true,
      false,
      true
    );
  }

  async guestRegister(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    documentNumber?: string;
    password: string;
  }): Promise<ApiResponse<{ token: string; guest: unknown }>> {
    return this.request(
      '/guests/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      true,
      false,
      true
    );
  }

  async guestLoginWithReservation(data: {
    reservationCode: string;
    lastName: string;
    checkInDate: string;
  }): Promise<ApiResponse<{ token: string; guest: unknown }>> {
    return this.request(
      '/guests/login/reservation',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      true,
      false,
      true
    );
  }

  /** Solicita e-mail com link para criar/redefinir senha do portal (público). */
  async guestRequestPasswordResetEmail(data: { email: string }): Promise<ApiResponse<{ message: string }>> {
    return this.request(
      '/guests/public/request-password-email',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      true,
      false,
      true
    );
  }

  /** Define senha usando token recebido por e-mail (público). */
  async guestResetPasswordWithToken(data: {
    token: string;
    newPassword: string;
    confirmPassword?: string;
  }): Promise<ApiResponse<{ message: string }>> {
    return this.request(
      '/guests/public/reset-password-with-token',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      true,
      false,
      true
    );
  }

  async getGuestMe(): Promise<ApiResponse<unknown>> {
    return this.request('/guests/me', {
      method: 'GET',
    }, true, true);
  }

  async getGuestReservations(): Promise<ApiResponse<unknown>> {
    return this.request('/guests/me/reservations', {
      method: 'GET',
    }, true, true);
  }

  async getGuestServiceRequests(status?: string): Promise<ApiResponse<{ requests: unknown[] }>> {
    const query = status ? `?status=${status}` : '';
    return this.request(`/guests/me/requests${query}`, {
      method: 'GET',
    }, true, true);
  }

  async createGuestServiceRequest(data: {
    category: string;
    description: string;
    priority: string;
    type?: string;
  }): Promise<ApiResponse<{ request: unknown }>> {
    return this.request('/guests/me/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true, true);
  }

  async updateGuestMe(data: {
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    documentNumber?: string | null;
    nationality?: string | null;
  }): Promise<ApiResponse<unknown>> {
    return this.request(
      '/guests/me',
      { method: 'PUT', body: JSON.stringify(data) },
      true,
      true
    );
  }

  async guestSubmitWebCheckin(data: {
    reservationId: number;
    fullName?: string;
    phone?: string;
    documentNumber?: string;
    email?: string;
    specialRequests?: string;
    /** URL pública ou relativa retornada pelo upload (obrigatório no backend) */
    documentPhotoUrl?: string;
    selfiePhotoUrl?: string;
    /** Foto ou PDF do contrato assinado (web check-in) */
    signedContractPhotoUrl?: string;
    /** Hóspede marcou que pagou (ou vai pagar) via PIX no portal */
    pixPaymentDeclared?: boolean;
    /** txid retornado pela Efí ao gerar a cobrança (web check-in) */
    pixGatewayTxid?: string;
    pixGatewayProvider?: 'efi' | 'static';
  }): Promise<ApiResponse<{ message: string; reservationId: number }>> {
    return this.request(
      '/guests/me/web-checkin',
      { method: 'POST', body: JSON.stringify(data) },
      true,
      true
    );
  }

  /** Dados PIX para saldo pendente (BR Code + QR) ou configured: false */
  async getGuestWebCheckinPix(reservationId: number): Promise<
    ApiResponse<{
      configured: boolean;
      reason?: string;
      amount?: number;
      brCode?: string;
      qrCodeDataUrl?: string;
      reservationNumber?: string | null;
      merchantName?: string;
      pixKeyMasked?: string;
    }>
  > {
    return this.request(
      `/guests/me/web-checkin/pix?reservationId=${encodeURIComponent(String(reservationId))}`,
      { method: 'GET' },
      true,
      true
    );
  }

  /** Upload de foto do documento ou selfie no web check-in (StorageService / S3 / local). Field: image */
  async guestUploadWebCheckinImage(
    file: File,
    params: { kind: 'document' | 'selfie' | 'signed_contract'; reservationId?: number | null }
  ): Promise<
    ApiResponse<{
      kind: string;
      url: string;
      fullUrl: string;
      filename: string;
      originalName: string;
      size: number;
    }>
  > {
    const formData = new FormData();
    formData.append('image', file);
    const q = new URLSearchParams();
    q.set('kind', params.kind);
    if (params.reservationId != null && params.reservationId > 0) {
      q.set('reservationId', String(params.reservationId));
    }
    return this.request(
      `/guests/me/web-checkin/upload?${q.toString()}`,
      { method: 'POST', body: formData },
      false,
      true
    );
  }

  // Booking Engine
  async getBookingProperties(type?: string): Promise<ApiResponse<{ properties: unknown[] }>> {
    const query = type ? `?type=${type}` : '';
    return this.request(`/booking/properties${query}`);
  }

  async getRegions(): Promise<ApiResponse<{ regions: string[] }>> {
    return this.request('/booking/regions', {
      method: 'GET',
    });
  }

  async checkBookingAvailability(data: {
    propertyType?: string;
    region?: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    stayType?: string;
  }): Promise<ApiResponse<{ units: unknown[] }>> {
    return this.request('/booking/availability', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createBookingReservation(data: {
    unitId: number;
    checkIn: string;
    checkOut: string;
    guests: number;
    stayType: string;
    guestInfo: {
      name: string;
      email: string;
      phone: string;
      cpf: string;
      observations?: string;
    };
    paymentMethod?: string;
    promotionCode?: string;
    paymentStatus?: 'pending' | 'paid';
    pixGatewayProvider?: string;
    pixGatewayTxid?: string;
  }): Promise<ApiResponse<{ reservation: unknown }>> {
    return this.request('/booking/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateBookingPixCharge(data: {
    amount: number;
    description: string;
    guest?: {
      name?: string;
      cpf?: string;
    };
    reservationContext?: {
      unitLabel?: string;
      period?: string;
    };
  }): Promise<ApiResponse<{
    provider: string;
    txid: string;
    brCode: string;
    amount: number;
    description: string;
  }>> {
    return this.request('/booking/pix/charge', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBookingRatePlans(): Promise<ApiResponse<{ ratePlans: unknown[] }>> {
    return this.request('/booking/rate-plans');
  }

  // Setup endpoints
  async checkSetupStatus(): Promise<ApiResponse<{ installed: boolean; propertyCount: number }>> {
    return this.request<{ installed: boolean; propertyCount: number }>('/setup/status', {
      method: 'GET',
    });
  }

  async getSetupProgress(): Promise<ApiResponse<{ items: Record<string, boolean> }>> {
    return this.request<{ items: Record<string, boolean> }>('/setup/progress', {
      method: 'GET',
    });
  }

  async installSetup(data: unknown): Promise<ApiResponse<{
    propertyId: number;
    userIds: number[];
    ratePlanIds: number[];
    unitIds: number[];
  }>> {
    return this.request<{
      propertyId: number;
      userIds: number[];
      ratePlanIds: number[];
      unitIds: number[];
    }>('/setup/install', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

}

export const api = new ApiClient(API_BASE_URL);
