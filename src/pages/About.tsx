import React from 'react';
import { 
  Info, 
  Code, 
  ExternalLink, 
  Share2, 
  Heart, 
  Cpu, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Users, 
  Code2, 
  Globe
} from 'lucide-react';

const About = () => {
  const stats = [
    { label: 'Version', value: '1.0.0', icon: Code2 },
    { label: 'Uptime', value: '99.9%', icon: Zap },
    { label: 'Security', value: 'AES-256', icon: ShieldCheck },
    { label: 'Users', value: '1k+', icon: Users },
  ];

  const technologies = [
    { name: 'React 19', description: 'Modern UI logic' },
    { name: 'Tailwind CSS 4', description: 'Rapid, premium styling' },
    { name: 'Vite', description: 'Lightning fast builds' },
    { name: 'Lucide Icons', description: 'Beautiful iconography' },
    { name: 'TypeScript', description: 'Type-safe development' },
    { name: 'Data Structures', description: 'Heap, DLL, MergeSort' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-20 text-center shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-red-400 text-sm font-medium backdrop-blur-md mb-4">
            <Info size={16} />
            <span>About TriageQ</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
            Next Generation <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-600">Queue Management</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl leading-relaxed">
            TriageQ is a sophisticated hospital queue management system built to streamline patient flow, 
            reduce wait times, and provide real-time visibility into clinic operations.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <button className="px-8 py-3 rounded-full bg-red-600 text-white font-semibold hover:bg-red-500 transition-all shadow-lg shadow-red-600/25">
              Get Started
            </button>
            <button className="px-8 py-3 rounded-full bg-slate-800 text-white font-semibold border border-slate-700 hover:bg-slate-700 transition-all">
              Documentation
            </button>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 mb-4 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
              <stat.icon size={24} />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-slate-500 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content Blocks */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Our Mission */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Globe size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
          <p className="text-slate-600 leading-relaxed">
            We aim to revolutionize the healthcare experience by leveraging cutting-edge technology 
            to solve one of the most common frustrations in clinics: the waiting room. 
            TriageQ brings transparency and efficiency to both patients and medical staff.
          </p>
        </div>

        {/* Tech Stack */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Cpu size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Modern Architecture</h2>
          <p className="text-slate-600 leading-relaxed">
            Built on a modular React architecture, TriageQ utilizes advanced data structures 
            like Priority Heaps for triage management and Doubly Linked Lists for queue tracking, 
            ensuring O(log n) efficiency in performance-critical paths.
          </p>
        </div>
      </div>

      {/* Technology Pills */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Layers className="text-red-500" />
          <h2 className="text-2xl font-bold text-slate-900">The Power Behind TriageQ</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {technologies.map((tech, i) => (
            <div key={i} className="flex flex-col p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-red-100 hover:bg-red-50/30 transition-all">
              <span className="font-bold text-slate-900">{tech.name}</span>
              <span className="text-slate-500 text-sm">{tech.description}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer / Connect */}
      <section className="bg-slate-50 rounded-3xl p-10 flex flex-col items-center text-center space-y-6 border border-slate-100">
        <Heart className="text-red-500 animate-pulse" size={32} />
        <div>
          <h3 className="text-xl font-bold text-slate-900">Join our Journey</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            We are constantly improving TriageQ. Follow our development or contribute to the project.
          </p>
        </div>
        <div className="flex gap-4">
          <a href="#" className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-red-500 hover:border-red-500 transition-all">
            <Code size={20} />
          </a>
          <a href="#" className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-red-500 hover:border-red-500 transition-all">
            <ExternalLink size={20} />
          </a>
          <a href="#" className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-red-500 hover:border-red-500 transition-all">
            <Share2 size={20} />
          </a>
        </div>
        <div className="text-slate-400 text-xs mt-4">
          © {new Date().getFullYear()} TriageQ Systems. All rights reserved.
        </div>
      </section>
    </div>
  );
};

export default About;
