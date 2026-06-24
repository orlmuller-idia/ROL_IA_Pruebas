import type { Metadata } from "next"
import { Landing } from "@/components/landing/landing"

export const metadata: Metadata = {
  title: { absolute: "Rol.IA — Inteligencia comercial autónoma | Guardianes de IA" },
  description:
    "Rol.IA vigila tu pauta, diagnostica por qué no cierras y proyecta tus ventas en tiempo real. Tus guardianes de IA cuidan el embudo 24/7 — y tú decides cuándo dejan de observar y empiezan a actuar.",
  keywords: [
    "inteligencia comercial",
    "IA marketing digital",
    "automatización de ventas",
    "optimización de pauta",
    "diagnóstico de leads",
    "proyección de ventas",
    "ROAS",
    "agencias de marketing",
    "Rol.IA",
    "IDIA",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Rol.IA",
    locale: "es_ES",
    url: "/",
    title: "Rol.IA — Inteligencia comercial autónoma",
    description:
      "Tus guardianes de IA vigilan tu pauta, tus leads y tus cierres 24/7. Tú decides cuándo dejan de observar y empiezan a actuar.",
    images: [{ url: "/rolia-mark.png", alt: "Rol.IA — hub neural de inteligencia comercial" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rol.IA — Inteligencia comercial autónoma",
    description:
      "Tus guardianes de IA vigilan tu pauta, tus leads y tus cierres 24/7. Tú decides cuándo actúan.",
    images: ["/rolia-mark.png"],
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Rol.IA",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://rolia.idiasolutions.com/",
  description:
    "Plataforma de inteligencia comercial con guardianes de IA que monitorean la pauta, diagnostican fugas de conversión y proyectan ventas en tiempo real, con gobernanza humana.",
  inLanguage: "es",
  publisher: {
    "@type": "Organization",
    name: "IDIA Solutions",
    url: "https://rolia.idiasolutions.com/",
  },
  offers: { "@type": "Offer", category: "SaaS" },
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Landing />
    </>
  )
}
