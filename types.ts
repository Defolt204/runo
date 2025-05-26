
export enum CurrencyType {
  REGULAR = 'Обычная валюта',
  PREMIUM = 'Донат-валюта'
}

export enum UserRole {
  PLAYER = 'Игрок',
  HELPER = 'Хелпер',
  MODERATOR = 'Модератор',
  ADMIN = 'Администратор'
}

export enum VIPStatus {
  NONE = 'Нет',
  VIP = 'VIP',
  PLUS = 'Plus',
  PREMIUM = 'Premium'
}

export type ActiveVipStatus = VIPStatus.VIP | VIPStatus.PLUS | VIPStatus.PREMIUM;

export interface AcquiredVipItem {
  id: string; // Unique ID for this stash item
  vipType: VIPStatus; // The base VIP type (VIP, Plus, Premium)
  vipDurationDays: number; // 0 for permanent
  acquiredDate: string; // ISO date
  source: 'Магазин' | 'Кейс';
}

export interface VipActivationLogEntry {
  id: string; // Unique ID for this log entry
  vipType: VIPStatus;
  vipDurationDays: number; // 0 for permanent
  activationDate: string; // ISO date
  source: 'Магазин (авто)' | 'Кейс (авто)' | 'Запас' | 'Админ' | 'Промокод' | 'Запрос одобрен';
  previousVipType?: VIPStatus;
  previousVipExpiry?: string;
}

export interface UsernameHistoryEntry {
  oldUsername: string;
  newUsername: string;
  changedAt: string; // ISO date
  changedByUsername: string; // Username of admin or user themselves
}

export interface PasswordChangeHistoryEntry {
  changedAt: string; // ISO date
  changedByUsername: string; // Username of admin or user themselves
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  regularBalance: number;
  premiumBalance: number;
  status: VIPStatus;
  vipExpiry?: string;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    totalWinningsRegular: number;
    totalWinningsPremium: number;
    russianRoulettePlayed: number;
    redBlackWhitePlayed: number;
    guessNumberPlayed: number;
    ladderPlayed: number;
  };
  inventory: {
    openedCases: number;
  };
  lastLogin: string;
  logs: Array<UserLog>;
  usedPromoCodes: string[];
  isBanned: boolean;
  banReason?: string;
  banExpiry?: string; // ISO string for ban expiry, undefined for permanent
  isMuted?: boolean;
  muteExpiry?: string; // ISO string for mute expiry
  muteReason?: string;
  mail: MailMessage[]; // User's mailbox
  vipStash: AcquiredVipItem[];
  vipActivationHistory: VipActivationLogEntry[];
  usernameHistory: UsernameHistoryEntry[];
  passwordChangeHistory: PasswordChangeHistoryEntry[];
}

export interface UserLog {
  timestamp: string;
  action: string; // e.g., 'Регистрация', 'Покупка VIP', 'Админ: Блокировка', 'Система: VIP истек'
  details: string;
}

export enum GameId {
  RUSSIAN_ROULETTE = 'Русская рулетка',
  RED_BLACK_WHITE = 'Красное/Чёрное/Белое',
  GUESS_NUMBER = 'Угадай число',
  LADDER = 'Лесенка'
}

export interface CaseItem {
  id: string;
  type: 'CURRENCY_REGULAR' | 'CURRENCY_PREMIUM' | 'VIP_STATUS';
  name: string;
  value?: number; 
  vipType?: ActiveVipStatus; // Use ActiveVipStatus for items from cases
  vipDurationDays?: number;
  probability: number; 
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
}

export interface GameCase {
  id: string;
  name: string;
  price: number; 
  currencyType: CurrencyType;
  items: CaseItem[];
  description: string;
}

export interface VIPOption {
  id: string; // Unique identifier for the specific option, e.g., "VIP_3D", "PREMIUM_30D"
  name: string; // Display name, e.g., "VIP (3 дня)"
  baseVipType: ActiveVipStatus; // The core VIP type (VIP, PLUS, PREMIUM) - Changed to ActiveVipStatus
  pricePremium: number;
  durationDays: number; 
  perks: string[];
  winMultiplier: number;
  accessToLadder: boolean;
  caseViewOdds: boolean;
  caseLuckBoost: number; 
  color: string;
}

export interface LeaderboardEntry {
  username: string;
  totalBalance: number; 
  status: VIPStatus;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderUsername: string;
  senderVipStatus: VIPStatus; // Added for displaying VIP in chat
  receiverUsername?: string; 
  content: string;
  timestamp: string;
  isAnnouncement?: boolean;
}

export interface PromoCodeReward {
  type: 'CURRENCY_REGULAR' | 'CURRENCY_PREMIUM' | 'VIP_STATUS';
  value?: number; 
  vipType?: ActiveVipStatus; // Use ActiveVipStatus for promo rewards
  vipDurationDays?: number; 
}

export interface PromoCode {
  id: string; 
  description: string; 
  rewards: PromoCodeReward[];
  usesLeft: number; 
  isActive: boolean;
  createdAt: string;
}

// Mailbox Feature
export interface MailMessage {
  id: string;
  senderId: string; // 'SYSTEM' or userId
  senderUsername: string; // 'Система' or user's username
  recipientId: string;
  subject: string;
  body: string;
  timestamp: string;
  isRead: boolean;
}

// Ban Request Feature
export enum BanRequestStatus {
  PENDING = 'Ожидает рассмотрения',
  APPROVED = 'Одобрена и исполнена',
  REJECTED = 'Отклонена'
}

export interface BanRequest {
  id: string;
  requesterId: string; 
  requesterUsername: string;
  targetUserId: string;
  targetUsername: string;
  reason: string;
  requestedDuration: string; // e.g., "7 дней", "24 часа", "навсегда" - text field for flexibility
  status: BanRequestStatus;
  timestamp: string;
  resolvedByUserId?: string; // Admin/Mod ID who resolved it
  resolvedByUsername?: string;
  resolvedAt?: string;
  resolverComment?: string;
}

// Resource/VIP Request Feature
export enum ResourceRequestStatus {
  PENDING = 'Ожидает',
  APPROVED = 'Одобрена',
  REJECTED = 'Отклонена'
}

export enum ResourceRequestAction {
  INCREASE_REGULAR = 'Увеличить обычную валюту',
  DECREASE_REGULAR = 'Уменьшить обычную валюту',
  INCREASE_PREMIUM = 'Увеличить донат-валюту',
  DECREASE_PREMIUM = 'Уменьшить донат-валюту',
  GRANT_VIP = 'Выдать VIP',
  REVOKE_VIP = 'Забрать VIP'
}

export interface ResourceRequest {
  id: string;
  requesterId: string;
  requesterUsername: string;
  targetUserId: string;
  targetUsername: string;
  action: ResourceRequestAction;
  amount?: number;
  currencyType?: CurrencyType; // Relevant for currency actions
  vipType?: ActiveVipStatus; // Relevant for GRANT_VIP, use ActiveVipStatus
  vipDurationDays?: number; // Relevant for GRANT_VIP, 0 for permanent
  reason: string;
  status: ResourceRequestStatus;
  timestamp: string;
  resolvedByUserId?: string;
  resolvedByUsername?: string;
  resolvedAt?: string;
  resolverComment?: string;
}
