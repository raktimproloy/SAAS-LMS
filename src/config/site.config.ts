import type { MotifId } from "@/components/public/motif/types";

export const siteConfig = {
  instituteName: "Institute Web",
  tagline: "Your Gateway to Medical Success",
  logo: "/assets/logo.png",
  /** Public-page decorative motif — switch to "medical" for doctor theme */
  motif: "bangla" as MotifId,
  theme: {
    primary: "#0D9488",
    secondary: "#7C3AED",
    accent: "#F59E0B",
  },
  contact: {
    phone: "+880-XXXX-XXXXXX",
    email: "info@instituteweb.com",
    whatsapp: "+880XXXXXXXXXX",
    address: "Dhaka, Bangladesh",
  },
  features: {
    smsEnabled: false,
    onlineExamEnabled: true,
    publicExamEnabled: true,
    videoCourseEnabled: true,
    multiLanguage: true,
    defaultLanguage: "bn",
  },
  seo: {
    defaultTitle: "Institute Web - Best Medical Coaching",
    defaultDescription: "Join Institute Web for the best medical admission coaching and HSC/SSC academic care.",
  }
}
