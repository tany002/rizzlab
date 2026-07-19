import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Upload, X, ImagePlus, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ONBOARDING } from "@/constants/testIds";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  COMPLETE_REGISTRATION_TRACKED_KEY,
  trackMetaEventOnce,
} from "@/lib/metaPixel";

const STEPS = ["About You", "Challenges", "Photos", "Profile", "Style", "Communication"];

const CHALLENGES = ["Not getting matches", "Matches don't reply", "Bad photos", "Poor bio", "No confidence", "Poor fashion", "Bad conversations"];
const APPS = ["Bumble", "Hinge", "Tinder", "Aisle", "Jeevansathi", "OkCupid"];
const INTERESTS = ["Fitness", "Travel", "Food", "Music", "Reading", "Gaming", "Startups", "Cinema", "Art", "Sports"];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    about: { age: "", city: "", occupation: "", goal: "long_term", height: "", fitness: 3, confidence: 3 },
    challenges: [],
    photos: [],
    profile: { bio: "", apps: [], dealBreakers: "", interests: [], personality: "" },
    style: { current: "", budget: "8000", colors: "", grooming: "" },
    communication: { type: "ambivert", topics: "", experience: "" },
  });
  const navigate = useNavigate();

  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

  const set = (section, field, value) => {
    setData((d) => ({ ...d, [section]: { ...d[section], [field]: value } }));
  };

  const toggleChallenge = (c) => {
    setData((d) => ({ ...d, challenges: d.challenges.includes(c) ? d.challenges.filter(x => x !== c) : [...d.challenges, c] }));
  };
  const toggleArray = (section, field, item) => {
    const arr = data[section][field];
    set(section, field, arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);
  };

  const handleFiles = (files) => {
    const list = Array.from(files).slice(0, 8 - data.photos.length);
    const readers = list.map((f) => new Promise((res) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.readAsDataURL(f);
    }));
    Promise.all(readers).then((urls) => setData((d) => ({ ...d, photos: [...d.photos, ...urls].slice(0, 8) })));
  };

  const removePhoto = (i) => setData((d) => ({ ...d, photos: d.photos.filter((_, idx) => idx !== i) }));

  const canNext = () => {
    if (step === 0) return data.about.age && data.about.city && data.about.occupation;
    if (step === 1) return data.challenges.length > 0;
    if (step === 2) return data.photos.length >= 3;
    if (step === 3) return data.profile.bio.length > 10;
    return true;
  };

  const next = async () => {
    if (step === STEPS.length - 1) {
      try {
        await api.post("/onboarding", data);
        const fired = trackMetaEventOnce(COMPLETE_REGISTRATION_TRACKED_KEY, "CompleteRegistration", {
          content_name: "RizzLab Onboarding",
          status: true,
        });
        if (fired) {
          console.info("[onboarding] Meta CompleteRegistration event fired");
        }
      } catch (err) {
        // Non-blocking: user might not be logged in yet; log but let flow continue
        console.warn("[onboarding] save skipped", err?.response?.status || err?.message);
      }
      navigate("/loading");
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* progress */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-zinc-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-7 h-7 rounded-lg bg-brand text-white grid place-items-center">
              <Heart className="w-3.5 h-3.5" fill="white" strokeWidth={0} />
            </span>
            <span className="font-outfit font-semibold text-ink">RizzLab</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-ink-muted mb-1.5">
              <span>{STEPS[step]}</span>
              <span>{step + 1} / {STEPS.length}</span>
            </div>
            <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-brand" transition={{ duration: 0.4 }} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
            {step === 0 && (
              <div className="space-y-6">
                <h1 className="font-outfit text-3xl font-semibold text-ink">Let's start with the basics.</h1>
                <p className="text-ink-muted">This helps us calibrate the coaching to your context.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><Label>Age</Label><Input value={data.about.age} onChange={(e) => set("about", "age", e.target.value)} type="number" placeholder="27" className="mt-2 h-12 rounded-xl" data-testid="ob-age" /></div>
                  <div><Label>City</Label><Input value={data.about.city} onChange={(e) => set("about", "city", e.target.value)} placeholder="Bangalore" className="mt-2 h-12 rounded-xl" data-testid="ob-city" /></div>
                  <div className="sm:col-span-2"><Label>Occupation</Label><Input value={data.about.occupation} onChange={(e) => set("about", "occupation", e.target.value)} placeholder="Product Manager at a fintech" className="mt-2 h-12 rounded-xl" data-testid="ob-occupation" /></div>
                  <div><Label>Height</Label><Input value={data.about.height} onChange={(e) => set("about", "height", e.target.value)} placeholder="5'10&quot;" className="mt-2 h-12 rounded-xl" /></div>
                  <div>
                    <Label>Relationship Goal</Label>
                    <Select value={data.about.goal} onValueChange={(v) => set("about", "goal", v)}>
                      <SelectTrigger className="mt-2 h-12 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="casual">Casual Dating</SelectItem>
                        <SelectItem value="long_term">Long-term Relationship</SelectItem>
                        <SelectItem value="marriage">Marriage</SelectItem>
                        <SelectItem value="not_sure">Not sure yet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2"><Label>Fitness Level (1-5)</Label>
                    <div className="mt-3 flex gap-2">{[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => set("about", "fitness", n)} className={`w-10 h-10 rounded-xl border ${data.about.fitness === n ? "bg-brand text-white border-brand" : "bg-white text-ink border-zinc-200"}`}>{n}</button>
                    ))}</div>
                  </div>
                  <div className="sm:col-span-2"><Label>Confidence Level (1-5)</Label>
                    <div className="mt-3 flex gap-2">{[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => set("about", "confidence", n)} className={`w-10 h-10 rounded-xl border ${data.about.confidence === n ? "bg-brand text-white border-brand" : "bg-white text-ink border-zinc-200"}`}>{n}</button>
                    ))}</div>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <h1 className="font-outfit text-3xl font-semibold text-ink">What are you struggling with?</h1>
                <p className="text-ink-muted">Pick everything that applies. We'll focus your report on these.</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {CHALLENGES.map(c => (
                    <button key={c} onClick={() => toggleChallenge(c)} data-testid={`ob-challenge-${c}`}
                      className={`text-left px-5 py-4 rounded-2xl border transition-all ${data.challenges.includes(c) ? "border-brand bg-brand-soft text-ink" : "border-zinc-200 bg-white text-ink-muted hover:border-zinc-300"}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{c}</span>
                        {data.challenges.includes(c) && <Check className="w-4 h-4 text-brand" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h1 className="font-outfit text-3xl font-semibold text-ink">Upload your dating photos.</h1>
                <p className="text-ink-muted">6-8 photos give the best signal. We'll score each one.</p>
                <label className="block border-2 border-dashed border-zinc-300 rounded-2xl p-10 text-center bg-white hover:border-brand hover:bg-brand-soft/30 transition-colors cursor-pointer" data-testid="ob-photo-drop">
                  <input type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
                  <Upload className="w-8 h-8 mx-auto text-ink-muted mb-3" />
                  <div className="font-medium text-ink">Drop photos here or click to upload</div>
                  <div className="text-sm text-ink-muted mt-1">JPG or PNG · Up to 8 photos</div>
                </label>
                {data.photos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {data.photos.map((p, i) => (
                      <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-zinc-200">
                        <img src={p} alt="upload" className="w-full h-full object-cover" />
                        <button onClick={() => removePhoto(i)} className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/70 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                    {data.photos.length < 8 && (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-zinc-300 grid place-items-center text-ink-muted cursor-pointer hover:border-brand hover:text-brand transition-colors">
                        <input type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
                        <ImagePlus className="w-6 h-6" />
                      </label>
                    )}
                  </div>
                )}
                <div className="bg-white rounded-2xl border border-zinc-200 p-5 text-sm text-ink-muted">
                  <div className="font-medium text-ink mb-2">Photo Guidelines</div>
                  <ul className="space-y-1.5">
                    <li>• 1 clear headshot as your first photo</li>
                    <li>• 1 full body photo — natural setting</li>
                    <li>• 1-2 action photos (hobby, sport, travel)</li>
                    <li>• Avoid sunglasses and heavily filtered shots</li>
                  </ul>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h1 className="font-outfit text-3xl font-semibold text-ink">Tell us about your current profile.</h1>
                <div>
                  <Label>Paste your dating bio</Label>
                  <Textarea value={data.profile.bio} onChange={(e) => set("profile", "bio", e.target.value)} data-testid="ob-bio"
                    placeholder="Software engineer. Love travel and food. DM me if interested."
                    className="mt-2 min-h-[120px] rounded-xl" />
                </div>
                <div>
                  <Label>Dating apps you use</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {APPS.map(a => (
                      <button key={a} onClick={() => toggleArray("profile", "apps", a)}
                        className={`px-4 py-2 rounded-full text-sm border transition-colors ${data.profile.apps.includes(a) ? "bg-ink text-white border-ink" : "bg-white text-ink-muted border-zinc-200"}`}>{a}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Interests</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {INTERESTS.map(a => (
                      <button key={a} onClick={() => toggleArray("profile", "interests", a)}
                        className={`px-4 py-2 rounded-full text-sm border transition-colors ${data.profile.interests.includes(a) ? "bg-brand text-white border-brand" : "bg-white text-ink-muted border-zinc-200"}`}>{a}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Deal breakers</Label>
                  <Input value={data.profile.dealBreakers} onChange={(e) => set("profile", "dealBreakers", e.target.value)} placeholder="Smoking, no career ambition..." className="mt-2 h-12 rounded-xl" />
                </div>
                <div>
                  <Label>Describe your personality in 3 words</Label>
                  <Input value={data.profile.personality} onChange={(e) => set("profile", "personality", e.target.value)} placeholder="Calm, curious, dry humour" className="mt-2 h-12 rounded-xl" />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h1 className="font-outfit text-3xl font-semibold text-ink">Let's talk style.</h1>
                <div>
                  <Label>How would you describe your current style?</Label>
                  <Textarea value={data.style.current} onChange={(e) => set("style", "current", e.target.value)} placeholder="T-shirts and jeans. Formal for work." className="mt-2 rounded-xl min-h-[80px]" />
                </div>
                <div>
                  <Label>Monthly shopping budget (₹)</Label>
                  <Input type="number" value={data.style.budget} onChange={(e) => set("style", "budget", e.target.value)} className="mt-2 h-12 rounded-xl" />
                </div>
                <div>
                  <Label>Favorite colors</Label>
                  <Input value={data.style.colors} onChange={(e) => set("style", "colors", e.target.value)} placeholder="Navy, olive, ecru" className="mt-2 h-12 rounded-xl" />
                </div>
                <div>
                  <Label>Current grooming routine</Label>
                  <Textarea value={data.style.grooming} onChange={(e) => set("style", "grooming", e.target.value)} placeholder="Haircut every 6 weeks, clean shave, basic skincare" className="mt-2 rounded-xl min-h-[80px]" />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <h1 className="font-outfit text-3xl font-semibold text-ink">One last thing — communication.</h1>
                <div>
                  <Label>You would describe yourself as:</Label>
                  <RadioGroup value={data.communication.type} onValueChange={(v) => set("communication", "type", v)} className="mt-3 grid grid-cols-3 gap-3">
                    {["introvert", "extrovert", "ambivert"].map(t => (
                      <label key={t} className={`flex items-center justify-center gap-2 px-4 py-4 rounded-2xl border cursor-pointer capitalize ${data.communication.type === t ? "border-brand bg-brand-soft" : "border-zinc-200 bg-white"}`}>
                        <RadioGroupItem value={t} className="sr-only" />
                        {t}
                      </label>
                    ))}
                  </RadioGroup>
                </div>
                <div>
                  <Label>Topics you love talking about</Label>
                  <Textarea value={data.communication.topics} onChange={(e) => set("communication", "topics", e.target.value)} placeholder="F1, indie films, coffee..." className="mt-2 rounded-xl min-h-[80px]" />
                </div>
                <div>
                  <Label>Your current dating experience</Label>
                  <Textarea value={data.communication.experience} onChange={(e) => set("communication", "experience", e.target.value)} placeholder="Been on 5-6 dates in the last year. Mostly awkward first dates that don't lead to seconds." className="mt-2 rounded-xl min-h-[80px]" />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between">
          <Button data-testid={ONBOARDING.back} variant="ghost" disabled={step === 0} onClick={() => setStep(s => Math.max(0, s - 1))} className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button data-testid={step === STEPS.length - 1 ? ONBOARDING.finish : ONBOARDING.continue}
            disabled={!canNext()} onClick={next}
            className="rounded-full bg-brand hover:bg-brand-hover text-white px-8 h-12 shadow-brand hover:-translate-y-0.5 transition-transform disabled:opacity-40">
            {step === STEPS.length - 1 ? "Generate My Report" : "Continue"} <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
