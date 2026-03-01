import { useState, type KeyboardEvent } from "react";
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
import { Loader2, ArrowRight, ArrowLeft, X, Info, ChevronDown, ChevronUp, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAdvertiser } from "@/contexts/AdvertiserContext";
import { campaignSchema, type CampaignFormData, EXTERNAL_SUPABASE_URL, EXTERNAL_ANON_KEY } from "./types";

const STEPS = [
  "Basics",
  "Solution",
  "Triggers",
  "Audience",
  "Offer",
  "Launch"
];

// Simplified TagInput with cleaner design
interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
  maxTags?: number;
  required?: boolean;
}

const TagInput = ({
  value = [],
  onChange,
  placeholder,
  maxTags = 10,
  required = false
}: TagInputProps) => {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim() && value.length < maxTags) {
      e.preventDefault();
      onChange([...value, input.trim()]);
      setInput("");
    }
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={`space-y-2 ${isFocused ? 'scale-[1.01]' : ''} transition-transform duration-200`}>
      {/* Show tags as simple pills */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
            >
              {tag}
              <button
                onClick={() => removeTag(index)}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                type="button"
                aria-label={`Remove ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Simplified input */}
      {value.length < maxTags && (
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={value.length === 0 ? placeholder : `Add another...`}
            className="w-full px-4 py-3 bg-muted/50 rounded-lg outline-none focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
          />
          {isFocused && (
            <span className="absolute right-3 top-3.5 text-xs text-muted-foreground animate-pulse">
              Press Enter
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Collapsible section for optional fields
const CollapsibleSection = ({
  title,
  children,
  defaultOpen = false
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors flex items-center justify-between text-sm font-medium"
      >
        {title}
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isOpen && (
        <div className="p-4 space-y-4 bg-background/50">
          {children}
        </div>
      )}
    </div>
  );
};

// Simple field with integrated label and no extra text
const SimpleField = ({
  label,
  required,
  error,
  children
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-foreground/80">
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
    {children}
    {error && (
      <p className="text-xs text-destructive flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {error}
      </p>
    )}
  </div>
);

const CampaignWizard = () => {
  const [, navigate] = useLocation();
  const { advertiserId, companyName, refreshAccessToken } = useAdvertiser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOptional, setShowOptional] = useState(false);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    mode: "onChange",
    defaultValues: {
      campaignName: "",
      companyName: companyName || "",
      budget: "10",
      bidAmount: "0.50",
      intentDescription: "",
      problemSolved: "",
      valueProposition: "",
      triggerContexts: [],
      exampleQueries: [],
      negativeContexts: [],
      idealCustomer: "",
      targetCountries: ["US"],
      targetingLanguages: ["en"],
      adType: "link",
      landingUrl: "",
      promoCode: "",
      keyBenefits: [],
      specialOffer: "",
      successMetrics: "",
      serviceName: "",
      serviceDescription: "",
      serviceEndpoint: "",
      serviceAuth: "",
      adTitle: "",
      adDescription: "",
      cta: "Learn More",
      termsAccepted: false,
    },
  });

  const watched = form.watch();
  const adType = watched.adType;

  const validateStep = (currentStep: number): boolean => {
    switch(currentStep) {
      case 1: // Basics
        const budgetNum = Number(watched.budget);
        const bidNum = Number(watched.bidAmount);
        return !!(
          watched.campaignName?.length >= 3 &&
          budgetNum >= 10 &&
          bidNum > 0
        );

      case 2: // Solution
        return !!(
          watched.intentDescription?.length >= 20 &&
          watched.problemSolved?.length >= 20 &&
          watched.valueProposition?.length >= 10
        );

      case 3: // Triggers
        return watched.triggerContexts?.length >= 1;

      case 4: // Audience
        return watched.idealCustomer?.length >= 20;

      case 5: // Offer
        if (adType === "service") {
          return !!(
            watched.serviceName?.length >= 3 &&
            watched.serviceDescription?.length >= 10
          );
        }
        return !!(
          watched.landingUrl?.startsWith("https://") &&
          watched.keyBenefits?.length >= 1
        );

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!advertiserId) {
      setError("Session expired. Please sign in again.");
      return;
    }
    if (!watched.termsAccepted) {
      setError("Please accept the terms to continue");
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

      const budgetCents = Math.round((Number(watched.budget) || 10) * 100);
      const bidCents = Math.round((Number(watched.bidAmount) || 0.50) * 100);

      const autoTitle = watched.valueProposition ||
                       (watched.keyBenefits && watched.keyBenefits[0]) ||
                       watched.campaignName;

      const autoDescription = watched.keyBenefits?.join('. ') ||
                             watched.intentDescription ||
                             watched.problemSolved;

      const payload: Record<string, any> = {
        advertiser_id: advertiserId,
        name: watched.campaignName,
        budget: budgetCents,
        bid_cpc: bidCents,
        ad_type: adType === "link" && watched.promoCode?.length >= 3 ? "recommendation" : adType,
        intent_description: watched.intentDescription,
        ideal_customer: watched.idealCustomer,
        problem_solved: watched.problemSolved,
        value_proposition: watched.valueProposition,
        trigger_contexts: watched.triggerContexts || [],
        example_queries: watched.exampleQueries || [],
        negative_contexts: watched.negativeContexts || [],
        targeting_countries: watched.targetCountries || ["US"],
        targeting_languages: watched.targetingLanguages || ["en"],
        title: autoTitle.substring(0, 60),
        body: autoDescription.substring(0, 150),
        cta: watched.cta || "Learn More",
        landing_url: watched.landingUrl || null,
        promo_code: watched.promoCode || null,
        service_endpoint: adType === "service" ? watched.serviceEndpoint : null,
        service_auth: adType === "service" ? watched.serviceAuth : null,
        metadata: {
          key_benefits: watched.keyBenefits || [],
          special_offer: watched.specialOffer || null,
          success_metrics: watched.successMetrics || null,
          ai_first_version: "1.0"
        }
      };

      if (adType === "service") {
        payload.title = watched.serviceName || watched.campaignName;
        payload.body = watched.serviceDescription;
        payload.landing_url = null;
      }

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

      if (result.campaign_id) {
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

      toast.success("Campaign created successfully!");
      navigate("/advertiser/dashboard");
    } catch (err: any) {
      console.error("Campaign creation error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: // Simplified Basics
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Let's start with the basics</h2>
              <p className="text-muted-foreground mt-2">Just a few quick details to get started</p>
            </div>

            <div className="space-y-6">
              <SimpleField label="Campaign Name" required>
                <Input
                  placeholder="e.g., Summer Launch"
                  className="h-12 text-base"
                  {...form.register("campaignName")}
                />
              </SimpleField>

              <div className="grid grid-cols-2 gap-4">
                <SimpleField label="Budget" required>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      min="10"
                      className="h-12 pl-8 text-base"
                      {...form.register("budget")}
                    />
                  </div>
                </SimpleField>

                <SimpleField label="Cost per Click" required>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      min="0.10"
                      step="0.10"
                      className="h-12 pl-8 text-base"
                      {...form.register("bidAmount")}
                    />
                  </div>
                </SimpleField>
              </div>

              {/* Simple performance indicator */}
              <div className="bg-primary/5 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estimated clicks</span>
                  <span className="text-lg font-semibold">
                    ~{Math.round((Number(watched.budget) || 10) / (Number(watched.bidAmount) || 0.5))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Simplified Solution
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">What does your product do?</h2>
              <p className="text-muted-foreground mt-2">Help AI understand your solution</p>
            </div>

            <div className="space-y-6">
              <SimpleField label="Problem you solve" required>
                <Textarea
                  rows={3}
                  placeholder="What pain point does your product address?"
                  className="resize-none text-base"
                  {...form.register("problemSolved")}
                />
              </SimpleField>

              <SimpleField label="Your solution" required>
                <Textarea
                  rows={3}
                  placeholder="How does your product solve this problem?"
                  className="resize-none text-base"
                  {...form.register("intentDescription")}
                />
              </SimpleField>

              <SimpleField label="One-line pitch" required>
                <Input
                  placeholder="What makes you different?"
                  className="h-12 text-base"
                  {...form.register("valueProposition")}
                />
              </SimpleField>
            </div>
          </div>
        );

      case 3: // Simplified Triggers
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">When should your ad appear?</h2>
              <p className="text-muted-foreground mt-2">We match based on context, not keywords</p>
            </div>

            <div className="space-y-6">
              {/* Required field - prominent */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Trigger contexts <span className="text-destructive">*</span>
                </Label>
                <TagInput
                  value={watched.triggerContexts || []}
                  onChange={(tags) => form.setValue("triggerContexts", tags, { shouldValidate: true })}
                  placeholder="When users are asking about..."
                  required
                />
              </div>

              {/* Optional fields - collapsed by default */}
              <CollapsibleSection title="Advanced targeting (optional)">
                <SimpleField label="Example phrases">
                  <TagInput
                    value={watched.exampleQueries || []}
                    onChange={(tags) => form.setValue("exampleQueries", tags)}
                    placeholder="What users might say..."
                  />
                </SimpleField>

                <SimpleField label="Avoid these contexts">
                  <TagInput
                    value={watched.negativeContexts || []}
                    onChange={(tags) => form.setValue("negativeContexts", tags)}
                    placeholder="Don't show when..."
                  />
                </SimpleField>
              </CollapsibleSection>
            </div>
          </div>
        );

      case 4: // Simplified Audience
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Who's your ideal customer?</h2>
              <p className="text-muted-foreground mt-2">Help us find the right people</p>
            </div>

            <div className="space-y-6">
              <SimpleField label="Describe your ideal customer" required>
                <Textarea
                  rows={4}
                  placeholder="Who benefits most from your solution?"
                  className="resize-none text-base"
                  {...form.register("idealCustomer")}
                />
              </SimpleField>

              <div className="grid grid-cols-2 gap-4">
                <SimpleField label="Country">
                  <Select
                    value={watched.targetCountries?.[0] || "US"}
                    onValueChange={(value) => form.setValue("targetCountries", [value])}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="GLOBAL">All Countries</SelectItem>
                    </SelectContent>
                  </Select>
                </SimpleField>

                <SimpleField label="Language">
                  <Select
                    value={watched.targetingLanguages?.[0] || "en"}
                    onValueChange={(value) => form.setValue("targetingLanguages", [value])}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="all">All Languages</SelectItem>
                    </SelectContent>
                  </Select>
                </SimpleField>
              </div>
            </div>
          </div>
        );

      case 5: // Simplified Offer
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">What's your offer?</h2>
              <p className="text-muted-foreground mt-2">Information AI will use to present your solution</p>
            </div>

            <div className="space-y-6">
              {/* Offer type - simplified */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">How do users access your solution?</Label>
                <RadioGroup
                  value={watched.adType}
                  onValueChange={(value) => form.setValue("adType", value as any)}
                  className="space-y-2"
                >
                  <label className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 cursor-pointer transition-colors">
                    <RadioGroupItem value="link" id="link" />
                    <span className="text-sm font-medium">Website</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 cursor-pointer transition-colors">
                    <RadioGroupItem value="service" id="service" />
                    <span className="text-sm font-medium">API Service</span>
                  </label>
                </RadioGroup>
              </div>

              {adType === "service" ? (
                <>
                  <SimpleField label="Service Name" required>
                    <Input
                      placeholder="e.g., Translation API"
                      className="h-12 text-base"
                      {...form.register("serviceName")}
                    />
                  </SimpleField>
                  <SimpleField label="What it does" required>
                    <Textarea
                      rows={3}
                      placeholder="Describe your API capabilities..."
                      className="resize-none text-base"
                      {...form.register("serviceDescription")}
                    />
                  </SimpleField>
                </>
              ) : (
                <>
                  <SimpleField label="Landing page" required>
                    <Input
                      type="url"
                      placeholder="https://yoursite.com"
                      className="h-12 text-base"
                      {...form.register("landingUrl")}
                    />
                  </SimpleField>

                  <SimpleField label="Key benefits" required>
                    <TagInput
                      value={watched.keyBenefits || []}
                      onChange={(tags) => form.setValue("keyBenefits", tags, { shouldValidate: true })}
                      placeholder="Main value props..."
                      required
                    />
                  </SimpleField>

                  {/* Optional fields collapsed */}
                  <CollapsibleSection title="Additional details (optional)">
                    <SimpleField label="Special offer">
                      <Input
                        placeholder="e.g., 14-day free trial"
                        className="h-12"
                        {...form.register("specialOffer")}
                      />
                    </SimpleField>
                    <SimpleField label="Promo code">
                      <Input
                        placeholder="e.g., SAVE20"
                        className="h-12"
                        {...form.register("promoCode")}
                      />
                    </SimpleField>
                  </CollapsibleSection>
                </>
              )}
            </div>
          </div>
        );

      case 6: // Simplified Review
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Ready to launch?</h2>
              <p className="text-muted-foreground mt-2">Review your campaign details</p>
            </div>

            {/* Simple summary cards */}
            <div className="space-y-3">
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Campaign</span>
                  <span className="font-medium">{watched.campaignName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Budget</span>
                  <span className="font-medium">${watched.budget} at ${watched.bidAmount}/click</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Targeting</span>
                  <span className="font-medium">{watched.triggerContexts?.length || 0} contexts</span>
                </div>
              </div>

              {/* Key benefits preview */}
              {watched.keyBenefits?.length > 0 && (
                <div className="bg-primary/5 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Your key benefits:</p>
                  <div className="flex flex-wrap gap-2">
                    {watched.keyBenefits.map((benefit, i) => (
                      <span key={i} className="text-xs bg-background px-2 py-1 rounded">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Terms checkbox - cleaner */}
              <label className="flex items-start space-x-3 p-4 bg-background rounded-lg border border-border/50 cursor-pointer hover:bg-muted/30 transition-colors">
                <Checkbox
                  id="terms"
                  checked={watched.termsAccepted}
                  onCheckedChange={(checked) => form.setValue("termsAccepted", checked as boolean)}
                  className="mt-0.5"
                />
                <span className="text-sm">
                  I agree to the terms of service and understand that campaigns are non-refundable
                </span>
              </label>
            </div>

            {error && (
              <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-1">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Progress dots (minimal)
  const ProgressDots = () => (
    <div className="flex items-center justify-center gap-2 py-4">
      {STEPS.map((_, index) => (
        <div
          key={index}
          className={`transition-all duration-300 ${
            index + 1 === step
              ? 'w-8 h-2 bg-primary rounded-full'
              : index + 1 < step
              ? 'w-2 h-2 bg-primary/50 rounded-full'
              : 'w-2 h-2 bg-muted rounded-full'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header */}
      <header className="border-b">
        <div className="container max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Step {step} of {STEPS.length}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/advertiser/dashboard")}
            className="hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container max-w-3xl mx-auto px-6 py-8">
        <ProgressDots />

        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Simplified navigation */}
        <div className="mt-12 flex items-center justify-between">
          {step > 1 ? (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-muted-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          ) : <div />}

          {step < STEPS.length ? (
            <Button
              onClick={handleNext}
              disabled={!validateStep(step)}
              size="lg"
              className="ml-auto"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading || !watched.termsAccepted}
              size="lg"
              className="ml-auto bg-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Launch Campaign
                  <Check className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default CampaignWizard;