import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import type { SEOProps } from "@/components/seo/SEO";
import {
  generateOrganization,
  generateWebPage,
  generateBreadcrumbList,
  getDefaultOrganization,
  type BreadcrumbItem,
} from "@/utils/structuredData";

interface UseSEOOptions extends Omit<SEOProps, "structuredData"> {
  structuredDataOverride?: object | object[];
  breadcrumbs?: BreadcrumbItem[];
  includeOrganization?: boolean;
  includeWebPage?: boolean;
}

export function useSEO(options: UseSEOOptions): SEOProps {
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;

  const structuredData = useMemo(() => {
    const data: object[] = [];

    // Always include organization
    if (options.includeOrganization !== false) {
      const organization = generateOrganization(getDefaultOrganization(baseUrl));
      data.push(organization);
    }

    // Include WebPage structured data
    if (options.includeWebPage !== false) {
      const webPage = generateWebPage({
        name: options.title || "Uni | Stays",
        description: options.description,
        url: options.url || `${baseUrl}${location.pathname}`,
        breadcrumb: options.breadcrumbs
          ? generateBreadcrumbList(options.breadcrumbs)
          : undefined,
      });
      data.push(webPage);
    }

    // Include custom structured data
    if (options.structuredDataOverride) {
      const overrideArray = Array.isArray(options.structuredDataOverride)
        ? options.structuredDataOverride
        : [options.structuredDataOverride];
      data.push(...overrideArray);
    }

    return data.length === 1 ? data[0] : data;
  }, [
    options.title,
    options.description,
    options.url,
    options.breadcrumbs,
    options.includeOrganization,
    options.includeWebPage,
    options.structuredDataOverride,
    baseUrl,
    location.pathname,
  ]);

  return {
    ...options,
    structuredData,
  };
}

