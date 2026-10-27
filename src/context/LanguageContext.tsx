import React, { createContext, useContext, useState, useEffect } from 'react';
import { District, PlayerPosition } from '../types';

export type Language = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  isRtl: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  translateDistrict: (district: District) => string;
  translatePosition: (position: PlayerPosition) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand & Header
    'brand.title': 'PADSTATION',
    'brand.league': 'LEAGUE',
    'brand.tagline': 'ONE CITY. ONE LEAGUE. EVERY PLAYER.',
    'brand.suezCircuit': 'Padstation Suez Circuit',
    'brand.suezEgypt': 'Suez, Egypt',
    'brand.officialCourt': 'Padstation Suez',
    'brand.courtDesc': 'One City. One League. One Court.',
    
    // Navigation
    'nav.home': 'Home',
    'nav.playerRankings': 'Player Rankings',
    'nav.teamRankings': 'Team Rankings',
    'nav.submitMatch': 'Submit Match',
    'nav.adminPanel': 'Admin Panel',
    'nav.rules': 'Rules & Points',
    'nav.logIn': 'Log In',
    'nav.joinPsl': 'Join PSL',
    'nav.logout': 'Log Out',
    'nav.role': 'Role',
    'nav.admin': 'ADMIN',
    'nav.player': 'PLAYER',
    'nav.administrator': 'Administrator',
    'nav.pending': 'Pending',
    'nav.supabaseConnected': 'Supabase: Connected',
    'nav.supabaseOffline': 'Supabase: Local / Setup',

    // Home Page
    'home.heroBadge': 'Official PSL Circuit • Padstation Suez',
    'home.heroDesc': 'The official competitive Padbol ranking platform in Suez, Egypt, hosted exclusively at Padstation Suez. Uniting players from Port Tawfiq, Faisal, Al Arbaeen, Attaka, and Suez Center on one championship court. Rigorous verification, independent player & doubles ratings, and certified championship standings.',
    'home.viewLeaderboards': 'View Leaderboards',
    'home.submitMatch': 'Submit Match Result',
    'home.adminHub': 'Admin Hub',
    'home.demoControlsTitle': 'PSL Evaluation & Quick Demo Controls',
    'home.demoControlsDesc': 'Switch roles, toggle sample Suez tournament matches, or clear to zero initial state.',
    'home.loadSample': 'Load Suez Sample Tournament',
    'home.resetZero': 'Reset to 0 Data',
    'home.supabaseGuide': 'Supabase SQL Guide',
    'home.statAthletes': 'Active Athletes',
    'home.statTeams': 'Doubles Pairs',
    'home.statVerified': 'Verified Matches',
    'home.statPoints': 'Points Awarded',
    'home.statAthletesSub': 'Competing at Padstation Suez',
    'home.statTeamsSub': 'Official Teams',
    'home.statVerifiedSub': 'pending verification',
    'home.statPointsSub': '3 PTS per win rule',
    'home.topPlayers': 'Top Ranked Athletes',
    'home.championshipStandings': 'Championship Standings',
    'home.fullIndividual': 'Full Individual Table',
    'home.viewCareer': 'View Career Profile',
    'home.recentApproved': 'Recent Approved Matches',
    'home.officialResults': 'Official PSL Results',
    'home.rankingEngineTitle': 'How The PSL Ranking Engine Operates',
    'home.suezConstitution': 'Suez League Constitution',
    'home.ruleZero': '0-Point Initial Baseline:',
    'home.ruleZeroDesc': 'Every player starts with 0 ranking points.',
    'home.ruleThree': '+3 PTS Award Per Win:',
    'home.ruleThreeDesc': 'Winning players receive 3 individual points; losing players 0.',
    'home.ruleSeparate': 'Separate Individual & Team Points:',
    'home.ruleSeparateDesc': 'Player individual totals never contaminate doubles pair standings.',
    'home.ruleAdmin': 'Admin-Only Point Distribution:',
    'home.ruleAdminDesc': 'Pending matches never alter points until certified by a league referee.',

    // Rankings Table
    'rankings.individualTitle': 'INDIVIDUAL PLAYER RANKINGS',
    'rankings.individualSubtitle': 'Official PSL individual points table. Every player starts at 0 PTS. Approved match winners receive +3 PTS; losing players receive 0 PTS.',
    'rankings.teamTitle': 'DOUBLES TEAM RANKINGS',
    'rankings.teamSubtitle': 'Official team leaderboard for registered doubles pairs. Winning teams earn +3 TEAM PTS per approved match. Doubles points are tracked strictly separate from individual player totals.',
    'rankings.registerPlayer': 'Register New Player',
    'rankings.searchPlaceholder': 'Search player name, nickname, or partner...',
    'rankings.searchTeamPlaceholder': 'Search by team name or partner...',
    'rankings.allDistricts': 'All Suez Districts',
    'rankings.allPositions': 'All Positions',
    'rankings.sortBy': 'Sort by',
    'rankings.sortByPoints': 'Sort by: Individual Points (PTS)',
    'rankings.sortByWinRate': 'Sort by: Win Rate %',
    'rankings.sortByWins': 'Sort by: Total Wins',
    'rankings.sortByMatches': 'Sort by: Matches Played',
    'rankings.rank': 'Rank',
    'rankings.player': 'Player',
    'rankings.district': 'District',
    'rankings.role': 'Role',
    'rankings.mp': 'MP',
    'rankings.w': 'W',
    'rankings.l': 'L',
    'rankings.winRate': 'Win %',
    'rankings.form': 'Recent Form',
    'rankings.pts': 'PTS',
    'rankings.teamPts': 'TEAM PTS',
    'rankings.doublesTeam': 'Doubles Team',
    'rankings.partners': 'Partners',
    'rankings.partner': 'Partner',

    // Doubles partner
    'doubles.partnerTitle': 'Doubles Partner (Padbol 2 vs 2)',
    'doubles.partnerDesc': 'Padbol is exclusively played in pairs. Enter your primary doubles partner to link your partnership in the Suez League rankings.',
    'doubles.partnerName': 'Partner Full Name',
    'doubles.partnerPhone': 'Partner Phone Number',

    // Match Submission
    'match.submitTitle': 'SUBMIT MATCH RESULT',
    'match.submitSubtitle': 'Record a completed 2v2 Padbol doubles match. Matches are entered in PENDING status and do not affect points until approved by a PSL League Administrator.',
    'match.venueTitle': '1. Match Venue & Time',
    'match.courtLocation': 'Suez Court Location',
    'match.matchDate': 'Match Date',
    'match.teamA': 'TEAM A',
    'match.teamB': 'TEAM B',
    'match.teamPair': 'Doubles Pair',
    'match.player1': 'Player 1',
    'match.player2': 'Player 2 (Partner)',
    'match.setsTitle': '2. Official Set Scores',
    'match.set': 'Set',
    'match.setDecider': 'Set 3 (Decider)',
    'match.addSet3': '+ Add 3rd Tiebreaker Set',
    'match.removeSet3': '- Remove 3rd Set',
    'match.calculatedOutcome': 'Calculated Outcome',
    'match.pointsDistribution': 'Points Distribution',
    'match.notes': 'Match Notes / Referee / Spectators',
    'match.submitBtn': 'Submit For Approval',

    // Admin Dashboard
    'admin.dashboardTitle': 'LEAGUE COMMISSIONER HUB',
    'admin.dashboardSubtitle': 'Review match submissions, approve point distributions, correct referee disputes, and manage the official Suez player registry.',
    'admin.pendingApprovals': 'Pending Approvals',
    'admin.history': 'Match History & Corrections',
    'admin.playerManagement': 'Player Management',
    'admin.approveBtn': 'Approve & Award Points (+3)',
    'admin.rejectBtn': 'Reject Match',
    'admin.revertBtn': 'Revert Points',
    'admin.ruleNotice': 'Rule: +3 PTS per winner',
    'admin.clearanceRequired': 'ADMINISTRATOR CLEARANCE REQUIRED',
    'admin.clearanceDesc': 'This area is restricted to PSL League Commissioners and certified referees to prevent unauthorized ranking modifications.',
    'admin.testingNotice': 'Testing PSL League Features?',
    'admin.testingDesc': 'You are currently signed in as a regular athlete. Switch your role to Administrator to test match approvals, points awarding, and corrections.',
    'admin.enableAdminBtn': 'Enable Administrator Mode (Evaluation)',
    'admin.registerPlayerBtn': 'Register Suez Player',
    'admin.noPending': 'There are currently no pending match submissions awaiting approval in the Suez circuit.',
    'admin.queueClear': 'Verification Queue Clear',
    'admin.waitingValidation': 'match(es) waiting for administrative validation. Points are held until approved.',
    'admin.submittedBy': 'Submitted by',
    'admin.winnerAward': 'Winner (+3 PTS)',
    'admin.setBreakdown': 'Set Breakdown',
    'admin.refereeNotes': 'Referee Notes',
    'admin.rejectModalTitle': 'Reject Match Submission',
    'admin.rejectModalDesc': 'Provide a reason for rejection. This will mark the match as rejected without affecting player rankings or awarding points.',
    'admin.rejectReasonPlaceholder': 'Reason (e.g. Ineligible player, erroneous score input, duplicate entry)...',
    'admin.confirmRejection': 'Confirm Rejection',
    'admin.partnerOptional': 'Doubles Partner (Optional)',
    'admin.partnerSimpleNote': 'Padbol is 2 vs 2. You can optionally link a partner now or later.',
    'admin.partnerName': 'Partner Name',
    'admin.partnerPhone': 'Partner Phone',
    'admin.initialZeroReminder': 'Rule Reminder: All newly registered players start at 0 points. Points can only be accrued through approved match victories.',
    'admin.registerProfileBtn': 'Register Profile',
    'admin.revertWarning': 'Roll back 3 points awarded and restore match to pending',
    'admin.revertConfirm': 'Are you sure you want to revert this match? This will deduct the 3 points awarded to the winners and restore the match to Pending.',

    // Rules Page
    'rules.title': 'PSL SUEZ RANKING RULES & REGULATIONS',
    'rules.subtitle': 'Standardized ranking rules governing all sanctioned Padbol matches hosted at Padstation Suez.',
    'rules.officialConstitution': 'Official League Constitution',
    'rules.corePrinciples': 'The Core Ranking Principles',
    'rules.r1Title': 'Initial 0-Point Baseline',
    'rules.r1Head': 'Every Player Starts at Exactly 0 Points',
    'rules.r1Desc': 'No inherited points or seniority advantages. Every athlete enters the Suez leaderboard on equal footing with zero ranking points.',
    'rules.r2Title': '+3 Points Awarded to Winners',
    'rules.r2Head': 'Winning Players Receive +3 Individual Points',
    'rules.r2Desc': 'Both athletes on the winning doubles team receive 3 individual ranking points for an approved official fixture.',
    'rules.r3Title': '0 Points for Defeat',
    'rules.r3Head': 'Losing Players Receive 0 Points',
    'rules.r3Desc': 'Defeated teams and players receive 0 points. Match participation, set scores, and loss records are tracked without reducing accumulated points.',
    'rules.r4Title': 'Separate Individual & Team Points',
    'rules.r4Head': 'Strict Separation of Ratings',
    'rules.r4Desc': 'Winning doubles pairs receive 3 team points on the Doubles Table. Individual points and doubles team points are completely separate and never merged.',
    'rules.r5Title': 'Pending & Rejected Isolation',
    'rules.r5Head': 'Pending Matches Do Not Affect Standings',
    'rules.r5Desc': 'Until a PSL Administrator or league referee formally verifies and stamps the result, zero points are distributed to any player.',
    'rules.r6Title': 'Zero Duplicate Point Protection',
    'rules.r6Head': 'Atomic Approval & Idempotency',
    'rules.r6Desc': 'Matches carry a strict transactional status and points_awarded flag. It is mathematically impossible for points to be credited more than once.',
    'rules.padbolFormat': 'Official Padbol Match Format at Padstation Suez',
    'rules.padbolDoubles': 'Doubles Format (2 vs 2): Every sanctioned fixture consists of 4 registered players (2 per side).',
    'rules.padbolSets': 'Sets & Games: Matches are contested as Best of 3 Sets. The first team to win 6 games (with a 2-game margin, or 7-5 / 7-6 tiebreaker) captures the set.',
    'rules.padbolNoDraws': 'No Draws: A match must conclude with a definitive winner (2-0 or 2-1 in sets).',
    'rules.padbolBody': 'Legal Touches: Played with feet, head, torso, and legs (no hands). Maximum of 3 touches before crossing the net.',
    'rules.padbolWalls': 'Glass Walls Interaction: Players can bounce the ball off their own glass walls to return it across the net.',
    'rules.inspectSql': 'Want to inspect the PostgreSQL RLS Policies?',
    'rules.inspectSqlDesc': 'Review how our Supabase database blocks users from modifying their own points.',
    'rules.viewSqlBtn': 'View Supabase RLS Schema',

    // Profile
    'profile.individualPoints': 'Individual Points',
    'profile.matchesPlayed': 'Matches Played',
    'profile.winPercentage': 'Win Percentage',
    'profile.topDoublesPoints': 'Top Doubles Points',
    'profile.recentForm': 'Recent Form (Last 5)',
    'profile.suezBadges': 'Suez Athlete Badges',
    'profile.matchHistory': 'Player Match History',
    'profile.memberSince': 'Member since',

    // Auth
    'auth.signInTitle': 'ATHLETE SIGN IN',
    'auth.createTitle': 'CREATE PLAYER PROFILE',
    'auth.fullName': 'Full Name',
    'auth.nickname': 'Nickname (Optional)',
    'auth.phone': 'Phone Number',
    'auth.district': 'Suez District Base',
    'auth.position': 'Preferred Position',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.quickTest': 'Instant Reviewer Test Access (No signup needed):',
    'auth.testAdmin': 'Test as Admin',
    'auth.testPlayer': 'Test as Player',

    // Common
    'common.verified': 'Verified & Approved',
    'common.rejected': 'Rejected',
    'common.awaiting': 'Awaiting Verification',
    'common.close': 'Close',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
  },
  ar: {
    // Brand & Header
    'brand.title': 'بادستيشن',
    'brand.league': 'ليج',
    'brand.tagline': 'مدينة واحدة. دوري واحد. كل لاعب.',
    'brand.suezCircuit': 'دوري بادستيشن السويس الرسمي',
    'brand.suezEgypt': 'السويس، مصر',
    'brand.officialCourt': 'بادستيشن السويس',
    'brand.courtDesc': 'مدينة واحدة. دوري واحد. ملعب واحد.',

    // Navigation
    'nav.home': 'الرئيسية',
    'nav.playerRankings': 'تصنيف اللاعبين',
    'nav.teamRankings': 'تصنيف الفرق',
    'nav.submitMatch': 'تسجيل مباراة',
    'nav.adminPanel': 'لوحة الإدارة',
    'nav.rules': 'قواعد النقاط',
    'nav.logIn': 'تسجيل الدخول',
    'nav.joinPsl': 'انضم للدوري',
    'nav.logout': 'تسجيل الخروج',
    'nav.role': 'الدور',
    'nav.admin': 'مسؤول',
    'nav.player': 'لاعب',
    'nav.administrator': 'مسؤول الدوري',
    'nav.pending': 'قيد المراجعة',
    'nav.supabaseConnected': 'سوبابيز: متصل',
    'nav.supabaseOffline': 'سوبابيز: وضع محلي / إعداد',

    // Home Page
    'home.heroBadge': 'الدوري الرسمي • بادستيشن السويس',
    'home.heroDesc': 'المنصة الرسمية المعتمدة لتصنيف لاعبي وفرق البادبول في محافظة السويس بمقر وملعب بادستيشن السويس (الملعب والموقع الرسمي الوحيد). تجمع لاعبي بورتوفيق وفيصل والأربعين وعتاقة وحي السويس والجناين على ملعب واحد للمنافسة على صدارة الدوري.',
    'home.viewLeaderboards': 'عرض لوحة الصدارة',
    'home.submitMatch': 'تسجيل نتيجة مباراة',
    'home.adminHub': 'لوحة المسؤولين',
    'home.demoControlsTitle': 'أدوات التجربة والتحكم السريع للدوري',
    'home.demoControlsDesc': 'بدل بين حساب المسؤول واللاعب، أو قم بتحميل مباريات تجريبية لبطولة السويس، أو ابدأ من نقطة الصفر.',
    'home.loadSample': 'تحميل بطولة السويس التجريبية',
    'home.resetZero': 'تصفير البيانات إلى الصفر',
    'home.supabaseGuide': 'دليل إعداد سوبابيز وSQL',
    'home.statAthletes': 'اللاعبون المسجلون',
    'home.statTeams': 'الفرق الزوجية',
    'home.statVerified': 'المباريات المعتمدة',
    'home.statPoints': 'النقاط الممنوحة',
    'home.statAthletesSub': 'يتنافسون في ملعب بادستيشن السويس',
    'home.statTeamsSub': 'فرق ثنائية معتمدة',
    'home.statVerifiedSub': 'مباريات بانتظار التحكيم',
    'home.statPointsSub': 'قاعدة ٣ نقاط للفائز',
    'home.topPlayers': 'متصدرو تصنيف السويس',
    'home.championshipStandings': 'صدارة بطولة السويس',
    'home.fullIndividual': 'جدول تصنيف اللاعبين بالكامل',
    'home.viewCareer': 'عرض السجل الرياضي',
    'home.recentApproved': 'أحدث المباريات المعتمدة',
    'home.officialResults': 'النتائج الرسمية المعتمدة',
    'home.rankingEngineTitle': 'دستور وقواعد احتساب نقاط دوري PSL',
    'home.suezConstitution': 'دستور الدوري في السويس',
    'home.ruleZero': 'البدء من الصفر تماماً:',
    'home.ruleZeroDesc': 'يبدأ كل لاعب جديد من رصيد صفر نقطة دون أي أسبقية.',
    'home.ruleThree': 'منح ٣ نقاط لكل فائز:',
    'home.ruleThreeDesc': 'يحصل كل لاعب في الفريق الفائز على ٣ نقاط فردية، و٠ نقطة للمهزوم.',
    'home.ruleSeparate': 'فصل نقاط الفردي عن نقاط الزوجي:',
    'home.ruleSeparateDesc': 'نقاطك الفردية لا تختلط إطلاقاً بنقاط فريقك الزوجي.',
    'home.ruleAdmin': 'الاعتماد حصري للمسؤولين:',
    'home.ruleAdminDesc': 'المباريات المعلقة لا تضيف أي نقطة حتى يصادق عليها حكم أو مسؤول الدوري.',

    // Rankings Table
    'rankings.individualTitle': 'جدول تصنيف اللاعبين الفردي',
    'rankings.individualSubtitle': 'الترتيب الرسمي للاعبي البادبول في السويس. يبدأ كل لاعب من ٠ نقطة. يمنح الفائز ٣ نقاط، ولا تخصم أي نقطة عند الخسارة.',
    'rankings.teamTitle': 'جدول تصنيف الفرق الزوجية (ثنائي)',
    'rankings.teamSubtitle': 'الترتيب الرسمي للثنائيات الزوجية في السويس. تمنح ٣ نقاط لكل فريق فائز في المباراة المعتمدة منفصلة عن رصيد اللاعبين الفردي.',
    'rankings.registerPlayer': 'تسجيل لاعب جديد',
    'rankings.searchPlaceholder': 'ابحث باسم اللاعب أو اللقب أو الزميل...',
    'rankings.searchTeamPlaceholder': 'ابحث باسم الفريق أو أحد الشريكين...',
    'rankings.allDistricts': 'جميع مناطق وأحياء السويس',
    'rankings.allPositions': 'جميع المراكز والمهام',
    'rankings.sortBy': 'ترتيب حسب',
    'rankings.sortByPoints': 'ترتيب حسب: النقاط الفردية',
    'rankings.sortByWinRate': 'ترتيب حسب: نسبة الفوز %',
    'rankings.sortByWins': 'ترتيب حسب: إجمالي الانتصارات',
    'rankings.sortByMatches': 'ترتيب حسب: عدد المباريات',
    'rankings.rank': 'الترتيب',
    'rankings.player': 'اللاعب',
    'rankings.district': 'المنطقة',
    'rankings.role': 'المركز',
    'rankings.mp': 'لعب',
    'rankings.w': 'فوز',
    'rankings.l': 'خسارة',
    'rankings.winRate': 'نسبة الفوز',
    'rankings.form': 'آخر المباريات',
    'rankings.pts': 'النقاط',
    'rankings.teamPts': 'نقاط الفريق',
    'rankings.doublesTeam': 'الفريق الزوجي',
    'rankings.partners': 'الشريكان',
    'rankings.partner': 'الزميل',

    // Doubles partner
    'doubles.partnerTitle': 'بيانات الزميل في الفريق الزوجي (بادبول ٢ ضد ٢)',
    'doubles.partnerDesc': 'رياضة البادبول تُلعب حصرياً بنظام الزوجي (لاعبان ضد لاعبين). تسجيل زميلك الدائم يربط فريقكما بجدول تصنيف الفرق في السويس.',
    'doubles.partnerName': 'اسم الزميل بالكامل',
    'doubles.partnerPhone': 'رقم هاتف الزميل',

    // Match Submission
    'match.submitTitle': 'تسجيل نتيجة مباراة جديدة',
    'match.submitSubtitle': 'أدخل نتيجة مباراة بادبول زوجي (٢ ضد ٢). تظل المباراة بحالة "قيد المراجعة" ولا تضاف أي نقاط إلا بعد اعتمادها من إدارة الدوري.',
    'match.venueTitle': '١. موقع وتاريخ المباراة',
    'match.courtLocation': 'ملعب البادبول في السويس',
    'match.matchDate': 'تاريخ المباراة',
    'match.teamA': 'الفريق الأول (أ)',
    'match.teamB': 'الفريق الثاني (ب)',
    'match.teamPair': 'الثنائي الزوجي',
    'match.player1': 'اللاعب الأول',
    'match.player2': 'اللاعب الثاني (الزميل)',
    'match.setsTitle': '٢. نتيجة الأشواط (المجموعات)',
    'match.set': 'المجموعة',
    'match.setDecider': 'المجموعة الثالثة (الفاصلة)',
    'match.addSet3': '+ إضافة شوط فاصل ثالث',
    'match.removeSet3': '- إزالة الشوط الثالث',
    'match.calculatedOutcome': 'الفائز المحسوب تلقائياً',
    'match.pointsDistribution': 'توزيع النقاط عند الاعتماد',
    'match.notes': 'ملاحظات المباراة / اسم الحكم / الشهود',
    'match.submitBtn': 'إرسال المباراة للاعتماد',

    // Admin Dashboard
    'admin.dashboardTitle': 'لوحة تحكم مسؤولي ولجنة حكام السويس',
    'admin.dashboardSubtitle': 'مراجعة طلبات المباريات، اعتماد منح النقاط (+٣)، حل النزاعات، وإدارة قاعدة بيانات لاعبي السويس.',
    'admin.pendingApprovals': 'مباريات بانتظار الاعتماد',
    'admin.history': 'سجل المباريات والتصحيحات',
    'admin.playerManagement': 'إدارة اللاعبين',
    'admin.approveBtn': 'اعتماد المباراة ومنح النقاط (+٣)',
    'admin.rejectBtn': 'رفض النتيجة',
    'admin.revertBtn': 'سحب النقاط والتصحيح',
    'admin.ruleNotice': 'القاعدة: +٣ نقاط لكل لاعب فائز',
    'admin.clearanceRequired': 'يلزم صلاحية مسؤول دوري للدخول',
    'admin.clearanceDesc': 'هذه المنطقة مخصصة فقط لمسؤولي وحكام دوري بادستيشن بالسويس لمنع أي تلاعب غير مصرح به في تصنيف ونقاط اللاعبين.',
    'admin.testingNotice': 'هل تختبر مميزات دوري بادستيشن السويس؟',
    'admin.testingDesc': 'أنت مسجل حالياً كلاعب عادي. اضغط للتحويل إلى حساب مسؤول لتجربة اعتماد المباريات، واحتساب النقاط (+٣)، وإلغاء وتعديل النتائج.',
    'admin.enableAdminBtn': 'تفعيل وضع المسؤول (للتجربة والتقييم)',
    'admin.registerPlayerBtn': 'تسجيل لاعب جديد في السويس',
    'admin.noPending': 'لا توجد حالياً أي مباريات معلقة بانتظار الاعتماد في دوري السويس.',
    'admin.queueClear': 'قائمة الانتظار فارغة',
    'admin.waitingValidation': 'مباراة بانتظار التحكيم والمصادقة. تُحجب النقاط حتى الاعتماد.',
    'admin.submittedBy': 'مقدم الطلب',
    'admin.winnerAward': 'الفائز (+٣ نقاط)',
    'admin.setBreakdown': 'تفاصيل المجموعات',
    'admin.refereeNotes': 'ملاحظات التحكيم',
    'admin.rejectModalTitle': 'رفض نتيجة المباراة',
    'admin.rejectModalDesc': 'اذكر سبب الرفض. سيتم حفظ المباراة كمرفوضة دون التأثير على نقاط وتصنيف اللاعبين.',
    'admin.rejectReasonPlaceholder': 'سبب الرفض (مثال: لاعب غير مسجل، خطأ في إدخال الأشواط، نتيجة مكررة)...',
    'admin.confirmRejection': 'تأكيد الرفض',
    'admin.partnerOptional': 'الزميل في الزوجي (اختياري)',
    'admin.partnerSimpleNote': 'رياضة البادبول تُلعب ٢ ضد ٢. يمكنك ربط اسم شريك اختياري دون أي تعقيد.',
    'admin.partnerName': 'اسم الزميل',
    'admin.partnerPhone': 'رقم هاتف الزميل',
    'admin.initialZeroReminder': 'تذكير دستوري: كل لاعب جديد يبدأ من رصيد ٠ نقطة. لا تكتسب النقاط إلا بالفوز في مباريات معتمدة.',
    'admin.registerProfileBtn': 'تسجيل الملف الرياضي',
    'admin.revertWarning': 'سحب الـ ٣ نقاط الممنوحة وإعادة المباراة للمراجعة',
    'admin.revertConfirm': 'هل أنت متأكد من رغبتك في سحب اعتماد هذه المباراة؟ سيتم خصم الـ ٣ نقاط الممنوحة للفائزين وإعادتها لقيد المراجعة.',

    // Rules Page
    'rules.title': 'قواعد ولوائح تصنيف دوري بادستيشن السويس',
    'rules.subtitle': 'القواعد المعتمدة لاحتساب النقاط لكافة مباريات البادبول في ملعب ومقر بادستيشن السويس.',
    'rules.officialConstitution': 'الدستور الرسمي للدوري',
    'rules.corePrinciples': 'المبادئ الأساسية لاحتساب النقاط',
    'rules.r1Title': 'البدء من رصيد صفر نقطة',
    'rules.r1Head': 'يبدأ كل لاعب جديد من رصيد صفر نقطة تماماً',
    'rules.r1Desc': 'لا توجد نقاط مسبقة أو تمييز للأقدمية. كل لاعب يدخل قائمة تصنيف السويس برصيد صفر نقطة على قدم المساواة.',
    'rules.r2Title': 'منح ٣ نقاط لكل فائز',
    'rules.r2Head': 'يحصل كل لاعب في الفريق الفائز على +٣ نقاط فردية',
    'rules.r2Desc': 'يحصل كلا اللاعبين في الفريق الزوجي الفائز على ٣ نقاط فردية عند اعتماد المباراة رسمياً.',
    'rules.r3Title': 'صفر نقطة عند الهزيمة',
    'rules.r3Head': 'يحصل الفريق واللاعب الخاسر على ٠ نقطة',
    'rules.r3Desc': 'لا تخصم أي نقطة عند الخسارة. يتم تسجيل عدد المباريات والأشواط مع الحفاظ التام على النقاط المكتسبة.',
    'rules.r4Title': 'فصل نقاط الفردي عن نقاط الفرق',
    'rules.r4Head': 'فصل كامل لا يقبل الدمج بين الرصيدين',
    'rules.r4Desc': 'يحصل الفريق الزوجي الفائز على ٣ نقاط في جدول تصنيف الفرق الزوجية، ولا تخلط إطلاقاً مع النقاط الفردية.',
    'rules.r5Title': 'عزل المباريات المعلقة والمرفوضة',
    'rules.r5Head': 'المباريات قيد المراجعة لا تعدل التصنيف',
    'rules.r5Desc': 'حتى يصدق مسؤول أو حكم معتمد في السويس على النتيجة، لا تمنح أي نقطة لأي طرف.',
    'rules.r6Title': 'منع احتساب النقاط المكررة',
    'rules.r6Head': 'اعتماد برمجـي ذري يمنع الازدواجية',
    'rules.r6Desc': 'المباريات مشفرة بحالة أمان صارمة ومؤشر نقاط يمنع برمجياً تكرار منح النقاط لأكثر من مرة واحدة.',
    'rules.padbolFormat': 'نظام وقوانين مباريات البادبول في بادستيشن السويس',
    'rules.padbolDoubles': 'نظام الزوجي (٢ ضد ٢): تلعب البادبول دائماً بفريقين، كل فريق يضم لاعبين اثنين (٤ لاعبين في الملعب).',
    'rules.padbolSets': 'الأشواط والمجموعات: المباريات بنظام الأفضل من ٣ مجموعات. الفريق الذي يحقق ٦ أشواط بفارق شوطين يحسم المجموعة.',
    'rules.padbolNoDraws': 'لا يوجد تعادل: تنتهي المباراة بفائز حتمي بنتيجة (٢-٠) أو (٢-١) في المجموعات.',
    'rules.padbolBody': 'اللمسات المسموحة: تلعب بالقدم والرأس والصدر والساق (يمنع استخدام اليدين). الحد الأقصى ٣ لمسات قبل عبور الشبكة.',
    'rules.padbolWalls': 'ارتداد الزجاج: يسمح بلعب الكرة على الجدران الزجاجية الخاصة بفريقك لتمريرها عبر الشبكة.',
    'rules.inspectSql': 'هل ترغب في فحص سياسات أمان قاعدة بيانات PostgreSQL (RLS)؟',
    'rules.inspectSqlDesc': 'اطلع على الكود البرمجي الذي يمنع المستخدمين من تعديل نقاطهم بأنفسهم في سوبابيز.',
    'rules.viewSqlBtn': 'عرض مخطط وقواعد أمان سوبابيز',

    // Profile
    'profile.individualPoints': 'النقاط الفردية',
    'profile.matchesPlayed': 'المباريات الملعوبة',
    'profile.winPercentage': 'نسبة الفوز',
    'profile.topDoublesPoints': 'نقاط الفريق الزوجي',
    'profile.recentForm': 'مستوى آخر ٥ مباريات',
    'profile.suezBadges': 'أوسمة وإنجازات السويس',
    'profile.matchHistory': 'سجل مباريات اللاعب',
    'profile.memberSince': 'عضو بالدوري منذ',

    // Auth
    'auth.signInTitle': 'تسجيل دخول اللاعبين',
    'auth.createTitle': 'إنشاء ملف لاعب جديد',
    'auth.fullName': 'الاسم بالكامل',
    'auth.nickname': 'اللقب الرياضي (اختياري)',
    'auth.phone': 'رقم الهاتف',
    'auth.district': 'المنطقة أو الحي التابع له',
    'auth.position': 'المركز المفضل في الملعب',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.quickTest': 'دخول سريع للتجربة (بدون كتابة كلمة سر):',
    'auth.testAdmin': 'تجربة كمسؤول دوري',
    'auth.testPlayer': 'تجربة كلاعب',

    // Common
    'common.verified': 'معتمدة وموثقة',
    'common.rejected': 'مرفوضة',
    'common.awaiting': 'بانتظار التحقق',
    'common.close': 'إغلاق',
    'common.cancel': 'إلغاء',
    'common.confirm': 'تأكيد',
    'common.back': 'رجوع',
  },
};

