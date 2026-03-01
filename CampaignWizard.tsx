import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowRight, ArrowLeft, Info, X, Plus } from "lucide-react";
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
  "Ad Creative",
  "Review & Launch"
];

// TagInput Component for array fields
const TagInput = ({
  value = [],
  onChange,
  placeholder,
  maxTags = 10,
  variant = "default"
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
  maxTags?: number;
  variant?: "default" | "danger";
}) => {
  const [input, setInput] = useState("");

  const handleKeyPress = (e: React.KeyboardEvent) => {
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
          <span key={index} className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${colorClass}`}>
            {tag}
            <button
              onClick={() => removeTag(index)}
              className="hover:opacity-70"
              type="button"
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
          placeholder={placeholder}
          className="w-full outline-none bg-transparent text-sm"
        />
      )}
      <div className="text-xs text-gray-500 mt-1">
        {value.length}/{maxTags} items • Press Enter to add
      </div>
    </div>
  );
};

const CampaignWizard = () => {
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
      budget: "10", // Changed from 500 to 10
      bidAmount: "0.50", // Changed from 2.50 to 0.50

      // Step 2: Solution
      intentDescription: "",
      problemSolved: "",
      valueProposition: "",

      // Step 3: Context Triggers (CRITICAL)
      triggerContexts: [],
      exampleQueries: [],
      negativeContexts: [],

      // Step 4: Audience
      idealCustomer: "",
      targetCountries: ["US"],
      targetingLanguages: ["en"],

      // Step 5: Creative
      adType: "link",
      adTitle: "",
      adDescription: "",
      cta: "Learn More",
      landingUrl: "",
      promoCode: "",

      // Service fields
      serviceName: "",
      serviceDescription: "",
      serviceEndpoint: "",

      // Step 6: Review
      termsAccepted: false,
    },
  });

  const watched = form.watch();
  const adType = watched.adType;

  const effectiveAdType = adType === "link" && watched.promoCode && watched.promoCode.length >= 3
    ? "recommendation"
    : adType;

  const validateStep = (currentStep: number): boolean => {
    switch(currentStep) {
      case 1: // Basics
        return !!(watched.campaignName && watched.campaignName.length >= 3 &&
                 watched.budget && Number(watched.budget) >= 10 &&
                 watched.bidAmount && Number(watched.bidAmount) > 0);

      case 2: // Solution
        return !!(watched.intentDescription && watched.intentDescription.length >= 20 &&
                 watched.problemSolved && watched.problemSolved.length >= 20 &&
                 watched.valueProposition && watched.valueProposition.length >= 10);

      case 3: // Context Triggers
        return watched.triggerContexts && watched.triggerContexts.length >= 1; // At least 1 required!

      case 4: // Audience
        return !!(watched.idealCustomer && watched.idealCustomer.length >= 20);

      case 5: // Creative
        if (adType === "service") {
          return !!(watched.serviceDescription && watched.serviceDescription.length >= 10);
        }
        return !!(watched.adTitle && watched.adTitle.length >= 5 &&
                 watched.adDescription && watched.adDescription.length >= 20 &&
                 watched.cta && watched.landingUrl && watched.landingUrl.startsWith("https://"));

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      toast.error("Please complete all required fields");
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

      // Convert dollars to cents for API
      const payload = {
        advertiser_id: advertiserId,
        name: watched.campaignName,
        budget: Math.round(Number(watched.budget) * 100), // Convert to cents
        bid_cpc: Math.round(Number(watched.bidAmount) * 100), // Convert to cents
        ad_type: effectiveAdType,

        // Context fields for embeddings
        intent_description: watched.intentDescription,
        ideal_customer: watched.idealCustomer,
        problem_solved: watched.problemSolved,
        value_proposition: watched.valueProposition,
        trigger_contexts: watched.triggerContexts || [],
        example_queries: watched.exampleQueries || [],
        negative_contexts: watched.negativeContexts || [],

        // Targeting
        targeting_countries: watched.targetCountries || ["US"],
        targeting_languages: watched.targetingLanguages || ["en"],

        // Ad content
        title: adType === "service" ? watched.serviceName || watched.campaignName : watched.adTitle,
        body: adType === "service" ? watched.serviceDescription : watched.adDescription,
        cta: adType === "service" ? null : watched.cta,
        landing_url: adType === "service" ? null : watched.landingUrl,
        promo_code: effectiveAdType === "recommendation" ? watched.promoCode : null,
        service_endpoint: adType === "service" ? watched.serviceEndpoint : null,
      };

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

      toast.success("Campaign created! Embeddings are being generated. Your campaign will start matching conversations in 5-10 minutes.");
      navigate("/advertiser/dashboard");
    } catch (err: any) {
      console.error("Campaign creation error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const PreviewPanel = () => {
    if (effectiveAdType === "recommendation") return <RecommendationAdPreview data={watched} />;
    if (adType === "service") return <ServiceAdPreview data={watched} />;
    return <LinkAdPreview data={watched} />;
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
          <Label htmlFor="campaignName">Campaign Name</Label>
          <Input
            id="campaignName"
            placeholder="e.g., Summer Sale 2024"
            {...form.register("campaignName")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="budget">Total Budget ($)</Label>
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
            <Label htmlFor="bidAmount">Max CPC Bid ($)</Label>
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
            <div>• Daily Budget: ${(Number(watched.budget) / 10).toFixed(2)}</div>
            <div>• Est. Clicks: {Math.round(Number(watched.budget) / Number(watched.bidAmount))} total</div>
            <div>• Est. Impressions: {Math.round(Number(watched.budget) / Number(watched.bidAmount) * 50)}</div>
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
            onChange={(tags) => form.setValue("triggerContexts", tags)}
            placeholder="Type a situation and press Enter (e.g., 'user asking about code reviews')"
            maxTags={10}
          />
        </div>

        <div>
          <Label>Example user phrases</Label>
          <TagInput
            value={watched.exampleQueries || []}
            onChange={(tags) => form.setValue("exampleQueries", tags)}
            placeholder="What might users say? (e.g., 'how to review code faster')"
            maxTags={10}
          />
        </div>

        <div>
          <Label>When NOT to show your ad</Label>
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

  const Step5Creative = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Create Your Ad</h2>
        <p className="text-muted-foreground">Design how your ad will appear</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Ad Type</Label>
          <RadioGroup
            value={watched.adType}
            onValueChange={(value) => form.setValue("adType", value as any)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="link" id="link" />
              <Label htmlFor="link">Smart Link Ad</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="service" id="service" />
              <Label htmlFor="service">API Service Integration</Label>
            </div>
          </RadioGroup>
        </div>

        {adType === "service" ? (
          <>
            <div>
              <Label htmlFor="serviceName">Service Name</Label>
              <Input
                id="serviceName"
                placeholder="e.g., Code Review API"
                {...form.register("serviceName")}
              />
            </div>
            <div>
              <Label htmlFor="serviceDescription">Service Description</Label>
              <Textarea
                id="serviceDescription"
                rows={3}
                placeholder="What does your API do?"
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
          </>
        ) : (
          <>
            <div>
              <Label htmlFor="adTitle">Headline *</Label>
              <Input
                id="adTitle"
                placeholder="e.g., Stop Wasting Hours on Code Reviews"
                maxLength={60}
                {...form.register("adTitle")}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {watched.adTitle?.length || 0}/60 characters
              </p>
            </div>

            <div>
              <Label htmlFor="adDescription">Description *</Label>
              <Textarea
                id="adDescription"
                rows={3}
                placeholder="Compelling description of your offer..."
                maxLength={150}
                {...form.register("adDescription")}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {watched.adDescription?.length || 0}/150 characters
              </p>
            </div>

            <div>
              <Label htmlFor="cta">Call to Action *</Label>
              <Select
                value={watched.cta}
                onValueChange={(value) => form.setValue("cta", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Learn More">Learn More</SelectItem>
                  <SelectItem value="Get Started">Get Started</SelectItem>
                  <SelectItem value="Try Free">Try Free</SelectItem>
                  <SelectItem value="View Demo">View Demo</SelectItem>
                  <SelectItem value="Sign Up">Sign Up</SelectItem>
                  <SelectItem value="Shop Now">Shop Now</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="landingUrl">Landing Page URL *</Label>
              <Input
                id="landingUrl"
                type="url"
                placeholder="https://example.com/signup"
                {...form.register("landingUrl")}
              />
            </div>

            <div>
              <Label htmlFor="promoCode">Promo Code (Optional)</Label>
              <Input
                id="promoCode"
                placeholder="e.g., SAVE20"
                {...form.register("promoCode")}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Adding a promo code converts this to a recommendation ad
              </p>
            </div>
          </>
        )}
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
              <span className="font-medium">{watched.campaignName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Budget:</span>
              <span className="font-medium">${watched.budget}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max CPC:</span>
              <span className="font-medium">${watched.bidAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ad Type:</span>
              <span className="font-medium">{effectiveAdType}</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-3">Context Matching</h3>
          <div className="space-y-2 text-sm text-green-800">
            <div>• {watched.triggerContexts?.length || 0} trigger contexts</div>
            <div>• {watched.exampleQueries?.length || 0} example queries</div>
            <div>• {watched.negativeContexts?.length || 0} negative contexts</div>
          </div>
          <p className="text-xs text-green-700 mt-2">
            Your campaign will generate {3 + (watched.triggerContexts?.length > 0 ? 1 : 0) + (watched.exampleQueries?.length > 0 ? 1 : 0) + (watched.negativeContexts?.length > 0 ? 1 : 0)} embeddings for AI matching
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-3">What Happens Next</h3>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Your campaign is created and embeddings generated</li>
            <li>2. AI agents start matching your contexts (5-10 min)</li>
            <li>3. Your ad appears in relevant conversations</li>
            <li>4. Track performance in your dashboard</li>
          </ol>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={watched.termsAccepted}
            onCheckedChange={(checked) => form.setValue("termsAccepted", checked as boolean)}
          />
          <Label htmlFor="terms" className="text-sm">
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
    <Step5Creative key="creative" />,
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
            <h4 className="text-sm font-medium text-muted-foreground">Live Preview</h4>
            <PreviewPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignWizard;