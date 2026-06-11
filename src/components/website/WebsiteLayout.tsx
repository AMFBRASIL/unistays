import { ReactNode } from "react";
import { WebsiteHeader } from "./WebsiteHeader";
import { WebsiteFooter } from "./WebsiteFooter";
import { SEO } from "@/components/seo/SEO";

interface WebsiteLayoutProps {
  children: ReactNode;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: "website" | "article" | "product";
    structuredData?: object | object[];
    noindex?: boolean;
    nofollow?: boolean;
    canonical?: string;
    breadcrumbs?: Array<{ name: string; url: string }>;
  };
}

export function WebsiteLayout({ children, seo }: WebsiteLayoutProps) {
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  
  return (
    <>
      <SEO
        title={seo?.title}
        description={seo?.description}
        keywords={seo?.keywords}
        image={seo?.image}
        url={seo?.url}
        type={seo?.type}
        structuredData={seo?.structuredData}
        noindex={seo?.noindex}
        nofollow={seo?.nofollow}
        canonical={seo?.canonical}
        siteName="Uni | Stays"
        locale="pt_BR"
        twitterCard="summary_large_image"
      />
      <div className="min-h-screen bg-white">
        <WebsiteHeader />
        <main className="pt-16">
          {children}
        </main>
        <WebsiteFooter />
      </div>
    </>
  );
}
