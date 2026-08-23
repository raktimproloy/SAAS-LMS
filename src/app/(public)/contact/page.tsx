import prisma from "@/lib/db";
import { ContactSection } from "@/components/public/home/ContactSection";
import { MapSection } from "@/components/public/home/MapSection";
// import { ReviewSection } from "@/components/public/home/ReviewSection";
import { AOSInit } from "../about/AOSInit";

export default async function ContactPage() {
  const settings = await prisma.siteSetting.findMany({
    where: { 
      setting_key: { 
        in: [
          "contact_page_hero_title", 
          "contact_page_hero_highlight", 
          "contact_page_hero_description"
        ] 
      } 
    }
  });

  const config = settings.reduce((acc, curr) => {
    acc[curr.setting_key] = curr.setting_value;
    return acc;
  }, {} as Record<string, string>);

  const heroTitle = config.contact_page_hero_title || "আমরা আছি আপনার";
  const heroHighlight = config.contact_page_hero_highlight || "যেকোনো প্রয়োজনে";
  const heroDesc = config.contact_page_hero_description || "ভর্তি সংক্রান্ত যেকোনো তথ্য, কোর্সের বিস্তারিত বা যেকোনো জিজ্ঞাসা থাকলে আমাদের সাথে যোগাযোগ করুন। আমাদের সাপোর্ট টিম সবসময় প্রস্তুত আপনার সহায়তায়।";

  return (
    <div>
      <AOSInit />

      {/* Contact Page Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div data-aos="fade-down">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground mb-6 tracking-tight leading-tight whitespace-pre-wrap">
              {heroTitle} <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">{heroHighlight}</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed whitespace-pre-wrap">
              {heroDesc}
            </p>
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <div className="-mt-10 relative z-20">
        <ContactSection />
      </div>

      {/* Map Section */}
      <MapSection />

      {/* Reviews Section */}
      {/* <ReviewSection /> */}

    </div>
  );
}
