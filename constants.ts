
import { VIPStatus, CurrencyType, GameId, CaseItem, GameCase, VIPOption, UserRole } from './types';

export const APP_NAME = "Игровой Клуб 'Фортуна'";

export const INITIAL_REGULAR_BALANCE = 1000;
export const INITIAL_PREMIUM_BALANCE = 10;

export const DEFAULT_USER_ROLE = UserRole.PLAYER;

// Game Constants
// Russian Roulette
export const RUSSIAN_ROULETTE_MIN_BET = 10;
export const RUSSIAN_ROULETTE_WIN_MULTIPLIER = 2; // Player wins Bet * Multiplier

// Red/Black/White
export const RED_BLACK_WHITE_MIN_BET = 10;
// export const RED_BLACK_WHITE_MAX_BET = 100; // Removed, bet any amount user has >= MIN_BET
export const RED_BLACK_WHITE_MULTIPLIER = 2;
export const RED_BLACK_WHITE_COLORS = {
  RED: { name: 'Красное', probability: 0.47, colorClass: 'bg-red-500 hover:bg-red-600' },
  BLACK: { name: 'Чёрное', probability: 0.47, colorClass: 'bg-gray-800 hover:bg-gray-900 text-white' },
  WHITE: { name: 'Белое', probability: 0.06, colorClass: 'bg-gray-200 hover:bg-gray-300 text-black' }
};

// Guess Number
export const GUESS_NUMBER_MIN_VAL = 1;
export const GUESS_NUMBER_MAX_VAL = 100;
export const GUESS_NUMBER_MAX_ATTEMPTS = 10;
export const GUESS_NUMBER_MIN_STAKE = 5; // User inputs their stake
export const GUESS_NUMBER_RANGES_MULTIPLIERS = [
  { attempts: 5, multiplier: 3 },
  { attempts: 8, multiplier: 2 },
  { attempts: 10, multiplier: 1.5 },
];

// Ladder Game
export const LADDER_GAME_ACCESS_STATUS: VIPStatus[] = [VIPStatus.PLUS, VIPStatus.PREMIUM];
export const LADDER_GAME_MIN_STAKE = 10; // User inputs their stake
export const LADDER_GAME_STEPS = [
  { step: 1, successProbability: 0.90, rewardMultiplier: 1.2 },
  { step: 2, successProbability: 0.80, rewardMultiplier: 1.3 },
  { step: 3, successProbability: 0.70, rewardMultiplier: 1.4 },
  { step: 4, successProbability: 0.60, rewardMultiplier: 1.5 },
  { step: 5, successProbability: 0.50, rewardMultiplier: 2.0 }
];


