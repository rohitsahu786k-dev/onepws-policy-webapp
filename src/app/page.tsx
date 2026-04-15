'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/components';
import { ArrowRight, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-border bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/uploads/onepws-logo.png" alt="OnePWS Logo" className="h-16 w-auto object-contain" />
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
          <Link href="/signup">
            <Button className="rounded-full px-6">Register</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-6 md:px-12 overflow-hidden flex-1 flex items-center">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <Zap size={14} />
              BEYOND THE OBVIOUS
            </div>
            
            <h1 className="text-5xl md:text-7xl font-normal tracking-tight leading-[1.1] bg-gradient-to-r from-primary to-white bg-clip-text text-transparent">
              Environment <br />
              Sustainability
            </h1>
            
            <p className="text-muted text-lg max-w-lg leading-relaxed">
              Empowering organizations with transparent policy management and sustainable 
              documentation frameworks for a greener tomorrow.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/signup">
                <Button className="px-8 py-6 rounded-full text-lg flex items-center gap-2 group">
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
    </div>
  );
}
