import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  X,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  Play,
  Pause,
  TrendingUp,
  Eye,
  MousePointer,
  DollarSign,
  Target,
  Brain,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Globe,
  MessageSquare,
  Tag,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { useAdvertiser } from "@/contexts/AdvertiserContext";
import { EXTERNAL_SUPABASE_URL, EXTERNAL_ANON_KEY } from "./types";

interface CampaignData {
  id: string;
  name: string;
  status: string;
  ad_type: string;
  created_at: string;
  budget: number;
  budget_spent: number;
  bid_cpc: number;

  // Performance metrics
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  quality_score: number;

  // Solution fields
  intent_description: string;
  problem_solved: string;
  value_proposition: string;
  ideal_customer: string;

  // Context arrays
  trigger_contexts: string[];
  example_queries: string[];
  negative_contexts: string[];

  // Targeting
  targeting_countries: string[];
  targeting_languages: string[];

  // Ad content
  title: string;
  body: string;
  cta: string;
  landing_url: string;
  promo_code?: string;

  // Service fields
  service_name?: string;
  service_description?: string;
  service_endpoint?: string;

  // AI-first fields (stored in metadata)
  metadata?: {
    key_benefits?: string[];
    special_offer?: string;
    success_metrics?: string;
    enriched_at?: string;
    embeddings?: {
      total_embeddings?: number;
      has_context_embeddings?: boolean;
    };
  };
}

// Collapsible section component
const CollapsibleSection = ({
  title,
  icon: Icon,
  children,
  defaultOpen = true
}: {
  title: string;
  icon?: any;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
          <span className="font-medium text-sm">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isOpen && (
        <div className="p-4 bg-background/50">
          {children}
        </div>
      )}
    </div>
  );
};

// Info row component
const InfoRow = ({ label, value, icon: Icon }: { label: string; value: any; icon?: any }) => (
  <div className="flex items-start justify-between py-2">
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </div>
    <div className="text-sm font-medium text-right max-w-[60%]">
      {value || <span className="text-muted-foreground">Not set</span>}
    </div>
  </div>
);

