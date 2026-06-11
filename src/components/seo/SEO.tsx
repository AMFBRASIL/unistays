import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  siteName?: string;
  locale?: string;
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  twitterSite?: string;
  twitterCreator?: string;
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
  structuredData?: object | object[];
  robots?: string;
  alternateLang?: { lang: string; url: string }[];
}

const defaultProps: Partial<SEOProps> = {
  siteName: "Uni | Stays",
  locale: "pt_BR",
  type: "website",
  twitterCard: "summary_large_image",
  author: "Uni Stays",
  noindex: false,
  nofollow: false,
};

export function SEO(props: SEOProps) {
  const location = useLocation();
  const {
    title,
    description,
    keywords,
    author,
    image,
    url,
    type,
    siteName,
    locale,
    twitterCard,
    twitterSite,
    twitterCreator,
    noindex,
    nofollow,
    canonical,
    structuredData,
    robots,
    alternateLang,
  } = { ...defaultProps, ...props };

  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const finalUrl = url || `${baseUrl}${location.pathname}`;
  const finalImage = image || `${baseUrl}/og-image.png`;
  const finalTitle = title 
    ? `${title} | ${siteName}`
    : `${siteName} - Sistema de Gestão Hoteleira`;
  const robotsContent = robots || [
    noindex && "noindex",
    nofollow && "nofollow",
  ]
    .filter(Boolean)
    .join(", ") || "index, follow";

  useEffect(() => {
    // Title
    if (title) {
      document.title = finalTitle;
    }

    // Basic Meta Tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      if (!content) return;
      const attribute = property ? "property" : "name";
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.content = content;
    };

    // Remove existing meta tags
    const removeMetaTag = (name: string, property = false) => {
      const attribute = property ? "property" : "name";
      const element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (element) {
        element.remove();
      }
    };

    // Update basic meta tags
    if (description) updateMetaTag("description", description);
    if (keywords) updateMetaTag("keywords", keywords);
    if (author) updateMetaTag("author", author);
    if (robotsContent) updateMetaTag("robots", robotsContent);

    // Open Graph Tags
    updateMetaTag("og:title", finalTitle, true);
    if (description) updateMetaTag("og:description", description, true);
    updateMetaTag("og:url", finalUrl, true);
    updateMetaTag("og:type", type || "website", true);
    updateMetaTag("og:image", finalImage, true);
    if (siteName) updateMetaTag("og:site_name", siteName, true);
    if (locale) updateMetaTag("og:locale", locale, true);

    // Twitter Card Tags
    updateMetaTag("twitter:card", twitterCard || "summary_large_image");
    updateMetaTag("twitter:title", finalTitle);
    if (description) updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", finalImage);
    if (twitterSite) updateMetaTag("twitter:site", twitterSite);
    if (twitterCreator) updateMetaTag("twitter:creator", twitterCreator);

    // Canonical URL
    const canonicalUrl = canonical || finalUrl;
    let canonicalLink = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;

    // Alternate Languages
    if (alternateLang && alternateLang.length > 0) {
      // Remove existing alternate links
      document.querySelectorAll("link[rel='alternate'][hreflang]").forEach((el) => el.remove());
      
      alternateLang.forEach(({ lang, url }) => {
        const link = document.createElement("link");
        link.rel = "alternate";
        link.hreflang = lang;
        link.href = url;
        document.head.appendChild(link);
      });
    }

    // Structured Data (JSON-LD)
    if (structuredData) {
      // Remove existing structured data
      document.querySelectorAll("script[type='application/ld+json']").forEach((el) => {
        const id = el.getAttribute("data-seo-id");
        if (id === "seo-structured-data") {
          el.remove();
        }
      });

      const dataArray = Array.isArray(structuredData) ? structuredData : [structuredData];
      
      dataArray.forEach((data, index) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-seo-id", "seo-structured-data");
        script.textContent = JSON.stringify(data, null, 2);
        document.head.appendChild(script);
      });
    }

    // Cleanup function
    return () => {
      // Note: We don't remove meta tags on cleanup to avoid flickering
      // They will be updated on the next SEO component mount
    };
  }, [
    title,
    description,
    keywords,
    author,
    image,
    url,
    type,
    siteName,
    locale,
    twitterCard,
    twitterSite,
    twitterCreator,
    noindex,
    nofollow,
    canonical,
    structuredData,
    robots,
    alternateLang,
    finalTitle,
    finalUrl,
    finalImage,
    robotsContent,
    location.pathname,
  ]);

  return null;
}

