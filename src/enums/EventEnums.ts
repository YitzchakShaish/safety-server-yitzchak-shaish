
// Military Ranks
export enum MilitaryRank {
  Tzurai = "טוראי",
  RishonTzurai = "טוראי ראשון",
  Samal = "סמל",
  SamalRishon = "סמל ראשון",
  RavSamal = "רב סמל",
  Seren = "סרן",
  RavSeren = "רב סרן",
  AlufMishne = "אלוף משנה",
  TatAluf = "תת אלוף",
  Aluf = "אלוף",
  RavAluf = "רב אלוף"
}

// Event Status
export enum EventStatus {
  NotTreated = 'לא טופל',
  InTreatment = 'בטיפול',
  Treated = 'טופל'
}

// Unit Activity Type
export enum UnitActivityType {
  Taam = 'תע"מ',
  Training = 'אימונים',
  Preparation = 'הכשרה',
  RelaxAdmin = 'רגיעה / מנהלה',
  Combat = 'מלחמה / מבצע צבאי נרחב'
}

// Personal Activity Type
export enum PersonalActivityType {
  Operational = 'פעילות מבצעית / לחימה',
  Training = 'אימון',
  Preparation = 'הכשרה',
  Routine = 'שגרה',
  Leisure = 'פנאי',
  Vacation = 'חופשה'
}

// Category
export enum Category {
  Weapons = 'נשק ומקלעים',
  Roads = 'דרכים',
  Ammunition = 'תחמושת',
  ShootingRange = 'ירי דו"צ',
  Weather = 'מזג אוויר',
  CombatSupport = 'רק"מ / צמ"ה קרביים',
  AirCollaboration = 'שת"פ אוויר',
  Work = 'עבודה',
  Air = 'אוויר',
  MarineSafety = 'בטיחות ימי',
  SportsExtreme = 'ספורט ואקסטרים',
  Falls = 'נפילות / חבלות',
  ShootingViolations = 'חריגות ירי / תנועה בשטחי אימונים',
  Explosives = 'חומ"ס',
  NonWeapon = 'אמל"ח (לא נשק / מקלעים)',
  Fire = 'אש',
  CombatTech = 'טג"ח קרבי',
  SeaCollaboration = 'שת"פ ים',
  Rescue = 'ייעודי עורף / חילוץ והצלה',
  LowAltitudeMeans = 'אמצעי רום קרוב לקרקע',
  PhysicalFitness = 'כושר גופני / קרבי'
}

// Location
export enum Location {
  Base = 'בסיס',
  CivilianArea = 'שטח אזרחי',
  FiringRange = 'שטח אש',
  Pier = 'רציף'
}

// Event Severity
export enum EventSeverity {
  Low = 'קל',
  Medium = 'בינוני',
  High = 'חמור'
}

// Event Result
export enum EventResult {
  NoneNoDamage = 'א.נ.א.נ (אין נפגעים, אין נזק)',
  NoneDamage = 'א.נ.י.נ (אין נפגעים, יש נזק)',
  InjuredNoDamage = 'י.נ.א.נ (יש נפגעים, אין נזק)',
  InjuredWithDamage = 'י.נ.י.נ (יש נפגעים, יש נזק)'
}

// Injury Level
export enum InjuryLevel {
  None = 'ללא פגיעה',
  MinorNoHospital = 'פגוע קל (ללא אשפוז)',
  MinorHospitalized = 'פגוע קל (שאושפז)',
  Moderate = 'פגוע בינוני',
  Severe = 'פגוע קשה / אנוש',
  Fatal = 'חלל'
}

// Weather Condition
export enum WeatherCondition {
  Heat = 'שרב / עומס חום',
  Snow = 'שלג',
  Sandstorm = 'סופת חול',
  Rain = 'גשם',
  Fog = 'ערפל',
  Bald = 'התקרחות',
  Hail = 'ברד',
  Cloudy = 'מעונן',
  Clear = 'נאה',
  Wind = 'רוח',
  RoughSea = 'ים סוער',
  CalmWater = 'מים שקטים'
}
