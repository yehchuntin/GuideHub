import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, GuideProfile, Tour, MatchResult, Booking, ChatMessage, AddOnService } from './types';
import { dataService } from './services/dataService';
import { geminiService } from './services/geminiService';
import { authService } from './services/authService';

// --- Icons ---
const Icons = {
  MapPin: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Star: () => <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
  Sparkles: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  Lock: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  Unlock: () => <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Calendar: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Car: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
  Filter: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
  Chat: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
  Home: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Briefcase: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Google: () => <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>,
  Sad: () => <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

// --- View State ---
type TravelerPage = 'HOME' | 'SEARCH' | 'DETAILS' | 'BOOKING' | 'TRIPS' | 'CHAT' | 'PROFILE';

// --- Shared Components ---
const LoginScreen = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await authService.signInWithGoogle();
      onLogin(user);
    } catch (err: any) {
      console.error("Login Error in UI:", err);
      // Simplify error message for display
      let msg = "Login failed.";
      if (err.code === 'auth/popup-closed-by-user') msg = "Login canceled.";
      if (err.code === 'auth/unauthorized-domain') {
        msg = `Domain Error: The domain "${window.location.hostname}" is not authorized. Go to Firebase Console > Authentication > Settings > Authorized Domains and add "${window.location.hostname}".`;
      }
      else if (err.message) msg = err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
           <div className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white p-3 rounded-xl shadow-lg">
             <Icons.MapPin />
           </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to GuideHub</h1>
        <p className="text-slate-500 mb-8">Connect with local experts or share your city with the world.</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 break-words text-left">
            <strong>Error:</strong> {error}
          </div>
        )}

        <button onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-xl transition-all shadow-sm">
          {loading ? <span>Signing in...</span> : <><Icons.Google /><span>Continue with Google</span></>}
        </button>
      </div>
    </div>
  );
};

const BottomNav = ({ activePage, setPage }: { activePage: TravelerPage, setPage: (p: TravelerPage) => void }) => {
  const NavItem = ({ page, icon, label }: { page: TravelerPage, icon: any, label: string }) => (
    <button onClick={() => setPage(page)} className={`flex flex-col items-center gap-1 ${activePage === page ? 'text-teal-600' : 'text-slate-400'}`}>
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-slate-200 py-3 px-6 flex justify-between z-50 md:hidden">
      <NavItem page="HOME" icon={<Icons.Home />} label="Home" />
      <NavItem page="SEARCH" icon={<Icons.Search />} label="Search" />
      <NavItem page="TRIPS" icon={<Icons.Briefcase />} label="Trips" />
      <NavItem page="CHAT" icon={<Icons.Chat />} label="Chat" />
      <NavItem page="PROFILE" icon={<Icons.Users />} label="Profile" />
    </div>
  );
};

const Navbar = ({ user, role, setRole, setPage, onLogout }: { user: User, role: UserRole, setRole: (r: UserRole) => void, setPage: (p: TravelerPage) => void, onLogout: () => void }) => (
  <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center cursor-pointer" onClick={() => setPage('HOME')}>
          <div className="flex-shrink-0 flex items-center gap-2">
            <span className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white p-1.5 rounded-lg"><Icons.MapPin /></span>
            <span className="font-bold text-xl tracking-tight text-slate-900">GuideHub</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
           <button onClick={() => setPage('HOME')} className="text-slate-600 hover:text-teal-600 font-medium">Home</button>
           <button onClick={() => setPage('TRIPS')} className="text-slate-600 hover:text-teal-600 font-medium">My Trips</button>
           <button onClick={() => setPage('CHAT')} className="text-slate-600 hover:text-teal-600 font-medium">Messages</button>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => { setRole(role === UserRole.TRAVELER ? UserRole.GUIDE : UserRole.TRAVELER); setPage('HOME'); }} className={`text-xs font-bold px-3 py-1.5 rounded-full border ${role === UserRole.TRAVELER ? 'bg-slate-100 text-slate-600' : 'bg-slate-900 text-white'}`}>
            {role === UserRole.TRAVELER ? 'Switch to Guide' : 'Switch to Traveler'}
          </button>
          <img src={user.photoURL} className="w-8 h-8 rounded-full border border-slate-200 cursor-pointer" onClick={onLogout} title="Logout" />
        </div>
      </div>
    </div>
  </nav>
);