export const VIP_OPTIONS: VIPOption[] = [
  // VIP
  {
    id: "VIP_3D",
    name: "VIP (3 дня)",
    baseVipType: VIPStatus.VIP,
    pricePremium: 8,
    durationDays: 3,
    perks: ["x1.5 к выигрышу"],
    winMultiplier: 1.5, accessToLadder: false, caseViewOdds: false, caseLuckBoost: 0, color: "bg-vip-vip"
  },
  {
    id: "VIP_7D",
    name: "VIP (7 дней)",
    baseVipType: VIPStatus.VIP,
    pricePremium: 15,
    durationDays: 7,
    perks: ["x1.5 к выигрышу"],
    winMultiplier: 1.5, accessToLadder: false, caseViewOdds: false, caseLuckBoost: 0, color: "bg-vip-vip"
  },
  {
    id: "VIP_30D",
    name: "VIP (30 дней)",
    baseVipType: VIPStatus.VIP,
    pricePremium: 50,
    durationDays: 30,
    perks: ["x1.5 к выигрышу", "Бесплатный кейс при покупке"],
    winMultiplier: 1.5, accessToLadder: false, caseViewOdds: false, caseLuckBoost: 0, color: "bg-vip-vip"
  },
  // Plus
  {
    id: "PLUS_3D",
    name: "Plus (3 дня)",
    baseVipType: VIPStatus.PLUS,
    pricePremium: 25,
    durationDays: 3,
    perks: ["x2 к выигрышу", "Доступ к 'Лесенке'"],
    winMultiplier: 2, accessToLadder: true, caseViewOdds: false, caseLuckBoost: 0, color: "bg-vip-plus"
  },
  {
    id: "PLUS_7D",
    name: "Plus (7 дней)",
    baseVipType: VIPStatus.PLUS,
    pricePremium: 45,
    durationDays: 7,
    perks: ["x2 к выигрышу", "Доступ к 'Лесенке'"],
    winMultiplier: 2, accessToLadder: true, caseViewOdds: false, caseLuckBoost: 0, color: "bg-vip-plus"
  },
  {
    id: "PLUS_30D",
    name: "Plus (30 дней)",
    baseVipType: VIPStatus.PLUS,
    pricePremium: 150,
    durationDays: 30,
    perks: ["x2 к выигрышу", "Доступ к 'Лесенке'"],
    winMultiplier: 2, accessToLadder: true, caseViewOdds: false, caseLuckBoost: 0, color: "bg-vip-plus"
  },
  // Premium
  {
    id: "PREMIUM_3D",
    name: "Premium (3 дня)",
    baseVipType: VIPStatus.PREMIUM,
    pricePremium: 50,
    durationDays: 3,
    perks: ["x2.5 к выигрышу", "Доступ к 'Лесенке'", "Просмотр шансов кейсов", "+5% к шансам в кейсах"],
    winMultiplier: 2.5, accessToLadder: true, caseViewOdds: true, caseLuckBoost: 0.05, color: "bg-vip-premium"
  },
  {
    id: "PREMIUM_7D",
    name: "Premium (7 дней)",
    baseVipType: VIPStatus.PREMIUM,
    pricePremium: 90,
    durationDays: 7,
    perks: ["x2.5 к выигрышу", "Доступ к 'Лесенке'", "Просмотр шансов кейсов", "+7% к шансам в кейсах"],
    winMultiplier: 2.5, accessToLadder: true, caseViewOdds: true, caseLuckBoost: 0.07, color: "bg-vip-premium"
  },
  {
    id: "PREMIUM_30D",
    name: "Premium (30 дней)",
    baseVipType: VIPStatus.PREMIUM,
    pricePremium: 300,
    durationDays: 30,
    perks: ["x2.5 к выигрышу", "Доступ к 'Лесенке'", "Просмотр шансов кейсов", "+10% к шансам в кейсах", "Повышенный дроп"],
    winMultiplier: 2.5, accessToLadder: true, caseViewOdds: true, caseLuckBoost: 0.1, color: "bg-vip-premium"
  },
];

// --- New Case Item Definitions ---

// Regular Currency Items
const TINY_REG_CURRENCY: CaseItem[] = [
  { id: 'reg_t1', type: 'CURRENCY_REGULAR', name: '10 Монет', value: 10, probability: 0, rarity: 'common' },
  { id: 'reg_t2', type: 'CURRENCY_REGULAR', name: '25 Монет', value: 25, probability: 0, rarity: 'common' },
  { id: 'reg_t3', type: 'CURRENCY_REGULAR', name: '50 Монет', value: 50, probability: 0, rarity: 'common' },
];
const SMALL_REG_CURRENCY: CaseItem[] = [
  { id: 'reg_s1', type: 'CURRENCY_REGULAR', name: '100 Монет', value: 100, probability: 0, rarity: 'common' },
  { id: 'reg_s2', type: 'CURRENCY_REGULAR', name: '250 Монет', value: 250, probability: 0, rarity: 'uncommon' },
  { id: 'reg_s3', type: 'CURRENCY_REGULAR', name: '500 Монет', value: 500, probability: 0, rarity: 'uncommon' },
];
const MEDIUM_REG_CURRENCY: CaseItem[] = [
  { id: 'reg_m1', type: 'CURRENCY_REGULAR', name: '750 Монет', value: 750, probability: 0, rarity: 'uncommon' },
  { id: 'reg_m2', type: 'CURRENCY_REGULAR', name: '1000 Монет', value: 1000, probability: 0, rarity: 'rare' },
  { id: 'reg_m3', type: 'CURRENCY_REGULAR', name: '1500 Монет', value: 1500, probability: 0, rarity: 'rare' },
];
const LARGE_REG_CURRENCY: CaseItem[] = [
  { id: 'reg_l1', type: 'CURRENCY_REGULAR', name: '2500 Монет', value: 2500, probability: 0, rarity: 'rare' },
  { id: 'reg_l2', type: 'CURRENCY_REGULAR', name: '5000 Монет', value: 5000, probability: 0, rarity: 'epic' },
  { id: 'reg_l3', type: 'CURRENCY_REGULAR', name: '10000 Монет', value: 10000, probability: 0, rarity: 'epic' },
];