// Tag list component
const TagList = ({ tags, variant = "default" }: { tags: string[]; variant?: "default" | "danger" }) => {
  if (!tags || tags.length === 0) return <span className="text-sm text-muted-foreground">None set</span>;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <span
          key={index}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            variant === "danger"
              ? "bg-destructive/10 text-destructive"
              : "bg-primary/10 text-primary"
          }`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
};

const CampaignDetails = () => {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/advertiser/campaign/:id");
  const { advertiserId, refreshAccessToken } = useAdvertiser();
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const campaignId = params?.id;

  useEffect(() => {
    if (campaignId && advertiserId) {
      fetchCampaignDetails();
    }
  }, [campaignId, advertiserId]);

  const fetchCampaignDetails = async () => {
    try {
      const token = await refreshAccessToken();
      if (!token) {
        navigate("/advertiser/login");
        return;
      }

      const response = await fetch(
        `${EXTERNAL_SUPABASE_URL}/rest/v1/campaigns?id=eq.${campaignId}&select=*`,
        {
          headers: {
            "apikey": EXTERNAL_ANON_KEY,
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch campaign");

      const data = await response.json();
      if (data && data[0]) {
        setCampaign(data[0]);
      }
    } catch (error) {
      console.error("Error fetching campaign:", error);
      toast.error("Failed to load campaign details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!campaign) return;

    setUpdating(true);
    try {
      const token = await refreshAccessToken();
      const newStatus = campaign.status === 'active' ? 'paused' : 'active';

      const response = await fetch(
        `${EXTERNAL_SUPABASE_URL}/rest/v1/campaigns?id=eq.${campaign.id}`,
        {
          method: "PATCH",
          headers: {
            "apikey": EXTERNAL_ANON_KEY,
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!response.ok) throw new Error("Failed to update status");

      setCampaign({ ...campaign, status: newStatus });
      toast.success(`Campaign ${newStatus === 'active' ? 'resumed' : 'paused'}`);
    } catch (error) {
      toast.error("Failed to update campaign status");
    } finally {
      setUpdating(false);
    }
  };

  const copyTrackingUrl = () => {
    if (campaign?.landing_url) {
      navigator.clipboard.writeText(campaign.landing_url);
      toast.success("URL copied to clipboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Campaign not found</p>
          <Button onClick={() => navigate("/advertiser/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const ctr = campaign.impressions > 0
    ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
    : "0.00";

  const budgetRemaining = campaign.budget - campaign.budget_spent;
  const budgetPercentUsed = (campaign.budget_spent / campaign.budget) * 100;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold">{campaign.name}</h1>
            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
              {campaign.status}
            </Badge>
            <Badge variant="outline">
              {campaign.ad_type === 'service' ? 'API Service' :
               campaign.promo_code ? 'Recommendation' : 'Link Ad'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleStatusToggle}
              disabled={updating}
            >
              {campaign.status === 'active' ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/advertiser/campaign/${campaign.id}/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/advertiser/dashboard")}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="text-2xl font-semibold">${(campaign.budget / 100).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ${(budgetRemaining / 100).toFixed(2)} remaining
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-muted-foreground/20" />
            </div>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${Math.min(budgetPercentUsed, 100)}%` }}
              />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Impressions</p>
                <p className="text-2xl font-semibold">{campaign.impressions.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Views</p>
              </div>
              <Eye className="w-8 h-8 text-muted-foreground/20" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clicks</p>
                <p className="text-2xl font-semibold">{campaign.clicks.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{ctr}% CTR</p>
              </div>
              <MousePointer className="w-8 h-8 text-muted-foreground/20" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quality Score</p>
                <p className="text-2xl font-semibold">{campaign.quality_score?.toFixed(2) || "0.50"}</p>
                <p className="text-xs text-muted-foreground mt-1">Performance</p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground/20" />
            </div>
          </Card>
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Budget & Bidding */}
            <CollapsibleSection title="Budget & Bidding" icon={DollarSign}>
              <div className="space-y-1">
                <InfoRow label="Total Budget" value={`$${(campaign.budget / 100).toFixed(2)}`} />
                <InfoRow label="Spent" value={`$${(campaign.budget_spent / 100).toFixed(2)}`} />
                <InfoRow label="Bid per Click" value={`$${(campaign.bid_cpc / 100).toFixed(2)}`} />
                <InfoRow label="Remaining" value={`$${(budgetRemaining / 100).toFixed(2)}`} />
              </div>
            </CollapsibleSection>

            {/* Solution Details */}
            <CollapsibleSection title="Solution Details" icon={Sparkles}>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Problem Solved</p>
                  <p className="text-sm">{campaign.problem_solved}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Solution Description</p>
                  <p className="text-sm">{campaign.intent_description}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Value Proposition</p>
                  <p className="text-sm font-medium">{campaign.value_proposition}</p>
                </div>
              </div>
            </CollapsibleSection>

            {/* Context Triggers */}
            <CollapsibleSection title="Context Triggers" icon={Brain}>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Trigger Contexts</p>
                  <TagList tags={campaign.trigger_contexts} />
                </div>
                {campaign.example_queries?.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Example Queries</p>
                    <TagList tags={campaign.example_queries} />
                  </div>
                )}
                {campaign.negative_contexts?.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Negative Contexts</p>
                    <TagList tags={campaign.negative_contexts} variant="danger" />
                  </div>
                )}
              </div>
            </CollapsibleSection>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Ad Creative / Offer */}
            <CollapsibleSection title="Offer Details" icon={MessageSquare}>
              <div className="space-y-4">
                {campaign.ad_type === 'service' ? (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Service Name</p>
                      <p className="text-sm font-medium">{campaign.service_name || campaign.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Service Description</p>
                      <p className="text-sm">{campaign.service_description || campaign.body}</p>
                    </div>
                    {campaign.service_endpoint && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">API Endpoint</p>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {campaign.service_endpoint}
                        </code>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* AI-First Fields */}
                    {campaign.metadata?.key_benefits && campaign.metadata.key_benefits.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Key Benefits</p>
                        <div className="space-y-1">
                          {campaign.metadata.key_benefits.map((benefit, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-primary mt-0.5" />
                              <span className="text-sm">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {campaign.metadata?.special_offer && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Special Offer</p>
                        <p className="text-sm font-medium text-primary">{campaign.metadata.special_offer}</p>
                      </div>
                    )}

                    {campaign.promo_code && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Promo Code</p>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono bg-muted px-3 py-1 rounded">
                            {campaign.promo_code}
                          </code>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => {
                              navigator.clipboard.writeText(campaign.promo_code!);
                              toast.success("Promo code copied");
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {campaign.landing_url && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Landing URL</p>
                        <div className="flex items-center gap-2">
                          <a
                            href={campaign.landing_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            {new URL(campaign.landing_url).hostname}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={copyTrackingUrl}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {campaign.metadata?.success_metrics && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Success Metrics</p>
                        <p className="text-sm">{campaign.metadata.success_metrics}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CollapsibleSection>

            {/* Targeting */}
            <CollapsibleSection title="Target Audience" icon={Target}>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ideal Customer</p>
                  <p className="text-sm">{campaign.ideal_customer}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Countries</p>
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      <span className="text-sm">
                        {campaign.targeting_countries?.join(", ") || "All"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Languages</p>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span className="text-sm">
                        {campaign.targeting_languages?.map(l => l.toUpperCase()).join(", ") || "All"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* AI Enrichment Status */}
            {campaign.metadata?.enriched_at && (
              <CollapsibleSection title="AI Enrichment" icon={Brain} defaultOpen={false}>
                <div className="space-y-2">
                  <InfoRow
                    label="Enriched"
                    value={new Date(campaign.metadata.enriched_at).toLocaleDateString()}
                  />
                  <InfoRow
                    label="Total Embeddings"
                    value={campaign.metadata.embeddings?.total_embeddings || "Unknown"}
                  />
                  <InfoRow
                    label="Context Embeddings"
                    value={campaign.metadata.embeddings?.has_context_embeddings ? "Yes" : "No"}
                  />
                  <div className="mt-3 p-2 bg-primary/5 rounded text-xs text-muted-foreground">
                    AI has analyzed this campaign and generated semantic embeddings for intelligent matching
                  </div>
                </div>
              </CollapsibleSection>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-muted-foreground pt-4 border-t">
          Created {new Date(campaign.created_at).toLocaleDateString()} ·
          Campaign ID: {campaign.id.split('-')[0]}
        </div>
      </main>
    </div>
  );
};

export default CampaignDetails;