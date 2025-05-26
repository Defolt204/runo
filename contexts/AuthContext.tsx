
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { User, UserRole, VIPStatus, CurrencyType, UserLog, PromoCode, PromoCodeReward, CaseItem, MailMessage, BanRequest, BanRequestStatus, AcquiredVipItem, VipActivationLogEntry, UsernameHistoryEntry, PasswordChangeHistoryEntry, VIPOption, ResourceRequest, ResourceRequestStatus, ResourceRequestAction } from '../types';
import { INITIAL_REGULAR_BALANCE, INITIAL_PREMIUM_BALANCE, DEFAULT_USER_ROLE, VIP_OPTIONS, GAME_CASES, MIN_PASSWORD_LENGTH, MAX_VIP_STASH_SIZE, MAX_VIP_ACTIVATION_HISTORY_SIZE, MAX_USERNAME_HISTORY_SIZE, MAX_PASSWORD_HISTORY_SIZE, GA_USERNAME } from '../constants';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (username: string, password?: string) => { success: boolean, message?: string };
  register: (username: string, password?: string) => { success: boolean, message?: string };
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  addLog: (userId: string, action: string, details: string) => void;
  addBalance: (userId: string, amount: number, currency: CurrencyType) => void;
  purchaseVip: (userId: string, vipOptionId: string) => { success: boolean, message: string };
  setVipStatus: (userId: string, vipId: VIPStatus, durationDays?: number, source?: VipActivationLogEntry['source']) => { success: boolean, message?: string };
  activateVipFromStash: (userId: string, stashItemId: string) => { success: boolean, message: string };
  openCase: (userId: string, caseId: string) => { success: boolean; prize?: string; error?: string };
  findUser: (username: string) => User | undefined;
  getAllUsers: () => User[];
  promoCodes: PromoCode[];
  createPromoCode: (codeDetails: Omit<PromoCode, 'isActive' | 'createdAt' | 'usesLeft'> & { id: string, usesLeft: number | string, rewards: PromoCodeReward[] }) => { success: boolean, message?: string };
  togglePromoCodeActive: (codeId: string) => { success: boolean, message?: string };
  redeemPromoCode: (userId: string, codeId: string) => { success: boolean; message?: string; prizeDescription?: string };
  
  muteUser: (targetUserId: string, durationMinutes: number, reason: string, muterUsername: string) => { success: boolean; message: string };
  unmuteUser: (targetUserId: string, unmuterUsername: string) => { success: boolean; message: string };
  
  banRequests: BanRequest[];
  submitBanRequest: (requestData: Omit<BanRequest, 'id' | 'status' | 'timestamp' | 'requesterId' | 'requesterUsername'> & {targetUsername: string}) => { success: boolean; message: string };
  resolveBanRequest: (requestId: string, status: BanRequestStatus.APPROVED | BanRequestStatus.REJECTED, resolverComment?: string, banDurationDays?: number) => { success: boolean; message: string };

  sendSystemMail: (recipientId: string, subject: string, body: string) => void;
  changeUsername: (userId: string, newUsername: string, changedByAdmin?: boolean) => { success: boolean; message?: string };
  changePassword: (userId: string, newPassword: string, changedByAdmin?: boolean) => { success: boolean; message?: string };
  adminChangePassword: (targetUserId: string, newPassword: string) => { success: boolean; message?: string };

  resourceRequests: ResourceRequest[];
  submitResourceRequest: (requestData: Omit<ResourceRequest, 'id' | 'status' | 'timestamp' | 'requesterId' | 'requesterUsername' | 'resolvedByUserId' | 'resolvedByUsername' | 'resolvedAt' | 'resolverComment'> & {targetUsername: string}) => { success: boolean; message: string };
  resolveResourceRequest: (requestId: string, status: ResourceRequestStatus.APPROVED | ResourceRequestStatus.REJECTED, resolverComment?: string, vipDurationDays?: number) => { success: boolean; message: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createInitialStats = () => ({
  gamesPlayed: 0, gamesWon: 0, totalWinningsRegular: 0, totalWinningsPremium: 0,
  russianRoulettePlayed: 0, redBlackWhitePlayed: 0, guessNumberPlayed: 0, ladderPlayed: 0
});

const createInitialUserFields = (user: Partial<User>): User => ({
    id: user.id || Date.now().toString(),
    username: user.username || 'Unknown',
    password: user.password, // Keep password if provided
    role: user.role || DEFAULT_USER_ROLE,
    regularBalance: typeof user.regularBalance === 'number' ? user.regularBalance : INITIAL_REGULAR_BALANCE,
    premiumBalance: typeof user.premiumBalance === 'number' ? user.premiumBalance : INITIAL_PREMIUM_BALANCE,
    status: user.status || VIPStatus.NONE,
    vipExpiry: user.vipExpiry,
    stats: { ...createInitialStats(), ...(user.stats || {}) },
    inventory: { openedCases: user.inventory?.openedCases || 0 },
    lastLogin: user.lastLogin || new Date().toISOString(),
    logs: user.logs || [],
    usedPromoCodes: user.usedPromoCodes || [],
    isBanned: user.isBanned || false,
    banReason: user.banReason,
    banExpiry: user.banExpiry,
    isMuted: user.isMuted || false,
    muteExpiry: user.muteExpiry,
    muteReason: user.muteReason,
    mail: user.mail || [],
    vipStash: user.vipStash || [],
    vipActivationHistory: user.vipActivationHistory || [],
    usernameHistory: user.usernameHistory || [],
    passwordChangeHistory: user.passwordChangeHistory || [],
});


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useLocalStorage<User[]>('users', []);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lastLoggedInUser, setLastLoggedInUser] = useLocalStorage<string | null>('lastLoggedInUser', null);
  const [promoCodes, setPromoCodes] = useLocalStorage<PromoCode[]>('promoCodes', []);
  const [banRequests, setBanRequests] = useLocalStorage<BanRequest[]>('banRequests', []);
  const [resourceRequests, setResourceRequests] = useLocalStorage<ResourceRequest[]>('resourceRequests', []);


  const addLog = useCallback((userId: string, action: string, details: string) => {
    const logEntry: UserLog = { timestamp: new Date().toISOString(), action, details };
    setUsers(prevUsers =>
      prevUsers.map(u =>
        u.id === userId ? { ...u, logs: [logEntry, ...(u.logs || []).slice(0, 999)] } : u
      )
    );
     if (currentUser && currentUser.id === userId) {
        setCurrentUser(prev => prev ? ({ ...prev, logs: [logEntry, ...(prev.logs || []).slice(0,999)] }) : null);
    }
  }, [setUsers, currentUser]);
  
  const addVipActivationLog = useCallback((userId: string, entry: Omit<VipActivationLogEntry, 'id'>) => {
    const newEntry: VipActivationLogEntry = { ...entry, id: Date.now().toString() + Math.random().toString(36).substring(2,7) };
     setUsers(prevUsers =>
      prevUsers.map(u =>
        u.id === userId ? { ...u, vipActivationHistory: [newEntry, ...(u.vipActivationHistory || [])].slice(0, MAX_VIP_ACTIVATION_HISTORY_SIZE) } : u
      )
    );
    if (currentUser && currentUser.id === userId) {
        setCurrentUser(prev => prev ? ({ ...prev, vipActivationHistory: [newEntry, ...(prev.vipActivationHistory || [])].slice(0, MAX_VIP_ACTIVATION_HISTORY_SIZE) }) : null);
    }
  }, [setUsers, currentUser]);


  const updateUser = useCallback((updatedUser: User) => {
    const userWithEnsuredFields = createInitialUserFields(updatedUser); 
    setUsers(prevUsers => prevUsers.map(u => u.id === userWithEnsuredFields.id ? userWithEnsuredFields : u));
    if (currentUser && currentUser.id === userWithEnsuredFields.id) {
      setCurrentUser(userWithEnsuredFields);
    }
  }, [setUsers, currentUser]);

 useEffect(() => {
    setUsers(prevUsers => {
      const alekId = 'alek-admin-seeded';
      const alekUsername = GA_USERNAME; // Use constant
      const alekPassword = '1111'; // Default password, can be changed
  
      const existingAlek = prevUsers.find(u => u.id === alekId || u.username?.toLowerCase() === alekUsername.toLowerCase());
      let finalAlekUser: User;
  
      if (existingAlek) {
        finalAlekUser = createInitialUserFields({
          ...existingAlek, 
          id: alekId, // Ensure ID is consistent
          username: alekUsername, // Ensure username is consistent
          role: UserRole.ADMIN, // Ensure role is Admin
          password: existingAlek.password || alekPassword, // Use existing or default if not set
          regularBalance: typeof existingAlek.regularBalance === 'number' ? existingAlek.regularBalance : 100000,
          premiumBalance: typeof existingAlek.premiumBalance === 'number' ? existingAlek.premiumBalance : 1000,
          status: existingAlek.status !== VIPStatus.NONE ? existingAlek.status : VIPStatus.PREMIUM,
          vipExpiry: existingAlek.vipExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          // Preserve histories and other fields
          usernameHistory: existingAlek.usernameHistory || [],
          passwordChangeHistory: existingAlek.passwordChangeHistory || [],
          logs: existingAlek.logs || [{ timestamp: new Date().toISOString(), action: 'Система', details: 'Учетная запись Главного Администратора проверена/обновлена.' }],
          vipStash: existingAlek.vipStash || [],
          vipActivationHistory: existingAlek.vipActivationHistory || [{
              id: `ga-vip-seed-${Date.now().toString()}`,
              vipType: VIPStatus.PREMIUM,
              vipDurationDays: 365,
              activationDate: new Date().toISOString(),
              source: 'Админ',
          }],
        });
      } else {
        // If Alek doesn't exist at all, create fresh
        finalAlekUser = createInitialUserFields({
          id: alekId,
          username: alekUsername,
          password: alekPassword,
          role: UserRole.ADMIN,
          regularBalance: 100000,
          premiumBalance: 1000,
          status: VIPStatus.PREMIUM,
          vipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          logs: [{ timestamp: new Date().toISOString(), action: 'Система', details: 'Учетная запись Главного Администратора инициализирована.' }],
          vipActivationHistory: [{
              id: `ga-vip-init-${Date.now().toString()}`,
              vipType: VIPStatus.PREMIUM,
              vipDurationDays: 365,
              activationDate: new Date().toISOString(),
              source: 'Админ',
          }],
        });
      }
  
      // Filter out any other users that might accidentally have Alek's username (case-insensitive) but not his ID
      const otherUsers = prevUsers
        .filter(u => u.id !== alekId && u.username?.toLowerCase() !== alekUsername.toLowerCase())
        .map(u => createInitialUserFields(u)); // Ensure other users also have all fields
  
      return [...otherUsers, finalAlekUser];
    });
  }, [setUsers]);


  useEffect(() => {
    if (lastLoggedInUser) {
      const user = users.find(u => u.username === lastLoggedInUser); 
      if (user) {
        setCurrentUser(createInitialUserFields(user)); 
      } else {
        setLastLoggedInUser(null);
      }
    }
  }, [lastLoggedInUser, users, setLastLoggedInUser]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let usersChanged = false;
      const updatedUsersList = users.map(user => {
        let userModified = false;
        let tempUser = { ...user };

        if (tempUser.status !== VIPStatus.NONE && tempUser.vipExpiry && new Date(tempUser.vipExpiry) < now) {
          addLog(tempUser.id, 'VIP Статус', 'Ваш VIP статус истек.');
          tempUser = { ...tempUser, status: VIPStatus.NONE, vipExpiry: undefined };
          userModified = true;
        }
        if (tempUser.isBanned && tempUser.banExpiry && new Date(tempUser.banExpiry) < now) {
          addLog(tempUser.id, 'Система', 'Срок блокировки истек. Аккаунт разблокирован.');
          tempUser = { ...tempUser, isBanned: false, banReason: undefined, banExpiry: undefined };
          userModified = true;
        }
        if (tempUser.isMuted && tempUser.muteExpiry && new Date(tempUser.muteExpiry) < now) {
          addLog(tempUser.id, 'Система', 'Срок блокировки чата истек.');
          tempUser = { ...tempUser, isMuted: false, muteReason: undefined, muteExpiry: undefined };
          userModified = true;
        }

        if (userModified) usersChanged = true;
        return tempUser;
      });

      if (usersChanged) {
        setUsers(updatedUsersList);
        if (currentUser) {
            const updatedCurrentUser = updatedUsersList.find(u => u.id === currentUser.id);
            if (updatedCurrentUser) setCurrentUser(createInitialUserFields(updatedCurrentUser));
        }
      }
    }, 60 * 1000); 

    return () => clearInterval(interval);
  }, [users, setUsers, addLog, currentUser]);


  const login = useCallback((username: string, password?: string): { success: boolean, message?: string } => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      if (user.username.toLowerCase() === GA_USERNAME.toLowerCase() && password === '1111' && !user.password) {
         const alekWithPassword = { ...user, password: '1111' };
         setUsers(prev => prev.map(u => u.id === alekWithPassword.id ? alekWithPassword : u));
      }

      const userForLogin = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (!userForLogin || userForLogin.password !== password) {
        setCurrentUser(null);
        return { success: false, message: "Неверный пароль." };
      }


      if (userForLogin.isBanned) {
        setCurrentUser(null);
        const expiryMsg = userForLogin.banExpiry ? ` до ${new Date(userForLogin.banExpiry).toLocaleString()}` : ' (навсегда)';
        return { success: false, message: `Этот аккаунт заблокирован${expiryMsg}. Причина: ${userForLogin.banReason || 'Не указана'}.` };
      }
      
      const loggedInUser = createInitialUserFields({...userForLogin, lastLogin: new Date().toISOString()});
      setCurrentUser(loggedInUser);
      setUsers(prevUsers => prevUsers.map(u => u.id === loggedInUser.id ? loggedInUser : u));
      setLastLoggedInUser(loggedInUser.username); 
      return { success: true };
    } else {
      setCurrentUser(null);
      return { success: false, message: "Пользователь не найден. Пожалуйста, зарегистрируйтесь." };
    }
  }, [users, setUsers, setLastLoggedInUser]);

  const register = useCallback((username: string, password?: string): { success: boolean, message?: string } => {
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      return { success: false, message: `Пароль должен быть не менее ${MIN_PASSWORD_LENGTH} символов.` };
    }
    const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
      return { success: false, message: 'Пользователь с таким именем уже существует.' };
    }
    
    if (username.toLowerCase() === GA_USERNAME.toLowerCase()) {
        return { success: false, message: 'Это имя пользователя зарезервировано.' };
    }

    let newUserPartial: Partial<User> = {
      id: Date.now().toString(),
      username,
      password,
      logs: [{ timestamp: new Date().toISOString(), action: 'Регистрация', details: 'Новый пользователь' }],
      vipStash: [],
      vipActivationHistory: [],
      stats: createInitialStats(),
      inventory: { openedCases: 0 },
      usedPromoCodes: [],
      mail: [],
      usernameHistory: [],
      passwordChangeHistory: [],
    };
    
    const newUser = createInitialUserFields(newUserPartial);
    setUsers(prevUsers => [...prevUsers, newUser]);
    setCurrentUser(newUser);
    setLastLoggedInUser(newUser.username); 

    return { success: true };
  }, [users, setUsers, setCurrentUser, setLastLoggedInUser]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setLastLoggedInUser(null);
  }, [setLastLoggedInUser]);

  const addBalance = useCallback((userId: string, amount: number, currency: CurrencyType) => {
    setUsers(prevUsers => prevUsers.map(u => {
        if (u.id === userId) {
            const updatedUserFields = {
                ...u,
                regularBalance: currency === CurrencyType.REGULAR ? u.regularBalance + amount : u.regularBalance,
                premiumBalance: currency === CurrencyType.PREMIUM ? u.premiumBalance + amount : u.premiumBalance,
            };
            const updatedUser = createInitialUserFields(updatedUserFields);
            if (currentUser && currentUser.id === userId) {
                setCurrentUser(updatedUser);
            }
            return updatedUser;
        }
        return u;
    }));
  }, [setUsers, currentUser]);

 const purchaseVip = useCallback((userId: string, vipOptionId: string): { success: boolean, message: string } => {
    const user = users.find(u => u.id === userId);
    const vipOption = VIP_OPTIONS.find(v => v.id === vipOptionId);

    if (!user || !vipOption) return { success: false, message: 'Пользователь или VIP опция не найдены.' };
    if (user.premiumBalance < vipOption.pricePremium) return { success: false, message: `Недостаточно ${CurrencyType.PREMIUM}.` };

    const acquiredVip: AcquiredVipItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2,7),
      vipType: vipOption.baseVipType, // Use baseVipType here
      vipDurationDays: vipOption.durationDays,
      acquiredDate: new Date().toISOString(),
      source: 'Магазин'
    };
    
    const updatedUserFields: Partial<User> = {
      premiumBalance: user.premiumBalance - vipOption.pricePremium,
      vipStash: [acquiredVip, ...(user.vipStash || [])].slice(0, MAX_VIP_STASH_SIZE),
    };
    
    updateUser({ ...user, ...updatedUserFields });
    addLog(userId, 'Покупка VIP в запас', `Статус: ${vipOption.name} добавлен в запас. Списано: ${vipOption.pricePremium} ${CurrencyType.PREMIUM}.`);
    return { success: true, message: `VIP статус "${vipOption.name}" добавлен в ваш запас.` };
  }, [users, updateUser, addLog]);

  const setVipStatus = useCallback((userId: string, vipId: VIPStatus, durationDays?: number, source: VipActivationLogEntry['source'] = 'Админ'): { success: boolean, message?: string } => {
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, message: "Пользователь не найден." };

    let newVipExpiry: string | undefined = undefined;
    let actualDurationDays = 0;
    let logDetails = `Статус VIP изменен на ${vipId}`;
    
    const previousVipType = user.status;
    const previousVipExpiry = user.vipExpiry;

    if (vipId !== VIPStatus.NONE) {
        // For admin setting, we find a representative option to get a name, but duration is primary
        const representativeVipOption = VIP_OPTIONS.find(opt => opt.baseVipType === vipId);
        actualDurationDays = durationDays ?? representativeVipOption?.durationDays ?? 0; 

        if (actualDurationDays === 0) { 
            newVipExpiry = undefined; // Undefined means permanent
            logDetails += ` (навсегда)`;
        } else { 
            newVipExpiry = new Date(Date.now() + actualDurationDays * 24 * 60 * 60 * 1000).toISOString();
            logDetails += ` (на ${actualDurationDays} дней)`;
        }
    } else {
         logDetails += ` (статус убран)`;
         actualDurationDays = 0; 
    }
    
    const updatedUser: User = { ...user, status: vipId, vipExpiry: newVipExpiry };
    updateUser(updatedUser);

    addVipActivationLog(userId, {
        vipType: vipId,
        vipDurationDays: actualDurationDays,
        activationDate: new Date().toISOString(),
        source: source,
        previousVipType: previousVipType,
        previousVipExpiry: previousVipExpiry
    });
    
    addLog(userId, 'Изменение VIP статуса', `${logDetails}. Источник: ${source}. Исполнитель: ${currentUser?.username || 'Система'}`);
    if(currentUser?.id !== userId && currentUser && (source === 'Админ' || source === 'Запрос одобрен') ) { 
        addLog(currentUser.id, 'Админ: Установка VIP', `Установлен VIP ${vipId} для ${user.username}. ${logDetails}`);
    }
    return { success: true, message: `VIP статус для ${user.username} обновлен.` };
  }, [users, updateUser, addLog, addVipActivationLog, currentUser]);

  const activateVipFromStash = useCallback((userId: string, stashItemId: string): { success: boolean, message: string } => {
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, message: "Пользователь не найден." };

    const stashItemIndex = (user.vipStash || []).findIndex(item => item.id === stashItemId);
    if (stashItemIndex === -1) return { success: false, message: "VIP предмет не найден в запасе."};

    const stashItem = user.vipStash[stashItemIndex];
    const previousVipType = user.status;
    const previousVipExpiry = user.vipExpiry;
    
    let newVipExpiry: string | undefined;
    if (stashItem.vipDurationDays === 0) {
        newVipExpiry = undefined; 
    } else {
        newVipExpiry = new Date(Date.now() + stashItem.vipDurationDays * 24 * 60 * 60 * 1000).toISOString();
    }

    const updatedUserFields: Partial<User> = {
        status: stashItem.vipType, // vipType from AcquiredVipItem is already the base VIPStatus
        vipExpiry: newVipExpiry,
        vipStash: user.vipStash.filter(item => item.id !== stashItemId),
    };
    updateUser({ ...user, ...updatedUserFields });
    
    addVipActivationLog(userId, {
        vipType: stashItem.vipType,
        vipDurationDays: stashItem.vipDurationDays,
        activationDate: new Date().toISOString(),
        source: 'Запас',
        previousVipType: previousVipType,
        previousVipExpiry: previousVipExpiry
    });

    addLog(userId, 'Активация VIP из запаса', `Статус: ${stashItem.vipType} (${stashItem.vipDurationDays === 0 ? 'Навсегда' : stashItem.vipDurationDays + ' дн.'}) активирован. ${previousVipType !== VIPStatus.NONE ? `Предыдущий статус ${previousVipType} заменен.` : ''}`);
    return { success: true, message: `VIP статус "${stashItem.vipType}" успешно активирован из запаса!`};
  }, [users, updateUser, addLog, addVipActivationLog]);


  const openCase = useCallback((userId: string, caseId: string) => {
    const user = users.find(u => u.id === userId);
    const gameCase = GAME_CASES.find(gc => gc.id === caseId);

    if (!user || !gameCase) return { success: false, error: 'Пользователь или кейс не найден.' };
    
    let userAfterPurchaseFields: Partial<User> = {};

    if (gameCase.currencyType === CurrencyType.REGULAR) {
      if (user.regularBalance < gameCase.price) {
        return { success: false, error: `Недостаточно ${CurrencyType.REGULAR}. Нужно ${gameCase.price}.` };
      }
      userAfterPurchaseFields = { 
        regularBalance: user.regularBalance - gameCase.price, 
        inventory: { ...user.inventory, openedCases: (user.inventory?.openedCases || 0) + 1 } 
      };
    } else { 
      if (user.premiumBalance < gameCase.price) {
        return { success: false, error: `Недостаточно ${CurrencyType.PREMIUM}. Нужно ${gameCase.price}.` };
      }
      userAfterPurchaseFields = { 
        premiumBalance: user.premiumBalance - gameCase.price, 
        inventory: { ...user.inventory, openedCases: (user.inventory?.openedCases || 0) + 1 } 
      };
    }
    let userAfterPurchase = { ...user, ...userAfterPurchaseFields };

    let cumulativeProbability = 0;
    const randomNumber = Math.random();
    let chosenItem: CaseItem | undefined;

    const itemsToConsider = gameCase.items.map(item => {
        let effectiveProbability = item.probability;
        const premiumVipOption = VIP_OPTIONS.find(v => v.baseVipType === VIPStatus.PREMIUM && v.durationDays === 30); // Use a reference Premium option for boost
        if (user.status === VIPStatus.PREMIUM && premiumVipOption && (item.rarity === 'rare' || item.rarity === 'epic')) {
            effectiveProbability *= (1 + premiumVipOption.caseLuckBoost);
        }
        return {...item, effectiveProbability};
    });

    const totalEffectiveProbability = itemsToConsider.reduce((sum, item) => sum + item.effectiveProbability, 0);
     for (const item of itemsToConsider) {
      const normalizedProbability = totalEffectiveProbability > 0 ? (item.effectiveProbability / totalEffectiveProbability) : (1 / itemsToConsider.length);
      cumulativeProbability += normalizedProbability;
      if (randomNumber <= cumulativeProbability) {
        chosenItem = item;
        break;
      }
    }
    if (!chosenItem && itemsToConsider.length > 0) chosenItem = itemsToConsider[itemsToConsider.length - 1]; 

    let prizeDescription = `Неизвестный предмет`;
    let finalUser = userAfterPurchase;

    if (chosenItem) {
      prizeDescription = chosenItem.name; 
      if (chosenItem.type === 'CURRENCY_REGULAR' && chosenItem.value !== undefined) {
        finalUser = { ...finalUser, regularBalance: finalUser.regularBalance + chosenItem.value };
        if (chosenItem.value < 0) {
            prizeDescription = `Потеря ${Math.abs(chosenItem.value)} ${CurrencyType.REGULAR} (из "${chosenItem.name}")`;
        } else if (chosenItem.value === 0) {
            prizeDescription = `Ничего (0 ${CurrencyType.REGULAR}) (из "${chosenItem.name}")`;
        } else {
            prizeDescription = `Выигрыш ${chosenItem.value} ${CurrencyType.REGULAR} (из "${chosenItem.name}")`;
        }
      } else if (chosenItem.type === 'CURRENCY_PREMIUM' && chosenItem.value !== undefined) {
        finalUser = { ...finalUser, premiumBalance: finalUser.premiumBalance + chosenItem.value };
         if (chosenItem.value < 0) {
            prizeDescription = `Потеря ${Math.abs(chosenItem.value)} ${CurrencyType.PREMIUM} (из "${chosenItem.name}")`;
        } else if (chosenItem.value === 0) {
            prizeDescription = `Ничего (0 ${CurrencyType.PREMIUM}) (из "${chosenItem.name}")`;
        } else {
            prizeDescription = `Выигрыш ${chosenItem.value} ${CurrencyType.PREMIUM} (из "${chosenItem.name}")`;
        }
      } else if (chosenItem.type === 'VIP_STATUS' && chosenItem.vipType && chosenItem.vipDurationDays !== undefined) {
        const acquiredVip: AcquiredVipItem = {
            id: Date.now().toString() + Math.random().toString(36).substring(2,7),
            vipType: chosenItem.vipType, // This is already a base VIPStatus from CaseItem
            vipDurationDays: chosenItem.vipDurationDays,
            acquiredDate: new Date().toISOString(),
            source: 'Кейс'
        };
        finalUser = { ...finalUser, vipStash: [acquiredVip, ...(finalUser.vipStash || [])].slice(0, MAX_VIP_STASH_SIZE) };
        prizeDescription = `Статус ${chosenItem.vipType}${chosenItem.vipDurationDays ? ` (${chosenItem.vipDurationDays} дн.)` : ' (Навсегда)'} добавлен в запас. (из "${chosenItem.name}")`;
      }
    }

    updateUser(finalUser);
    addLog(userId, 'Открытие кейса', `Кейс: ${gameCase.name}. Результат: ${prizeDescription}. Списано: ${gameCase.price} ${gameCase.currencyType}.`);
    return { success: true, prize: prizeDescription };

  }, [users, updateUser, addLog]);

  const findUser = useCallback((username: string): User | undefined => {
    return users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }, [users]);

  const getAllUsers = useCallback((): User[] => {
    return users;
  }, [users]);

  const createPromoCode = useCallback((codeDetails: Omit<PromoCode, 'isActive' | 'createdAt' | 'usesLeft'> & { id: string, usesLeft: number | string, rewards: PromoCodeReward[] }): { success: boolean, message?: string } => {
    if (promoCodes.some(pc => pc.id.toLowerCase() === codeDetails.id.toLowerCase())) {
      return { success: false, message: 'Промокод с таким названием уже существует.' };
    }
    if (!codeDetails.id.trim()) {
        return { success: false, message: 'Название промокода не может быть пустым.' };
    }
    if (!codeDetails.rewards || codeDetails.rewards.length === 0) {
        return { success: false, message: 'Промокод должен содержать хотя бы одну награду.' };
    }
     const usesLeftNumeric = typeof codeDetails.usesLeft === 'string' ? parseInt(codeDetails.usesLeft, 10) : codeDetails.usesLeft;
    if (isNaN(usesLeftNumeric) || (usesLeftNumeric < -1)) { 
        return { success: false, message: 'Количество использований должно быть числом (-1 для бесконечного).' };
    }

    const newPromoCode: PromoCode = {
      id: codeDetails.id,
      description: codeDetails.description,
      rewards: codeDetails.rewards,
      usesLeft: usesLeftNumeric,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setPromoCodes(prev => [...prev, newPromoCode]);
    return { success: true, message: `Промокод "${newPromoCode.id}" успешно создан.` };
  }, [promoCodes, setPromoCodes]);

  const togglePromoCodeActive = useCallback((codeId: string): { success: boolean, message?: string } => {
    const codeExists = promoCodes.some(pc => pc.id === codeId);
    if (!codeExists) {
      return { success: false, message: 'Промокод не найден.' };
    }
    let newStatus = false;
    setPromoCodes(prev => prev.map(pc => {
      if (pc.id === codeId) {
        newStatus = !pc.isActive;
        return { ...pc, isActive: newStatus };
      }
      return pc;
    }));
    return { success: true, message: `Статус промокода "${codeId}" изменен на ${newStatus ? 'активен' : 'неактивен'}.` };
  }, [promoCodes, setPromoCodes]);


  const redeemPromoCode = useCallback((userId: string, codeId: string): { success: boolean; message?: string; prizeDescription?: string } => {
    const user = users.find(u => u.id === userId);
    const promoCode = promoCodes.find(pc => pc.id.toLowerCase() === codeId.toLowerCase());

    if (!user) return { success: false, message: 'Пользователь не найден.' };
    if (!promoCode) return { success: false, message: 'Промокод не найден.' };
    if (!promoCode.isActive) return { success: false, message: 'Промокод неактивен.' };
    if (promoCode.usesLeft === 0) return { success: false, message: 'Этот промокод больше нельзя использовать.' };
    if (user.usedPromoCodes.includes(promoCode.id)) return { success: false, message: 'Вы уже использовали этот промокод.' };
    if (!promoCode.rewards || promoCode.rewards.length === 0) {
        return { success: false, message: 'Промокод не содержит наград.' };
    }

    let prizeDescriptions: string[] = [];
    let finalUser = { ...user }; 

    promoCode.rewards.forEach(reward => {
      if (reward.type === 'CURRENCY_REGULAR' && reward.value) {
        finalUser.regularBalance = (finalUser.regularBalance || 0) + reward.value;
        prizeDescriptions.push(`${reward.value} ${CurrencyType.REGULAR}`);
      } else if (reward.type === 'CURRENCY_PREMIUM' && reward.value) {
        finalUser.premiumBalance = (finalUser.premiumBalance || 0) + reward.value;
        prizeDescriptions.push(`${reward.value} ${CurrencyType.PREMIUM}`);
      } else if (reward.type === 'VIP_STATUS' && reward.vipType && reward.vipDurationDays !== undefined) {
        const previousVipType = finalUser.status;
        const previousVipExpiry = finalUser.vipExpiry;
        
        finalUser.status = reward.vipType;
        finalUser.vipExpiry = reward.vipDurationDays === 0 ? undefined : new Date(Date.now() + reward.vipDurationDays * 24 * 60 * 60 * 1000).toISOString();
        
        addVipActivationLog(userId, {
            vipType: reward.vipType,
            vipDurationDays: reward.vipDurationDays,
            activationDate: new Date().toISOString(),
            source: 'Промокод',
            previousVipType: previousVipType,
            previousVipExpiry: previousVipExpiry
        });
        prizeDescriptions.push(`Статус ${reward.vipType}${reward.vipDurationDays ? ` (${reward.vipDurationDays} дн.)` : ' (Навсегда)'} активирован.`);
      }
    });

    if (prizeDescriptions.length === 0) {
         return { success: false, message: 'Некорректный тип или значение промокода.' };
    }
    
    const combinedPrizeDescription = prizeDescriptions.join(', ');
    finalUser.usedPromoCodes = [...(finalUser.usedPromoCodes || []), promoCode.id];
    
    updateUser(finalUser); 

    if (promoCode.usesLeft > 0) {
      setPromoCodes(prev => prev.map(pc => pc.id === promoCode.id ? { ...pc, usesLeft: pc.usesLeft - 1 } : pc));
    }

    addLog(userId, 'Активация промокода', `Код: ${promoCode.id}. Приз: ${combinedPrizeDescription}.`);
    return { success: true, message: `Промокод успешно активирован! Вы получили: ${combinedPrizeDescription}.`, prizeDescription: combinedPrizeDescription };
  }, [users, promoCodes, updateUser, setPromoCodes, addLog, addVipActivationLog]);

  const muteUser = useCallback((targetUserId: string, durationMinutes: number, reason: string, muterUsername: string): { success: boolean; message: string } => {
    const targetUser = users.find(u => u.id === targetUserId);
    if (!targetUser) {
      return { success: false, message: `Пользователь с ID ${targetUserId} не найден.` };
    }

    const muteExpiry = durationMinutes > 0 ? new Date(Date.now() + durationMinutes * 60 * 1000).toISOString() : undefined;
    const updatedTargetUser: User = {
      ...targetUser,
      isMuted: true,
      muteReason: reason,
      muteExpiry: muteExpiry,
    };
    updateUser(updatedTargetUser);
    const durationText = durationMinutes > 0 ? `на ${durationMinutes} минут` : 'на неопределенный срок (до ручного снятия)';
    
    addLog(targetUserId, 'Блокировка чата', `Чат заблокирован ${muterUsername} ${durationText}. Причина: ${reason}`);
    if (currentUser && currentUser.id !== targetUserId) {
        addLog(currentUser.id, 'Админ: Блокировка чата', `Заблокирован чат для ${targetUser.username} (${targetUser.id}) ${durationText}. Причина: ${reason}`);
    }
    return { success: true, message: `Чат для пользователя ${targetUser.username} заблокирован ${durationText}.` };
  }, [users, updateUser, addLog, currentUser]);

  const unmuteUser = useCallback((targetUserId: string, unmuterUsername: string): { success: boolean; message: string } => {
    const targetUser = users.find(u => u.id === targetUserId);
    if (!targetUser) {
      return { success: false, message: `Пользователь с ID ${targetUserId} не найден.` };
    }
    if (!targetUser.isMuted) {
      return { success: false, message: `Чат пользователя ${targetUser.username} не заблокирован.` };
    }

    const updatedTargetUser: User = {
      ...targetUser,
      isMuted: false,
      muteReason: undefined,
      muteExpiry: undefined,
    };
    updateUser(updatedTargetUser);
    
    addLog(targetUserId, 'Разблокировка чата', `Чат разблокирован пользователем ${unmuterUsername}.`);
    if (currentUser && currentUser.id !== targetUserId) {
        addLog(currentUser.id, 'Админ: Разблокировка чата', `Разблокирован чат для ${targetUser.username} (${targetUser.id}). Исполнитель: ${unmuterUsername}`);
    }
    return { success: true, message: `Чат для пользователя ${targetUser.username} успешно разблокирован.` };
  }, [users, updateUser, addLog, currentUser]);


  const submitBanRequest = useCallback((requestData: Omit<BanRequest, 'id' | 'status' | 'timestamp' | 'requesterId' | 'requesterUsername'> & {targetUsername: string}): { success: boolean; message: string } => {
    if (!currentUser || currentUser.role !== UserRole.HELPER) {
        return { success: false, message: "Только хелперы могут подавать запросы на блокировку." };
    }
    const targetUser = findUser(requestData.targetUsername);
    if (!targetUser) {
        return { success: false, message: `Пользователь "${requestData.targetUsername}" не найден.` };
    }
     if ([UserRole.ADMIN, UserRole.MODERATOR].includes(targetUser.role)) {
        return { success: false, message: "Нельзя подать запрос на блокировку администратора или модератора." };
    }


    const newRequest: BanRequest = {
        id: Date.now().toString(),
        requesterId: currentUser.id,
        requesterUsername: currentUser.username,
        targetUserId: targetUser.id,
        targetUsername: targetUser.username,
        reason: requestData.reason,
        requestedDuration: requestData.requestedDuration,
        status: BanRequestStatus.PENDING,
        timestamp: new Date().toISOString(),
    };
    setBanRequests(prev => [...prev, newRequest]);
    addLog(currentUser.id, "Запрос на блокировку", `Подан запрос на блокировку ${targetUser.username}. Причина: ${requestData.reason}`);
    return { success: true, message: "Запрос на блокировку успешно отправлен." };
  }, [currentUser, findUser, setBanRequests, addLog]);

  const resolveBanRequest = useCallback((requestId: string, status: BanRequestStatus.APPROVED | BanRequestStatus.REJECTED, resolverComment?: string, banDurationDays?: number): { success: boolean; message: string } => {
    if (!currentUser || ![UserRole.ADMIN, UserRole.MODERATOR].includes(currentUser.role)) {
        return { success: false, message: "Только администраторы или модераторы могут обрабатывать запросы." };
    }
    const requestIndex = banRequests.findIndex(req => req.id === requestId);
    if (requestIndex === -1) {
        return { success: false, message: "Запрос не найден." };
    }
    const request = banRequests[requestIndex];
    const targetUser = findUser(request.targetUsername);

    if (!targetUser) {
        setBanRequests(prev => prev.map(r => r.id === requestId ? {...r, status: BanRequestStatus.REJECTED, resolverComment: "Пользователь не найден к моменту обработки"} : r));
        return { success: false, message: `Целевой пользователь ${request.targetUsername} не найден.` };
    }
    
    if (status === BanRequestStatus.APPROVED) {
        if ([UserRole.ADMIN, UserRole.MODERATOR].includes(targetUser.role) && targetUser.username.toLowerCase() !== GA_USERNAME.toLowerCase()) {
             addLog(currentUser.id, "Админ: Отказ в блокировке", `Попытка заблокировать администратора/модератора ${targetUser.username} через запрос отклонена.`);
             setBanRequests(prev => prev.map(r => r.id === requestId ? {...r, status: BanRequestStatus.REJECTED, resolvedByUserId: currentUser.id, resolvedByUsername: currentUser.username, resolvedAt: new Date().toISOString(), resolverComment: resolverComment || "Отклонено: нельзя заблокировать администрацию." } : r));
             return { success: false, message: `Нельзя заблокировать пользователя ${targetUser.username} с ролью ${targetUser.role}.` };
        }
        if (targetUser.username.toLowerCase() === GA_USERNAME.toLowerCase() && currentUser.username.toLowerCase() !== GA_USERNAME.toLowerCase()) {
            addLog(currentUser.id, "Админ: Отказ в блокировке", `Попытка заблокировать Главного Администратора ${targetUser.username} через запрос отклонена.`);
            setBanRequests(prev => prev.map(r => r.id === requestId ? {...r, status: BanRequestStatus.REJECTED, resolvedByUserId: currentUser.id, resolvedByUsername: currentUser.username, resolvedAt: new Date().toISOString(), resolverComment: resolverComment || "Отклонено: нельзя заблокировать Главного Администратора." } : r));
            return { success: false, message: `Нельзя заблокировать Главного Администратора.` };
        }
        
        let actualBanDurationDays = banDurationDays;
        
        if (currentUser.role === UserRole.MODERATOR) {
            if (actualBanDurationDays === undefined || actualBanDurationDays === 0 || actualBanDurationDays > 7) { 
                actualBanDurationDays = 7;
            }
        }

        const banExpiry = actualBanDurationDays !== undefined && actualBanDurationDays > 0 
            ? new Date(Date.now() + actualBanDurationDays * 24 * 60 * 60 * 1000).toISOString() 
            : undefined; 

        updateUser({ ...targetUser, isBanned: true, banReason: `По запросу от ${request.requesterUsername}: ${request.reason}. ${resolverComment || ''}`, banExpiry });
        addLog(targetUser.id, "Блокировка аккаунта", `Аккаунт заблокирован администратором ${currentUser.username} по запросу. Причина: ${request.reason}. ${banExpiry ? `До: ${new Date(banExpiry).toLocaleDateString()}` : 'Навсегда.'}`);
        addLog(currentUser.id, "Админ: Одобрение запроса на бан", `Одобрен запрос на бан для ${targetUser.username}. Причина: ${request.reason}.`);
    }

    setBanRequests(prev => prev.map(r => r.id === requestId ? {...r, status, resolvedByUserId: currentUser.id, resolvedByUsername: currentUser.username, resolvedAt: new Date().toISOString(), resolverComment } : r));
    return { success: true, message: `Запрос ${status === BanRequestStatus.APPROVED ? 'одобрен' : 'отклонен'}.` };

  }, [currentUser, banRequests, findUser, updateUser, addLog, setBanRequests]);
  
  const sendSystemMail = useCallback((recipientId: string, subject: string, body: string) => {
    const mailMessage: MailMessage = {
      id: Date.now().toString() + Math.random().toString(36).substring(2,9),
      senderId: 'SYSTEM',
      senderUsername: 'Система',
      recipientId,
      subject,
      body,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setUsers(prevUsers => prevUsers.map(u => 
        u.id === recipientId ? { ...u, mail: [mailMessage, ...(u.mail || []).slice(0,49)] } : u
    ));
     if (currentUser && currentUser.id === recipientId) {
        setCurrentUser(prev => prev ? ({...prev, mail: [mailMessage, ...(prev.mail || []).slice(0,49)] }) : null);
    }
  }, [setUsers, currentUser]);

  const changeUsername = useCallback((userId: string, newUsername: string, changedByAdmin: boolean = false): { success: boolean; message?: string } => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate || !currentUser) {
      return { success: false, message: 'Пользователь не найден или действие не авторизовано.' };
    }
    if (!newUsername.trim() || newUsername.length < 3) {
      return { success: false, message: 'Имя пользователя должно быть не менее 3 символов.' };
    }
    const existingUser = users.find(u => u.username.toLowerCase() === newUsername.toLowerCase() && u.id !== userId);
    if (existingUser) {
      return { success: false, message: 'Это имя пользователя уже занято.' };
    }
    // Prevent changing the GA_USERNAME if the user *is* GA and trying to change it to something else.
    if (userToUpdate.username.toLowerCase() === GA_USERNAME.toLowerCase() && newUsername.toLowerCase() !== GA_USERNAME.toLowerCase()) {
        return { success: false, message: `Имя пользователя Главного Администратора (${GA_USERNAME}) не может быть изменено.` };
    }
    // Prevent changing *to* GA_USERNAME if the new name is GA_USERNAME but the user is not already GA (or if someone else tries to take it)
    if (newUsername.toLowerCase() === GA_USERNAME.toLowerCase() && userToUpdate.username.toLowerCase() !== GA_USERNAME.toLowerCase()) {
        return { success: false, message: `Имя пользователя ${GA_USERNAME} зарезервировано.` };
    }


    const oldUsername = userToUpdate.username;
    const changer = changedByAdmin ? currentUser.username : userToUpdate.username;

    const usernameHistoryEntry: UsernameHistoryEntry = {
        oldUsername,
        newUsername,
        changedAt: new Date().toISOString(),
        changedByUsername: changer
    };
    
    const updatedUser: User = { 
        ...userToUpdate, 
        username: newUsername,
        usernameHistory: [usernameHistoryEntry, ...(userToUpdate.usernameHistory || [])].slice(0, MAX_USERNAME_HISTORY_SIZE)
    };
    updateUser(updatedUser);

    const logAction = changedByAdmin ? `Админ: Смена имени (${currentUser.username})` : 'Смена имени пользователя';
    addLog(userId, logAction, `Имя пользователя изменено с "${oldUsername}" на "${newUsername}".`);
    if (changedByAdmin && currentUser.id !== userId) {
        addLog(currentUser.id, 'Админ: Управление пользователями', `Изменено имя пользователя ${oldUsername} на ${newUsername}.`);
    }


    if (lastLoggedInUser === oldUsername && userId === currentUser.id) { // Only update lastLoggedInUser if current user changed their own name
        setLastLoggedInUser(newUsername);
    }

    return { success: true, message: 'Имя пользователя успешно изменено.' };
  }, [users, updateUser, addLog, currentUser, lastLoggedInUser, setLastLoggedInUser]);

  const changePassword = useCallback((userId: string, newPassword: string, changedByAdmin: boolean = false): { success: boolean; message?: string } => {
    const userToUpdate = users.find(u => u.id === userId);
     if (!userToUpdate || !currentUser) {
      return { success: false, message: 'Пользователь не найден или действие не авторизовано.' };
    }
    if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
      return { success: false, message: `Новый пароль должен быть не менее ${MIN_PASSWORD_LENGTH} символов.` };
    }
    
    const changer = changedByAdmin ? currentUser.username : userToUpdate.username;
    const passwordHistoryEntry: PasswordChangeHistoryEntry = {
        changedAt: new Date().toISOString(),
        changedByUsername: changer
    };

    const updatedUser: User = { 
        ...userToUpdate, 
        password: newPassword,
        passwordChangeHistory: [passwordHistoryEntry, ...(userToUpdate.passwordChangeHistory || [])].slice(0, MAX_PASSWORD_HISTORY_SIZE)
    };
    updateUser(updatedUser);
    const logAction = changedByAdmin ? `Админ: Смена пароля (${currentUser.username})` : 'Смена пароля';
    addLog(userId, logAction, 'Пароль был успешно изменен.');
     if (changedByAdmin && currentUser.id !== userId) {
        addLog(currentUser.id, 'Админ: Управление пользователями', `Изменен пароль для пользователя ${userToUpdate.username}.`);
    }
    return { success: true, message: 'Пароль успешно изменен.' };
  }, [users, updateUser, addLog, currentUser]);

  const adminChangePassword = useCallback((targetUserId: string, newPassword: string): { success: boolean; message?: string } => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
        return { success: false, message: "У вас нет прав для выполнения этого действия." };
    }
    const targetUser = users.find(u => u.id === targetUserId);
    if (!targetUser) {
        return { success: false, message: "Целевой пользователь не найден." };
    }

    // GA can change anyone's password (including other admins)
    // Regular admins cannot change GA's password or other admins' passwords
    if (currentUser.username.toLowerCase() !== GA_USERNAME.toLowerCase()) { // If current user is NOT GA
        if (targetUser.username.toLowerCase() === GA_USERNAME.toLowerCase() || targetUser.role === UserRole.ADMIN) {
            return { success: false, message: "Администраторы не могут изменять пароли других администраторов или Главного Администратора." };
        }
    }
    
    return changePassword(targetUserId, newPassword, true);
  }, [users, currentUser, changePassword]);

  const submitResourceRequest = useCallback((requestData: Omit<ResourceRequest, 'id' | 'status' | 'timestamp' | 'requesterId' | 'requesterUsername' | 'resolvedByUserId' | 'resolvedByUsername' | 'resolvedAt' | 'resolverComment'> & {targetUsername: string}) => {
    if (!currentUser || currentUser.role !== UserRole.HELPER ) { 
        return { success: false, message: "Только Хелперы могут подавать эти запросы." };
    }
    const targetUser = findUser(requestData.targetUsername);
    if (!targetUser) {
        return { success: false, message: `Пользователь "${requestData.targetUsername}" не найден.` };
    }
    
    // Prevent Helpers (who are not GA) from targeting Admins
    if (currentUser.username.toLowerCase() !== GA_USERNAME.toLowerCase() &&
        (targetUser.role === UserRole.ADMIN || targetUser.username.toLowerCase() === GA_USERNAME.toLowerCase())) {
            return { success: false, message: "Хелперы не могут подавать запросы на изменение ресурсов/VIP для Администраторов." };
    }

    const newRequest: ResourceRequest = {
        ...requestData,
        id: Date.now().toString() + Math.random().toString(36).substring(2,7),
        requesterId: currentUser.id,
        requesterUsername: currentUser.username,
        targetUserId: targetUser.id, 
        status: ResourceRequestStatus.PENDING,
        timestamp: new Date().toISOString(),
    };
    setResourceRequests(prev => [newRequest, ...prev]);
    addLog(currentUser.id, "Запрос на ресурсы/VIP", `Подан запрос на ${targetUser.username}: ${newRequest.action}. Причина: ${newRequest.reason}`);
    return { success: true, message: "Запрос успешно отправлен на рассмотрение." };
  }, [currentUser, findUser, setResourceRequests, addLog, users]);

  const resolveResourceRequest = useCallback((requestId: string, status: ResourceRequestStatus.APPROVED | ResourceRequestStatus.REJECTED, resolverComment?: string, vipDurationDays?: number) => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
        return { success: false, message: "Только Администраторы могут обрабатывать эти запросы." };
    }
    const requestIndex = resourceRequests.findIndex(req => req.id === requestId);
    if (requestIndex === -1) return { success: false, message: "Запрос не найден." };

    const request = resourceRequests[requestIndex];
    let message = `Запрос на "${request.action}" для ${request.targetUsername} ${status === ResourceRequestStatus.APPROVED ? 'одобрен' : 'отклонен'}.`;
    
    if (status === ResourceRequestStatus.APPROVED) {
        const targetUser = findUser(request.targetUsername);
        if (!targetUser) {
            setResourceRequests(prev => prev.map(r => r.id === requestId ? {...r, status: ResourceRequestStatus.REJECTED, resolvedByUserId: currentUser.id, resolvedByUsername: currentUser.username, resolvedAt: new Date().toISOString(), resolverComment: "Целевой пользователь не найден на момент обработки."} : r));
            return { success: false, message: `Целевой пользователь ${request.targetUsername} не найден. Запрос отклонен.` };
        }
        
        switch(request.action) {
            case ResourceRequestAction.INCREASE_REGULAR:
            case ResourceRequestAction.DECREASE_REGULAR:
                if (request.amount !== undefined) addBalance(targetUser.id, request.amount, CurrencyType.REGULAR);
                break;
            case ResourceRequestAction.INCREASE_PREMIUM:
            case ResourceRequestAction.DECREASE_PREMIUM:
                 if (request.amount !== undefined) addBalance(targetUser.id, request.amount, CurrencyType.PREMIUM);
                break;
            case ResourceRequestAction.GRANT_VIP:
                if (request.vipType && request.vipType !== VIPStatus.NONE) {
                    const duration = vipDurationDays !== undefined ? vipDurationDays : (request.vipDurationDays ?? 0);
                    setVipStatus(targetUser.id, request.vipType, duration, 'Запрос одобрен');
                }
                break;
            case ResourceRequestAction.REVOKE_VIP:
                setVipStatus(targetUser.id, VIPStatus.NONE, undefined, 'Запрос одобрен');
                break;
        }
        addLog(targetUser.id, "Изменение ресурсов/VIP (по запросу)", `Действие "${request.action}" одобрено администратором ${currentUser.username}. ${resolverComment || ''}`);
        addLog(currentUser.id, "Одобрение запроса ресурсов/VIP", `Одобрен запрос ID ${request.id} для ${targetUser.username}: ${request.action}.`);
    } else {
        addLog(currentUser.id, "Отклонение запроса ресурсов/VIP", `Отклонен запрос ID ${request.id} для ${request.targetUsername}: ${request.action}. Причина: ${resolverComment || 'Не указана'}`);
    }

    setResourceRequests(prev => prev.map(r => r.id === requestId ? {...r, status, resolvedByUserId: currentUser.id, resolvedByUsername: currentUser.username, resolvedAt: new Date().toISOString(), resolverComment } : r));
    return { success: true, message };
  }, [currentUser, resourceRequests, findUser, addBalance, setVipStatus, addLog, setResourceRequests]);


  return (
    <AuthContext.Provider value={{
      currentUser, users, login, register, logout, updateUser, addLog, addBalance, 
      purchaseVip, setVipStatus, activateVipFromStash, 
      openCase, findUser, getAllUsers,
      promoCodes, createPromoCode, togglePromoCodeActive, redeemPromoCode,
      muteUser, unmuteUser,
      banRequests, submitBanRequest, resolveBanRequest,
      sendSystemMail,
      changeUsername, changePassword, adminChangePassword,
      resourceRequests, submitResourceRequest, resolveResourceRequest
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