// Premium Currency Items
const TINY_PREM_CURRENCY: CaseItem[] = [
  { id: 'prem_t1', type: 'CURRENCY_PREMIUM', name: '1 Кристалл', value: 1, probability: 0, rarity: 'uncommon' },
  { id: 'prem_t2', type: 'CURRENCY_PREMIUM', name: '2 Кристалла', value: 2, probability: 0, rarity: 'uncommon' },
];
const SMALL_PREM_CURRENCY: CaseItem[] = [
  { id: 'prem_s1', type: 'CURRENCY_PREMIUM', name: '5 Кристаллов', value: 5, probability: 0, rarity: 'rare' },
  { id: 'prem_s2', type: 'CURRENCY_PREMIUM', name: '10 Кристаллов', value: 10, probability: 0, rarity: 'rare' },
];
const MEDIUM_PREM_CURRENCY: CaseItem[] = [
  { id: 'prem_m1', type: 'CURRENCY_PREMIUM', name: '15 Кристаллов', value: 15, probability: 0, rarity: 'epic' },
  { id: 'prem_m2', type: 'CURRENCY_PREMIUM', name: '25 Кристаллов', value: 25, probability: 0, rarity: 'epic' },
];
const LARGE_PREM_CURRENCY: CaseItem[] = [
  { id: 'prem_l1', type: 'CURRENCY_PREMIUM', name: '50 Кристаллов', value: 50, probability: 0, rarity: 'epic' },
  { id: 'prem_l2', type: 'CURRENCY_PREMIUM', name: '100 Кристаллов', value: 100, probability: 0, rarity: 'epic' },
];

// VIP Status Items
const SHORT_VIP_ITEMS: CaseItem[] = [
  { id: 'vip_s1', type: 'VIP_STATUS', name: 'VIP (1 день)', vipType: VIPStatus.VIP, vipDurationDays: 1, probability: 0, rarity: 'rare' },
  { id: 'vip_s2', type: 'VIP_STATUS', name: 'VIP (3 дня)', vipType: VIPStatus.VIP, vipDurationDays: 3, probability: 0, rarity: 'epic' },
];
const MEDIUM_VIP_ITEMS: CaseItem[] = [
  { id: 'vip_m1', type: 'VIP_STATUS', name: 'VIP (7 дней)', vipType: VIPStatus.VIP, vipDurationDays: 7, probability: 0, rarity: 'epic' },
  { id: 'vip_m2', type: 'VIP_STATUS', name: 'Plus (3 дня)', vipType: VIPStatus.PLUS, vipDurationDays: 3, probability: 0, rarity: 'epic' },
];
const LONG_VIP_ITEMS: CaseItem[] = [
  { id: 'vip_l1', type: 'VIP_STATUS', name: 'Plus (7 дней)', vipType: VIPStatus.PLUS, vipDurationDays: 7, probability: 0, rarity: 'epic' },
  { id: 'vip_l2', type: 'VIP_STATUS', name: 'Premium (3 дня)', vipType: VIPStatus.PREMIUM, vipDurationDays: 3, probability: 0, rarity: 'epic' },
  { id: 'vip_l3', type: 'VIP_STATUS', name: 'Premium (7 дней)', vipType: VIPStatus.PREMIUM, vipDurationDays: 7, probability: 0, rarity: 'epic' },
];


