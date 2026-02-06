
import React from 'react';
// Added missing icon ShieldCheck to the lucide-react import list
import { Building2, Save, Globe, Phone, MapPin, Hash, Sparkles, ShieldCheck } from 'lucide-react';
import { BusinessProfile } from '../types';

interface SettingsProps {
  profile: BusinessProfile;
  setProfile: (p: BusinessProfile) => void;
}

const SettingsView: React.FC<SettingsProps> = ({ profile, setProfile }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-slate-500 font-medium">Personalize your business identity and app behavior</p>
        </div>
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner">
           <Building2 className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center">
           <Sparkles className="w-5 h-5 text-indigo-600 mr-3" />
           <h3 className="font-black text-slate-900">Store Branding</h3>
        </div>
        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Business Name</label>
              <div className="relative">
                 <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                 <input name="name" value={profile.name} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="e.g. My Awesome Shop" />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Tagline</label>
              <div className="relative">
                 <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                 <input name="tagline" value={profile.tagline} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="e.g. Quality Retail Engine" />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
              <div className="relative">
                 <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                 <input name="phone" value={profile.phone} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="+91 00000 00000" />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GSTIN (Tax ID)</label>
              <div className="relative">
                 <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                 <input name="gstin" value={profile.gstin} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="27AAAAA..." />
              </div>
           </div>

           <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Address</label>
              <div className="relative">
                 <MapPin className="absolute left-4 top-6 w-4 h-4 text-slate-300" />
                 <textarea name="address" value={profile.address} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all min-h-[100px]" placeholder="Full address for invoices..." />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Currency</label>
              <select name="currency" value={profile.currency} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold appearance-none">
                 <option value="₹">₹ - INR</option>
                 <option value="$">$ - USD</option>
                 <option value="€">€ - EUR</option>
                 <option value="£">£ - GBP</option>
              </select>
           </div>
        </div>
        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end">
           <button className="flex items-center px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:-translate-y-1 transition-all">
             <Save className="w-4 h-4 mr-2" /> Update Store Config
           </button>
        </div>
      </div>
      
      <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-indigo-200">
         <div className="flex items-center space-x-4 text-center md:text-left">
            <div className="p-4 bg-white/10 rounded-3xl"><ShieldCheck className="w-8 h-8" /></div>
            <div>
               <h4 className="text-xl font-black">Data Security</h4>
               <p className="text-indigo-200 text-sm">Your data never leaves this browser. Local storage encrypted.</p>
            </div>
         </div>
         <button className="px-6 py-3 bg-white text-indigo-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">Enable Cloud Sync</button>
      </div>
    </div>
  );
};

export default SettingsView;
