'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/components';
import { ArrowRight, Globe, Leaf, Shield, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-border bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src="/uploads/onepws-logo.png" alt="OnePWS Logo" className="h-10 w-auto" />
          <span className="text-xl font-bold tracking-tighter">POLICY HUB</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">Work</Link>
          <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">Expertise</Link>
          <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">Resources</Link>
          <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">Contact</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
          <Link href="/signup">
            <Button className="rounded-full px-6">Register</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-6 md:px-12 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <Zap size={14} />
              BEYOND THE OBVIOUS
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] bg-gradient-to-r from-primary to-white bg-clip-text text-transparent">
              Environment <br />
              Sustainability
            </h1>
            
            <p className="text-muted text-lg max-w-lg leading-relaxed">
              Empowering organizations with transparent policy management and sustainable 
              documentation frameworks for a greener tomorrow.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/signup">
                <Button variant="gradient" className="px-8 py-6 rounded-full text-lg flex items-center gap-2 group">
                  Register Now
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="px-8 py-6 rounded-full text-lg">
                  Access Portal
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/30 transition-colors" />
            <div className="relative aspect-square rounded-3xl overflow-hidden border border-border shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000" 
                alt="Control Room" 
                className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 md:px-12 border-y border-border bg-card/30">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4 text-center">
            <div className="text-5xl font-bold text-primary">15+</div>
            <div className="text-xl font-semibold">Years of Experience</div>
            <p className="text-muted text-sm">Leading the industry in policy documentation and compliance.</p>
          </div>
          <div className="space-y-4 text-center">
            <div className="text-5xl font-bold text-primary">100%</div>
            <div className="text-xl font-semibold">Sustainable Data</div>
            <p className="text-muted text-sm">Every document is indexed for long-term environmental tracking.</p>
          </div>
          <div className="space-y-4 text-center">
            <div className="text-5xl font-bold text-primary">500+</div>
            <div className="text-xl font-semibold">Global Innovation</div>
            <p className="text-muted text-sm">Trusted by world-class organizations for their policy hubs.</p>
          </div>
        </div>
      </section>

      {/* Data Hub Section */}
      <section className="py-24 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Our Core Values</h2>
          
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all group">
              <Leaf className="text-primary mb-6 group-hover:scale-110 transition-transform" size={40} />
              <h3 className="text-xl font-bold mb-3">Green First</h3>
              <p className="text-muted text-sm">Documentation strategies designed with environmental impact in mind.</p>
            </div>
            <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all group">
              <Shield className="text-primary mb-6 group-hover:scale-110 transition-transform" size={40} />
              <h3 className="text-xl font-bold mb-3">Secure Access</h3>
              <p className="text-muted text-sm">Enterprise-grade security for your sensitive policy documents.</p>
            </div>
            <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all group">
              <Globe className="text-primary mb-6 group-hover:scale-110 transition-transform" size={40} />
              <h3 className="text-xl font-bold mb-3">Global Compliance</h3>
              <p className="text-muted text-sm">Meeting international standards for sustainability reporting.</p>
            </div>
          </div>

          <div className="pt-8">
            <Link href="/signup">
              <Button variant="gradient" className="px-12 py-8 rounded-full text-xl shadow-[0_0_30px_rgba(234,45,45,0.4)]">
                Start Your Journey Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-muted text-sm">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <img src="/uploads/onepws-logo.png" alt="OnePWS Logo" className="h-6 w-auto" />
            POLICY HUB
          </div>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Cookies</Link>
          </div>
          <p>© 2026 Policy Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