// --- Traveler Components ---

const HeroSection = ({ onSearch }: { onSearch: () => void }) => (
  <div className="relative h-[500px] w-full bg-slate-900 overflow-hidden flex items-center justify-center">
    <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover opacity-60" />
    <div className="relative z-10 w-full max-w-4xl px-4 text-center">
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-md">Find Your Perfect Private Guide</h1>
      
      {/* Search Bar */}
      <div className="bg-white p-2 rounded-full shadow-2xl flex flex-col md:flex-row items-center p-4 md:p-2 gap-2">
        <div className="flex-1 flex items-center px-4 w-full md:w-auto border-b md:border-b-0 border-slate-100 pb-2 md:pb-0">
          <Icons.MapPin />
          <input type="text" placeholder="Where are you going?" className="ml-2 w-full outline-none text-slate-700 font-medium placeholder:font-normal" />
        </div>
        <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
        <div className="flex-1 flex items-center px-4 w-full md:w-auto border-b md:border-b-0 border-slate-100 py-2 md:py-0">
          <Icons.Calendar />
          <input type="text" placeholder="Add dates" className="ml-2 w-full outline-none text-slate-700 font-medium placeholder:font-normal" />
        </div>
        <button onClick={onSearch} className="bg-teal-600 hover:bg-teal-700 text-white rounded-full p-3 md:px-8 font-bold transition-all w-full md:w-auto mt-2 md:mt-0">
          Search
        </button>
      </div>
    </div>
  </div>
);

const CategoryGrid = ({ selectedCategory, onCategoryClick }: { selectedCategory: string, onCategoryClick: (c: string) => void }) => {
  const categories = [
    { name: 'Local Expert', icon: '🗺️', id: 'Local' },
    { name: 'Transport', icon: '🚗', id: 'Transport' },
    { name: 'Accommodation', icon: '🛏️', id: 'Accommodation' },
    { name: 'Translator', icon: '🗣️', id: 'Language' },
    { name: 'Custom Tour', icon: '✨', id: 'Custom' },
    { name: 'Family', icon: '👨‍👩‍👧‍👦', id: 'Family' },
  ];
  return (
    <div className="py-8">
      <h3 className="text-xl font-bold text-slate-900 mb-4 px-4 md:px-0">Explore Services</h3>
      <div className="flex gap-4 overflow-x-auto px-4 md:px-0 pb-4 scrollbar-hide">
        {categories.map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <button 
                key={cat.id} 
                onClick={() => onCategoryClick(cat.id)} 
                className={`flex flex-col items-center min-w-[100px] gap-2 p-4 rounded-xl shadow-sm border transition-all duration-200
                    ${isActive 
                        ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500 ring-opacity-20 transform scale-105' 
                        : 'bg-white border-slate-100 hover:shadow-md hover:border-teal-200'
                    }`}
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className={`text-sm font-medium whitespace-nowrap ${isActive ? 'text-teal-800' : 'text-slate-700'}`}>
                    {cat.name}
                </span>
              </button>
            );
        })}
      </div>
    </div>
  );
};

