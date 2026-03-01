import React, { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowRight, ArrowLeft, Info, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAdvertiser } from "@/contexts/AdvertiserContext";
import StepIndicator from "./StepIndicator";
import LinkAdPreview from "./previews/LinkAdPreview";
import RecommendationAdPreview from "./previews/RecommendationAdPreview";
import ServiceAdPreview from "./previews/ServiceAdPreview";
import { campaignSchema, type CampaignFormData, EXTERNAL_SUPABASE_URL, EXTERNAL_ANON_KEY } from "./types";

const STEPS = [
  "Campaign Basics",
  "Define Solution",
  "Context Triggers",
  "Target Audience",
  "Provide Your Offer",
  "Review & Launch"
];

// TagInput Component for array fields
interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
  maxTags?: number;
  variant?: "default" | "danger";
}

const TagInput: React.FC<TagInputProps> = ({
  value = [],
  onChange,
  placeholder,
  maxTags = 10,
  variant = "default"
}) => {
  const [input, setInput] = useState("");

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim() && value.length < maxTags) {
      e.preventDefault();
      onChange([...value, input.trim()]);
      setInput("");
    }
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const colorClass = variant === "danger"
    ? "bg-red-100 text-red-700 border-red-300"
    : "bg-blue-100 text-blue-700 border-blue-300";

  return (
    <div className={`border rounded-lg p-3 ${variant === "danger" ? "border-red-200" : "border-gray-300"}`}>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag, index) => (
          <span key={index} className={`px-3 py-1 rounded-full text-sm inline-flex items-center gap-2 ${colorClass}`}>
            {tag}
            <button
              onClick={() => removeTag(index)}
              className="hover:opacity-70"
              type="button"
              aria-label={`Remove ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      {value.length < maxTags && (
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={value.length === 0 ? placeholder : `Add more (${maxTags - value.length} remaining)`}
          className="w-full outline-none bg-transparent text-sm"
        />
      )}
      <div className="text-xs text-gray-500 mt-1">
        {value.length}/{maxTags} items • Press Enter to add
      </div>
    </div>
  );
};

const CampaignWizard: React.FC = () => {
  const [, navigate] = useLocation();
  const { advertiserId, companyName, refreshAccessToken } = useAdvertiser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    mode: "onChange",
    defaultValues: {
      // Step 1: Basics
      campaignName: "",
      companyName: companyName || "",
      budget: "10",
      bidAmount: "0.50",

      // Step 2: Solution
      intentDescription: "",
      problemSolved: "",
      valueProposition: "",

      // Step 3: Context Triggers
      triggerContexts: [],
      exampleQueries: [],
      negativeContexts: [],

      // Step 4: Audience
      idealCustomer: "",
      targetCountries: ["US"],
      targetingLanguages: ["en"],

      // Step 5: Offer Details (AI-First Approach)
      adType: "link",
      landingUrl: "",
      promoCode: "",
      keyBenefits: [], // NEW: Array of key benefits
      specialOffer: "", // NEW: Free trial, discount, etc
      successMetrics: "", // NEW: Proof points, testimonials

      // Service fields (if API)
      serviceName: "",
      serviceDescription: "",
      serviceEndpoint: "",
      serviceAuth: "",

      // Legacy fields (we'll auto-generate these from new fields)
      adTitle: "",
      adDescription: "",
      cta: "Learn More",

      // Step 6: Review
      termsAccepted: false,
    },
  });

  const watched = form.watch();
  const adType = watched.adType;

  // Determine effective ad type
  const effectiveAdType = adType === "link" && watched.promoCode && watched.promoCode.length >= 3
    ? "recommendation"
    : adType;

  const validateStep = (currentStep: number): boolean => {
    switch(currentStep) {
      case 1: // Basics
        const budgetNum = Number(watched.budget);
        const bidNum = Number(watched.bidAmount);
        return !!(
          watched.campaignName &&
          watched.campaignName.length >= 3 &&
          watched.budget &&
          !isNaN(budgetNum) &&
          budgetNum >= 10 &&
          watched.bidAmount &&
          !isNaN(bidNum) &&
          bidNum > 0
        );

      case 2: // Solution
        return !!(
          watched.intentDescription &&
          watched.intentDescription.length >= 20 &&
          watched.problemSolved &&
          watched.problemSolved.length >= 20 &&
          watched.valueProposition &&
          watched.valueProposition.length >= 10
        );

      case 3: // Context Triggers
        return !!(
          watched.triggerContexts &&
          Array.isArray(watched.triggerContexts) &&
          watched.triggerContexts.length >= 1
        );

      case 4: // Audience
        return !!(
          watched.idealCustomer &&
          watched.idealCustomer.length >= 20
        );

      case 5: // Offer Details
        if (adType === "service") {
          return !!(
            watched.serviceName &&
            watched.serviceName.length >= 3 &&
            watched.serviceDescription &&
            watched.serviceDescription.length >= 10
          );
        }
        // For link ads, just need the destination URL and at least one key benefit
        return !!(
          watched.landingUrl &&
          watched.landingUrl.startsWith("https://") &&
          watched.keyBenefits &&
          watched.keyBenefits.length >= 1
        );

      default:
        return true;
    }
  };

  const getStepErrorMessage = (currentStep: number): string => {
    switch(currentStep) {
      case 1:
        if (!watched.campaignName || watched.campaignName.length < 3)
          return "Campaign name must be at least 3 characters";
        if (!watched.budget || Number(watched.budget) < 10)
          return "Minimum budget is $10";
        if (!watched.bidAmount || Number(watched.bidAmount) <= 0)
          return "Bid amount must be greater than $0";
        return "";

      case 2:
        if (!watched.intentDescription || watched.intentDescription.length < 20)
          return "Solution description must be at least 20 characters";
        if (!watched.problemSolved || watched.problemSolved.length < 20)
          return "Problem description must be at least 20 characters";
        if (!watched.valueProposition || watched.valueProposition.length < 10)
          return "Value proposition must be at least 10 characters";
        return "";

      case 3:
        if (!watched.triggerContexts || watched.triggerContexts.length === 0)
          return "Add at least one trigger context for when your ad should appear";
        return "";

      case 4:
        if (!watched.idealCustomer || watched.idealCustomer.length < 20)
          return "Ideal customer description must be at least 20 characters";
        return "";

      case 5:
        if (adType === "service") {
          if (!watched.serviceName || watched.serviceName.length < 3)
            return "Service name must be at least 3 characters";
          if (!watched.serviceDescription || watched.serviceDescription.length < 10)
            return "Service description must be at least 10 characters";
        } else {
          if (!watched.landingUrl || !watched.landingUrl.startsWith("https://"))
            return "Please provide a valid destination URL (https://)";
          if (!watched.keyBenefits || watched.keyBenefits.length === 0)
            return "Add at least one key benefit of your solution";
        }
        return "";

      default:
        return "";
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      const errorMsg = getStepErrorMessage(step);
      toast.error(errorMsg || "Please complete all required fields");
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!advertiserId) {
      setError("Session expired. Please sign in again.");
      return;
    }
    if (!watched.termsAccepted) {
      toast.error("Please accept the terms to continue");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const validToken = await refreshAccessToken();
      if (!validToken) {
        setError("Session expired. Please sign in again.");
        setLoading(false);
        return;
      }

      // Safely convert to numbers
      const budgetCents = Math.round((Number(watched.budget) || 10) * 100);
      const bidCents = Math.round((Number(watched.bidAmount) || 0.50) * 100);

      // CRITICAL FIX 1: Generate auto title/description from AI-first fields
      // Backend expects title and body fields for ad_units table
      const autoTitle = watched.valueProposition ||
                       (watched.keyBenefits && watched.keyBenefits[0]) ||
                       watched.campaignName;

      const autoDescription = watched.keyBenefits?.join('. ') ||
                             watched.intentDescription ||
                             watched.problemSolved;

      // CRITICAL FIX 2: Build payload matching backend expectations
      const payload: Record<string, any> = {
        // Core campaign fields (required by campaigns table)
        advertiser_id: advertiserId,
        name: watched.campaignName,
        budget: budgetCents,
        bid_cpc: bidCents,
        ad_type: effectiveAdType,

        // Context fields for embeddings (used by enrich-campaign)
        intent_description: watched.intentDescription,
        ideal_customer: watched.idealCustomer,
        problem_solved: watched.problemSolved, // FIX: Add this field for enrichment
        value_proposition: watched.valueProposition,

        // Context arrays (used by enrich-campaign for context-aware embeddings)
        trigger_contexts: Array.isArray(watched.triggerContexts) ? watched.triggerContexts : [],
        example_queries: Array.isArray(watched.exampleQueries) ? watched.exampleQueries : [],
        negative_contexts: Array.isArray(watched.negativeContexts) ? watched.negativeContexts : [],

        // Targeting
        targeting_countries: Array.isArray(watched.targetCountries) ? watched.targetCountries : ["US"],
        targeting_languages: Array.isArray(watched.targetingLanguages) ? watched.targetingLanguages : ["en"],

        // Ad content (required for ad_units table)
        title: autoTitle.substring(0, 60), // Required field
        body: autoDescription.substring(0, 150), // Required field
        cta: watched.cta || "Learn More",
        landing_url: watched.landingUrl || null,
        promo_code: watched.promoCode || null,

        // Service fields (optional, only for service ads)
        service_endpoint: adType === "service" ? watched.serviceEndpoint : null,
        service_auth: adType === "service" ? watched.serviceAuth : null,

        // CRITICAL FIX 3: Store AI-first fields in metadata for future use
        // These can be used by decide function for dynamic ad generation
        metadata: {
          key_benefits: watched.keyBenefits || [],
          special_offer: watched.specialOffer || null,
          success_metrics: watched.successMetrics || null,
          ai_first_version: "1.0"
        }
      };

      // CRITICAL FIX 4: Override title/body for service ads
      if (adType === "service") {
        payload.title = watched.serviceName || watched.campaignName;
        payload.body = watched.serviceDescription;
        payload.landing_url = null; // Service ads don't have landing URLs
      }

      console.log("Submitting AI-first campaign payload:", payload);

      // CRITICAL FIX 5: Correct endpoint path (no /v1 prefix based on CLAUDE.md)
      const response = await fetch(`${EXTERNAL_SUPABASE_URL}/functions/v1/campaign-create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": EXTERNAL_ANON_KEY,
          "Authorization": `Bearer ${validToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Failed to create campaign");
      }

      const result = await response.json();

      // CRITICAL FIX 6: Trigger enrichment after campaign creation
      // The enrich-campaign function generates embeddings for semantic matching
      if (result.campaign_id) {
        // Fire and forget enrichment (non-blocking)
        fetch(`${EXTERNAL_SUPABASE_URL}/functions/v1/enrich-campaign`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": EXTERNAL_ANON_KEY,
            "Authorization": `Bearer ${validToken}`,
          },
          body: JSON.stringify({ campaign_id: result.campaign_id }),
        }).catch(err => console.log("Enrichment queued:", err));
      }

      toast.success("Campaign created! AI agents will intelligently present your offer in relevant conversations.");
      navigate("/advertiser/dashboard");
    } catch (err: any) {
      console.error("Campaign creation error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const PreviewPanel = () => {
    // Update preview data to include new fields
    const previewData = {
      ...watched,
      // Map new AI-first fields to legacy preview format
      adTitle: watched.valueProposition || "Your Solution",
      adDescription: watched.keyBenefits?.join('. ') || watched.intentDescription || "AI will craft the perfect message",
      cta: "Learn More",
    };

    if (effectiveAdType === "recommendation") return <RecommendationAdPreview data={previewData} />;
    if (adType === "service") return <ServiceAdPreview data={previewData} />;
    return <LinkAdPreview data={previewData} />;
  };

  // Step Components
  const Step1Basics = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Campaign Basics</h2>
        <p className="text-muted-foreground">Start with just $10 to test your campaign performance</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="campaignName">Campaign Name *</Label>
          <Input
            id="campaignName"
            placeholder="e.g., Summer Sale 2024"
            {...form.register("campaignName")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="budget">Total Budget ($) *</Label>
            <Input
              id="budget"
              type="number"
              min="10"
              step="10"
              placeholder="10"
              {...form.register("budget")}
            />
            <p className="text-xs text-muted-foreground mt-1">Minimum $10</p>
          </div>

          <div>
            <Label htmlFor="bidAmount">Max CPC Bid ($) *</Label>
            <Input
              id="bidAmount"
              type="number"
              min="0.10"
              step="0.10"
              placeholder="0.50"
              {...form.register("bidAmount")}
            />
            <p className="text-xs text-muted-foreground mt-1">Cost per click</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Estimated Performance</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <div>• Daily Budget: ${((Number(watched.budget) || 10) / 10).toFixed(2)}</div>
            <div>• Est. Clicks: {Math.round((Number(watched.budget) || 10) / (Number(watched.bidAmount) || 0.5))} total</div>
            <div>• Est. Impressions: {Math.round((Number(watched.budget) || 10) / (Number(watched.bidAmount) || 0.5) * 50)}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const Step2Solution = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Define Your Solution</h2>
        <p className="text-muted-foreground">Help our AI understand what problem you solve</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="problemSolved">What problem does your product solve? *</Label>
          <Textarea
            id="problemSolved"
            rows={3}
            placeholder="Describe the specific pain point your product addresses..."
            maxLength={500}
            {...form.register("problemSolved")}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {watched.problemSolved?.length || 0}/500 characters (min 20)
          </p>
        </div>

        <div>
          <Label htmlFor="intentDescription">Describe your solution *</Label>
          <Textarea
            id="intentDescription"
            rows={3}
            placeholder="Explain how your product/service solves this problem..."
            maxLength={500}
            {...form.register("intentDescription")}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {watched.intentDescription?.length || 0}/500 characters (min 20)
          </p>
        </div>

        <div>
          <Label htmlFor="valueProposition">Value proposition (one sentence) *</Label>
          <Input
            id="valueProposition"
            placeholder="What makes you different?"
            maxLength={150}
            {...form.register("valueProposition")}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {watched.valueProposition?.length || 0}/150 characters (min 10)
          </p>
        </div>
      </div>
    </div>
  );

  const Step3Triggers = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Context Triggers</h2>
        <p className="text-muted-foreground">When should your ad appear in conversations?</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex gap-2">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">This is what makes us different!</h4>
            <p className="text-sm text-blue-800 mt-1">
              We match based on conversation context, not keywords. The AI understands when your solution is relevant.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label>When should your ad appear? (Required) *</Label>
          <TagInput
            value={watched.triggerContexts || []}
            onChange={(tags) => form.setValue("triggerContexts", tags, { shouldValidate: true })}
            placeholder="Type a situation and press Enter (e.g., 'user asking about code reviews')"
            maxTags={10}
          />
        </div>

        <div>
          <Label>Example user phrases (Optional)</Label>
          <TagInput
            value={watched.exampleQueries || []}
            onChange={(tags) => form.setValue("exampleQueries", tags)}
            placeholder="What might users say? (e.g., 'how to review code faster')"
            maxTags={10}
          />
        </div>

        <div>
          <Label>When NOT to show your ad (Optional)</Label>
          <TagInput
            value={watched.negativeContexts || []}
            onChange={(tags) => form.setValue("negativeContexts", tags)}
            placeholder="Avoid these contexts (e.g., 'looking for free tools')"
            maxTags={10}
            variant="danger"
          />
        </div>
      </div>
    </div>
  );

  const Step4Audience = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Target Audience</h2>
        <p className="text-muted-foreground">Who needs your solution?</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="idealCustomer">Describe your ideal customer *</Label>
          <Textarea
            id="idealCustomer"
            rows={3}
            placeholder="e.g., Development teams at startups who ship code daily and need faster code reviews..."
            maxLength={500}
            {...form.register("idealCustomer")}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {watched.idealCustomer?.length || 0}/500 characters (min 20)
          </p>
        </div>

        <div>
          <Label>Target Countries</Label>
          <Select
            value={watched.targetCountries?.[0] || "US"}
            onValueChange={(value) => form.setValue("targetCountries", [value])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="US">United States</SelectItem>
              <SelectItem value="CA">Canada</SelectItem>
              <SelectItem value="UK">United Kingdom</SelectItem>
              <SelectItem value="AU">Australia</SelectItem>
              <SelectItem value="GLOBAL">All Countries</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Language</Label>
          <Select
            value={watched.targetingLanguages?.[0] || "en"}
            onValueChange={(value) => form.setValue("targetingLanguages", [value])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="all">All Languages</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  // NEW AI-FIRST STEP 5: Provide Your Offer
  const Step5Offer = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Provide Your Offer</h2>
        <p className="text-muted-foreground">Share information AI agents will use to present your solution</p>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex gap-2">
          <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-purple-900">AI-First Approach</h4>
            <p className="text-sm text-purple-800 mt-1">
              You're not writing ad copy. You're providing information that AI agents will naturally
              weave into conversations when your solution is relevant.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Offer Type</Label>
          <RadioGroup
            value={watched.adType}
            onValueChange={(value) => form.setValue("adType", value as any)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="link" id="link" />
              <Label htmlFor="link">Web Destination (Link to your site)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="service" id="service" />
              <Label htmlFor="service">API Service (Direct integration)</Label>
            </div>
          </RadioGroup>
        </div>

        {adType === "service" ? (
          <>
            <div>
              <Label htmlFor="serviceName">Service Name *</Label>
              <Input
                id="serviceName"
                placeholder="e.g., Code Review API"
                {...form.register("serviceName")}
              />
            </div>
            <div>
              <Label htmlFor="serviceDescription">What does your API do? *</Label>
              <Textarea
                id="serviceDescription"
                rows={3}
                placeholder="Describe the capabilities and use cases..."
                {...form.register("serviceDescription")}
              />
            </div>
            <div>
              <Label htmlFor="serviceEndpoint">API Endpoint (Optional)</Label>
              <Input
                id="serviceEndpoint"
                placeholder="https://api.example.com/endpoint"
                {...form.register("serviceEndpoint")}
              />
            </div>
            <div>
              <Label htmlFor="serviceAuth">API Auth Token (Optional)</Label>
              <Input
                id="serviceAuth"
                type="password"
                placeholder="Bearer token or API key"
                {...form.register("serviceAuth")}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <Label htmlFor="landingUrl">Where should interested users go? *</Label>
              <Input
                id="landingUrl"
                type="url"
                placeholder="https://yoursite.com/signup"
                {...form.register("landingUrl")}
              />
              <p className="text-xs text-muted-foreground mt-1">
                The destination URL where users will learn more
              </p>
            </div>

            <div>
              <Label>Key Benefits (Required) *</Label>
              <TagInput
                value={watched.keyBenefits || []}
                onChange={(tags) => form.setValue("keyBenefits", tags, { shouldValidate: true })}
                placeholder="Add a key benefit and press Enter (e.g., 'Reduces review time by 80%')"
                maxTags={5}
              />
              <p className="text-xs text-muted-foreground mt-1">
                AI will emphasize different benefits based on user needs
              </p>
            </div>

            <div>
              <Label htmlFor="specialOffer">Special Offer or Incentive (Optional)</Label>
              <Input
                id="specialOffer"
                placeholder="e.g., 14-day free trial, no credit card required"
                {...form.register("specialOffer")}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Free trials, discounts, or other incentives
              </p>
            </div>

            <div>
              <Label htmlFor="promoCode">Promo/Tracking Code (Optional)</Label>
              <Input
                id="promoCode"
                placeholder="e.g., FASTPR50"
                maxLength={20}
                {...form.register("promoCode")}
              />
              <p className="text-xs text-muted-foreground mt-1">
                AI will mention this when users show high intent
              </p>
            </div>

            <div>
              <Label htmlFor="successMetrics">Success Metrics or Proof (Optional)</Label>
              <Textarea
                id="successMetrics"
                rows={2}
                placeholder="e.g., Used by 500+ teams, 4.8/5 star rating, SOC2 certified"
                {...form.register("successMetrics")}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Credibility indicators AI can reference
              </p>
            </div>
          </>
        )}

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">How AI Will Use This Information</h4>
          <ul className="text-sm space-y-1 text-gray-600">
            <li>• Naturally mention your solution when context matches</li>
            <li>• Emphasize relevant benefits based on user's specific needs</li>
            <li>• Share special offers when users show buying intent</li>
            <li>• Adjust tone and formality to match the conversation</li>
            <li>• Provide proof points when credibility matters</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const Step6Review = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Review & Launch</h2>
        <p className="text-muted-foreground">Review your campaign before launching</p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Campaign Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{watched.campaignName || "Not set"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Budget:</span>
              <span className="font-medium">${watched.budget || "10"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max CPC:</span>
              <span className="font-medium">${watched.bidAmount || "0.50"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Offer Type:</span>
              <span className="font-medium capitalize">{adType === "service" ? "API Service" : "Web Destination"}</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-3">AI Matching Configuration</h3>
          <div className="space-y-2 text-sm text-green-800">
            <div>• {watched.triggerContexts?.length || 0} trigger contexts</div>
            <div>• {watched.exampleQueries?.length || 0} example queries</div>
            <div>• {watched.negativeContexts?.length || 0} negative contexts</div>
            <div>• {watched.keyBenefits?.length || 0} key benefits for AI to emphasize</div>
          </div>
          <p className="text-xs text-green-700 mt-2">
            Your campaign will generate {
              4 +
              (watched.triggerContexts?.length > 0 ? 1 : 0) +
              (watched.exampleQueries?.length > 0 ? 1 : 0) +
              (watched.negativeContexts?.length > 0 ? 1 : 0)
            } embeddings for semantic matching
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-3">AI Agent Behavior</h3>
          <div className="text-sm text-purple-800 space-y-2">
            <p>AI agents will:</p>
            <ul className="space-y-1 ml-4">
              <li>• Identify when users need: <em>{watched.problemSolved?.substring(0, 50)}...</em></li>
              <li>• Present your solution naturally in conversation</li>
              <li>• Emphasize benefits that match user context</li>
              {watched.specialOffer && <li>• Mention: {watched.specialOffer}</li>}
              {watched.promoCode && <li>• Share code {watched.promoCode} when appropriate</li>}
            </ul>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={watched.termsAccepted}
            onCheckedChange={(checked) => form.setValue("termsAccepted", checked as boolean)}
          />
          <Label htmlFor="terms" className="text-sm cursor-pointer">
            I agree to the terms of service and understand that campaigns are non-refundable
          </Label>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );

  const stepComponents = [
    <Step1Basics key="basics" />,
    <Step2Solution key="solution" />,
    <Step3Triggers key="triggers" />,
    <Step4Audience key="audience" />,
    <Step5Offer key="offer" />,
    <Step6Review key="review" />
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <StepIndicator currentStep={step} steps={STEPS} />

      <div className="flex gap-8">
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {stepComponents[step - 1]}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between pt-6 pb-4">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="h-11"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            ) : <div />}

            {step < 6 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!validateStep(step)}
                className="h-11"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !watched.termsAccepted}
                className="h-11"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating campaign...
                  </>
                ) : (
                  <>🚀 Launch Campaign</>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-24 space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">AI Presentation Preview</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-3">Example of how AI might present your offer:</p>
              <div className="bg-white rounded-lg p-3 border text-sm">
                <p className="text-gray-700 mb-2">
                  "Based on your need for {watched.problemSolved?.split(' ').slice(0, 5).join(' ') || 'this solution'}..."
                </p>
                {watched.keyBenefits && watched.keyBenefits.length > 0 && (
                  <p className="text-gray-700 mb-2">
                    "This tool {watched.keyBenefits[0]?.toLowerCase()}. {watched.keyBenefits[1] ? `It also ${watched.keyBenefits[1].toLowerCase()}.` : ''}"
                  </p>
                )}
                {watched.specialOffer && (
                  <p className="text-gray-700 mb-2">
                    "They're offering {watched.specialOffer}."
                  </p>
                )}
                {watched.promoCode && (
                  <p className="text-blue-600">
                    "Use code {watched.promoCode} for a special discount."
                  </p>
                )}
                <a href="#" className="text-blue-600 underline text-sm">
                  Learn more →
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                AI adapts tone and emphasis based on conversation context
              </p>
            </div>
            <PreviewPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignWizard;