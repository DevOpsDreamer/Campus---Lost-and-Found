import React, { useState } from 'react';
import { Search, MapPin, Calendar, AlertTriangle, Shield, Laptop, CreditCard, Book, Shirt, Package, ChevronDown, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LostItemForm() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [dateLost, setDateLost] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [errors, setErrors] = useState<{ category?: string; description?: string; location?: string; contact?: string }>({});
  
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'pinned'>('idle');
  const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'electronics', label: 'Electronics (Laptop, Phone, Tablet)', icon: Laptop },
    { id: 'id_wallet', label: 'ID Card / Wallet / Keys', icon: CreditCard },
    { id: 'books', label: 'Books / Notebooks', icon: Book },
    { id: 'clothing', label: 'Clothing / Accessories', icon: Shirt },
    { id: 'other', label: 'Other', icon: Package },
  ];

  const handlePinLocation = () => {
    setLocationStatus('loading');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCoordinates({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationStatus('pinned');
      }, () => {
        setCoordinates({ lat: 19.0760, lng: 72.8777 }); 
        setLocationStatus('pinned');
      }, { enableHighAccuracy: true });
    } else {
      setCoordinates({ lat: 19.0760, lng: 72.8777 }); 
      setLocationStatus('pinned');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { category?: string; description?: string; location?: string; contact?: string } = {};
    let isValid = true;

    if (!selectedCategory) { newErrors.category = 'Required'; isValid = false; }
    if (!description.trim() || description.length < 20) { newErrors.description = 'Too short'; isValid = false; }
    if (!coordinates) { newErrors.location = 'Required'; isValid = false; }
    if (!contactInfo.trim()) { newErrors.contact = 'Required'; isValid = false; }

    setErrors(newErrors);

    if (isValid && coordinates) {
      setIsSubmitting(true);
      try {
        const response = await fetch('http://127.0.0.1:5000/api/claims/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mySecretKeyDescription: description,
            lostLat: coordinates.lat,
            lostLng: coordinates.lng,
            lostTimestamp: dateLost ? new Date(dateLost).toISOString() : new Date().toISOString()
          })
        });

        const data = await response.json();
        
        if (data.status === 'APPROVED') {
          alert(`HIGH CONFIDENCE MATCH! Unified AI Score: ${data.score.toFixed(2)}. Proceed to security to claim it.`);
        } else if (data.status === 'PROVISIONAL') {
          alert(`PROVISIONAL MATCH. AI Score: ${data.score.toFixed(2)}. Security will contact you for manual review.`);
        } else {
          alert(`MATCH FAILED. AI Score: ${data.score.toFixed(2)}. No items in database match this description or spatiotemporal window.`);
        }
      } catch (err) {
        alert('Server unreachable. Please check backend connection.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Report Lost Item</h2>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        {/* Category Dropdown */}
        <div className="space-y-2 relative z-20">
          <label className="block text-sm font-semibold text-slate-900">Category *</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-4 flex items-center justify-between"
            >
              <span>{categories.find(c => c.id === selectedCategory)?.label || 'Select category...'}</span>
              <ChevronDown size={20} className={isCategoryOpen ? 'rotate-180' : ''} />
            </button>
            {isCategoryOpen && (
              <div className="absolute z-20 w-full mt-2 bg-white border rounded-xl shadow-lg">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => { setSelectedCategory(category.id); setIsCategoryOpen(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50"
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.category && <p className="text-sm text-red-600 font-medium">{errors.category}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">Item Description *</label>
          <textarea 
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3"
            placeholder="e.g., Black Dell XPS 15 laptop with a red sticker."
          />
          {errors.description && <p className="text-sm text-red-600 font-medium">{errors.description}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">Spatiotemporal Tag (Where you lost it) *</label>
          <button
            type="button"
            onClick={handlePinLocation}
            disabled={locationStatus === 'loading'}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold bg-slate-900 text-white"
          >
            {locationStatus === 'idle' && <><MapPin size={20} /> Pin Approximate Location</>}
            {locationStatus === 'loading' && 'Acquiring GPS...'}
            {locationStatus === 'pinned' && <><CheckCircle2 size={20} className="text-emerald-400" /> Location Pinned ({coordinates?.lat.toFixed(4)}, {coordinates?.lng.toFixed(4)})</>}
          </button>
          {errors.location && <p className="text-sm text-red-600 font-medium">{errors.location}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">Date Lost (Approximate)</label>
          <input type="datetime-local" value={dateLost} onChange={(e) => setDateLost(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4" />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">Contact Email / Phone *</label>
          <input type="text" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} placeholder="student@university.edu" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4" />
        </div>

        <div className="pt-6 mt-8">
          <button type="submit" disabled={isSubmitting} className="w-full bg-sky-600 text-white font-bold text-lg py-4 rounded-xl shadow-md hover:bg-sky-700 flex items-center justify-center gap-2">
            <Search size={22} />
            {isSubmitting ? 'Running Math Engine...' : 'Scan Database for Matches'}
          </button>
        </div>
      </form>
    </div>
  );
}