const GuideCard: React.FC<{ tour: Tour; onClick: () => void }> = ({ tour, onClick }) => (
  <div onClick={onClick} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-slate-100 group">
    <div className="relative h-56">
      <img src={tour.publicData.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-800 flex items-center gap-1">
        <Icons.Star /> {tour.rating} ({tour.reviewCount})
      </div>
      <div className="absolute bottom-3 right-3 bg-slate-900/80 text-white px-3 py-1 rounded-lg text-sm font-bold">
        ${tour.pricing.basePrice} <span className="text-xs font-normal">/ trip</span>
      </div>
    </div>
    <div className="p-5">
      <div className="flex justify-between items-start mb-2">
         <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{tour.publicData.title}</h3>
      </div>
      <p className="text-slate-500 text-sm line-clamp-2 mb-4">{tour.publicData.summary}</p>
      <div className="flex gap-2">
        {tour.category === 'Food' && <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-md font-medium">🍜 Foodie</span>}
        {tour.pricing.addOns.some(a => a.name.includes('Pickup')) && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">🚗 Pickup</span>}
      </div>
    </div>
  </div>
);

// --- SEARCH VIEW ---
const SearchResults = ({ tours, onSelectTour }: { tours: Tour[], onSelectTour: (t: Tour) => void }) => {
  return (
    <div className="pt-8 pb-24 max-w-7xl mx-auto px-4">
      {/* Filter Bar (Simplified) */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-full text-sm font-medium whitespace-nowrap"><Icons.Filter /> Filters</button>
        <button className="px-4 py-2 bg-white border border-slate-300 rounded-full text-sm font-medium whitespace-nowrap">Price</button>
        <button className="px-4 py-2 bg-white border border-slate-300 rounded-full text-sm font-medium whitespace-nowrap">Duration</button>
        <button className="px-4 py-2 bg-white border border-slate-300 rounded-full text-sm font-medium whitespace-nowrap">Language</button>
      </div>
      
      {tours.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tours.map(t => <GuideCard key={t.id} tour={t} onClick={() => onSelectTour(t)} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <Icons.Sad />
            <p className="mt-4 font-medium text-lg">No tours found</p>
            <p className="text-sm">Try selecting a different service category.</p>
        </div>
      )}
    </div>
  );
};

// --- BOOKING WIZARD ---
const BookingWizard = ({ tour, onClose, onComplete }: { tour: Tour, onClose: () => void, onComplete: () => void }) => {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState(2);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const baseTotal = tour.pricing.perPerson ? tour.pricing.basePrice * guests : tour.pricing.basePrice;
  const addOnsTotal = tour.pricing.addOns.filter(a => selectedAddOns.includes(a.id)).reduce((acc, curr) => acc + curr.price, 0);
  const total = baseTotal + addOnsTotal;

  const handleBook = async () => {
    setIsProcessing(true);
    await dataService.createBooking({
      tourId: tour.id,
      tourTitle: tour.publicData.title,
      tourImage: tour.publicData.images[0],
      guideId: tour.guideId,
      guideName: 'Yuki & Ken', // Mock
      travelerName: 'Current User',
      date: date || '2024-06-01',
      timeSlot: '09:00 AM',
      totalPrice: total,
      selectedAddOns,
      guestCount: guests
    });
    setIsProcessing(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in">
      <div className="bg-white w-full md:max-w-2xl md:rounded-2xl h-[90vh] md:h-auto flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="font-bold text-lg">Book Tour</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 p-2">✕</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">When are you going?</h3>
              <input type="date" className="w-full p-4 border border-slate-200 rounded-xl text-lg" onChange={e => setDate(e.target.value)} />
              
              <h3 className="text-xl font-bold pt-4">How many guests?</h3>
              <div className="flex items-center gap-4">
                <button onClick={() => setGuests(Math.max(1, guests-1))} className="w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xl">-</button>
                <span className="text-xl font-bold w-8 text-center">{guests}</span>
                <button onClick={() => setGuests(Math.min(tour.maxGroupSize, guests+1))} className="w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xl">+</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Customize your experience</h3>
              {tour.pricing.addOns.length === 0 ? <p className="text-slate-500">No add-ons available for this tour.</p> : (
                <div className="space-y-3">
                  {tour.pricing.addOns.map(addon => (
                    <div key={addon.id} 
                         onClick={() => setSelectedAddOns(prev => prev.includes(addon.id) ? prev.filter(id => id !== addon.id) : [...prev, addon.id])}
                         className={`p-4 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${selectedAddOns.includes(addon.id) ? 'border-teal-600 bg-teal-50' : 'border-slate-200'}`}>
                      <div>
                        <div className="font-bold">{addon.name}</div>
                        <div className="text-sm text-slate-500">{addon.description}</div>
                      </div>
                      <div className="font-bold text-teal-700">+${addon.price}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Review & Pay</h3>
              <div className="bg-slate-50 p-4 rounded-xl space-y-3 text-sm">
                <div className="flex justify-between"><span>Base Price ({guests} guests)</span> <span>${baseTotal}</span></div>
                {selectedAddOns.length > 0 && <div className="flex justify-between text-slate-600"><span>Add-ons</span> <span>${addOnsTotal}</span></div>}
                <div className="h-px bg-slate-200 my-2"></div>
                <div className="flex justify-between font-bold text-lg text-slate-900"><span>Total</span> <span>${total}</span></div>
              </div>
              
              <div className="p-4 border rounded-xl flex gap-3 items-center">
                <div className="w-8 h-5 bg-slate-800 rounded"></div>
                <span className="font-medium text-slate-700">•••• 4242</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white">
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800">Next Step</button>
          ) : (
            <button onClick={handleBook} disabled={isProcessing} className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-teal-700 disabled:opacity-50">
              {isProcessing ? 'Processing...' : `Confirm & Pay $${total}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- CHAT VIEW ---
const ChatView = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  
  useEffect(() => { dataService.getMessages('g1').then(setMessages); }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = await dataService.sendMessage('g1', input);
    setMessages([...messages, msg]);
    setInput('');
  };

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-140px)] md:h-[600px] flex flex-col bg-white md:rounded-2xl md:shadow-sm md:border border-slate-200 mt-4 md:mt-8">
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <img src="https://picsum.photos/100/100?random=1" className="w-10 h-10 rounded-full" />
        <div>
          <h3 className="font-bold text-slate-900">Yuki & Ken</h3>
          <p className="text-xs text-green-600 font-bold">Online</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.senderId === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.isSystem ? 'bg-slate-100 text-slate-500 text-center w-full max-w-full italic' : m.senderId === 'user' ? 'bg-teal-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-slate-100 flex gap-2">
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..." 
          className="flex-1 bg-slate-50 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-teal-500"
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} className="p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700">
          <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
      </div>
    </div>
  );
};

// --- MY TRIPS VIEW ---
const MyTripsView = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => { dataService.getTravelerBookings().then(setBookings); }, []);

  const filtered = bookings.filter(b => activeTab === 'upcoming' ? (b.status === 'CONFIRMED' || b.status === 'PENDING') : (b.status === 'COMPLETED' || b.status === 'CANCELLED'));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
      <h2 className="text-2xl font-bold mb-6">My Trips</h2>
      <div className="flex gap-6 border-b border-slate-200 mb-6">
        <button onClick={() => setActiveTab('upcoming')} className={`pb-3 font-medium ${activeTab === 'upcoming' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-400'}`}>Upcoming</button>
        <button onClick={() => setActiveTab('past')} className={`pb-3 font-medium ${activeTab === 'past' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-400'}`}>Past</button>
      </div>
      
      <div className="space-y-4">
        {filtered.length === 0 ? <p className="text-slate-400 text-center py-8">No trips found.</p> : filtered.map(b => (
          <div key={b.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex gap-4">
            <img src={b.tourImage} className="w-24 h-24 rounded-lg object-cover" />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                 <h3 className="font-bold text-slate-900">{b.tourTitle}</h3>
                 <span className={`text-xs px-2 py-1 rounded font-bold ${b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{b.status}</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">with {b.guideName}</p>
              <div className="mt-3 flex items-center gap-4 text-sm text-slate-700 font-medium">
                 <span className="flex items-center gap-1"><Icons.Calendar /> {b.date}</span>
                 <span>{b.timeSlot}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Guide Dashboard (Simplified placeholder for context) ---
const GuideDashboard = ({ user }: { user: User }) => (
  <div className="p-8 text-center text-slate-500">
    <h1 className="text-2xl font-bold text-slate-900 mb-2">Guide Dashboard</h1>
    <p>Switch to Traveler mode to see the new UI updates.</p>
  </div>
);

// --- MAIN CONTROLLER ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(UserRole.TRAVELER);
  const [page, setPage] = useState<TravelerPage>('HOME');
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  
  // Home Page State
  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');

  useEffect(() => {
    dataService.getTours().then(setAllTours);
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    // Toggle: if clicking the active one, turn it off. Otherwise set it.
    setActiveCategory(prev => prev === categoryId ? '' : categoryId);
  };

  const getFilteredTours = () => {
      if (!activeCategory) return allTours;

      return allTours.filter(t => {
          if (activeCategory === 'Transport') {
              // Logic: Has pickup service OR is a driving tour
              return t.category === 'Driving' || t.pricing.addOns.some(a => a.name.toLowerCase().includes('pickup'));
          }
          if (activeCategory === 'Language') {
              // Logic: Speaks more than 1 language
              return t.languages.length > 1;
          }
          if (activeCategory === 'Family') {
              // Logic: Good group size
              return t.maxGroupSize >= 4;
          }
          if (activeCategory === 'Local') {
              // Logic: For MVP, show all, or verified
              return true; 
          }
          // Default fallthrough for other tags that don't match data perfectly yet
          return false;
      });
  };

  const filteredTours = getFilteredTours();

  if (!user) return <LoginScreen onLogin={(u) => { setUser(u); setRole(u.role); }} />;

  return (
    <div className="font-sans text-slate-900 bg-slate-50 min-h-screen pb-16 md:pb-0">
      <Navbar user={user} role={role} setRole={setRole} setPage={setPage} onLogout={() => setUser(null)} />
      
      {role === UserRole.GUIDE ? <GuideDashboard user={user} /> : (
        <>
          {page === 'HOME' && (
            <div>
              <HeroSection onSearch={() => setPage('SEARCH')} />
              <div className="max-w-7xl mx-auto px-4">
                <CategoryGrid selectedCategory={activeCategory} onCategoryClick={handleCategorySelect} />
                <h3 className="text-xl font-bold mb-4 mt-4">
                    {activeCategory ? `Results for ${activeCategory}` : 'Recommended For You'}
                </h3>
                <SearchResults tours={filteredTours} onSelectTour={(t) => { setSelectedTour(t); setPage('DETAILS'); }} />
              </div>
            </div>
          )}

          {page === 'SEARCH' && <SearchResults tours={allTours} onSelectTour={(t) => { setSelectedTour(t); setPage('DETAILS'); }} />}
          
          {page === 'DETAILS' && selectedTour && (
            <div className="min-h-screen bg-white animate-fade-in">
              <div className="relative h-72 md:h-96">
                <img src={selectedTour.publicData.images[0]} className="w-full h-full object-cover" />
                <button onClick={() => setPage('HOME')} className="absolute top-4 left-4 bg-white/50 backdrop-blur p-2 rounded-full hover:bg-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
              </div>
              <div className="max-w-4xl mx-auto px-4 py-8">
                 <div className="flex justify-between items-start mb-4">
                   <h1 className="text-3xl font-bold text-slate-900">{selectedTour.publicData.title}</h1>
                 </div>
                 <div className="flex gap-4 text-sm text-slate-500 mb-8 border-b border-slate-100 pb-8">
                    <span className="flex items-center gap-1"><Icons.Star /> {selectedTour.rating} ({selectedTour.reviewCount} reviews)</span>
                    <span>•</span>
                    <span>{selectedTour.publicData.meetingPoint}</span>
                    <span>•</span>
                    <span>{selectedTour.durationHours} hours</span>
                 </div>
                 
                 <div className="grid md:grid-cols-3 gap-8">
                   <div className="md:col-span-2 space-y-8">
                      <section>
                        <h3 className="font-bold text-lg mb-2">About this tour</h3>
                        <p className="text-slate-600 leading-relaxed">{selectedTour.publicData.summary}</p>
                      </section>
                      <section>
                        <h3 className="font-bold text-lg mb-2">Highlights</h3>
                        <ul className="grid grid-cols-2 gap-2">
                          {selectedTour.publicData.highlights.map(h => (
                            <li key={h} className="flex items-center gap-2 text-slate-600 text-sm"><Icons.Check /> {h}</li>
                          ))}
                        </ul>
                      </section>
                   </div>
                   {/* Sticky Booking Card */}
                   <div className="relative">
                      <div className="sticky top-24 bg-white border border-slate-200 shadow-lg rounded-2xl p-6">
                        <div className="text-2xl font-bold mb-4">${selectedTour.pricing.basePrice} <span className="text-sm font-normal text-slate-500">/ trip</span></div>
                        <button onClick={() => setShowBooking(true)} className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700">Check Availability</button>
                        <button onClick={() => setPage('CHAT')} className="w-full mt-3 border border-slate-300 font-bold py-3 rounded-xl hover:bg-slate-50">Chat with Guide</button>
                      </div>
                   </div>
                 </div>
              </div>
            </div>
          )}

          {page === 'TRIPS' && <MyTripsView />}
          {page === 'CHAT' && <ChatView />}

          {showBooking && selectedTour && (
             <BookingWizard tour={selectedTour} onClose={() => setShowBooking(false)} onComplete={() => { setShowBooking(false); setPage('TRIPS'); }} />
          )}

          <BottomNav activePage={page} setPage={setPage} />
        </>
      )}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}