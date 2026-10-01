// ----------------------------------------------------------------------
// HealthLine Admin — static demo data (replace with APIs later)
// ----------------------------------------------------------------------

export const HL_DASHBOARD_STATS = [
  { label: 'Users', value: '12,482', change: '+326 today' },
  { label: 'Active Users', value: '8,421', change: '67% of total' },
  { label: 'New Users', value: '326', change: 'Today' },
  { label: 'Premium', value: '2,184', change: '17.5% conversion' },
  { label: 'Revenue', value: '₹4.8L', change: 'This month' },
  { label: 'AI Requests', value: '42,812', change: 'Today' },
  { label: 'Reports Uploaded', value: '3,421', change: 'All time' },
];

/** Last 7 days — static trends for dashboard charts */
export const HL_DASHBOARD_CHART = {
  categories: ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
  users: {
    total: [11820, 11940, 12010, 12105, 12180, 12290, 12482],
    active: [7900, 8010, 8120, 8200, 8280, 8350, 8421],
    newUsers: [210, 180, 150, 240, 280, 310, 326],
  },
  revenueLakhs: [3.2, 3.4, 3.6, 3.9, 4.1, 4.4, 4.8],
  aiRequests: [28000, 30500, 32000, 35000, 38000, 40500, 42812],
  plans: [
    { label: 'Free', value: 10298 },
    { label: 'Plus', value: 1930 },
    { label: 'Family', value: 254 },
  ],
  engagement: [
    { label: 'Food logs', value: 18420 },
    { label: 'Workouts', value: 6210 },
    { label: 'Sleep logs', value: 4100 },
    { label: 'AI chats', value: 9800 },
    { label: 'Recipes', value: 3520 },
  ],
};

export const HL_USERS = [
  { id: 'u1', name: 'Rahul Sharma', email: 'rahul@email.com', plan: 'Plus', status: 'Active', joined: '2026-08-12' },
  { id: 'u2', name: 'Priya Patel', email: 'priya@email.com', plan: 'Family', status: 'Active', joined: '2026-07-03' },
  { id: 'u3', name: 'John Mehta', email: 'john@email.com', plan: 'Free', status: 'Active', joined: '2026-09-01' },
  { id: 'u4', name: 'Ananya Desai', email: 'ananya@email.com', plan: 'Plus', status: 'Trial', joined: '2026-09-08' },
  { id: 'u5', name: 'Vikram Shah', email: 'vikram@email.com', plan: 'Free', status: 'Blocked', joined: '2026-06-20' },
];

export const HL_SUBSCRIPTIONS = [
  { id: 's1', plan: 'Free', price: '₹0', billing: '—', active: 10298, status: 'Active' },
  { id: 's2', plan: 'Plus Monthly', price: '₹199', billing: 'Monthly', active: 1420, status: 'Active' },
  { id: 's3', plan: 'Plus Annual', price: '₹1,999', billing: 'Yearly', active: 510, status: 'Active' },
  { id: 's4', plan: 'Family Monthly', price: '₹299', billing: 'Monthly', active: 180, status: 'Active' },
  { id: 's5', plan: 'Family Annual', price: '₹2,999', billing: 'Yearly', active: 74, status: 'Active' },
];

export const HL_PAYMENTS = [
  { id: 'p1', user: 'Rahul Sharma', amount: '₹199', method: 'UPI', plan: 'Plus Monthly', status: 'Paid', date: '2026-09-10' },
  { id: 'p2', user: 'Priya Patel', amount: '₹2,999', method: 'Card', plan: 'Family Annual', status: 'Paid', date: '2026-09-09' },
  { id: 'p3', user: 'Ananya Desai', amount: '₹199', method: 'UPI', plan: 'Plus Monthly', status: 'Trial', date: '2026-09-08' },
  { id: 'p4', user: 'Karan Joshi', amount: '₹1,999', method: 'Card', plan: 'Plus Annual', status: 'Refunded', date: '2026-09-05' },
  { id: 'p5', user: 'Neha Gupta', amount: '₹299', method: 'UPI', plan: 'Family Monthly', status: 'Failed', date: '2026-09-04' },
];

export const HL_AI_FEATURES = [
  { id: 'ai1', feature: 'Meal Scanner', status: 'ON', requests: 12400, cost: '₹8,200' },
  { id: 'ai2', feature: 'AI Coach', status: 'ON', requests: 18600, cost: '₹12,400' },
  { id: 'ai3', feature: 'Voice Logging', status: 'ON', requests: 6200, cost: '₹4,100' },
  { id: 'ai4', feature: 'Workout AI', status: 'ON', requests: 4100, cost: '₹2,800' },
  { id: 'ai5', feature: 'Medical AI', status: 'OFF', requests: 0, cost: '₹0' },
];

