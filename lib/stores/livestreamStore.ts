import { create } from 'zustand';

// Types for livestream state
export interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  description?: string;
  isHighlighted: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
  role?: 'seller' | 'buyer' | 'moderator';
  isPinned?: boolean;
}

export interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  timestamp: number;
  x: number;
  y: number;
}

export interface Gift {
  id: string;
  type: string;
  name: string;
  value: number;
  animation: string;
}

export interface ViewerInfo {
  identity: string;
  name: string;
  joinedAt: number;
  role?: 'seller' | 'buyer';
}

export interface StreamStats {
  viewerCount: number;
  peakViewers: number;
  duration: number;
  messageCount: number;
  reactionCount: number;
  productClicks: number;
}

export type VideoLayout = 'grid' | 'spotlight' | 'screen-share' | 'side-by-side';
export type ViewMode = 'normal' | 'theater' | 'fullscreen' | 'pip';

export interface DetectionSettings {
  enabled: boolean;
  visibleToViewers: boolean;
  showLabels: boolean;
  showConfidence: boolean;
  confidenceThreshold: number;
  textThreshold: number;
  textPrompts: string[];
  fps: number;
}

interface LivestreamState {
  // Room state
  roomName: string | null;
  sessionId: string | null;
  isHost: boolean;
  isConnected: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor';

  // Object Detection state
  detectionSettings: DetectionSettings;
  isDetectionActive: boolean;

  // Featured products
  featuredProducts: FeaturedProduct[];
  highlightedProductId: string | null;

  // AI detection - auto-selected product
  aiDetectedProductId: string | null;
  aiDetectedAt: number | null;

  // Chat
  chatMessages: ChatMessage[];
  pinnedMessages: ChatMessage[];
  isChatVisible: boolean;

  // Reactions
  activeReactions: Reaction[];

  // Gifts
  recentGifts: Gift[];

  // Viewers
  viewers: ViewerInfo[];

  // Stats
  stats: StreamStats;

  // UI state
  videoLayout: VideoLayout;
  viewMode: ViewMode;
  isProductOverlayVisible: boolean;
  isCartVisible: boolean;
  selectedProduct: FeaturedProduct | null;

  // Shopping cart
  cartItems: Array<{ productId: string; quantity: number }>;

  // Actions
  setRoomName: (name: string | null) => void;
  setSessionId: (id: string | null) => void;
  setIsHost: (isHost: boolean) => void;
  setIsConnected: (isConnected: boolean) => void;
  setConnectionQuality: (quality: 'excellent' | 'good' | 'poor') => void;

  // Pre-populate actions (for PreLiveWizard)
  setFeaturedProducts: (products: FeaturedProduct[]) => void;

  // Featured products actions
  addFeaturedProduct: (product: FeaturedProduct) => void;
  removeFeaturedProduct: (productId: string) => void;
  highlightProduct: (productId: string | null) => void;
  updateProductStock: (productId: string, stock: number) => void;

  // Chat actions
  addChatMessage: (message: ChatMessage) => void;
  pinMessage: (messageId: string) => void;
  unpinMessage: (messageId: string) => void;
  clearChat: () => void;
  toggleChatVisibility: () => void;

  // Reactions actions
  addReaction: (reaction: Reaction) => void;
  removeReaction: (reactionId: string) => void;
  clearOldReactions: () => void;

  // Gifts actions
  addGift: (gift: Gift) => void;
  clearOldGifts: () => void;

  // Viewers actions
  setViewers: (viewers: ViewerInfo[]) => void;
  addViewer: (viewer: ViewerInfo) => void;
  removeViewer: (identity: string) => void;

  // Stats actions
  updateStats: (stats: Partial<StreamStats>) => void;
  incrementStat: (stat: keyof StreamStats) => void;

  // UI actions
  setVideoLayout: (layout: VideoLayout) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleProductOverlay: () => void;
  toggleCart: () => void;
  selectProduct: (product: FeaturedProduct | null) => void;

  // Cart actions
  addToCart: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Detection actions
  toggleDetection: () => void;
  setDetectionEnabled: (enabled: boolean) => void;
  setDetectionVisibleToViewers: (visible: boolean) => void;
  updateDetectionSettings: (settings: Partial<DetectionSettings>) => void;
  setDetectionActive: (active: boolean) => void;

