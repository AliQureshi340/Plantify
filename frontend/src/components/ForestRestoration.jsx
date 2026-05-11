/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Search, Calendar, MapPin, Users, Star, ArrowRight, Play, Check, Phone, Mail, MessageCircle, Leaf } from 'lucide-react';

export default function PlantifyPlatform() {
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = [
    
    { icon: '📷', title: 'Identify Your Plants', desc: 'Use AI identification and track your plants Identity' },
    { icon: '🌿', title: 'Disease Detection', desc: 'With the help of AI Track your plants Health' },
    { icon: '📊', title: 'Plantation Drives', desc: 'Join Various Plantation Drives from this sole platform' },
    { icon: '🌱', title: 'Plantify Profile', desc: 'Create your plant collection with detailed profiles and care schedules' },
    { icon: '🌳', title: 'Nursery Shop', desc: 'Get acces to buy all plants and stuff related to them Here' }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50">


      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-green-300/40 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 transform transition-all duration-1000">
              <div className="space-y-6">
                <h4 className="text-green-600 font-semibold text-lg tracking-wide animate-pulse">DISCOVER PLANT CARE ONLINE</h4>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-800 leading-tight hover:scale-105 transition-all duration-500">
                  Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600 animate-pulse">PLANTIFY</span> to Nurture your plants like never before...
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed hover:text-gray-700 transition-colors duration-300">
                  “Plantify – Your smart green companion!  Identify plants, detect diseases instantly, and join plantation drives to grow a greener future.” 
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-full hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transform">
                  Start Growing
                </button>
                <button className="border-2 border-gray-300 text-gray-700 hover:text-green-600 hover:border-green-500 px-8 py-4 rounded-full transition-all duration-300 font-semibold text-lg hover:shadow-lg hover:-translate-y-1 transform">
                  Browse Plants
                </button>
              </div>
            </div>

            {/* Right Content - Plant Care Dashboard */}
            <div className="relative hover:scale-105 transition-all duration-500">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-green-200/30 shadow-2xl hover:shadow-3xl transition-all duration-300">
                {/* Plant Care Interface */}
                <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-6 mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-gray-800 font-bold text-lg">Plant Care</h3>
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300">
                        <Leaf className="text-white w-4 h-4" />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 hover:bg-green-100 hover:border-green-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="text-sm text-gray-600">Indoor Plants</div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-800 font-medium">Lilly Plant</span>
                          <div className="flex items-center space-x-2">
                            <button className="w-8 h-8 border border-green-300 rounded flex items-center justify-center text-green-600 hover:bg-green-100 hover:scale-110 transition-all duration-200">💧</button>
                            <span className="font-bold text-green-600 animate-pulse">Today</span>
                            <button className="w-8 h-8 border border-green-300 rounded flex items-center justify-center text-green-600 hover:bg-green-100 hover:scale-110 transition-all duration-200">☀️</button>
                          </div>
                        </div>
                        <div className="text-green-600 font-bold">Healthy</div>
                      </div>
                      
                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 hover:bg-yellow-100 hover:border-yellow-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-800 font-medium">Sunflower Plant</span>
                          <div className="flex items-center space-x-2">
                            <button className="w-8 h-8 border border-yellow-300 rounded flex items-center justify-center text-yellow-600 hover:bg-yellow-100 hover:scale-110 transition-all duration-200">💧</button>
                            <span className="font-bold text-yellow-600 animate-pulse">3 days</span>
                            <button className="w-8 h-8 border border-yellow-300 rounded flex items-center justify-center text-yellow-600 hover:bg-yellow-100 hover:scale-110 transition-all duration-200">☀️</button>
                          </div>
                        </div>
                        <div className="text-yellow-600">Needs Water</div>
                      </div>
                    </div>
                    
                    <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 transform">
                      Add New Plant
                    </button>
                  </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-green-200/30 hover:bg-white/30 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="text-2xl font-bold text-green-800">24</div>
                    <div className="text-green-600 text-sm">Plants in Collection</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-green-200/30 hover:bg-white/30 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="text-2xl font-bold text-green-800">95%</div>
                    <div className="text-green-600 text-sm">Health Score</div>
                  </div>
                </div>

                {/* Growth Chart */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">Growth Progress</span>
                    <span className="text-2xl font-bold">78%</span>
                  </div>
                  <div className="flex items-end space-x-1 h-12">
                    {[40, 60, 80, 100, 75, 90, 85].map((height, i) => (
                      <div 
                        key={i} 
                        className="bg-white/40 rounded-sm flex-1 hover:bg-white/60 transition-all duration-300 hover:scale-110" 
                        style={{height: `${height/2}%`}}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-lime-400 to-green-500 text-white p-3 rounded-lg shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 animate-pulse">
                <div className="text-sm font-bold">1,240</div>
                <div className="text-xs">Care Points</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Video Hero Section */}
<section className="relative h-[500px] mb-12 mx-6 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500">
  {/* Background Video */}
  <video 
    className="absolute inset-0 w-full h-full object-cover" 
    src="\videos\video1.mp4"
    autoPlay 
    loop 
    muted 
    playsInline
  />

  {/* Gradient Overlay & Text */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 flex items-center justify-center">
    <div className="text-center text-white transform hover:scale-110 transition-all duration-500">
      <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
        Discover Plantify
      </h2>
      <p className="text-xl opacity-90">Learn how to be a part of Green Enviorment</p>
    </div>
  </div>
</section>


      {/* How it Works Section */}
      <section className="py-20 bg-gradient-to-br from-white via-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-6 hover:scale-105 transition-all duration-500">
              How it <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4 hover:text-gray-700 transition-colors duration-300">
              While Plantify is a powerful plant care system with comprehensive plant database at your disposal,
              our focus is to make it quick and easy to nurture your green companions.
            </p>
            <p className="text-lg text-gray-500 hover:text-gray-600 transition-colors duration-300">You'll be growing successfully in a few simple steps</p>
          </div>

          {/* Steps */}
          <div className="relative">
            {/* Connection Lines */}
            <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-green-200 via-emerald-300 via-green-300 via-emerald-300 to-green-200"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className="relative hover:scale-110 transition-all duration-500 hover:-translate-y-2"
                  onMouseEnter={() => setActiveStep(index)}
                >
                  {/* Icon */}
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center text-2xl shadow-xl hover:shadow-2xl transition-all duration-500 ${
                    activeStep === index || index === 0 ? 'bg-green-100 border-4 border-green-400 scale-110' :
                    index === 1 ? 'bg-emerald-100 border-4 border-emerald-300 hover:border-emerald-400' :
                    index === 2 ? 'bg-lime-100 border-4 border-lime-300 hover:border-lime-400' :
                    index === 3 ? 'bg-teal-100 border-4 border-teal-300 hover:border-teal-400' :
                    'bg-green-100 border-4 border-green-300 hover:border-green-400'
                  }`}>
                    {step.icon}
                  </div>

                  {/* Card */}
                  <div className={`p-6 rounded-2xl text-center h-48 flex flex-col justify-center shadow-xl hover:shadow-2xl transition-all duration-500 transform ${
                    activeStep === index || index === 0 ? 'bg-green-50 border-2 border-green-300 scale-105' :
                    index === 1 ? 'bg-emerald-50 border-2 border-emerald-200 hover:border-emerald-300' :
                    index === 2 ? 'bg-lime-50 border-2 border-lime-200 hover:border-lime-300' :
                    index === 3 ? 'bg-teal-50 border-2 border-teal-200 hover:border-teal-300' :
                    'bg-green-50 border-2 border-green-200 hover:border-green-300'
                  }`}>
                    <h3 className={`font-bold text-lg mb-3 transition-colors duration-300 ${
                      activeStep === index || index === 0 ? 'text-green-800' :
                      index === 1 ? 'text-emerald-700' :
                      index === 2 ? 'text-lime-700' :
                      index === 3 ? 'text-teal-700' :
                      'text-green-700'
                    }`}>
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed hover:text-gray-700 transition-colors duration-300">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

{/* Dual Video Section */}
<section className="py-16 mx-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl mb-16 shadow-2xl hover:shadow-3xl transition-all duration-500">
  <div className="max-w-7xl mx-auto px-6">
    <div className="text-center mb-12">
      <h3 className="text-3xl font-bold text-gray-800 mb-4 hover:scale-105 transition-all duration-500">See It In Action</h3>
      <p className="text-gray-600 hover:text-gray-700 transition-colors duration-300">Watch how our platform transforms plant care</p>
    </div>
    
    <div className="grid md:grid-cols-2 gap-8">
      
      {/* Plant Identification Video */}
      <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 hover:-translate-y-2">
        <div className="h-72 rounded-xl overflow-hidden shadow-inner">
          <video 
            className="w-full h-full object-cover" 
            src="\videos\video3.mp4" // 🔗 replace with your video link
            autoPlay 
            loop 
            muted 
            playsInline
          />
        </div>
        <h4 className="text-lg font-bold mt-4 text-gray-800 hover:text-green-600 transition-colors duration-300">Plant Identification</h4>
        <p className="text-gray-600 hover:text-gray-700 transition-colors duration-300">AI-powered plant recognition</p>
      </div>
      
      {/* Care Tracking Video */}
      <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 hover:-translate-y-2">
        <div className="h-72 rounded-xl overflow-hidden shadow-inner">
          <video 
            className="w-full h-full object-cover" 
            src="\videos\video2.mp4"     // 🔗 replace with your video link
            autoPlay 
            loop 
            muted 
            playsInline
          />
        </div>
        <h4 className="text-lg font-bold mt-4 text-gray-800 hover:text-green-600 transition-colors duration-300">Care Tracking</h4>
        <p className="text-gray-600 hover:text-gray-700 transition-colors duration-300">Monitor growth and health</p>
      </div>

    </div>
  </div>
</section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-6 hover:scale-105 transition-all duration-500">Simple Pricing</h2>
            
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {['No Credit Card', 'Free Forever', 'Premium Features', 'Expert Support'].map((feature, i) => (
                <span 
                  key={i} 
                  className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium border-2 border-green-200 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:-translate-y-1"
                >
                  {feature}
                </span>
              ))}
            </div>

            <p className="text-gray-600 max-w-3xl mx-auto mb-4 hover:text-gray-700 transition-colors duration-300">
              Everyone gets access to basic plant care tools and community support, with unlimited plant profiles and care tracking.
            </p>
            <p className="text-gray-600 hover:text-gray-700 transition-colors duration-300">
              Premium features help advanced gardeners with detailed analytics and expert consultations.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 hover:-translate-y-2">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Free Forever</h3>
              <div className="text-sm text-gray-600 mb-6">Perfect for beginners</div>
              
              <div className="mb-8">
                <div className="text-3xl font-bold text-gray-800 animate-pulse">Free = Rs. 0</div>
                <div className="text-sm text-gray-600 mt-2">Complete access to basic plant care features.</div>
              </div>
              
              <p className="text-gray-600 text-sm hover:text-gray-700 transition-colors duration-300">
                Plant identification, care reminders, and community access included
              </p>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-500 hover:-translate-y-4 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                POPULAR
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Premium Care</h3>
              <div className="text-sm text-gray-600 mb-6">For serious gardeners</div>
              
              <div className="mb-8">
                <div className="text-lg font-bold text-gray-800 mb-2">Monthly plan:</div>
                <div className="text-3xl font-bold text-gray-800 animate-pulse">Rs. 299/month</div>
                <div className="text-xl text-gray-600">Advanced analytics</div>
                <div className="text-sm text-gray-600 mt-2">Expert plant consultations included</div>
              </div>
              
              <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 mb-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transform">
                Start Premium
              </button>
              
              <p className="text-gray-600 text-sm hover:text-gray-700 transition-colors duration-300">
                Advanced care schedules, disease diagnosis, and expert support
              </p>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 hover:-translate-y-2">
              <h3 className="text-xl font-bold mb-6">Nursery & Business</h3>
              
              <div className="mb-8">
                <p className="mb-6 opacity-90">
                  If you run a nursery or plant business and need custom plant management solutions, let's discuss!
                </p>
              </div>
              
              <button className="w-full bg-white text-green-600 py-3 rounded-lg font-medium hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 transform">
                Contact Sales
              </button>
            </div>
          </div>

          <div className="text-center mt-12 space-x-4">
            <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 transform">
              Start Growing
            </button>
            <button className="border-2 border-green-300 text-green-700 px-8 py-3 rounded-lg font-medium hover:border-green-400 hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 transform">
              Learn More
            </button>
          </div>
        </div>
      </section>
      </div>

  );
}