export const HL_AI_SAFETY = [
  { id: 'safe1', rule: 'Medical diagnosis', action: 'BLOCK', enabled: true },
  { id: 'safe2', rule: 'Medication changes', action: 'BLOCK', enabled: true },
  { id: 'safe3', rule: 'Emergency symptoms', action: 'ESCALATE', enabled: true },
  { id: 'safe4', rule: 'Self-harm content', action: 'SAFETY RESPONSE', enabled: true },
  { id: 'safe5', rule: 'Extreme weight loss', action: 'SAFEGUARD', enabled: true },
];

export const HL_FOODS = [
  { id: 'f1', name: 'Paneer', calories: 265, protein: 18, carbs: 1.2, fat: 20, serving: '100g', cuisine: 'Indian', category: 'Dairy', status: 'Approved' },
  { id: 'f2', name: 'Roti', calories: 120, protein: 3.5, carbs: 22, fat: 2, serving: '1 piece', cuisine: 'Indian', category: 'Grains', status: 'Approved' },
  { id: 'f3', name: 'Dal Tadka', calories: 180, protein: 9, carbs: 24, fat: 5, serving: '1 bowl', cuisine: 'Indian', category: 'Protein', status: 'Approved' },
  { id: 'f4', name: 'Masala Dosa', calories: 350, protein: 8, carbs: 48, fat: 12, serving: '1 plate', cuisine: 'South Indian', category: 'Meal', status: 'Pending' },
  { id: 'f5', name: 'Greek Yogurt', calories: 97, protein: 9, carbs: 3.6, fat: 5, serving: '100g', cuisine: 'Global', category: 'Dairy', status: 'Approved' },
];

export const HL_RECIPES = [
  { id: 'r1', title: 'High-Protein Paneer Bowl', cuisine: 'Gujarati', meal: 'Lunch', tags: 'High Protein', status: 'Published' },
  { id: 'r2', title: 'Oats Idli', cuisine: 'South Indian', meal: 'Breakfast', tags: 'Healthy', status: 'Published' },
  { id: 'r3', title: 'Palak Dal', cuisine: 'North Indian', meal: 'Dinner', tags: 'Weight Management', status: 'Published' },
  { id: 'r4', title: 'Millet Khichdi', cuisine: 'Gujarati', meal: 'Dinner', tags: 'Healthy', status: 'Draft' },
  { id: 'r5', title: 'Chicken Stir Fry', cuisine: 'Global', meal: 'Lunch', tags: 'High Protein', status: 'Published' },
];

export const HL_WORKOUTS = [
  { id: 'w1', title: 'Beginner Home Strength', level: 'Beginner', place: 'Home', focus: 'Strength', status: 'Published' },
  { id: 'w2', title: 'Morning Walk Plan', level: 'Beginner', place: 'Outdoor', focus: 'Walking', status: 'Published' },
  { id: 'w3', title: 'Gym Hypertrophy 4-Day', level: 'Intermediate', place: 'Gym', focus: 'Strength', status: 'Published' },
  { id: 'w4', title: 'Desk Mobility Stretch', level: 'Beginner', place: 'Home', focus: 'Mobility', status: 'Draft' },
  { id: 'w5', title: 'No-Equipment HIIT', level: 'Advanced', place: 'Home', focus: 'Cardio', status: 'Published' },
];

export const HL_TRACKS = [
  { id: 't1', name: 'Weight Management', habits: 8, milestones: 5, status: 'Published' },
  { id: 't2', name: 'Better Sleep', habits: 6, milestones: 4, status: 'Published' },
  { id: 't3', name: 'Active Lifestyle', habits: 7, milestones: 5, status: 'Published' },
  { id: 't4', name: 'Strength', habits: 9, milestones: 6, status: 'Draft' },
  { id: 't5', name: 'Healthy Eating', habits: 8, milestones: 5, status: 'Published' },
  { id: 't6', name: 'Stress Management', habits: 5, milestones: 3, status: 'Published' },
];

export const HL_CONTENT = [
  { id: 'c1', title: 'How to read food labels', type: 'Article', lang: 'English', status: 'Published' },
  { id: 'c2', title: 'Better sleep in 7 days', type: 'Guide', lang: 'Hindi', status: 'Published' },
  { id: 'c3', title: 'Protein basics', type: 'Nutrition Guide', lang: 'Gujarati', status: 'Draft' },
  { id: 'c4', title: 'Home workout FAQ', type: 'FAQ', lang: 'English', status: 'Published' },
  { id: 'c5', title: 'Mindful breathing', type: 'Video', lang: 'Hindi', status: 'Published' },
];