export const GAME_CASES: GameCase[] = [
  // --- Regular Currency Cases (15) ---
  // Tier 1: Very Cheap (50 - 500 Regular Currency)
  {
    id: 'case_rusty_box', // Price: 50
    name: 'Ржавый Ящик',
    price: 50,
    currencyType: CurrencyType.REGULAR,
    description: 'Старый ящик, найденный на задворках. Что внутри?',
    items: [
      { id: 'rusty_reg_10', type: 'CURRENCY_REGULAR', name: '10 Монет', value: 10, probability: 0.35, rarity: 'common' }, // Net -40
      { id: 'rusty_reg_25', type: 'CURRENCY_REGULAR', name: '25 Монет', value: 25, probability: 0.25, rarity: 'common' }, // Net -25
      { id: 'rusty_reg_50', type: 'CURRENCY_REGULAR', name: '50 Монет', value: 50, probability: 0.15, rarity: 'common' }, // Net 0
      { id: 'rusty_reg_bonus_75', type: 'CURRENCY_REGULAR', name: 'Бонус 75 Монет', value: 75, probability: 0.10, rarity: 'uncommon' }, // Net +25
      { id: 'rusty_reg_penalty_20', type: 'CURRENCY_REGULAR', name: 'Неудача (-20 Монет)', value: -20, probability: 0.10, rarity: 'common' }, // Total Loss 50+20 = 70
      { id: 'rusty_prem_1', type: 'CURRENCY_PREMIUM', name: '1 Кристалл', value: 1, probability: 0.05, rarity: 'uncommon' },
    ]
  },
  {
    id: 'case_coin_pouch', // Price: 100
    name: 'Мешочек Монет',
    price: 100,
    currencyType: CurrencyType.REGULAR,
    description: 'Простой мешочек, звенит от монет.',
    items: [
      { id: 'pouch_reg_50', type: 'CURRENCY_REGULAR', name: '50 Монет', value: 50, probability: 0.40, rarity: 'common' }, // Net -50
      { id: 'pouch_reg_100', type: 'CURRENCY_REGULAR', name: '100 Монет', value: 100, probability: 0.25, rarity: 'common' }, // Net 0
      { id: 'pouch_reg_bonus_150', type: 'CURRENCY_REGULAR', name: 'Бонус 150 Монет', value: 150, probability: 0.15, rarity: 'uncommon' }, // Net +50
      { id: 'pouch_reg_jackpot_250', type: 'CURRENCY_REGULAR', name: 'Джекпот 250 Монет', value: 250, probability: 0.05, rarity: 'rare' }, // Net +150
      { id: 'pouch_reg_penalty_50', type: 'CURRENCY_REGULAR', name: 'Крупная неудача (-50 Монет)', value: -50, probability: 0.10, rarity: 'common' }, // Total Loss 100+50 = 150
      { id: 'pouch_prem_2', type: 'CURRENCY_PREMIUM', name: '2 Кристалла', value: 2, probability: 0.05, rarity: 'uncommon' },
    ]
  },
  {
    id: 'case_lucky_trinket', // Price: 250
    name: 'Счастливый Брелок',
    price: 250,
    currencyType: CurrencyType.REGULAR,
    description: 'Маленький брелок, может принести удачу.',
    items: [
      { id: 'trinket_reg_100', type: 'CURRENCY_REGULAR', name: '100 Монет', value: 100, probability: 0.40, rarity: 'common' }, // Net -150
      { id: 'trinket_reg_250', type: 'CURRENCY_REGULAR', name: '250 Монет', value: 250, probability: 0.30, rarity: 'uncommon' }, // Net 0
      { id: 'trinket_reg_bonus_400', type: 'CURRENCY_REGULAR', name: 'Бонус 400 Монет', value: 400, probability: 0.15, rarity: 'rare' }, // Net +150
      { id: 'trinket_reg_penalty_100', type: 'CURRENCY_REGULAR', name: 'Упс (-100 Монет)', value: -100, probability: 0.10, rarity: 'common' }, // Total loss 350
      { ...TINY_PREM_CURRENCY[0], probability: 0.03 }, // 1 Кристалл
      { ...TINY_PREM_CURRENCY[1], probability: 0.02 }, // 2 Кристалла
    ]
  },
  {
    id: 'case_workers_lunchbox', // Price 500
    name: 'Ланчбокс Работяги',
    price: 500,
    currencyType: CurrencyType.REGULAR,
    description: 'Что-то съедобное или немного деньжат?',
    items: [
      { ...SMALL_REG_CURRENCY[1], probability: 0.4 }, // 250 Монет (Net -250)
      { ...SMALL_REG_CURRENCY[2], probability: 0.3 }, // 500 Монет (Net 0)
      { id: 'lunchbox_bonus_750', type: 'CURRENCY_REGULAR', name: 'Премия 750 Монет', value: 750, probability: 0.15, rarity: 'rare' }, // Net +250
      { id: 'lunchbox_penalty_200', type: 'CURRENCY_REGULAR', name: 'Штраф (-200 Монет)', value: -200, probability: 0.10, rarity: 'common'}, // Total loss 700
      { ...SMALL_PREM_CURRENCY[0], probability: 0.05 }, // 5 Кристаллов
    ]
  },
   {
    id: 'case_dice_roll',
    name: 'Бросок Костей',
    price: 150,
    currencyType: CurrencyType.REGULAR,
    description: 'Какое число выпадет на этот раз?',
    items: [
      { ...TINY_REG_CURRENCY[0], name: "Выпало 1-2 (10 Монет)", value: 10, probability: 0.33, rarity: 'common' },
      { ...TINY_REG_CURRENCY[2], name: "Выпало 3-4 (50 Монет)", value: 50, probability: 0.33, rarity: 'common' },
      { ...SMALL_REG_CURRENCY[0], name: "Выпало 5-6 (100 Монет)", value: 100, probability: 0.34, rarity: 'common' },
    ]
  },

  // Tier 2: Medium (1000 - 5000 Regular Currency)
  {
    id: 'case_merchants_chest',
    name: 'Сундук Торговца',
    price: 1000,
    currencyType: CurrencyType.REGULAR,
    description: 'Товары и немного монет от заезжего купца.',
    items: [
      { ...SMALL_REG_CURRENCY[2], probability: 0.5 }, // 500 Монет
      { ...MEDIUM_REG_CURRENCY[0], probability: 0.3 }, // 750 Монет
      { ...MEDIUM_REG_CURRENCY[1], probability: 0.15 }, // 1000 Монет
      { ...SMALL_PREM_CURRENCY[0], probability: 0.05 }, // 5 Кристаллов
    ]
  },
  {
    id: 'case_adventurers_pack',
    name: 'Рюкзак Путешественника',
    price: 2000,
    currencyType: CurrencyType.REGULAR,
    description: 'Содержимое рюкзака бывалого искателя приключений.',
    items: [
      { ...MEDIUM_REG_CURRENCY[0], probability: 0.4 }, // 750 Монет
      { ...MEDIUM_REG_CURRENCY[1], probability: 0.3 }, // 1000 Монет
      { ...MEDIUM_REG_CURRENCY[2], probability: 0.2 }, // 1500 Монет
      { ...SMALL_PREM_CURRENCY[1], probability: 0.08 }, // 10 Кристаллов
      { ...SHORT_VIP_ITEMS[0], probability: 0.02 }, // VIP 1 день
    ]
  },
  {
    id: 'case_gamblers_choice',
    name: 'Выбор Игрока',
    price: 3500,
    currencyType: CurrencyType.REGULAR,
    description: 'Высокие ставки, высокие награды... или нет?',
    items: [
      { id: 'gambler_tiny_loss', type: 'CURRENCY_REGULAR', name: "Малая неудача (100 Монет)", value: 100, probability: 0.2, rarity: 'common' },   // Net -3400
      { ...MEDIUM_REG_CURRENCY[2], probability: 0.4 }, // 1500 Монет (Net -2000)
      { ...LARGE_REG_CURRENCY[0], probability: 0.3 }, // 2500 Монет (Net -1000)
      { id: 'gambler_penalty_1000', type: 'CURRENCY_REGULAR', name: 'Крупный проигрыш (-1000 Монет)', value: -1000, probability: 0.05, rarity: 'uncommon' }, // Total loss 4500
      { ...MEDIUM_PREM_CURRENCY[0], probability: 0.03 }, // 15 Кристаллов
      { ...SHORT_VIP_ITEMS[1], probability: 0.02 }, // VIP 3 дня
    ]
  },
  {
    id: 'case_silver_strongbox',
    name: 'Серебряный Сейф',
    price: 5000,
    currencyType: CurrencyType.REGULAR,
    description: 'Надежный сейф, скрывающий ценности.',
    items: [
      { ...MEDIUM_REG_CURRENCY[2], probability: 0.45 }, // 1500 Монет
      { ...LARGE_REG_CURRENCY[0], probability: 0.35 }, // 2500 Монет
      { ...LARGE_REG_CURRENCY[1], probability: 0.1 },  // 5000 Монет
      { ...MEDIUM_PREM_CURRENCY[1], probability: 0.08 }, // 25 Кристаллов
      { ...SHORT_VIP_ITEMS[1], probability: 0.02 }, // VIP 3 дня
    ]
  },
   {
    id: 'case_card_draw',
    name: 'Тяни Карту',
    price: 1500,
    currencyType: CurrencyType.REGULAR,
    description: 'Какая карта тебе выпадет? Валет, Дама, Король или Туз?',
    items: [
      { ...SMALL_REG_CURRENCY[1], name: "Валет (250 Монет)", value: 250, probability: 0.40, rarity: 'common' },
      { ...SMALL_REG_CURRENCY[2], name: "Дама (500 Монет)", value: 500, probability: 0.30, rarity: 'uncommon' },
      { ...MEDIUM_REG_CURRENCY[1], name: "Король (1000 Монет)", value: 1000, probability: 0.20, rarity: 'rare' },
      { ...MEDIUM_REG_CURRENCY[2], name: "Туз (1500 Монет)", value: 1500, probability: 0.10, rarity: 'epic' },
    ]
  },

  // Tier 3: Expensive (10000 - 50000 Regular Currency)
  {
    id: 'case_gold_hoard',
    name: 'Золотой Клад',
    price: 10000,
    currencyType: CurrencyType.REGULAR,
    description: 'Гора золота, скрытая от посторонних глаз.',
    items: [
      { ...LARGE_REG_CURRENCY[0], probability: 0.5 }, // 2500 Монет
      { ...LARGE_REG_CURRENCY[1], probability: 0.35 }, // 5000 Монет
      { ...LARGE_REG_CURRENCY[2], probability: 0.1 }, // 10000 Монет
      { ...MEDIUM_PREM_CURRENCY[1], probability: 0.04 }, // 25 Кристаллов
      { ...MEDIUM_VIP_ITEMS[0], probability: 0.01 }, // VIP 7 дней
    ]
  },
  {
    id: 'case_royal_treasury',
    name: 'Королевская Казна',
    price: 25000,
    currencyType: CurrencyType.REGULAR,
    description: 'Богатства из сокровищницы самого короля!',
    items: [
      { ...LARGE_REG_CURRENCY[1], probability: 0.6 }, // 5000 Монет
      { ...LARGE_REG_CURRENCY[2], probability: 0.3 }, // 10000 Монет
      { ...LARGE_PREM_CURRENCY[0], probability: 0.07 }, // 50 Кристаллов
      { ...MEDIUM_VIP_ITEMS[1], probability: 0.03 }, // Plus 3 дня
    ]
  },
  {
    id: 'case_dragons_lair',
    name: 'Логово Дракона',
    price: 50000,
    currencyType: CurrencyType.REGULAR,
    description: 'Только самые смелые рискнут заглянуть сюда. Огромные богатства или опаляющее пламя?',
    items: [
// Explicitly add 'rarity' to ensure it's present, matching the structure of CaseItem and resolving TS error.
      { ...LARGE_REG_CURRENCY[2], name: "Чешуя Дракона (10000 Монет)", value: 10000, probability: 0.7, rarity: 'epic' },
      { ...LARGE_PREM_CURRENCY[0], name: "Коготь Дракона (50 Кристаллов)", value: 50, probability: 0.15, rarity: 'epic' },
      { ...LARGE_PREM_CURRENCY[1], name: "Сердце Дракона (100 Кристаллов)", value: 100, probability: 0.1, rarity: 'epic' },
      { ...MEDIUM_VIP_ITEMS[0], name: "Благословение Дракона (VIP 7 дней)", vipType: VIPStatus.VIP, vipDurationDays: 7, probability: 0.05, rarity: 'epic' },
    ]
  },
  {
    id: 'case_vault_777',
    name: 'Хранилище 777',
    price: 7777, // Lucky number price
    currencyType: CurrencyType.REGULAR,
    description: 'Счастливое хранилище, полное сюрпризов.',
    items: [
      { ...MEDIUM_REG_CURRENCY[1], name: '777 Монет', value: 777, probability: 0.3, rarity: 'rare' },
      { ...MEDIUM_REG_CURRENCY[2], name: '1777 Монет', value: 1777, probability: 0.3, rarity: 'rare' },
      { ...LARGE_REG_CURRENCY[0], name: '2777 Монет', value: 2777, probability: 0.2, rarity: 'epic' },
      { ...SMALL_PREM_CURRENCY[1], name: '7 Кристаллов', value: 7, probability: 0.15, rarity: 'rare' },
      { ...SHORT_VIP_ITEMS[0], name: 'VIP (1 день)', vipType: VIPStatus.VIP, vipDurationDays: 1, probability: 0.05, rarity: 'rare' },
    ]
  },
  {
    id: 'case_mystery_fortune',
    name: 'Таинственная Фортуна',
    price: 12345,
    currencyType: CurrencyType.REGULAR,
    description: 'Никогда не знаешь, что найдешь!',
    items: [
      { ...SMALL_REG_CURRENCY[0], probability: 0.2 },
      { ...MEDIUM_REG_CURRENCY[0], probability: 0.2 },
      { ...LARGE_REG_CURRENCY[0], probability: 0.2 },
      { ...TINY_PREM_CURRENCY[0], probability: 0.1 },
      { ...SMALL_PREM_CURRENCY[0], probability: 0.1 },
      { ...MEDIUM_PREM_CURRENCY[0], probability: 0.1 },
      { ...SHORT_VIP_ITEMS[0], probability: 0.05 },
      { id: 'nothing_mf', type: 'CURRENCY_REGULAR', name: 'Пусто :(', value: 1, probability: 0.05, rarity: 'common' }, // A small "dud" prize
    ]
  },


  // --- Premium Currency Cases (5) ---
  {
    id: 'case_premium_starter',
    name: 'Премиум Старт',
    price: 10,
    currencyType: CurrencyType.PREMIUM,
    description: 'Начните свой путь к богатству с этим премиальным набором.',
    items: [
      { ...SMALL_PREM_CURRENCY[0], probability: 0.5 },  // 5 Кристаллов
      { ...SMALL_PREM_CURRENCY[1], probability: 0.35 }, // 10 Кристаллов
      { ...MEDIUM_PREM_CURRENCY[0], probability: 0.1 }, // 15 Кристаллов
      { ...SHORT_VIP_ITEMS[1], probability: 0.05 },    // VIP 3 дня
    ]
  },
  {
    id: 'case_ruby_reliquary',
    name: 'Рубиновый Реликварий',
    price: 25,
    currencyType: CurrencyType.PREMIUM,
    description: 'Древний реликварий, наполненный сверкающими рубинами и ценностями.',
    items: [
      { ...SMALL_PREM_CURRENCY[1], probability: 0.4 },  // 10 Кристаллов
      { ...MEDIUM_PREM_CURRENCY[0], probability: 0.3 }, // 15 Кристаллов
      { ...MEDIUM_PREM_CURRENCY[1], probability: 0.2 }, // 25 Кристаллов
      { ...MEDIUM_VIP_ITEMS[0], probability: 0.07 },    // VIP 7 дней
      { ...MEDIUM_VIP_ITEMS[1], probability: 0.03 },    // Plus 3 дня
    ]
  },
  {
    id: 'case_sapphire_strongbox',
    name: 'Сапфировый Сейф',
    price: 50,
    currencyType: CurrencyType.PREMIUM,
    description: 'Крепкий сейф, инкрустированный сапфирами. Хранит редкие сокровища.',
    items: [
      { ...MEDIUM_PREM_CURRENCY[1], probability: 0.45 }, // 25 Кристаллов
      { ...LARGE_PREM_CURRENCY[0], probability: 0.35 },  // 50 Кристаллов
      { ...MEDIUM_VIP_ITEMS[1], probability: 0.12 },     // Plus 3 дня
      { ...LONG_VIP_ITEMS[0], probability: 0.08 },     // Plus 7 дней
    ]
  },
  {
    id: 'case_emerald_eminence',
    name: 'Изумрудное Величие',
    price: 100,
    currencyType: CurrencyType.PREMIUM,
    description: 'Величественный кейс, источающий изумрудное сияние. Только для элиты.',
    items: [
      { ...LARGE_PREM_CURRENCY[0], probability: 0.5 },   // 50 Кристаллов
      { ...LARGE_PREM_CURRENCY[1], probability: 0.3 },   // 100 Кристаллов
      { ...LONG_VIP_ITEMS[0], probability: 0.1 },      // Plus 7 дней
      { ...LONG_VIP_ITEMS[1], probability: 0.07 },      // Premium 3 дня
      { ...LONG_VIP_ITEMS[2], probability: 0.03 },      // Premium 7 дней
    ]
  },
  {
    id: 'case_diamond_dynasty',
    name: 'Бриллиантовая Династия',
    price: 250,
    currencyType: CurrencyType.PREMIUM,
    description: 'Вершина роскоши! Кейс, достойный королей, с невероятными наградами.',
    items: [
      { ...LARGE_PREM_CURRENCY[1], name: 'Россыпь Бриллиантов (100 Кристаллов)', value: 100, probability: 0.6, rarity: 'epic' },
      { id: 'prem_dd_200', type: 'CURRENCY_PREMIUM', name: 'Королевский Бриллиант (200 Кристаллов)', value: 200, probability: 0.2, rarity: 'epic'},
      { ...LONG_VIP_ITEMS[2], name: 'VIP Premium (7 дней)', vipType: VIPStatus.PREMIUM, vipDurationDays: 7, probability: 0.15, rarity: 'epic' },
      { id: 'vip_prem_30d', type: 'VIP_STATUS', name: 'VIP Premium (30 дней)', vipType: VIPStatus.PREMIUM, vipDurationDays: 30, probability: 0.05, rarity: 'epic' },
    ]
  }
];


