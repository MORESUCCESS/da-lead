import { Link } from "react-router-dom";
import {
  Target,
  Zap,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  XCircle,
  Search,
  Clock,
  Mail,
} from "lucide-react";
import Hamburger from "hamburger-react";
import { useState } from "react";

const painPoints = [
  "Spending hours manually searching for leads with zero system",
  "Sending the same generic pitch that gets ignored every time",
  "Losing track of who you contacted and when to follow up",
  "Missing high-value opportunities because your pipeline is a mess",
];

const steps = [
  {
    icon: Search,
    title: "Find Leads",
    desc: "Add leads manually or import a list. Capture business name, website, and social handles.",
    color: "bg-primary-50 text-primary",
  },
  {
    icon: Zap,
    title: "AI Analysis",
    desc: "Our AI scans each lead and generates a problem description with an opportunity score.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: MessageSquare,
    title: "Generate Pitch",
    desc: "Get a personalized pitch or follow-up message crafted specifically for that lead.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: TrendingUp,
    title: "Track & Close",
    desc: "Move leads through your pipeline: Not Contacted → Contacted → Replied → Closed.",
    color: "bg-green-50 text-success",
  },
];

const features = [
  {
    icon: Zap,
    title: "Opportunity Scoring",
    desc: "AI evaluates every lead and rates them High, Medium, or Low so you focus on the best bets first.",
    color: "from-amber-400 to-orange-500",
  },
  {
    icon: MessageSquare,
    title: "AI Pitch Generator",
    desc: "Stop writing the same message. Get personalized cold pitches, follow-ups, and closing messages in seconds.",
    color: "from-primary to-accent",
  },
  {
    icon: TrendingUp,
    title: "Lead Tracking",
    desc: "Visual pipeline so you always know exactly where every lead stands and who needs a nudge.",
    color: "from-success to-teal-500",
  },
];

