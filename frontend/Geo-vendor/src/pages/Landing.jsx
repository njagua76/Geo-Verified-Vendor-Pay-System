import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Shield, Smartphone, Users, ArrowRight } from 'lucide-react';

export const Landing = () => {
  const features = [
    {
      icon: MapPin,
      title: 'GPS Verification',
      description: 'Ensure payments happen at verified supplier locations with real-time geolocation tracking.',
    },
    {
      icon: Shield,
      title: 'Secure Transactions',
      description: 'End-to-end encrypted M-Pesa integration for safe and reliable mobile payments.',
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Optimized for field agents with intuitive mobile interface and offline support.',
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Separate dashboards for field agents and administrators with custom permissions.',
    },
  ];

  const stats = [
    { value: '99.9%', label: 'Uptime' },
    { value: '50ms', label: 'Avg Response' },
    { value: '10K+', label: 'Transactions' },
    { value: '500+', label: 'Suppliers' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">GeoVend Pay</h1>
              <p className="text-xs text-gray-600">Geo-Verified Payments</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <button className="text-gray-700 hover:text-gray-900 transition-colors">Sign In</button>
            </Link>
            <Link to="/login">
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium hover:shadow-lg transition-all">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 lg:pt-32 pb-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-100/30 rounded-full blur-3xl animate-float" />
          <div
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-blue-50/20 rounded-full blur-3xl animate-float"
            style={{ animationDelay: '3s' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center space-y-8">
            <div className="space-y-4 animate-slide-in">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900">
                Geo-Verified <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Field Payments</span>
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
                Secure, location-verified M-Pesa payments for field agents. Ensure every transaction happens exactly where it should.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login">
                <button className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium hover:shadow-lg transition-all inline-flex items-center gap-2">
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-gray-200 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600">Everything you need for secure field payments</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="p-6 rounded-xl bg-white border border-gray-200 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 lg:py-32 bg-gray-50/50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple 3-Step Payment Process
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Capture Location',
                description: 'Field agent arrives at supplier hub and captures GPS coordinates',
              },
              {
                step: '02',
                title: 'Verify Proximity',
                description: 'System verifies agent is within 100m of registered supplier location',
              },
              {
                step: '03',
                title: 'Process Payment',
                description: "M-Pesa payment is sent directly to supplier's registered number",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center mx-auto mb-4 text-xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="p-8 md:p-12 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Ready to Streamline Your Field Payments?
                </h2>
                <p className="text-white/80 mb-6">
                  Join thousands of businesses using GeoVend Pay for secure, location-verified transactions.
                </p>
                <Link to="/login">
                  <button className="px-8 py-3 rounded-lg bg-white text-blue-600 font-medium hover:shadow-lg transition-all inline-flex items-center gap-2">
                    Start Free Trial <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">GeoVend Pay</span>
            </div>
            <p className="text-sm text-gray-600">
              © 2024 GeoVend Pay. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