export const MOCK_USER_LOGS_COUNT = 100;
export const MOCK_MODER_LOGS_COUNT = 1000;

export const NAV_LINKS = [
  { name: 'Главная', path: '/' },
  { name: 'Игры', path: '/games' },
  { name: 'Кейсы', path: '/cases' },
  { name: 'Магазин VIP', path: '/store' },
  { name: 'Лидеры', path: '/leaderboard' },
  { name: 'Чат', path: '/chat' },
  { name: 'Переводы', path: '/transfers' },
  { name: 'Промокоды', path: '/promocodes' },
  { name: 'Профиль', path: '/profile' },
];

export const ADMIN_NAV_LINKS = [
   { name: 'Админ-панель', path: '/admin', roles: [UserRole.ADMIN, UserRole.MODERATOR, UserRole.HELPER] },
   { name: 'Почта', path: '/mail', roles: [UserRole.ADMIN, UserRole.MODERATOR] } 
];

export const MIN_PASSWORD_LENGTH = 4;

// VIP Stash and Activation History constants
export const MAX_VIP_STASH_SIZE = 5;
export const MAX_VIP_ACTIVATION_HISTORY_SIZE = 5;

// History constants
export const MAX_USERNAME_HISTORY_SIZE = 10;
export const MAX_PASSWORD_HISTORY_SIZE = 10;
export const GA_USERNAME = 'Alek'; // Global Admin Username