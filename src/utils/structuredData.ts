/**
 * Structured Data (JSON-LD) generators for SEO
 * Following Schema.org standards
 */

export interface Organization {
  name: string;
  url: string;
  logo?: string;
  contactPoint?: {
    telephone?: string;
    contactType?: string;
    email?: string;
    areaServed?: string;
  };
  sameAs?: string[];
}

export interface WebSite {
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    "@type": "SearchAction";
    target: {
      "@type": "EntryPoint";
      urlTemplate: string;
    };
    "query-input": string;
  };
}

export interface WebPage {
  "@context": "https://schema.org";
  "@type": "WebPage";
  name: string;
  description?: string;
  url?: string;
  breadcrumb?: {
    "@type": "BreadcrumbList";
    itemListElement: Array<{
      "@type": "ListItem";
      position: number;
      name: string;
      item?: string;
    }>;
  };
}

export interface Product {
  "@context": "https://schema.org";
  "@type": "SoftwareApplication" | "Product" | "Service";
  name: string;
  description?: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    "@type": "Offer";
    price?: string;
    priceCurrency?: string;
    priceValidUntil?: string;
    availability?: string;
    url?: string;
  };
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: string;
    reviewCount: string;
  };
  brand?: {
    "@type": "Brand";
    name: string;
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generate Organization structured data
 */
export function generateOrganization(data: Organization) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: data.name,
    url: data.url,
    logo: data.logo || `${data.url}/logo.png`,
    contactPoint: data.contactPoint
      ? {
          "@type": "ContactPoint",
          telephone: data.contactPoint.telephone,
          contactType: data.contactPoint.contactType || "customer service",
          email: data.contactPoint.email,
          areaServed: data.contactPoint.areaServed || "BR",
        }
      : undefined,
    sameAs: data.sameAs || [],
  };
}

/**
 * Generate Website structured data
 */
export function generateWebSite(data: WebSite) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: data.name,
    url: data.url,
    description: data.description,
    potentialAction: data.potentialAction,
  };
}

/**
 * Generate WebPage structured data
 */
export function generateWebPage(data: Omit<WebPage, "@context" | "@type">) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage" as const,
    ...data,
  };
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbList(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate Product/SoftwareApplication structured data
 */
export function generateProduct(data: Product) {
  return {
    "@context": "https://schema.org",
    ...data,
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQPage(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Review/Rating structured data
 */
export function generateReview(data: {
  name: string;
  reviewBody: string;
  author: string;
  datePublished: string;
  ratingValue: number;
  bestRating?: number;
  worstRating?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "SoftwareApplication",
      name: data.name,
    },
    reviewBody: data.reviewBody,
    author: {
      "@type": "Person",
      name: data.author,
    },
    datePublished: data.datePublished,
    reviewRating: {
      "@type": "Rating",
      ratingValue: data.ratingValue,
      bestRating: data.bestRating || 5,
      worstRating: data.worstRating || 1,
    },
  };
}

/**
 * Generate Service structured data
 */
export function generateService(data: {
  name: string;
  description: string;
  provider: {
    name: string;
    url?: string;
  };
  areaServed?: string;
  serviceType?: string;
  offers?: {
    price?: string;
    priceCurrency?: string;
  };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: data.name,
    description: data.description,
    provider: {
      "@type": "Organization",
      name: data.provider.name,
      url: data.provider.url,
    },
    areaServed: data.areaServed || "BR",
    serviceType: data.serviceType,
    offers: data.offers
      ? {
          "@type": "Offer",
          price: data.offers.price,
          priceCurrency: data.offers.priceCurrency || "BRL",
        }
      : undefined,
  };
}

/**
 * Generate default organization data for Uni | Stays
 */
export function getDefaultOrganization(baseUrl: string): Organization {
  return {
    name: "Uni | Stays",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    contactPoint: {
      contactType: "customer service",
      areaServed: "BR",
    },
    sameAs: [
      "https://linkedin.com/company/unistays",
      "https://twitter.com/unistays",
      "https://instagram.com/unistays",
      "https://youtube.com/@unistays",
    ],
  };
}