export const HL_LANGUAGES = [
  { id: 'l1', name: 'English', code: 'en', status: 'ON', coverage: '100%' },
  { id: 'l2', name: 'Hindi', code: 'hi', status: 'ON', coverage: '92%' },
  { id: 'l3', name: 'Gujarati', code: 'gu', status: 'ON', coverage: '88%' },
  { id: 'l4', name: 'Marathi', code: 'mr', status: 'OFF', coverage: '0%' },
  { id: 'l5', name: 'Tamil', code: 'ta', status: 'OFF', coverage: '0%' },
  { id: 'l6', name: 'Bengali', code: 'bn', status: 'OFF', coverage: '0%' },
];

export const HL_NOTIFICATIONS = [
  { id: 'n1', title: "You've completed 7 days!", channel: 'Push', audience: 'Active Free', status: 'Scheduled', date: '2026-09-12' },
  { id: 'n2', title: 'Your weekly report is ready', channel: 'In-app', audience: 'Plus', status: 'Sent', date: '2026-09-07' },
  { id: 'n3', title: 'New healthy recipes available', channel: 'Email', audience: 'All', status: 'Draft', date: '—' },
  { id: 'n4', title: 'Family plan tip', channel: 'Push', audience: 'Family', status: 'Sent', date: '2026-09-02' },
];

export const HL_REPORTS = [
  { id: 'rep1', user: 'Rahul Sharma', type: 'Blood Report', date: '2026-09-01', status: 'Parsed', review: 'Pending' },
  { id: 'rep2', user: 'Priya Patel', type: 'Lab Report', date: '2026-08-28', status: 'Parsed', review: 'Approved' },
  { id: 'rep3', user: 'John Mehta', type: 'Prescription', date: '2026-08-20', status: 'Uploaded', review: '—' },
  { id: 'rep4', user: 'Ananya Desai', type: 'Doctor Visit', date: '2026-08-15', status: 'Parsed', review: 'Needs edit' },
];

export const HL_SUPPORT = [
  { id: 'sup1', user: 'Rahul Sharma', issue: 'Payment failed but amount deducted', priority: 'High', assigned: 'Support A', status: 'Open' },
  { id: 'sup2', user: 'Priya Patel', issue: 'Cannot sync diary', priority: 'Medium', assigned: 'Support B', status: 'Pending' },
  { id: 'sup3', user: 'John Mehta', issue: 'Recipe language wrong', priority: 'Low', assigned: 'Support A', status: 'Resolved' },
  { id: 'sup4', user: 'Neha Gupta', issue: 'AI coach not responding', priority: 'High', assigned: 'Support C', status: 'Open' },
];

export const HL_SECURITY = [
  { id: 'sec1', role: 'Super Admin', users: 2, access: 'Full', lastChange: '2026-08-01' },
  { id: 'sec2', role: 'Support', users: 6, access: 'Users + tickets (no health data)', lastChange: '2026-08-15' },
  { id: 'sec3', role: 'Content Editor', users: 4, access: 'Recipes + content', lastChange: '2026-08-20' },
  { id: 'sec4', role: 'Analyst', users: 3, access: 'Dashboard metrics only', lastChange: '2026-09-01' },
];

export const HL_SETTINGS = [
  { id: 'set1', key: 'App name', value: 'HealthLine', group: 'General' },
  { id: 'set2', key: 'Default brand color', value: 'Blue (#0070E0)', group: 'Theme' },
  { id: 'set3', key: 'Free AI daily limit', value: '5', group: 'AI' },
  { id: 'set4', key: 'Medical AI', value: 'OFF', group: 'AI' },
  { id: 'set5', key: 'Maintenance mode', value: 'OFF', group: 'System' },
];

export const HL_AUDIT_LOGS = [
  { id: 'a1', actor: 'admin@healthline.local', action: 'Signed in', target: 'Admin panel', time: '2026-09-11 09:40' },
  { id: 'a2', actor: 'admin@healthline.local', action: 'Viewed user list', target: 'Users', time: '2026-09-11 09:42' },
  { id: 'a3', actor: 'support.a@healthline.local', action: 'Opened ticket', target: 'SUP-1001', time: '2026-09-11 09:50' },
  { id: 'a4', actor: 'content@healthline.local', action: 'Published recipe', target: 'High-Protein Paneer Bowl', time: '2026-09-10 18:12' },
  { id: 'a5', actor: 'admin@healthline.local', action: 'Toggled Medical AI OFF', target: 'AI features', time: '2026-09-10 16:00' },
];
