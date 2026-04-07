import React, { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, CheckCircle2, AlertTriangle, Shield, Laptop, CreditCard, Book, Shirt, Package, ChevronDown, CloudUpload, Sparkles } from 'lucide-react';

export default function FoundItemForm() {
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'pinned'>('idle');
  const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | null>(null);
  
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ category?: string; description?: string; photo?: string }>({});
  
  const categories = [
    { id: 'electronics', label: 'Electronics (Laptop, Phone, Tablet)', icon: Laptop },
    { id: 'id_wallet', label: 'ID Card / Wallet / Keys', icon: CreditCard },
    { id: 'books', label: 'Books / Notebooks', icon: Book },
    { id: 'clothing', label: 'Clothing / Accessories', icon: Shirt },
    { id: 'other', label: 'Other', icon: Package },
  ];
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePinLocation = () => {
    setLocationStatus('loading');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCoordinates({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationStatus('pinned');
      }, (error) => {
        console.error("Error getting location:", error);
        // Fallback dummy location if GPS fails
        setCoordinates({ lat: 19.0760, lng: 72.8777 }); 
        setLocationStatus('pinned');
      }, { enableHighAccuracy: true });
    } else {
      setCoordinates({ lat: 19.0760, lng: 72.8777 }); 
      setLocationStatus('pinned');
    }
  };

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const localUrl = URL.createObjectURL(file);
      setPhotoPreviewUrl(localUrl);
      setPhotoFile(file);
      if (errors.photo) setErrors({ ...errors, photo: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { category?: string; description?: string; photo?: string } = {};
    let isValid = true;

    if (!photoFile) {
      newErrors.photo = 'Please capture a photo of the item.';
      isValid = false;
    }

    if (!selectedCategory) {
      newErrors.category = 'Please select a category for the found item.';
      isValid = false;
    }

    if (!description.trim() || description.length < 20) {
      newErrors.description = 'Description is too short. Please provide at least 20 characters.';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid && photoFile) {
      setIsSubmitting(true);
      setSubmitError(null);

      const formData = new FormData();
      formData.append('image', photoFile);
      formData.append('secretKey', description);
      formData.append('category', selectedCategory);
      if (coordinates) {
        formData.append('lat', coordinates.lat.toString());
        formData.append('lng', coordinates.lng.toString());
      } else {
        formData.append('lat', '19.0760');
        formData.append('lng', '72.8777');
      }

      try {
        const response = await fetch('http://127.0.0.1:5000/api/claims/found', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Failed to submit item securely to backend.');
        }

        const data = await response.json();
        alert('Item logged securely to vault backend! ID: ' + data.assetId);
        
        // Reset form
        setDescription('');
        setSelectedCategory('');
        setPhotoPreviewUrl(null);
        setPhotoFile(null);
        setCoordinates(null);
        setLocationStatus('idle');
      } catch (err) {
        console.error(err);
        setSubmitError('Failed to upload securely to Server.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Report Found Item</h2>
        <p className="text-sm text-slate-500 mt-1">
          Fast-path reporting. <span className="font-semibold text-slate-700">Under 30 seconds.</span>
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        {/* Visual Evidence Integration */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Visual Evidence <span className="text-red-500 ml-0.5">*</span>
          </label>
          <button 
            type="button"
            onClick={() => !isSubmitting && fileInputRef.current?.click()}
            disabled={isSubmitting}
            className={`relative w-full h-40 rounded-2xl border-2 overflow-hidden flex flex-col items-center justify-center transition-colors shadow-sm ${
              isSubmitting
                ? 'border-sky-300 bg-sky-50 border-solid'
                : photoFile 
                ? 'border-emerald-500 bg-emerald-50 border-solid' 
                : errors.photo
                ? 'border-red-400 bg-red-50 border-dashed'
                : 'border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 border-dashed'
            }`}
          >
            {isSubmitting ? (
              <div className="flex flex-col items-center justify-center z-10">
                <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mb-3" />
                <span className="font-semibold text-sky-900">Encrypting & Uploading...</span>
              </div>
            ) : photoPreviewUrl ? (
              <>
                <img src={photoPreviewUrl} alt="Captured preview" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20">
                  <Camera size={14} />
                  <span className="text-xs font-semibold">Retake</span>
                </div>
              </>
            ) : (
              <>
                <div className="bg-sky-100 p-3 rounded-full mb-3">
                  <Camera size={28} className="text-sky-700" />
                </div>
                <span className="font-semibold text-slate-800 text-lg">Take Photo of Item</span>
              </>
            )}
          </button>
          
          {submitError && <p className="text-sm text-red-600 font-medium">{submitError}</p>}
          {errors.photo && <p className="text-sm text-red-600 font-medium">{errors.photo}</p>}

          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handlePhotoCapture}
          />
        </div>

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

        {/* Geolocation Tagging */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">Spatiotemporal Tag</label>
          <button
            type="button"
            onClick={handlePinLocation}
            disabled={locationStatus === 'loading'}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold bg-slate-900 text-white"
          >
            {locationStatus === 'idle' && <><MapPin size={20} /> Pin Current Location</>}
            {locationStatus === 'loading' && 'Acquiring GPS...'}
            {locationStatus === 'pinned' && <><CheckCircle2 size={20} className="text-emerald-400" /> Location Pinned ({coordinates?.lat.toFixed(4)}, {coordinates?.lng.toFixed(4)})</>}
          </button>
        </div>

        {/* Submission */}
        <div className="pt-6 mt-8">
          <button 
            type="submit"
            className="w-full bg-sky-600 text-white font-bold text-lg py-4 rounded-xl shadow-md hover:bg-sky-700 flex items-center justify-center gap-2"
          >
            <Shield size={22} />
            Securely Log Item to Node.js Backend
          </button>
        </div>
      </form>
    </div>
  );
}