const districtTranslations: Record<District, { en: string; ar: string }> = {
  'Al Arbaeen': { en: 'Al Arbaeen', ar: 'الأربعين' },
  'Faisal': { en: 'Faisal', ar: 'فيصل' },
  'Attaka': { en: 'Attaka', ar: 'عتاقة' },
  'Port Tawfiq': { en: 'Port Tawfiq', ar: 'بورتوفيق' },
  'Suez Center': { en: 'Suez Center', ar: 'حي السويس' },
  'Al Ganayen': { en: 'Al Ganayen', ar: 'الجناين' },
};

const positionTranslations: Record<PlayerPosition, { en: string; ar: string }> = {
  'Attacker': { en: 'Attacker', ar: 'مهاجم' },
  'Defender': { en: 'Defender', ar: 'مدافع' },
  'All-Rounder': { en: 'All-Rounder', ar: 'شامل' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANG_STORAGE_KEY = 'psl_selected_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // English is the primary default language on initial load; Arabic is secondary
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(LANG_STORAGE_KEY);
      if (stored === 'en' || stored === 'ar') {
        return stored;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    const next = language === 'ar' ? 'en' : 'ar';
    setLanguage(next);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  const translateDistrict = (district: District): string => {
    return districtTranslations[district]?.[language] || district;
  };

  const translatePosition = (position: PlayerPosition): string => {
    return positionTranslations[position]?.[language] || position;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        direction,
        isRtl: direction === 'rtl',
        setLanguage,
        toggleLanguage,
        t,
        translateDistrict,
        translatePosition,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
