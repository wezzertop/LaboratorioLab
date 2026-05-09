import { create } from 'zustand';

interface CreditState {
  credits: number;
  freeReportsUsed: number;
  consumeCredit: () => boolean;
  addCredits: (amount: number) => void;
  initialize: (credits: number, freeReportsUsed: number) => void;
}

export const useCreditStore = create<CreditState>((set, get) => ({
  credits: 0,
  freeReportsUsed: 0,
  
  initialize: (credits, freeReportsUsed) => set({ credits, freeReportsUsed }),
  
  consumeCredit: () => {
    const { credits, freeReportsUsed } = get();
    
    // First 3 reports are free
    if (freeReportsUsed < 3) {
      set({ freeReportsUsed: freeReportsUsed + 1 });
      return true;
    }
    
    // Use paid credits
    if (credits > 0) {
      set({ credits: credits - 1 });
      return true;
    }
    
    return false; // No credits available
  },
  
  addCredits: (amount) => set((state) => ({ credits: state.credits + amount }))
}));
