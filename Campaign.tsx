import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAdvertiser } from "@/contexts/AdvertiserContext";
import DashboardLayout from "@/components/advertiser/DashboardLayout";
import CampaignWizard from "@/components/advertiser/campaign/CampaignWizard";

const Campaign = () => {
  const [, navigate] = useLocation();
  const { advertiserId, companyName, isLoading, clearAdvertiser } = useAdvertiser();

  useEffect(() => {
    if (!isLoading && !advertiserId) {
      navigate("/advertiser/login");
    }
  }, [isLoading, advertiserId, navigate]);

  if (isLoading || (!advertiserId && !isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleLogout = () => {
    clearAdvertiser();
    navigate("/advertiser/login");
  };

  return (
    <DashboardLayout companyName={companyName} onLogout={handleLogout}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1" data-testid="text-campaign-title">
            Create Campaign
          </h1>
          <p className="text-muted-foreground text-sm">
            Create context-aware ads that appear when users need them most
          </p>
        </div>
        <CampaignWizard />
      </div>
    </DashboardLayout>
  );
};

export default Campaign;