export default function Landing() {
  // amburger menu icon
  const [isOpen, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 via-gray-100 to-gray-300 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
              <Target size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold lg:text-xl text-gray-900">Da-Lead</span>
          </div>
          <div className="lg:flex hidden md:gap-6">
            <a
              href="/"
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Home
            </a>
            <a
              href="#howitworks"
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              How it Works
            </a>
            <a
              href="#features"
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Features
            </a>
          </div>
          <div className="flex items-center">
            <Link
              to="/signup"
              className="lg:flex hidden btn-primary text-sm !py-2.5 !px-5"
            >
              Get Started
            </Link>

            {/* amburger menu icon */}
            <div className="text-amber-600 lg:hidden block">
              <Hamburger
                className="!w-5 !h-5"
                toggled={isOpen}
                toggle={setOpen}
              />
            </div>
          </div>
        </div>

        {/* mobile view */}
        <ul
          className={`z-80 absolute top-16 left-0 w-full flex flex-col items-center justify-center gap-5 py-16 text-sm text-gray-600 lg:hidden transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}
        >
            <li>
              <a className="text-sm font-semibold text-gray-100 hover:text-gray-300 transition-colors" href="/">
                Home
              </a>
            </li>
            <li>
              <a className="text-sm font-semibold text-gray-100 hover:text-gray-300 transition-colors" href="#howitworks">
                How it works
              </a>
            </li>
            <li>
              <a className="text-sm font-semibold text-gray-100 hover:text-gray-300 transition-colors" href="#features">
                Features
              </a>
            </li>
            <li>
              <Link
                to="/signup"
                className="btn-primary text-sm !py-2.5 !px-5"
              >
                Get Started
              </Link>
            </li>   
          </ul>
      </header>
        {isOpen && (
          <div className="fixed h-[37%] inset-0 bg-black/20 backdrop-blur-sm z-40"></div>
        )}

      <main className="flex-1">
        {/* Hero */}
        <section className="min-h-screen relative pt-20 pb-28 overflow-hidden bg-gradient-to-br from-primary-100 via-white to-white items-center justify-center text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/40 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-20 left-0 w-64 h-64 bg-primary/50 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative py-12">
            <div className="flex items-center w-full justify-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-accent/10 text-accent text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
                  <Zap size={14} />
                  <span>AI-Powered Lead Outreach</span>
                </div>
                <h1 className="text-5xl sm:text-6xl font-black text-gray-900 leading-tight mb-6">
                  Find leads, send
                  <br className="lg:flex hidden" />
                  smarter ptiches,{" "}
                  <span className="text-primary">and close</span>{" "}
                  <span className="text-accent">deals.</span>
                </h1>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                  The all-in-one platform for freelancers and online hustlers to
                  find leads, analyze opportunities, and generate AI-powered
                  pitches that actually convert.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full items-center justify-center">
                  <Link to="/signup" className="btn-primary text-center">
                    Get Started <ArrowRight size={16} className="inline ml-1" />
                  </Link>
                  <Link to="/login" className="btn-secondary text-center">
                    Sign In
                  </Link>
                </div>
              </div>

              {/* Hero visual */}
              {/* <div className="hidden lg:block relative">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 max-w-sm mx-auto">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-gray-900">Lead Pipeline</h3>
                    <span className="text-xs bg-primary-50 text-primary font-semibold px-3 py-1 rounded-full">12 Active</span>
                  </div>
                  {[
                    { name: 'Acme Design Co', score: 'high', status: 'Replied' },
                    { name: 'TechFlow SaaS', score: 'medium', status: 'Contacted' },
                    { name: 'Bloom Boutique', score: 'high', status: 'Not Contacted' },
                  ].map((lead) => (
                    <div key={lead.name} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                      <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {lead.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{lead.name}</p>
                        <p className="text-xs text-gray-500">{lead.status}</p>
                      </div>
                      <span className={lead.score === 'high' ? 'badge-high' : 'badge-medium'}>
                        {lead.score === 'high' ? '🟢' : '🟡'} {lead.score}
                      </span>
                    </div>
                  ))}
                  <div className="mt-4 p-3 bg-success/5 rounded-xl border border-success/20">
                    <p className="text-xs text-success font-semibold flex items-center gap-1.5">
                      <TrendingUp size={12} /> 3 high-opportunity leads ready for outreach
                    </p>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </section>

        {/* Pain Points */}
        <section className="py-20 bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Sound familiar?
            </h2>
            <p className="text-gray-400 mb-12 text-lg">
              Every freelancer struggles with the same lead generation
              nightmare.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {painPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-5 bg-white/5 rounded-2xl p-5 text-left border border-white/10 hover:scale-105 duration-300 cursor-pointer"
                >
                  <XCircle size={20} className="text-accent shrink-0 mt-0.5" />
                  <p className="text-gray-300 font-medium">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="howitworks"
          className="py-24 bg-gradient-to-br from-primary-100 via-gray-100 to-gray-300"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
                How FynLead Works
              </h2>
              <p className="text-lg text-gray-500">
                Four simple steps from finding a lead to closing the deal.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, i) => (
                <div
                  key={step.title}
                  className="relative cursor-pointer hover:scale-110 transition-transform duration-300"
                >
                  {i < steps.length - 1 && (
                    <div
                      className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gray-100 z-0"
                      style={{ width: "calc(100% - 2rem)", left: "50%" }}
                    />
                  )}
                  <div className="card p-6 text-center relative z-10">
                    <div
                      className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-4`}
                    >
                      <step.icon size={24} />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center mx-auto mb-3">
                      {i + 1}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 bg-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Everything You Need to Close Deals
              </h2>
              <p className="text-lg text-gray-500">
                Powerful features built specifically for freelancers and
                hustlers.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="card p-7 bg-white/5 border-white/10 hover:scale-105 transition-transform duration-300 cursor-pointer"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-sm`}
                  >
                    <f.icon size={22} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {f.title}
                  </h3>
                  <p className="text-white/80 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-to-br from-primary-100 via-gray-100 to-gray-300">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-black/80 mb-4">
              Ready to fill your pipeline?
            </h2>
            <p className="text-black/70 text-lg mb-10">
              Join hundreds of freelancers already closing more deals with
              FynLead.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3.5 rounded-xl bg-black/10 border border-black/20 text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black/30"
              />
              <Link to="/signup" className="btn-primary whitespace-nowrap">
                Get Started
              </Link>
            </div>
            <p className="text-primary-200 text-sm mt-4">
              Free forever plan available · No credit card needed
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col lg:flex-row items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Target size={14} className="text-white" />
              </div>
              <span className="font-bold text-white">Da-Lead</span>
              <span className="text-gray-500 text-sm ml-2">
                · Find leads, send smarter ptiches, and close deals.
              </span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-300 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-gray-300 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-gray-300 transition-colors">
                Contact
              </a>
            </div>
            <p className="text-gray-600 text-sm">
              © 2026 FynLead. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
