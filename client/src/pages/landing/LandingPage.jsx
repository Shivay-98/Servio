import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ClipboardCheck,
  ShieldCheck,
  CalendarClock,
  BarChart3,
  Lock,
  Users,
  UserPlus,
  FileCheck,
  TrendingUp,
  Star,
  ChevronRight,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const stats = [
  { label: 'Active Providers', value: '10,000+' },
  { label: 'Services Delivered', value: '50,000+' },
  { label: 'Platform Uptime', value: '99.9%' },
  { label: 'Client Satisfaction', value: '4.9/5' },
];

const features = [
  {
    icon: ClipboardCheck,
    title: 'Easy Onboarding',
    description:
      'Get started in minutes with our streamlined onboarding process. No complex paperwork or lengthy approvals.',
  },
  {
    icon: ShieldCheck,
    title: 'Document Verification',
    description:
      'Our automated verification system ensures fast and secure document processing for compliance.',
  },
  {
    icon: CalendarClock,
    title: 'Smart Scheduling',
    description:
      'Intelligent scheduling tools that help you manage appointments and maximize your availability.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description:
      'Track your performance, revenue, and growth with comprehensive real-time dashboards.',
  },
  {
    icon: Lock,
    title: 'Secure Platform',
    description:
      'Enterprise-grade security to protect your data, transactions, and personal information.',
  },
  {
    icon: Users,
    title: 'Growing Network',
    description:
      'Join thousands of service providers and connect with clients looking for your expertise.',
  },
];

const steps = [
  {
    icon: UserPlus,
    title: 'Create Your Profile',
    description:
      'Sign up and build your professional profile. Highlight your skills, experience, and service areas.',
    step: 1,
  },
  {
    icon: FileCheck,
    title: 'Upload Documents',
    description:
      'Submit your credentials and documents for verification. Our team reviews them quickly and securely.',
    step: 2,
  },
  {
    icon: TrendingUp,
    title: 'Start Earning',
    description:
      'Once verified, start accepting bookings and grow your service business with our platform tools.',
    step: 3,
  },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Home Cleaning Professional',
    quote:
      'Servio transformed my business. I went from 5 clients a month to over 30. The onboarding was seamless and the scheduling tools save me hours every week.',
    rating: 5,
    initials: 'PS',
  },
  {
    name: 'Rahul Verma',
    role: 'Electrical Contractor',
    quote:
      'The document verification was incredibly fast. I was up and running within 24 hours. The analytics dashboard helps me track my growth effortlessly.',
    rating: 5,
    initials: 'RV',
  },
  {
    name: 'Anita Desai',
    role: 'Interior Designer',
    quote:
      'I love how professional everything feels. My clients trust me more because of the Servio verification badge. Revenue has increased by 200% in 6 months.',
    rating: 5,
    initials: 'AD',
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 pt-20 pb-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Zap className="h-3.5 w-3.5" />
                Trusted by 10,000+ service providers
              </span>
            </motion.div>

            <motion.h1
              className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Grow Your Service{' '}
              <br className="hidden sm:block" />
              Business with{' '}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Servio
              </span>
            </motion.h1>

            <motion.p
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              The all-in-one platform for service providers to manage their
              business, connect with clients, and scale their operations
              effortlessly.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link to="/register">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                asChild
              >
                <a href="#features">
                  Learn More
                  <ChevronRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </motion.div>
          </div>

          {/* Floating Stats Cards */}
          <motion.div
            className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              >
                <Card className="border-primary/10 bg-card/80 text-center backdrop-blur-sm">
                  <CardContent className="p-4 sm:p-6">
                    <p className="text-2xl font-bold text-primary sm:text-3xl">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Features
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful tools and features designed to help service providers
              manage and grow their business.
            </p>
          </motion.div>

          <motion.div
            className="mx-auto mt-16 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="group h-full transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                    <CardContent className="p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/50 py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              How It Works
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Get Started in 3 Simple Steps
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join the Servio platform and start growing your service business
              today.
            </p>
          </motion.div>

          <div className="mx-auto mt-16 max-w-5xl">
            <div className="relative grid gap-8 md:grid-cols-3">
              {/* Connecting line (desktop) */}
              <div className="absolute left-0 right-0 top-24 hidden h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent md:block" />

              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.step}
                    className="relative"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: step.step * 0.15 }}
                  >
                    <Card className="h-full text-center">
                      <CardContent className="p-6 pt-8">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                          {step.step}
                        </div>
                        <div className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-7 w-7" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">
                          {step.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {step.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Testimonials
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Loved by Service Providers
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Hear from professionals who have transformed their business with
              Servio.
            </p>
          </motion.div>

          <motion.div
            className="mx-auto mt-16 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.name}
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex gap-1">
                      {Array.from({ length: testimonial.rating }).map(
                        (_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-amber-400 text-amber-400"
                          />
                        )
                      )}
                    </div>
                    <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>
                    <div className="mt-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {testimonial.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {testimonial.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-8 text-center text-primary-foreground shadow-2xl sm:p-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                }}
              />
            </div>

            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Grow Your Business?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
                Join thousands of service providers who are already using Servio
                to manage and scale their business.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  asChild
                >
                  <Link to="/register">
                    Get Started Today
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
                  asChild
                >
                  <Link to="/login">
                    Sign In
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-primary-foreground/70">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Free to join
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  No hidden fees
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Cancel anytime
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
