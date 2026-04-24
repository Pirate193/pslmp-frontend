import CallToAction from "@/components/landingpage/calltoaction"
import CommunitySection from "@/components/landingpage/communitysection"
import FeaturesSection from "@/components/landingpage/featuresection"
import FooterSection from "@/components/landingpage/footer"
import HeroSection from "@/components/landingpage/hero-section"
import IntegrationsSection from "@/components/landingpage/intergration"
import WallOfLoveSection from "@/components/landingpage/testimonials"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden ">
     <HeroSection />
     <FeaturesSection />
     <IntegrationsSection />
     <WallOfLoveSection />
     <CommunitySection />
     <CallToAction />
     <FooterSection />
    </div>
  )
}
