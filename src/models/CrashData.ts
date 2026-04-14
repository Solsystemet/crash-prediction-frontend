export type CrashData = {
  id: string;
  location: number;
  severity: 'FATAL' | 'INCAPACITATING INJURY' | 'NO INDICATION OF INJURY' | 'NONINCAPACITATING INJURY' | 'REPORTED, NOT EVIDENT';
};
