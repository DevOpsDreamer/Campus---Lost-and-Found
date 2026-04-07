import React, { useState } from 'react';
import { Search, MapPin, Calendar, AlertTriangle, Shield, Laptop, CreditCard, Book, Shirt, Package, ChevronDown, Sparkles } from 'lucide-react';

export default function LostItemForm() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [lastLocation, setLastLocation] = useState('');
  const [dateLost, setDateLost] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [errors, setErrors] = useState<{ category?: string; description?: string; location?: string; contact?: string }>({});
  
  const categories = [
    { id: 'electronics', label: 'Electronics (Laptop, Phone, Tablet)', icon: Laptop },
    { id: 'id_wallet', label: 'ID Card / Wallet / Keys', icon: CreditCard },
    { id: 'books', label: 'Books / Notebooks', icon: Book },
    { id: 'clothing', label: 'Clothing / Accessories', icon: Shirt },
    { id: 'other', label: 'Other', icon: Package },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { category?: string; description?: string; location?: string; contact?: string } = {};
    let isValid = true;

    if (!selectedCategory) {
      newErrors.category = 'Please select a category.';
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = 'Please provide a description.';
      isValid = false;
    } else if (description.trim().length < 20) {
      newErrors.description = 'Description is too short. Please provide at least 20 characters.';
      isValid = false;
    }

    if (!lastLocation.trim()) {
      newErrors.location = 'Please provide the last known location.';
      isValid = false;
    }

    if (!contactInfo.trim()) {
      newErrors.contact = 'Please provide contact information.';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      console.log('Lost item reported', { selectedCategory, description, lastLocation, dateLost, contactInfo });
      alert('Lost item report submitted successfully! Our AI is now scanning the found items database.');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Report Lost Item</h2>
        <p className="text-sm text-slate-500 mt-1">
          Provide details to help our AI match your item against the secure database.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        
        {/* Custom Category Dropdown */}
        <div className="space-y-2 relative z-20">
          <label htmlFor="category" className="block text-sm font-semibold text-slate-900">
            Category <span className="text-red-500 ml-0.5">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className={`w-full bg-white border ${errors.category ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} text-slate-900 text-base rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm font-medium flex items-center justify-between`}
            >
              {selectedCategory ? (
                <div className="flex items-center gap-3">
                  {React.createElement(categories.find(c => c.id === selectedCategory)?.icon || Package, { size: 20, className: "text-slate-500" })}
                  <span className="truncate">{categories.find(c => c.id === selectedCategory)?.label}</span>
                </div>
              ) : (
                <span className="text-slate-500">Select category...</span>
              )}
              <ChevronDown size={20} className={`text-slate-500 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCategoryOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsCategoryOpen(false)} />
                <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setIsCategoryOpen(false);
                          if (errors.category) setErrors({ ...errors, category: undefined });
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${selectedCategory === category.id ? 'bg-sky-50 text-sky-700' : 'text-slate-700'}`}
                      >
                        <Icon size={20} className={selectedCategory === category.id ? 'text-sky-600' : 'text-slate-400'} />
                        <span className="font-medium">{category.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          {errors.category && (
            <p className="text-sm text-red-600 font-medium mt-1">{errors.category}</p>
          )}
        </div>

        {/* Item Description (AI Optimized) */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-semibold text-slate-900">
            Item Description <span className="text-red-500 ml-0.5">*</span>
          </label>
          <div className="relative">
            <textarea 
              id="description" 
              required
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: undefined });
              }}
              placeholder="e.g., Black Dell XPS 15 laptop. It has a cracked left hinge and a red sticker on the bottom."
              className={`w-full bg-white border ${errors.description ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} text-slate-900 text-base rounded-xl px-4 py-3 pb-8 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent shadow-sm font-medium resize-none transition-shadow`}
            />
            <div className="absolute bottom-3 right-4 pointer-events-none">
              <span className={`text-[11px] font-bold tracking-wider uppercase ${description.length < 20 ? 'text-slate-400' : 'text-emerald-600'}`}>
                {description.length} / 20 min
              </span>
            </div>
          </div>
          {errors.description && (
            <p className="text-sm text-red-600 font-medium mt-1">{errors.description}</p>
          )}
          <div className="flex items-start gap-2.5 mt-2 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50">
            <Sparkles size={18} className="text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Please include specific details like brand, color, and unique damage/stickers. Our AI securely processes this description to auto-categorize the item and generate hidden verification challenges for the true owner.
            </p>
          </div>
        </div>

        {/* Last Known Location */}
        <div className="space-y-2">
          <label htmlFor="location" className="block text-sm font-semibold text-slate-900">
            Last Known Location <span className="text-red-500 ml-0.5">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MapPin size={20} className="text-slate-400" />
            </div>
            <input 
              type="text"
              id="location"
              value={lastLocation}
              onChange={(e) => {
                setLastLocation(e.target.value);
                if (errors.location) setErrors({ ...errors, location: undefined });
              }}
              placeholder="e.g., Library 2nd Floor, near the printers"
              className={`w-full bg-white border ${errors.location ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} text-slate-900 text-base rounded-xl pl-11 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm font-medium`}
            />
          </div>
          {errors.location && (
            <p className="text-sm text-red-600 font-medium mt-1">{errors.location}</p>
          )}
        </div>

        {/* Date Lost */}
        <div className="space-y-2">
          <label htmlFor="date" className="block text-sm font-semibold text-slate-900">
            Date Lost (Approximate)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Calendar size={20} className="text-slate-400" />
            </div>
            <input 
              type="date"
              id="date"
              value={dateLost}
              onChange={(e) => setDateLost(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-900 text-base rounded-xl pl-11 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm font-medium"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <label htmlFor="contact" className="block text-sm font-semibold text-slate-900">
            Contact Email / Phone <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input 
            type="text"
            id="contact"
            value={contactInfo}
            onChange={(e) => {
              setContactInfo(e.target.value);
              if (errors.contact) setErrors({ ...errors, contact: undefined });
            }}
            placeholder="student@university.edu"
            className={`w-full bg-white border ${errors.contact ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} text-slate-900 text-base rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm font-medium`}
          />
          {errors.contact && (
            <p className="text-sm text-red-600 font-medium mt-1">{errors.contact}</p>
          )}
        </div>

        {/* Submission & Legal Disclaimer */}
        <div className="pt-6 mt-8">
          <button 
            type="submit"
            className="w-full bg-sky-600 text-white font-bold text-lg py-4 rounded-xl shadow-md hover:bg-sky-700 active:bg-sky-800 transition-colors flex items-center justify-center gap-2"
          >
            <Search size={22} />
            Submit Lost Report
          </button>
          
          <div className="mt-5 flex items-start gap-2.5 bg-slate-100 p-3.5 rounded-xl border border-slate-200">
            <Shield size={20} className="text-slate-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Your report will be actively matched against our secure database. You will be notified immediately if a provisional match is found.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
