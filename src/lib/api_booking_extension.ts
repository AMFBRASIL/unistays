
  // Booking Engine
  async getBookingProperties(type ?: string): Promise < ApiResponse < { properties: any[] } >> {
    const query = type ? `?type=${type}` : '';
    return this.request(`/booking/properties${query}`);
}

  async checkBookingAvailability(data: {
    propertyType?: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    stayType?: string;
}): Promise < ApiResponse < { units: any[] } >> {
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
}): Promise < ApiResponse < { reservation: any } >> {
    return this.request('/booking/reservations', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

  async getBookingRatePlans(): Promise < ApiResponse < { ratePlans: any[] } >> {
    return this.request('/booking/rate-plans');
}
}

export const api = new Api();