  // AI detection product actions
  setAiDetectedProduct: (productId: string | null) => void;

  // Reset state
  resetState: () => void;
}

const initialStats: StreamStats = {
  viewerCount: 0,
  peakViewers: 0,
  duration: 0,
  messageCount: 0,
  reactionCount: 0,
  productClicks: 0,
};

const initialDetectionSettings: DetectionSettings = {
  enabled: false,
  visibleToViewers: true,
  showLabels: true,
  showConfidence: true,
  confidenceThreshold: 0.4,
  textThreshold: 0.3,
  textPrompts: ['a bottle', 'a mouse', 'a headset', 'a keyboard'],
  fps: 1.5,
};

export const useLivestreamStore = create<LivestreamState>((set, get) => ({
  // Initial state
  roomName: null,
  sessionId: null,
  isHost: false,
  isConnected: false,
  connectionQuality: 'excellent',

  detectionSettings: initialDetectionSettings,
  isDetectionActive: false,

  featuredProducts: [],
  highlightedProductId: null,
  aiDetectedProductId: null,
  aiDetectedAt: null,

  chatMessages: [],
  pinnedMessages: [],
  isChatVisible: true,

  activeReactions: [],

  recentGifts: [],

  viewers: [],

  stats: initialStats,

  videoLayout: 'spotlight',
  viewMode: 'normal',
  isProductOverlayVisible: true,
  isCartVisible: false,
  selectedProduct: null,

  cartItems: [],

  // Room actions
  setRoomName: (name) => set({ roomName: name }),
  setSessionId: (id) => set({ sessionId: id }),
  setIsHost: (isHost) => set({ isHost }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setConnectionQuality: (quality) => set({ connectionQuality: quality }),

  // Pre-populate featured products (for PreLiveWizard)
  setFeaturedProducts: (products) => set({ featuredProducts: products }),

  // Featured products actions
  addFeaturedProduct: (product) =>
    set((state) => ({
      featuredProducts: [...state.featuredProducts, product],
    })),

  removeFeaturedProduct: (productId) =>
    set((state) => ({
      featuredProducts: state.featuredProducts.filter((p) => p.id !== productId),
      highlightedProductId:
        state.highlightedProductId === productId ? null : state.highlightedProductId,
    })),

  highlightProduct: (productId) =>
    set((state) => ({
      highlightedProductId: productId,
      featuredProducts: state.featuredProducts.map((p) => ({
        ...p,
        isHighlighted: p.id === productId,
      })),
    })),

  updateProductStock: (productId, stock) =>
    set((state) => ({
      featuredProducts: state.featuredProducts.map((p) =>
        p.id === productId ? { ...p, stock } : p
      ),
    })),

  // Chat actions
  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
      stats: { ...state.stats, messageCount: state.stats.messageCount + 1 },
    })),

  pinMessage: (messageId) =>
    set((state) => {
      const message = state.chatMessages.find((m) => m.id === messageId);
      if (!message) return state;

      const updatedMessage = { ...message, isPinned: true };
      return {
        chatMessages: state.chatMessages.map((m) =>
          m.id === messageId ? updatedMessage : m
        ),
        pinnedMessages: [...state.pinnedMessages, updatedMessage],
      };
    }),

  unpinMessage: (messageId) =>
    set((state) => ({
      chatMessages: state.chatMessages.map((m) =>
        m.id === messageId ? { ...m, isPinned: false } : m
      ),
      pinnedMessages: state.pinnedMessages.filter((m) => m.id !== messageId),
    })),

  clearChat: () => set({ chatMessages: [], pinnedMessages: [] }),

  toggleChatVisibility: () =>
    set((state) => ({ isChatVisible: !state.isChatVisible })),

  // Reactions actions
  addReaction: (reaction) =>
    set((state) => ({
      activeReactions: [...state.activeReactions, reaction],
      stats: { ...state.stats, reactionCount: state.stats.reactionCount + 1 },
    })),

  removeReaction: (reactionId) =>
    set((state) => ({
      activeReactions: state.activeReactions.filter((r) => r.id !== reactionId),
    })),

  clearOldReactions: () =>
    set((state) => {
      const now = Date.now();
      return {
        activeReactions: state.activeReactions.filter(
          (r) => now - r.timestamp < 3000 // Keep reactions for 3 seconds
        ),
      };
    }),

  // Gifts actions
  addGift: (gift) =>
    set((state) => ({
      recentGifts: [...state.recentGifts, gift],
    })),

  clearOldGifts: () =>
    set((state) => ({
      recentGifts: state.recentGifts.slice(-10), // Keep only last 10 gifts
    })),

  // Viewers actions
  setViewers: (viewers) => set({ viewers }),

  addViewer: (viewer) =>
    set((state) => {
      const newViewerCount = state.stats.viewerCount + 1;
      return {
        viewers: [...state.viewers, viewer],
        stats: {
          ...state.stats,
          viewerCount: newViewerCount,
          peakViewers: Math.max(state.stats.peakViewers, newViewerCount),
        },
      };
    }),

  removeViewer: (identity) =>
    set((state) => ({
      viewers: state.viewers.filter((v) => v.identity !== identity),
      stats: { ...state.stats, viewerCount: Math.max(0, state.stats.viewerCount - 1) },
    })),

  // Stats actions
  updateStats: (stats) =>
    set((state) => ({
      stats: { ...state.stats, ...stats },
    })),

  incrementStat: (stat) =>
    set((state) => ({
      stats: { ...state.stats, [stat]: state.stats[stat] + 1 },
    })),

  // UI actions
  setVideoLayout: (layout) => set({ videoLayout: layout }),

  setViewMode: (mode) => set({ viewMode: mode }),

  toggleProductOverlay: () =>
    set((state) => ({
      isProductOverlayVisible: !state.isProductOverlayVisible,
    })),

  toggleCart: () =>
    set((state) => ({
      isCartVisible: !state.isCartVisible,
    })),

  selectProduct: (product) =>
    set({
      selectedProduct: product,
      stats: product
        ? { ...get().stats, productClicks: get().stats.productClicks + 1 }
        : get().stats,
    }),

  // Cart actions
  addToCart: (productId, quantity) =>
    set((state) => {
      const existingItem = state.cartItems.find((item) => item.productId === productId);

      if (existingItem) {
        return {
          cartItems: state.cartItems.map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }

      return {
        cartItems: [...state.cartItems, { productId, quantity }],
      };
    }),

  removeFromCart: (productId) =>
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.productId !== productId),
    })),

  updateCartQuantity: (productId, quantity) =>
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      ),
    })),

  clearCart: () => set({ cartItems: [] }),

  // Detection actions
  toggleDetection: () =>
    set((state) => ({
      detectionSettings: {
        ...state.detectionSettings,
        enabled: !state.detectionSettings.enabled,
      },
    })),

  setDetectionEnabled: (enabled) =>
    set((state) => ({
      detectionSettings: { ...state.detectionSettings, enabled },
    })),

  setDetectionVisibleToViewers: (visible) =>
    set((state) => ({
      detectionSettings: { ...state.detectionSettings, visibleToViewers: visible },
    })),

  updateDetectionSettings: (settings) =>
    set((state) => ({
      detectionSettings: { ...state.detectionSettings, ...settings },
    })),

  setDetectionActive: (active) =>
    set({ isDetectionActive: active }),

  // AI detection product actions
  setAiDetectedProduct: (productId) =>
    set((state) => ({
      aiDetectedProductId: productId,
      aiDetectedAt: productId ? Date.now() : null,
      // Also highlight the detected product
      highlightedProductId: productId ?? state.highlightedProductId,
      featuredProducts: productId
        ? state.featuredProducts.map((p) => ({
            ...p,
            isHighlighted: p.id === productId,
          }))
        : state.featuredProducts,
    })),

  // Reset state
  resetState: () =>
    set({
      roomName: null,
      sessionId: null,
      isHost: false,
      isConnected: false,
      connectionQuality: 'excellent',
      detectionSettings: initialDetectionSettings,
      isDetectionActive: false,
      featuredProducts: [],
      highlightedProductId: null,
      aiDetectedProductId: null,
      aiDetectedAt: null,
      chatMessages: [],
      pinnedMessages: [],
      isChatVisible: true,
      activeReactions: [],
      recentGifts: [],
      viewers: [],
      stats: initialStats,
      videoLayout: 'spotlight',
      viewMode: 'normal',
      isProductOverlayVisible: true,
      isCartVisible: false,
      selectedProduct: null,
      cartItems: [],
    }),
}));
