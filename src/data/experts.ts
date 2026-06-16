export type Expert = {
  id: string;
  initials: string;
  name: string;
  title: string;
  location: string;
  country: string;
  skills: string[];
  languages: string[];
  regions: string[];
  emergencyExperience: boolean;
  previousUnicef: boolean;
  verified: boolean;
  trustRating: number;
  reviewsCount: number;
  yearsExperience: number;
  availability: string;
  dailyFee: string;
  summary: string;
  expertiseLevels: { skill: string; level: 'Expert' | 'Advanced' | 'Intermediate' }[];
  pastMissions: { title: string; organization: string; role: string; rating: number }[];
  certifications: string[];
  contact: { email: string; phone: string };
  assignmentDetails: {
    feeRange: string;
    previousAssignments: number;
    homeBase: string;
    duration: string;
  };
  specialCapabilities: string[];
  references: { name: string; title: string; email: string }[];
};

const firstNames = ['Ana', 'Chloe', 'Elena', 'Farah', 'Helene', 'Julia', 'Mariam', 'William', 'Yara', 'Zoe', 'Ahmed', 'Bintu', 'Chen', 'David', 'Esher', 'Fatima', 'George', 'Hannah', 'Ismail', 'Jasmine', 'Kofi', 'Lara', 'Musa', 'Ngozi', 'Omar', 'Paul', 'Quinn', 'Ravi', 'Sarah', 'Tariq', 'Uma', 'Victor'];
const lastNames = ['Haq', 'Jensen', 'Johnson', 'Lopez', 'Garcia', 'Costa', 'Smith', 'Singh', 'Traore', 'Haddad', 'Al-Sayed', 'Nwosu', 'Wang', 'Miller', 'Okafor', 'Bello', 'Ali', 'Kim', 'Onyango', 'Diallo'];
const countries = ["Cote d'Ivoire", 'Ethiopia', 'Canada', 'Pakistan', 'Uganda', 'Nigeria', 'Kenya', 'Senegal', 'South Africa', 'India', 'Bangladesh', 'Brazil', 'France', 'UK'];
const regionsPool = ['East & Southern Africa', 'South Asia', 'East Asia & Pacific', 'West & Central Africa'];
const areasOfExpertise = ['WASH', 'Programme Scale-up Management', 'Humanitarian Action', 'Health', 'Programme Design', 'Digital Infrastructure', 'Early Childhood Development', 'Policy Reform', 'Child Protection', 'Social & Behaviour Change', 'Financing for Scale', 'Education'];
const languagesPool = ['English', 'German', 'French', 'Swahili', 'Bemba', 'Hausa', 'Sinhala', 'Spanish', 'Arabic'];

function rItem<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rMulti<T>(arr: T[], max: number): T[] {
  const result = new Set<T>();
  const count = Math.floor(Math.random() * max) + 1;
  for(let i=0; i<count; i++) result.add(rItem(arr));
  return Array.from(result);
}
function rRange(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }

export const MOCK_EXPERTS: Expert[] = Array.from({ length: 50 }).map((_, i) => {
  const fn = rItem(firstNames);
  const ln = rItem(lastNames);
  const name = `${fn} ${ln}`;
  const isEmergency = Math.random() > 0.5;
  const isUnicef = Math.random() > 0.3;
  const country = rItem(countries);
  const skills = rMulti(areasOfExpertise, 4);

  return {
    id: String(i + 1),
    initials: `${fn[0]}${ln[0]}`,
    name,
    title: `${skills[0]} Specialist`,
    location: country,
    country,
    skills,
    languages: rMulti(languagesPool, 3),
    regions: rMulti(regionsPool, 2),
    emergencyExperience: isEmergency,
    previousUnicef: isUnicef,
    verified: Math.random() > 0.1,
    trustRating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
    reviewsCount: rRange(3, 40),
    yearsExperience: rRange(5, 25),
    availability: rItem(['Immediate', '1-3 months', '3-6 months', 'Unavailable']),
    dailyFee: rItem(['$300-400', '$401-500', '$500-600', '$601-700', '$701-800', '$800+']),
    summary: `${fn} is a highly experienced ${skills[0]} expert based in ${country}. She/He has ${rRange(5,20)} years of experience supporting various humanitarian scale-up projects globally.`,
    expertiseLevels: skills.map(s => ({ skill: s, level: rItem(['Expert', 'Advanced', 'Intermediate']) as 'Expert' | 'Advanced' | 'Intermediate' })),
    pastMissions: [],
    certifications: isEmergency ? ['Emergency Response Certified', 'UNICEF Core Values'] : ['UNICEF Core Values'],
    contact: { email: `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`, phone: `+${rRange(10, 99)} ${rRange(100, 999)} ${rRange(1000, 9999)}` },
    assignmentDetails: {
      feeRange: rItem(['$300-400', '$401-500', '$500-600', '$601-700', '$701-800', '$800+']),
      previousAssignments: rRange(0, 8),
      homeBase: country,
      duration: rItem(['Flexible', 'Short-term', 'Emergency Deployments', 'Long-term only'])
    },
    specialCapabilities: rMulti(['Emergency Experience', 'Programme Scale-up', 'Conflict Zone Management', 'Policy Drafting'], 2),
    references: []
  };
});
