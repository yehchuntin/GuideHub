
import { GuideProfile, Tour, Booking, Review, ChatMessage } from '../types';
import { db } from '../firebaseConfig';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where 
} from "firebase/firestore";

// --- MOCK DATA FOR SEEDING (Keep this to populate DB first time) ---
const MOCK_TOURS_SEED: Tour[] = [
  {
    id: 't1',
    guideId: 'g1',
    category: 'Food',
    durationHours: 4,
    maxGroupSize: 4,
    languages: ['English', 'Japanese'],
    isActive: true,
    rating: 4.9,
    reviewCount: 42,
    pricing: {
      basePrice: 150,
      currency: 'USD',
      perPerson: true,
      addOns: [
        { id: 'a1', name: 'Sake Tasting', price: 40, description: 'Premium flight of 3 sakes' },
        { id: 'a2', name: 'Kimono Rental Help', price: 30, description: 'Assistance with rental and return' }
      ]
    },
    publicData: {
      title: 'Kyoto Backstreet Izakaya Hop',
      summary: 'Explore the narrow Pontocho alleyways and eat where the locals eat. No tourist traps.',
      highlights: ['3 Authentic Izakayas', 'Yakitori Tasting', 'Pontocho Alley Walk'],
      itineraryOverview: ['Meet at Gion Shijo', 'First stop: Standing Bar', 'Walk Pontocho', 'Dinner: Hidden Izakaya'],
      included: ['Guide Fee', 'First drink'],
      excluded: ['Food cost (split bill)', 'Transport'],
      meetingPoint: 'Statue of Izumo no Okuni',
      transportation: 'Walking',
      images: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800']
    },
    privateData: {
      secretSpots: ['Bar K-ya (No english sign)', 'The tiny shrine behind the noodle shop'],
      detailedRoute: 'Enter alley 3, turn left at the red lantern. Code for door is 4421.',
      logisticsNotes: 'Bar 2 is cash only. Bring small change.',
      weatherBackupPlan: 'If raining, we use the covered arcade route via Nishiki Market.'
    }
  },
  {
    id: 't2',
    guideId: 'g2',
    category: 'Culture',
    durationHours: 3,
    maxGroupSize: 6,
    languages: ['English', 'Italian'],
    isActive: true,
    rating: 4.8,
    reviewCount: 15,
    pricing: {
      basePrice: 200,
      currency: 'USD',
      perPerson: false,
      addOns: [
        { id: 'a2', name: 'Private Van Pickup', price: 80, description: 'From hotel to Pantheon' }
      ]
    },
    publicData: {
      title: 'Rome: The Engineering Marvels',
      summary: 'Skip the myths, learn how the Pantheon actually stands up.',
      highlights: ['Pantheon Roof Access', 'Aqueduct Systems', 'Hidden Underground Ruins'],
      itineraryOverview: ['Pantheon Plaza', 'Engineering Deep Dive', 'Aqueduct Park'],
      included: ['Guide Fee', 'Entry Tickets'],
      excluded: ['Lunch'],
      meetingPoint: 'Pantheon Fountain',
      transportation: 'Walking',
      images: ['https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=800']
    },
    privateData: {
      secretSpots: ['The maintenance hatch view', 'Aquaduct key access point'],
      detailedRoute: 'Use the side staff entrance at Pantheon.',
      logisticsNotes: 'Security is tight, no tripods.',
      weatherBackupPlan: 'Museum of Roman Civilization'
    }
  }
];

export const dataService = {
  // --- Guides ---
  getGuideProfile: async (id: string): Promise<GuideProfile | undefined> => {
    const docRef = doc(db, "users", id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as GuideProfile;
    }
    return undefined;
  },

  updateGuideProfile: async (profile: GuideProfile): Promise<void> => {
    // This updates the user document with guide-specific fields
    const docRef = doc(db, "users", profile.id);
    await setDoc(docRef, profile, { merge: true });
  },

  // --- Tours ---
  getTours: async (): Promise<Tour[]> => {
    const toursRef = collection(db, "tours");
    const snap = await getDocs(toursRef);
    const tours = snap.docs.map(d => ({ ...d.data(), id: d.id } as Tour));

    // SEEDING LOGIC: If DB is empty, fill it with mock data
    if (tours.length === 0) {
      console.log("Seeding Database...");
      for (const t of MOCK_TOURS_SEED) {
        // Using setDoc with specific ID to keep it consistent
        await setDoc(doc(db, "tours", t.id), t);
      }
      return MOCK_TOURS_SEED;
    }
    
    return tours;
  },

  getGuideTours: async (guideId: string): Promise<Tour[]> => {
    const q = query(collection(db, "tours"), where("guideId", "==", guideId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as Tour));
  },

  saveTour: async (tour: Tour): Promise<void> => {
    // If id exists update, else add
    const tourRef = doc(db, "tours", tour.id || Math.random().toString(36).substr(2,9));
    const tourData = { ...tour, id: tourRef.id };
    await setDoc(tourRef, tourData, { merge: true });
  },

  // --- Bookings ---
  getGuideBookings: async (guideId: string): Promise<Booking[]> => {
    const q = query(collection(db, "bookings"), where("guideId", "==", guideId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as Booking));
  },

  getTravelerBookings: async (): Promise<Booking[]> => {
     // In a real app, pass the current user ID to filter. 
     // For this MVP, we fetch all (since we don't have easy context access here)
     // or implement a simple client-side filter in the UI.
     const snap = await getDocs(collection(db, "bookings"));
     return snap.docs.map(d => ({ ...d.data(), id: d.id } as Booking));
  },

  createBooking: async (booking: Omit<Booking, 'id' | 'status'>): Promise<Booking> => {
    const newBooking = {
      ...booking,
      status: 'CONFIRMED' as const, 
    };
    const docRef = await addDoc(collection(db, "bookings"), newBooking);
    return { ...newBooking, id: docRef.id };
  },

  updateBookingStatus: async (id: string, status: Booking['status']): Promise<void> => {
    const ref = doc(db, "bookings", id);
    await updateDoc(ref, { status });
  },

  // --- Chat ---
  getMessages: async (guideId: string): Promise<ChatMessage[]> => {
    // Ideally use onSnapshot for realtime, but for now using standard get
    const q = query(collection(db, `chats/${guideId}/messages`));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as ChatMessage))
      .sort((a,b) => a.timestamp['seconds'] - b.timestamp['seconds']); // Firestore timestamps
  },

  sendMessage: async (guideId: string, text: string): Promise<ChatMessage> => {
    const msg = { 
        senderId: 'user', 
        text, 
        timestamp: new Date() 
    };
    const docRef = await addDoc(collection(db, `chats/${guideId}/messages`), msg);
    return { ...msg, id: docRef.id } as ChatMessage;
  }
};
