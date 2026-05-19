import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Home, ScanLine, Leaf, Users, User, Droplets, Sun, Wind,
  Search, ChevronRight, Bell, Sparkles, Heart, MessageCircle,
  Bookmark, Share2, Camera, Upload, Check, AlertTriangle,
  Sprout, Clock, CloudRain, Thermometer, ArrowLeft, Send,
  Plus, MoreHorizontal, TrendingUp, Shield,
  Zap, Target, Award, BookOpen, HelpCircle,
  Repeat2, MapPin
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────
type Screen = 'home' | 'scanner' | 'mentor' | 'encyclopedia' | 'guides' | 'garden' | 'community' | 'profile' | 'plantDetail' | 'guideDetail' | 'postDetail' | 'scanResult';
type Tab = 'home' | 'garden' | 'scanner' | 'community' | 'profile';

interface Plant {
  id: string;
  name: string;
  scientificName: string;
  image: string;
  category: 'vegetable' | 'herb' | 'houseplant' | 'flower';
  waterFrequency: number;
  sunLevel: 'low' | 'medium' | 'high';
  difficulty: 'easy' | 'medium' | 'hard';
  benefits: string[];
  phRange: string;
  humidity: string;
  description: string;
  growthTimeline: { week: number; description: string }[];
}

interface GardenPlant {
  id: string;
  plantId: string;
  plantedDate: string;
  lastWatered: string;
  health: 'excellent' | 'good' | 'fair' | 'poor';
  notes: string;
}

interface Reminder {
  id: string;
  plantName: string;
  task: string;
  dueDate: string;
  completed: boolean;
  icon: string;
}

interface Post {
  id: string;
  userName: string;
  userAvatar: string;
  image: string;
  caption: string;
  likes: number;
  comments: Comment[];
  liked: boolean;
  bookmarked: boolean;
  timestamp: string;
  tags: string[];
}

interface Comment {
  id: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Guide {
  id: string;
  title: string;
  plantName: string;
  image: string;
  steps: GuideStep[];
  difficulty: string;
  duration: string;
}

interface GuideStep {
  title: string;
  description: string;
  tip: string;
  flipQuestion: string;
  flipAnswer: string;
}

// ─── Mock Data ───────────────────────────────────────────
const PLANTS: Plant[] = [
  {
    id: '1', name: 'Tomato', scientificName: 'Solanum lycopersicum', image: '/images/plant-tomato.jpg',
    category: 'vegetable', waterFrequency: 3, sunLevel: 'high', difficulty: 'medium',
    benefits: ['Rich in Vitamin C', 'Antioxidant lycopene', 'Supports heart health', 'Versatile in cooking'],
    phRange: '6.0 - 6.8', humidity: '60-70%', description: 'Tomatoes are one of the most popular garden vegetables. They need plenty of sun and consistent watering for the best fruit production.',
    growthTimeline: [
      { week: 1, description: 'Seeds germinate. Tiny cotyledons emerge from soil.' },
      { week: 2, description: 'First true leaves appear. Seedlings need bright light.' },
      { week: 4, description: 'Plant develops 4-6 true leaves. Ready for transplanting.' },
      { week: 8, description: 'Vigorous vegetative growth. Stake or cage for support.' },
      { week: 12, description: 'First flowers appear! Pollination begins.' },
      { week: 14, description: 'Small green fruits form. Increase watering.' },
    ]
  },
  {
    id: '2', name: 'Basil', scientificName: 'Ocimum basilicum', image: '/images/plant-basil.jpg',
    category: 'herb', waterFrequency: 2, sunLevel: 'high', difficulty: 'easy',
    benefits: ['Anti-inflammatory', 'Rich in antioxidants', 'Aids digestion', 'Natural insect repellent'],
    phRange: '6.0 - 7.0', humidity: '50-60%', description: 'Basil is an aromatic herb beloved in Italian and Thai cuisines. It grows quickly and thrives in warm, sunny conditions.',
    growthTimeline: [
      { week: 1, description: 'Seeds sprout. Keep soil consistently moist.' },
      { week: 2, description: 'First pair of true leaves develop.' },
      { week: 3, description: 'Rapid growth begins. Provide plenty of light.' },
      { week: 4, description: 'Plant reaches 4-6 inches. Begin harvesting top leaves.' },
      { week: 6, description: 'Bushy growth. Pinch flower buds to prolong harvest.' },
      { week: 8, description: 'Full mature plant. Harvest regularly for best flavor.' },
    ]
  },
  {
    id: '3', name: 'Monstera', scientificName: 'Monstera deliciosa', image: '/images/plant-monstera.jpg',
    category: 'houseplant', waterFrequency: 7, sunLevel: 'medium', difficulty: 'easy',
    benefits: ['Air purifying', 'Tropical aesthetics', 'Low maintenance', 'Humidity booster'],
    phRange: '5.5 - 7.0', humidity: '60-80%', description: 'The iconic Swiss Cheese Plant is a tropical favorite known for its dramatic split leaves and easy care requirements.',
    growthTimeline: [
      { week: 1, description: 'New leaf unfurls from cataphyll.' },
      { week: 2, description: 'Leaf expands. No fenestrations yet on young plants.' },
      { week: 4, description: 'New growth point visible. Aerial roots may appear.' },
      { week: 8, description: 'Mature leaf with characteristic splits develops.' },
      { week: 12, description: 'Vining growth begins. Provide moss pole for climbing.' },
      { week: 24, description: 'Large fenestrated leaves. Stunning tropical specimen.' },
    ]
  },
  {
    id: '4', name: 'Lavender', scientificName: 'Lavandula angustifolia', image: '/images/plant-lavender.jpg',
    category: 'herb', waterFrequency: 7, sunLevel: 'high', difficulty: 'medium',
    benefits: ['Calming aroma', 'Natural sleep aid', 'Antiseptic properties', 'Attracts pollinators'],
    phRange: '6.5 - 7.5', humidity: '40-50%', description: 'Lavender is a fragrant Mediterranean herb prized for its calming scent, beautiful purple flowers, and versatility in cooking and crafts.',
    growthTimeline: [
      { week: 1, description: 'Seeds germinate slowly. Patience required.' },
      { week: 3, description: 'Tiny seedlings with first leaves.' },
      { week: 6, description: 'Established young plant. Silvery-green foliage.' },
      { week: 12, description: 'Bushy growth. May need pruning for shape.' },
      { week: 20, description: 'Flower spikes begin to form.' },
      { week: 24, description: 'Full bloom! Harvest flowers for drying.' },
    ]
  },
  {
    id: '5', name: 'Aloe Vera', scientificName: 'Aloe barbadensis', image: '/images/plant-aloe.jpg',
    category: 'houseplant', waterFrequency: 14, sunLevel: 'medium', difficulty: 'easy',
    benefits: ['Healing gel for skin', 'Air purification', 'Drought tolerant', 'Natural moisturizer'],
    phRange: '7.0 - 8.5', humidity: '30-50%', description: 'Aloe Vera is a succulent known for its medicinal gel. It thrives on neglect and makes a perfect beginner houseplant.',
    growthTimeline: [
      { week: 1, description: 'Pup or cutting roots established.' },
      { week: 4, description: 'New growth visible at center.' },
      { week: 8, description: 'New plump leaf unfurls.' },
      { week: 16, description: 'Multiple leaves form rosette shape.' },
      { week: 32, description: 'Mature plant with thick, gel-filled leaves.' },
      { week: 52, description: 'May produce flower stalk in ideal conditions.' },
    ]
  },
  {
    id: '6', name: 'Snake Plant', scientificName: 'Dracaena trifasciata', image: '/images/plant-snake.jpg',
    category: 'houseplant', waterFrequency: 14, sunLevel: 'low', difficulty: 'easy',
    benefits: ['NASA air purifier', 'Extremely hardy', 'Releases oxygen at night', 'Stylish architectural look'],
    phRange: '5.5 - 7.5', humidity: '30-50%', description: 'The Snake Plant is nearly indestructible. Its striking upright leaves make it a modern decor staple and it tolerates almost any light condition.',
    growthTimeline: [
      { week: 1, description: 'Rhizome or leaf cutting planted.' },
      { week: 4, description: 'Root development below soil.' },
      { week: 8, description: 'New leaf spike emerges.' },
      { week: 16, description: 'Leaf reaches full height with variegation.' },
      { week: 32, description: 'New pups appear at base.' },
      { week: 52, description: 'Full clump of architectural leaves.' },
    ]
  },
  {
    id: '7', name: 'Rose', scientificName: 'Rosa rubiginosa', image: '/images/plant-rose.jpg',
    category: 'flower', waterFrequency: 4, sunLevel: 'high', difficulty: 'hard',
    benefits: ['Stunning fragrance', 'Cut flowers', 'Attracts pollinators', 'Edible petals'],
    phRange: '6.0 - 7.0', humidity: '50-70%', description: 'Roses are the quintessential garden flower. With proper care, they reward gardeners with months of breathtaking blooms and intoxicating fragrance.',
    growthTimeline: [
      { week: 1, description: 'Bare root planted or cutting rooted.' },
      { week: 2, description: 'First shoots break dormancy.' },
      { week: 4, description: 'Leaf canopy develops rapidly.' },
      { week: 6, description: 'Flower buds form at stem tips.' },
      { week: 8, description: 'First blooms open! Deadhead for more flowers.' },
      { week: 12, description: 'Flush of repeat blooms. Feed for continued flowering.' },
    ]
  },
  {
    id: '8', name: 'Mint', scientificName: 'Mentha spicata', image: '/images/plant-mint.jpg',
    category: 'herb', waterFrequency: 2, sunLevel: 'medium', difficulty: 'easy',
    benefits: ['Aids digestion', 'Freshens breath', 'Natural pest deterrent', 'Culinary versatile'],
    phRange: '6.0 - 7.5', humidity: '60-70%', description: 'Mint is an aggressively spreading herb with refreshing flavor. Best grown in containers to prevent it from taking over your garden.',
    growthTimeline: [
      { week: 1, description: 'Roots establish quickly from runners.' },
      { week: 2, description: 'Rapid vertical growth begins.' },
      { week: 3, description: 'First harvestable leaves available.' },
      { week: 4, description: 'Bushy growth. Consider pruning.' },
      { week: 6, description: 'May flower. Pinch for leaf production.' },
      { week: 8, description: 'Lush container-full. Harvest abundantly.' },
    ]
  },
  {
    id: '9', name: 'Fiddle Leaf Fig', scientificName: 'Ficus lyrata', image: '/images/plant-fiddle.jpg',
    category: 'houseplant', waterFrequency: 7, sunLevel: 'high', difficulty: 'hard',
    benefits: ['Statement decor piece', 'Air filtering', 'Large dramatic leaves', 'Increases room humidity'],
    phRange: '6.0 - 7.0', humidity: '50-70%', description: 'The Fiddle Leaf Fig is the interior design worlds favorite plant. Its large, violin-shaped leaves create a stunning focal point in any room.',
    growthTimeline: [
      { week: 1, description: 'New growth point begins swelling.' },
      { week: 2, description: 'Tiny new leaf emerges from sheath.' },
      { week: 3, description: 'Leaf unfurls, initially soft and light green.' },
      { week: 4, description: 'Leaf hardens and darkens to mature color.' },
      { week: 12, description: 'New tier of branching begins.' },
      { week: 24, description: 'Tree-like structure with multiple leaf tiers.' },
    ]
  },
];

const GUIDES: Guide[] = [
  {
    id: '1', title: 'Growing Tomatoes from Seed', plantName: 'Tomato', image: '/images/plant-tomato.jpg',
    difficulty: 'Medium', duration: '14 weeks',
    steps: [
      { title: 'Choose Your Seeds', description: 'Select determinate varieties for containers and indeterminate for in-ground gardens. Cherry tomatoes are easiest for beginners.', tip: 'Look for disease-resistant codes like VFN on seed packets.', flipQuestion: 'What is the ideal soil temperature for tomato seed germination?', flipAnswer: '70-80°F (21-27°C). Seeds will not germinate below 50°F.' },
      { title: 'Start Indoors', description: 'Plant seeds 1/4 inch deep in seed starting mix, 6-8 weeks before your last frost date. Keep soil consistently moist.', tip: 'Use a heat mat to speed up germination time.', flipQuestion: 'How deep should you plant tomato seeds?', flipAnswer: 'About 1/4 inch (6mm) deep. Too deep and they may not emerge.' },
      { title: 'Provide Light', description: 'Place seedlings under grow lights or in a sunny south-facing window. They need 14-16 hours of bright light daily.', tip: 'Rotate trays daily to prevent leggy, one-sided growth.', flipQuestion: 'How many hours of light do tomato seedlings need?', flipAnswer: '14-16 hours of bright light per day for strong growth.' },
      { title: 'Transplant Carefully', description: 'When seedlings have 2 sets of true leaves, transplant to larger pots. Bury the stem deeper each time for stronger roots.', tip: 'Harden off plants by gradually exposing them to outdoor conditions.', flipQuestion: 'Why bury tomato stems deeper when transplanting?', flipAnswer: 'Tomatoes can grow roots along their stems, creating a stronger root system.' },
    ]
  },
  {
    id: '2', title: 'Basil in Containers', plantName: 'Basil', image: '/images/plant-basil.jpg',
    difficulty: 'Easy', duration: '4 weeks',
    steps: [
      { title: 'Pick the Right Pot', description: 'Choose a container at least 8 inches wide with drainage holes. Terra cotta breathes well but dries faster.', tip: 'Group multiple basil varieties in one large pot for a beautiful display.', flipQuestion: 'What is the minimum pot size for basil?', flipAnswer: '8 inches (20cm) in diameter with good drainage holes.' },
      { title: 'Use Quality Soil', description: 'Fill with a premium potting mix, not garden soil. Basil prefers rich, well-draining soil with a pH of 6.0-7.0.', tip: 'Mix in some compost for added nutrients.', flipQuestion: 'What pH does basil prefer?', flipAnswer: '6.0 to 7.0 - slightly acidic to neutral.' },
      { title: 'Plant and Water', description: 'Plant seeds or seedlings, water thoroughly after planting. Keep soil moist but never waterlogged.', tip: 'Water at the base to keep leaves dry and prevent fungal issues.', flipQuestion: 'How often should you water container basil?', flipAnswer: 'When the top inch of soil feels dry - usually every 2-3 days.' },
      { title: 'Harvest Regularly', description: 'Pinch off the top sets of leaves just above a leaf pair. This encourages bushy growth and prevents flowering.', tip: 'Harvest in the morning when essential oils are most concentrated.', flipQuestion: 'Why should you pinch basil flowers?', flipAnswer: 'Flowering changes the leaf flavor and slows leaf production.' },
    ]
  },
];

const INITIAL_POSTS: Post[] = [
  { id: '1', userName: 'Sarah Green', userAvatar: '/images/avatar1.jpg', image: '/images/community-garden1.jpg', caption: 'My raised bed garden is finally thriving! After months of planning and building, the harvest is incredible. What should I plant next?', likes: 142, comments: [{ id: 'c1', userName: 'Tom Rivers', userAvatar: '/images/avatar2.jpg', text: 'Beautiful layout! Try adding some companion plants like marigolds!', timestamp: '2h ago' }], liked: false, bookmarked: false, timestamp: '3h ago', tags: ['#RaisedBeds', '#VegetableGarden', '#Harvest'] },
  { id: '2', userName: 'Tom Rivers', userAvatar: '/images/avatar2.jpg', image: '/images/community-planting.jpg', caption: 'There is something magical about planting seeds with your own hands. Today I started my spring tomatoes and peppers. Fingers crossed!', likes: 89, comments: [], liked: false, bookmarked: false, timestamp: '5h ago', tags: ['#SeedStarting', '#SpringGarden', '#Tomatoes'] },
  { id: '3', userName: 'Maya Chen', userAvatar: '/images/avatar3.jpg', image: '/images/community-indoor.jpg', caption: 'My indoor jungle corner brings me so much peace. Pothos, ferns, and succulents living their best life by the window.', likes: 231, comments: [{ id: 'c2', userName: 'Sarah Green', userAvatar: '/images/avatar1.jpg', text: 'This is goals! What direction does this window face?', timestamp: '1h ago' }], liked: false, bookmarked: false, timestamp: '8h ago', tags: ['#IndoorPlants', '#PlantCorner', '#UrbanJungle'] },
  { id: '4', userName: 'Sarah Green', userAvatar: '/images/avatar1.jpg', image: '/images/community-dew.jpg', caption: 'Morning dew on my spinach leaves. Nature is the most beautiful artist. Shot this at 6am before the sun burned it off.', likes: 315, comments: [], liked: false, bookmarked: false, timestamp: '12h ago', tags: ['#MacroPhotography', '#MorningDew', '#Spinach'] },
  { id: '5', userName: 'Tom Rivers', userAvatar: '/images/avatar2.jpg', image: '/images/community-harvest.jpg', caption: 'Today harvest: tomatoes, cucumbers, basil, and rosemary. Farm to table in 10 steps! Nothing beats homegrown flavor.', likes: 178, comments: [{ id: 'c3', userName: 'Maya Chen', userAvatar: '/images/avatar3.jpg', text: 'Those tomatoes look perfect! What variety are they?', timestamp: '4h ago' }], liked: false, bookmarked: false, timestamp: '1d ago', tags: ['#Harvest', '#Homegrown', '#FarmToTable'] },
  { id: '6', userName: 'Maya Chen', userAvatar: '/images/avatar3.jpg', image: '/images/community-flowers.jpg', caption: 'My pollinator garden is buzzing with life! Sunflowers, coneflowers, and cosmos attracting bees and butterflies all day long.', likes: 267, comments: [], liked: false, bookmarked: false, timestamp: '1d ago', tags: ['#Pollinators', '#FlowerGarden', '#Sunflowers'] },
];

const INITIAL_REMINDERS: Reminder[] = [
  { id: '1', plantName: 'Tomato', task: 'Water deeply', dueDate: 'Today, 8:00 AM', completed: false, icon: 'water' },
  { id: '2', plantName: 'Basil', task: 'Harvest top leaves', dueDate: 'Today, 10:00 AM', completed: false, icon: 'sprout' },
  { id: '3', plantName: 'Monstera', task: 'Mist leaves', dueDate: 'Tomorrow, 9:00 AM', completed: false, icon: 'water' },
  { id: '4', plantName: 'Lavender', task: 'Fertilize', dueDate: 'Tomorrow, 2:00 PM', completed: false, icon: 'zap' },
  { id: '5', plantName: 'Aloe Vera', task: 'Check soil moisture', dueDate: 'Wed, 8:00 AM', completed: true, icon: 'target' },
];

const MENTOR_RESPONSES: Record<string, string> = {
  default: "That's a great question about gardening! Based on best practices, I'd recommend starting with well-draining soil, ensuring proper sunlight exposure, and maintaining consistent watering. Would you like more specific advice?",
  water: "For most plants, water when the top 1-2 inches of soil feel dry. Morning watering is best as it allows leaves to dry before evening. Avoid overhead watering for disease-prone plants like tomatoes.",
  soil: "Healthy soil should be dark, crumbly, and rich in organic matter. Test your pH - most vegetables prefer 6.0-7.0. Add compost annually to improve soil structure and fertility.",
  pest: "For common garden pests, start with organic methods: neem oil for soft-bodied insects, diatomaceous earth for crawling pests, and hand-picking for larger invaders. Companion planting with marigolds and basil helps deter many pests naturally.",
  indoor: "Indoor plants need bright indirect light, consistent watering (but not overwatering), and good humidity. Group plants together to create a microclimate, and rotate pots weekly for even growth.",
};

// ─── App ─────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [prevScreen, setPrevScreen] = useState<Screen>('home');
  const [selectedPlantId, setSelectedPlantId] = useState<string>('');
  const [selectedGuideId, setSelectedGuideId] = useState<string>('');
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [scanMode, setScanMode] = useState<'identify' | 'diagnose' | 'soil'>('identify');
  const [scanStage, setScanStage] = useState<'camera' | 'analyzing' | 'result'>('camera');

  const navigate = useCallback((s: Screen) => {
    setPrevScreen(screen);
    setScreen(s);
  }, [screen]);

  const goBack = useCallback(() => {
    setScreen(prevScreen);
  }, [prevScreen]);

  const tabRoots: Record<Tab, Screen> = { home: 'home', garden: 'garden', scanner: 'scanner', community: 'community', profile: 'profile' };

  const showNav = ['home', 'garden', 'scanner', 'community', 'profile'].includes(screen);

  return (
    <div className="h-screen w-full bg-[#F5F9F4] overflow-hidden flex justify-center items-center p-0 md:p-4">
      <div className="w-full max-w-[430px] h-[100dvh] md:h-[850px] bg-[#F5F9F4] rounded-none overflow-hidden shadow-2xl relative isolate flex flex-col">
        {/* Floating Ambient Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="blob-1 absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#C8E6C9]/40 blur-3xl" />
          <div className="blob-2 absolute top-1/3 -left-16 w-56 h-56 rounded-full bg-[#8BC34A]/30 blur-3xl" />
          <div className="blob-3 absolute -bottom-16 right-1/4 w-72 h-72 rounded-full bg-[#C8E6C9]/35 blur-3xl" />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative z-10 page-enter">
          {screen === 'home' && <HomeScreen navigate={navigate} setSelectedPlantId={setSelectedPlantId} setSelectedPostId={setSelectedPostId} />}
          {screen === 'encyclopedia' && <EncyclopediaScreen navigate={navigate} setSelectedPlantId={setSelectedPlantId} />}
          {screen === 'plantDetail' && <PlantDetailScreen plantId={selectedPlantId} goBack={goBack} navigate={navigate} />}
          {screen === 'scanner' && <ScannerScreen scanMode={scanMode} setScanMode={setScanMode} scanStage={scanStage} setScanStage={setScanStage} navigate={navigate} setSelectedPlantId={setSelectedPlantId} />}
          {screen === 'scanResult' && <ScanResultScreen scanMode={scanMode} plantId={selectedPlantId} goBack={goBack} navigate={navigate} />}
          {screen === 'mentor' && <MentorScreen goBack={goBack} />}
          {screen === 'guides' && <GuidesScreen navigate={navigate} setSelectedGuideId={setSelectedGuideId} />}
          {screen === 'guideDetail' && <GuideDetailScreen guideId={selectedGuideId} goBack={goBack} />}
          {screen === 'garden' && <GardenScreen navigate={navigate} setSelectedPlantId={setSelectedPlantId} />}
          {screen === 'community' && <CommunityScreen navigate={navigate} setSelectedPostId={setSelectedPostId} />}
          {screen === 'postDetail' && <PostDetailScreen postId={selectedPostId} goBack={goBack} />}
          {screen === 'profile' && <ProfileScreen navigate={navigate} setSelectedPlantId={setSelectedPlantId} />}
        </main>

        {/* Bottom Navigation */}
        {showNav && (
          <nav className="shrink-0 h-16 bg-white/70 backdrop-blur-xl border-t border-white/50 z-50 flex items-center justify-around px-2">
            <NavButton icon={<Home size={22} />} label="Home" active={screen === 'home'} onClick={() => navigate(tabRoots.home)} />
            <NavButton icon={<Leaf size={22} />} label="Garden" active={screen === 'garden'} onClick={() => navigate(tabRoots.garden)} />
            <div className="relative -top-5">
              <button
                onClick={() => { setScanMode('identify'); setScanStage('camera'); navigate('scanner'); }}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1B5E20] to-[#4CAF50] flex items-center justify-center shadow-lg shadow-green-900/30 transition-transform active:scale-90"
              >
                <ScanLine size={24} className="text-white" />
              </button>
            </div>
            <NavButton icon={<Users size={22} />} label="Community" active={screen === 'community'} onClick={() => navigate(tabRoots.community)} />
            <NavButton icon={<User size={22} />} label="Profile" active={screen === 'profile'} onClick={() => navigate(tabRoots.profile)} />
          </nav>
        )}
      </div>
    </div>
  );
}

// ─── Nav Button ──────────────────────────────────────────
function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-all ${active ? 'text-[#1B5E20]' : 'text-gray-400'}`}>
      <div className={`transition-transform ${active ? 'scale-110' : ''}`}>{icon}</div>
      <span className="text-[10px] font-medium">{label}</span>
      {active && <div className="w-1 h-1 rounded-full bg-[#1B5E20] mt-0.5" />}
    </button>
  );
}

// ═════════════════════════════════════════════════════════
//  HOME SCREEN
// ═════════════════════════════════════════════════════════
function HomeScreen({ navigate, setSelectedPlantId, setSelectedPostId }: { navigate: (s: Screen) => void; setSelectedPlantId: (id: string) => void; setSelectedPostId: (id: string) => void }) {
  const [greeting, setGreeting] = useState('');
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');
  }, []);

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-[#666]">{greeting},</p>
            <h1 className="text-2xl font-bold text-[#1B5E20]">Green Thumb</h1>
          </div>
          <button className="relative w-10 h-10 rounded-full glass flex items-center justify-center">
            <Bell size={20} className="text-[#1B5E20]" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold badge-pulse">3</span>
          </button>
        </div>

        {/* Weather Widget */}
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center">
              <Sun size={24} className="text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#1B5E20]">72°F</p>
              <p className="text-xs text-[#666]">Sunny · Perfect for gardening</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-[#666]">
              <Droplets size={12} className="text-blue-500" />
              <span>Humidity 45%</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#666] mt-0.5">
              <Wind size={12} className="text-gray-500" />
              <span>Wind 8 mph</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 mb-5">
        <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1">
          <QuickActionBtn icon={<ScanLine size={20} />} label="Scan Plant" color="bg-gradient-to-br from-[#4CAF50] to-[#2E7D32]" onClick={() => navigate('scanner')} />
          <QuickActionBtn icon={<Droplets size={20} />} label="Watering" color="bg-gradient-to-br from-blue-400 to-blue-600" onClick={() => navigate('garden')} />
          <QuickActionBtn icon={<MessageCircle size={20} />} label="Ask AI" color="bg-gradient-to-br from-purple-400 to-purple-600" onClick={() => navigate('mentor')} />
          <QuickActionBtn icon={<BookOpen size={20} />} label="Guides" color="bg-gradient-to-br from-amber-400 to-orange-500" onClick={() => navigate('guides')} />
        </div>
      </div>

      {/* Upcoming Reminders */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[#1B5E20]">Today's Care</h2>
          <button onClick={() => navigate('garden')} className="text-sm text-[#4CAF50] font-medium flex items-center gap-0.5">
            View All <ChevronRight size={16} />
          </button>
        </div>
        <div className="space-y-2.5">
          {INITIAL_REMINDERS.slice(0, 3).map((r, i) => (
            <div key={r.id} className="glass-card rounded-xl p-3.5 flex items-center gap-3 stagger-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${r.completed ? 'bg-gray-100' : 'bg-blue-50'}`}>
                {r.icon === 'water' ? <Droplets size={18} className={r.completed ? 'text-gray-400' : 'text-blue-500'} /> :
                 r.icon === 'sprout' ? <Sprout size={18} className={r.completed ? 'text-gray-400' : 'text-green-500'} /> :
                 <Zap size={18} className={r.completed ? 'text-gray-400' : 'text-amber-500'} />}
              </div>
              <div className="flex-1">
                <p className={`font-medium text-sm ${r.completed ? 'text-gray-400 line-through' : 'text-[#1B5E20]'}`}>{r.task}</p>
                <p className="text-xs text-[#666]">{r.plantName} · {r.dueDate}</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${r.completed ? 'bg-[#4CAF50] border-[#4CAF50]' : 'border-gray-300'}`}>
                {r.completed && <Check size={14} className="text-white" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seasonal Tips */}
      <div className="px-5 mb-5">
        <h2 className="text-lg font-bold text-[#1B5E20] mb-3">Seasonal Tips</h2>
        <div className="glass-card rounded-2xl overflow-hidden">
          <img src="/images/community-dew.jpg" alt="Seasonal tip" className="w-full h-36 object-cover" />
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-[#C8E6C9] rounded-full text-[10px] font-semibold text-[#1B5E20] uppercase">Spring</span>
              <span className="text-xs text-[#666]">May 2025</span>
            </div>
            <h3 className="font-bold text-[#1B5E20] mb-1">Perfect Time to Start Warm-Season Crops</h3>
            <p className="text-xs text-[#666] leading-relaxed">Soil temperatures are rising. Now is the ideal time to plant tomatoes, peppers, and squash directly in your garden beds.</p>
          </div>
        </div>
      </div>

      {/* Featured Plants */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[#1B5E20]">Popular Plants</h2>
          <button onClick={() => navigate('encyclopedia')} className="text-sm text-[#4CAF50] font-medium flex items-center gap-0.5">
            See All <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1">
          {PLANTS.slice(0, 5).map((plant) => (
            <button
              key={plant.id}
              onClick={() => { setSelectedPlantId(plant.id); navigate('plantDetail'); }}
              className="snap-start flex-shrink-0 w-32 glass-card rounded-xl overflow-hidden text-left transition-transform active:scale-95"
            >
              <img src={plant.image} alt={plant.name} className="w-full h-28 object-cover" />
              <div className="p-2.5">
                <p className="font-semibold text-sm text-[#1B5E20]">{plant.name}</p>
                <p className="text-[10px] text-[#666] capitalize">{plant.category}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Community Preview */}
      <div className="px-5 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[#1B5E20]">Community</h2>
          <button onClick={() => navigate('community')} className="text-sm text-[#4CAF50] font-medium flex items-center gap-0.5">
            Explore <ChevronRight size={16} />
          </button>
        </div>
        <div className="masonry-grid">
          {INITIAL_POSTS.slice(0, 4).map((post, i) => (
            <button
              key={post.id}
              onClick={() => { setSelectedPostId(post.id); navigate('postDetail'); }}
              className={`glass-card rounded-xl overflow-hidden text-left transition-transform active:scale-95 stagger-in ${i === 0 ? 'col-span-1' : ''}`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <img src={post.image} alt="" className="w-full h-32 object-cover" />
              <div className="p-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <img src={post.userAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                  <span className="text-[10px] font-medium text-[#1B5E20]">{post.userName}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#666]">
                  <span className="flex items-center gap-0.5"><Heart size={10} /> {post.likes}</span>
                  <span className="flex items-center gap-0.5"><MessageCircle size={10} /> {post.comments.length}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickActionBtn({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`snap-start flex-shrink-0 ${color} rounded-2xl px-4 py-3.5 flex items-center gap-2.5 text-white shadow-lg active:scale-95 transition-transform`}>
      {icon}
      <span className="text-sm font-semibold whitespace-nowrap">{label}</span>
    </button>
  );
}

// ═════════════════════════════════════════════════════════
//  ENCYCLOPEDIA SCREEN
// ═════════════════════════════════════════════════════════
function EncyclopediaScreen({ navigate, setSelectedPlantId }: { navigate: (s: Screen) => void; setSelectedPlantId: (id: string) => void }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const categories = ['all', 'vegetable', 'herb', 'houseplant', 'flower'];

  const filtered = PLANTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.scientificName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || p.category === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-5 pt-6 pb-3">
        <h1 className="text-2xl font-bold text-[#1B5E20] mb-3">Plant Encyclopedia</h1>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search plants..."
            className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/50 text-sm text-[#1B5E20] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                filter === cat ? 'bg-[#1B5E20] text-white shadow-md' : 'bg-white/60 text-[#666]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Plant Grid */}
      <div className="px-5 grid grid-cols-2 gap-3">
        {filtered.map((plant, i) => (
          <button
            key={plant.id}
            onClick={() => { setSelectedPlantId(plant.id); navigate('plantDetail'); }}
            className="glass-card rounded-2xl overflow-hidden text-left transition-all active:scale-95 stagger-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <img src={plant.image} alt={plant.name} className="w-full h-36 object-cover" />
            <div className="p-3">
              <p className="font-bold text-sm text-[#1B5E20]">{plant.name}</p>
              <p className="text-[10px] text-[#666] italic mb-1.5">{plant.scientificName}</p>
              <div className="flex flex-wrap gap-1">
                <span className="px-1.5 py-0.5 bg-[#C8E6C9] rounded text-[9px] font-medium text-[#1B5E20] capitalize">{plant.category}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${plant.difficulty === 'easy' ? 'bg-green-100 text-green-700' : plant.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                  {plant.difficulty}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search size={40} className="text-gray-300 mb-3" />
          <p className="text-[#666] font-medium">No plants found</p>
          <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════
//  PLANT DETAIL SCREEN
// ═════════════════════════════════════════════════════════
function PlantDetailScreen({ plantId, goBack, navigate }: { plantId: string; goBack: () => void; navigate: (s: Screen) => void }) {
  const plant = PLANTS.find(p => p.id === plantId);
  if (!plant) return null;

  const sunIcon = plant.sunLevel === 'high' ? <Sun size={16} /> : plant.sunLevel === 'medium' ? <Sun size={16} /> : <CloudRain size={16} />;
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'care'>('overview');

  return (
    <div className="pb-4">
      {/* Hero Image */}
      <div className="relative">
        <img src={plant.image} alt={plant.name} className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <button onClick={goBack} className="absolute top-4 left-4 w-10 h-10 rounded-full glass flex items-center justify-center">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <button
          onClick={() => navigate('mentor')}
          className="absolute top-4 right-4 px-3 py-2 rounded-full glass flex items-center gap-1.5"
        >
          <Sparkles size={14} className="text-amber-400" />
          <span className="text-xs font-semibold text-white">Ask AI</span>
        </button>
        <div className="absolute bottom-4 left-5 right-5">
          <h1 className="text-2xl font-bold text-white">{plant.name}</h1>
          <p className="text-sm text-white/80 italic">{plant.scientificName}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-5 -mt-4 relative z-10">
        <div className="glass-card rounded-xl p-3 flex items-center justify-around">
          <div className="flex flex-col items-center gap-1">
            <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">{sunIcon}</div>
            <span className="text-[10px] font-medium text-[#666] capitalize">{plant.sunLevel} Sun</span>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="flex flex-col items-center gap-1">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><Droplets size={16} /></div>
            <span className="text-[10px] font-medium text-[#666]">Every {plant.waterFrequency}d</span>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="flex flex-col items-center gap-1">
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center text-green-600"><Target size={16} /></div>
            <span className="text-[10px] font-medium text-[#666]">{plant.phRange}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mt-4 mb-3">
        <div className="flex gap-1 bg-white/40 rounded-xl p-1">
          {(['overview', 'timeline', 'care'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${activeTab === tab ? 'bg-white shadow-sm text-[#1B5E20]' : 'text-[#666]'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-5">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="glass-card rounded-xl p-4">
              <h3 className="font-bold text-[#1B5E20] mb-2">About</h3>
              <p className="text-sm text-[#666] leading-relaxed">{plant.description}</p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <h3 className="font-bold text-[#1B5E20] mb-2">Benefits</h3>
              <div className="flex flex-wrap gap-2">
                {plant.benefits.map((b, i) => (
                  <span key={i} className="px-3 py-1.5 bg-[#E8F5E9] rounded-full text-xs font-medium text-[#2E7D32]">{b}</span>
                ))}
              </div>
            </div>
            <div className="glass-card rounded-xl p-4">
              <h3 className="font-bold text-[#1B5E20] mb-2">Environment</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2"><Thermometer size={16} className="text-orange-500" /><span className="text-xs text-[#666]">65-85°F ideal</span></div>
                <div className="flex items-center gap-2"><Droplets size={16} className="text-blue-500" /><span className="text-xs text-[#666]">{plant.humidity} humidity</span></div>
                <div className="flex items-center gap-2"><Target size={16} className="text-purple-500" /><span className="text-xs text-[#666]">pH {plant.phRange}</span></div>
                <div className="flex items-center gap-2"><Sun size={16} className="text-amber-500" /><span className="text-xs text-[#666] capitalize">{plant.sunLevel} light</span></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-0 relative pl-4">
            <div className="absolute left-6 top-2 bottom-2 w-0.5 timeline-line rounded-full" />
            {plant.growthTimeline.map((stage, i) => (
              <div key={i} className="relative flex gap-3 pb-4 stagger-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="relative z-10 w-5 h-5 rounded-full bg-[#4CAF50] border-3 border-white shadow flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div className="glass-card rounded-xl p-3 flex-1">
                  <p className="text-xs font-bold text-[#4CAF50] mb-0.5">Week {stage.week}</p>
                  <p className="text-xs text-[#666] leading-relaxed">{stage.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'care' && (
          <div className="space-y-3">
            <CareCard icon={<Droplets size={18} className="text-blue-500" />} title="Watering" text={`Water every ${plant.waterFrequency} days. Keep soil evenly moist but not waterlogged. Reduce in winter.`} color="bg-blue-50" />
            <CareCard icon={<Sun size={18} className="text-amber-500" />} title="Light" text={`Provide ${plant.sunLevel} light. ${plant.sunLevel === 'high' ? '6+ hours of direct sun daily.' : plant.sunLevel === 'medium' ? 'Bright indirect light for 4-6 hours.' : 'Low to medium indirect light.'}`} color="bg-amber-50" />
            <CareCard icon={<Target size={18} className="text-purple-500" />} title="Soil" text={`Well-draining mix with pH ${plant.phRange}. Add perlite for drainage and compost for nutrients.`} color="bg-purple-50" />
            <CareCard icon={<Sprout size={18} className="text-green-500" />} title="Fertilizing" text={`Feed monthly during growing season with balanced organic fertilizer. Reduce feeding in fall/winter.`} color="bg-green-50" />
            <CareCard icon={<Shield size={18} className="text-red-500" />} title="Common Issues" text={`Watch for aphids and spider mites. Ensure good air circulation. Yellow leaves may indicate overwatering.`} color="bg-red-50" />
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 mt-5 pb-4">
        <button
          onClick={() => navigate('guides')}
          className="w-full h-14 liquid-btn rounded-2xl flex items-center justify-center gap-2 text-white font-bold"
        >
          <BookOpen size={20} />
          View Growing Guide
        </button>
      </div>
    </div>
  );
}

function CareCard({ icon, title, text, color }: { icon: React.ReactNode; title: string; text: string; color: string }) {
  return (
    <div className="glass-card rounded-xl p-3.5 flex gap-3 items-start">
      <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>{icon}</div>
      <div>
        <p className="font-semibold text-sm text-[#1B5E20] mb-0.5">{title}</p>
        <p className="text-xs text-[#666] leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
//  SCANNER SCREEN
// ═════════════════════════════════════════════════════════
function ScannerScreen({ scanMode, setScanMode, scanStage, setScanStage, navigate, setSelectedPlantId }: {
  scanMode: 'identify' | 'diagnose' | 'soil';
  setScanMode: (m: 'identify' | 'diagnose' | 'soil') => void;
  scanStage: 'camera' | 'analyzing' | 'result';
  setScanStage: (s: 'camera' | 'analyzing' | 'result') => void;
  navigate: (s: Screen) => void;
  setSelectedPlantId: (id: string) => void;
}) {
  const [_selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleCapture = () => {
    setScanStage('analyzing');
    setTimeout(() => {
      setScanStage('result');
      setSelectedPlantId('1');
      navigate('scanResult');
      setScanStage('camera');
    }, 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedFile(url);
      handleCapture();
    }
  };

  if (scanStage === 'analyzing') {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8">
        <div className="relative w-40 h-40 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-[#C8E6C9]" />
          <div className="absolute inset-2 rounded-full border-4 border-[#8BC34A] scan-pulse" />
          <div className="absolute inset-4 rounded-full border-4 border-[#4CAF50]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Leaf size={40} className="text-[#4CAF50] loader-spin" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-[#1B5E20] mb-2">Analyzing...</h2>
        <p className="text-sm text-[#666] text-center">
          {scanMode === 'identify' && 'Identifying plant species from your image'}
          {scanMode === 'diagnose' && 'Scanning for pests, diseases, and deficiencies'}
          {scanMode === 'soil' && 'Analyzing soil composition and health'}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-3 flex items-center gap-3">
        <button onClick={() => navigate('home')} className="w-10 h-10 rounded-full glass flex items-center justify-center flex-shrink-0">
          <ArrowLeft size={20} className="text-[#1B5E20]" />
        </button>
        <h1 className="text-xl font-bold text-[#1B5E20]">AI Scanner</h1>
      </div>

      {/* Mode Tabs */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 bg-white/40 rounded-xl p-1">
          {(['identify', 'diagnose', 'soil'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setScanMode(mode)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold capitalize transition-all ${scanMode === mode ? 'bg-[#1B5E20] text-white shadow-md' : 'text-[#666]'}`}
            >
              {mode === 'identify' && 'Identify'}
              {mode === 'diagnose' && 'Diagnose'}
              {mode === 'soil' && 'Soil'}
            </button>
          ))}
        </div>
      </div>

      {/* Camera Viewfinder */}
      <div className="flex-1 px-5 flex flex-col">
        <div className="relative flex-1 rounded-3xl overflow-hidden bg-gradient-to-br from-[#1B5E20]/10 to-[#4CAF50]/10 border-2 border-dashed border-[#4CAF50]/30 flex items-center justify-center min-h-[300px]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Organic blob focus reticle */}
              <div className="w-56 h-56 relative scan-pulse">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <path d="M100,20 C140,20 175,50 180,95 C185,140 150,180 100,180 C50,180 15,140 20,95 C25,50 60,20 100,20" fill="none" stroke="#4CAF50" strokeWidth="2" strokeDasharray="8 4" />
                </svg>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Camera size={32} className="text-[#4CAF50] mb-2" />
                <p className="text-sm font-medium text-[#1B5E20]">
                  {scanMode === 'identify' && 'Point at any plant'}
                  {scanMode === 'diagnose' && 'Focus on affected area'}
                  {scanMode === 'soil' && 'Show soil close-up'}
                </p>
                <p className="text-xs text-[#666] mt-1">Tap capture or upload photo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 py-6">
          <label className="w-12 h-12 rounded-full glass flex items-center justify-center cursor-pointer active:scale-90 transition-transform">
            <Upload size={20} className="text-[#1B5E20]" />
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
          <button onClick={handleCapture} className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] flex items-center justify-center shadow-lg shadow-green-600/30 active:scale-90 transition-transform">
            <div className="w-14 h-14 rounded-full border-2 border-white/40 flex items-center justify-center">
              <div className="w-11 h-11 rounded-full bg-white" />
            </div>
          </button>
          <button className="w-12 h-12 rounded-full glass flex items-center justify-center active:scale-90 transition-transform">
            <HelpCircle size={20} className="text-[#1B5E20]" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
//  SCAN RESULT SCREEN
// ═════════════════════════════════════════════════════════
function ScanResultScreen({ scanMode, plantId, goBack, navigate }: { scanMode: 'identify' | 'diagnose' | 'soil'; plantId: string; goBack: () => void; navigate: (s: Screen) => void }) {
  const plant = PLANTS.find(p => p.id === plantId) || PLANTS[0];

  const mockDiagnosis = {
    issue: 'Early Leaf Spot',
    confidence: 87,
    severity: 'Mild' as const,
    description: 'Small dark spots on lower leaves with yellow halos. Common fungal issue in humid conditions.',
    treatment: [
      'Remove affected leaves immediately',
      'Apply organic neem oil spray',
      'Improve air circulation around plant',
      'Water at the base, avoid wetting foliage',
      'Apply copper fungicide if spreading',
    ],
  };

  const mockSoil = {
    overall: 'Good',
    score: 78,
    moisture: 65,
    ph: 6.5,
    organic: 70,
    nutrients: { nitrogen: 60, phosphorus: 75, potassium: 80 },
    recommendations: [
      'Add compost to boost organic matter',
      'Slightly increase nitrogen with fish emulsion',
      'Mulch surface to retain moisture',
    ],
  };

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="relative">
        <img src={scanMode === 'soil' ? '/images/soil-health.jpg' : plant.image} alt="" className="w-full h-56 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button onClick={goBack} className="absolute top-4 left-4 w-10 h-10 rounded-full glass flex items-center justify-center">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="absolute bottom-4 left-5 right-5">
          {scanMode === 'identify' && <><h1 className="text-2xl font-bold text-white">{plant.name}</h1><p className="text-sm text-white/80 italic">{plant.scientificName}</p></>}
          {scanMode === 'diagnose' && <><h1 className="text-xl font-bold text-white">{mockDiagnosis.issue}</h1><p className="text-sm text-white/80">Confidence: {mockDiagnosis.confidence}% · Severity: {mockDiagnosis.severity}</p></>}
          {scanMode === 'soil' && <><h1 className="text-xl font-bold text-white">Soil Health: {mockSoil.overall}</h1><p className="text-sm text-white/80">Overall Score: {mockSoil.score}/100</p></>}
        </div>
      </div>

      <div className="px-5 -mt-3 relative z-10">
        <div className="glass-card rounded-2xl p-4">
          {scanMode === 'identify' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center"><Check size={24} className="text-green-600" /></div>
                <div><p className="font-bold text-[#1B5E20]">Match Confidence</p><p className="text-2xl font-bold text-[#4CAF50]">94%</p></div>
              </div>
              <p className="text-sm text-[#666]">{plant.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-[#E8F5E9] rounded-full text-xs font-medium text-[#2E7D32]">{(plant.category)}</span>
                <span className="px-3 py-1 bg-blue-50 rounded-full text-xs font-medium text-blue-700">Water every {plant.waterFrequency}d</span>
                <span className="px-3 py-1 bg-amber-50 rounded-full text-xs font-medium text-amber-700">{plant.sunLevel} sun</span>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => navigate('plantDetail')} className="flex-1 h-11 liquid-btn rounded-xl text-white font-semibold text-sm">View Details</button>
                <button onClick={() => navigate('mentor')} className="flex-1 h-11 glass rounded-xl text-[#1B5E20] font-semibold text-sm flex items-center justify-center gap-1"><Sparkles size={14} /> Ask AI</button>
              </div>
            </div>
          )}

          {scanMode === 'diagnose' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center"><AlertTriangle size={24} className="text-amber-600" /></div>
                <div><p className="font-bold text-[#1B5E20]">Severity</p><p className="text-lg font-bold text-amber-600">{mockDiagnosis.severity}</p></div>
              </div>
              <p className="text-sm text-[#666]">{mockDiagnosis.description}</p>
              <div>
                <h3 className="font-bold text-[#1B5E20] mb-2">Treatment Steps</h3>
                <div className="space-y-2">
                  {mockDiagnosis.treatment.map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-[#4CAF50] flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-white text-xs font-bold">{i + 1}</span></div>
                      <p className="text-sm text-[#666]">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => navigate('mentor')} className="w-full h-11 liquid-btn rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2"><Sparkles size={16} /> Ask Green Mentor</button>
            </div>
          )}

          {scanMode === 'soil' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-xl"><p className="text-lg font-bold text-blue-600">{mockSoil.moisture}%</p><p className="text-[10px] text-[#666]">Moisture</p></div>
                <div className="text-center p-3 bg-purple-50 rounded-xl"><p className="text-lg font-bold text-purple-600">{mockSoil.ph}</p><p className="text-[10px] text-[#666]">pH Level</p></div>
                <div className="text-center p-3 bg-green-50 rounded-xl"><p className="text-lg font-bold text-green-600">{mockSoil.organic}%</p><p className="text-[10px] text-[#666]">Organic</p></div>
              </div>
              <div>
                <h3 className="font-bold text-[#1B5E20] mb-2 text-sm">Nutrient Levels</h3>
                <div className="space-y-2">
                  <NutrientBar label="Nitrogen (N)" value={mockSoil.nutrients.nitrogen} color="bg-blue-500" />
                  <NutrientBar label="Phosphorus (P)" value={mockSoil.nutrients.phosphorus} color="bg-orange-500" />
                  <NutrientBar label="Potassium (K)" value={mockSoil.nutrients.potassium} color="bg-green-500" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-[#1B5E20] mb-2 text-sm">Recommendations</h3>
                <div className="space-y-2">
                  {mockSoil.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-2 items-start"><Sparkles size={14} className="text-[#4CAF50] flex-shrink-0 mt-0.5" /><p className="text-xs text-[#666]">{rec}</p></div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NutrientBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1"><span className="text-[#666]">{label}</span><span className="font-semibold text-[#1B5E20]">{value}%</span></div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full progress-animated`} style={{ width: `${value}%` }} /></div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
//  GREEN MENTOR SCREEN
// ═════════════════════════════════════════════════════════
function MentorScreen({ goBack }: { goBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hello! I\'m your Green Mentor. Ask me anything about gardening - from plant care and pest control to soil health and seasonal planting advice.', timestamp: 'Now' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: 'Just now' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const lower = input.toLowerCase();
      let response = MENTOR_RESPONSES.default;
      if (lower.includes('water')) response = MENTOR_RESPONSES.water;
      else if (lower.includes('soil')) response = MENTOR_RESPONSES.soil;
      else if (lower.includes('pest') || lower.includes('bug') || lower.includes('insect')) response = MENTOR_RESPONSES.pest;
      else if (lower.includes('indoor') || lower.includes('house')) response = MENTOR_RESPONSES.indoor;

      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: 'Just now' };
      setMessages(prev => [...prev, botMsg]);
    }, 1500);
  };

  const quickQuestions = [
    'How often should I water tomatoes?',
    'What soil pH do basil plants need?',
    'How to deal with aphids organically?',
    'Best indoor plants for beginners?',
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-3 flex items-center gap-3 bg-gradient-to-r from-[#1B5E20] to-[#4CAF50]">
        <button onClick={goBack} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><Sparkles size={22} className="text-amber-300" /></div>
          <div><h1 className="text-lg font-bold text-white">Green Mentor</h1><p className="text-xs text-white/70 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /> AI Powered</p></div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} message-in`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-[#1B5E20] text-white rounded-br-md' : 'glass-card text-[#1B5E20] rounded-bl-md'}`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-white/60' : 'text-[#666]'}`}>{msg.timestamp}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start message-in">
            <div className="glass-card px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-[#4CAF50] animate-bounce" /><div className="w-2 h-2 rounded-full bg-[#4CAF50] animate-bounce" style={{ animationDelay: '0.15s' }} /><div className="w-2 h-2 rounded-full bg-[#4CAF50] animate-bounce" style={{ animationDelay: '0.3s' }} /></div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Questions */}
      {messages.length < 3 && (
        <div className="px-5 pb-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {quickQuestions.map((q, i) => (
              <button key={i} onClick={() => { setInput(q); }} className="snap-start flex-shrink-0 px-3 py-2 glass-card rounded-full text-xs text-[#1B5E20] whitespace-nowrap active:scale-95 transition-transform">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-center gap-2 glass-card rounded-2xl px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about gardening..."
            className="flex-1 bg-transparent text-sm text-[#1B5E20] placeholder:text-gray-400 focus:outline-none"
          />
          <button onClick={sendMessage} disabled={!input.trim()} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${input.trim() ? 'bg-[#4CAF50] text-white' : 'bg-gray-100 text-gray-400'}`}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
//  GUIDES SCREEN
// ═════════════════════════════════════════════════════════
function GuidesScreen({ navigate, setSelectedGuideId }: { navigate: (s: Screen) => void; setSelectedGuideId: (id: string) => void }) {
  return (
    <div className="pb-4">
      <div className="px-5 pt-6 pb-3">
        <h1 className="text-2xl font-bold text-[#1B5E20] mb-1">Growing Guides</h1>
        <p className="text-sm text-[#666]">Step-by-step interactive tutorials</p>
      </div>

      <div className="px-5 space-y-4">
        {GUIDES.map((guide, i) => (
          <button
            key={guide.id}
            onClick={() => { setSelectedGuideId(guide.id); navigate('guideDetail'); }}
            className="w-full glass-card rounded-2xl overflow-hidden text-left transition-all active:scale-[0.98] stagger-in"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="relative">
              <img src={guide.image} alt={guide.title} className="w-full h-40 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="text-lg font-bold text-white">{guide.title}</h3>
                <p className="text-xs text-white/80">{guide.plantName}</p>
              </div>
            </div>
            <div className="p-4 flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-[#666]"><Clock size={14} className="text-[#4CAF50]" />{guide.duration}</div>
              <div className="flex items-center gap-1.5 text-xs text-[#666]"><TrendingUp size={14} className="text-amber-500" />{guide.difficulty}</div>
              <div className="flex items-center gap-1.5 text-xs text-[#666]"><BookOpen size={14} className="text-blue-500" />{guide.steps.length} steps</div>
            </div>
          </button>
        ))}
      </div>

      {/* Tips Card */}
      <div className="px-5 mt-5">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-amber-500" />
            <h3 className="font-bold text-[#1B5E20]">Pro Tip</h3>
          </div>
          <p className="text-sm text-[#666] leading-relaxed">Always harden off seedlings gradually over 7-10 days before transplanting outdoors. Start with 1 hour of indirect sunlight and increase exposure daily.</p>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
//  GUIDE DETAIL SCREEN
// ═════════════════════════════════════════════════════════
function GuideDetailScreen({ guideId, goBack }: { guideId: string; goBack: () => void }) {
  const guide = GUIDES.find(g => g.id === guideId);
  const [currentStep, setCurrentStep] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  if (!guide) return null;
  const step = guide.steps[currentStep];

  const toggleFlip = (idx: number) => setFlippedCards(prev => ({ ...prev, [idx]: !prev[idx] }));

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="relative">
        <img src={guide.image} alt="" className="w-full h-44 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button onClick={goBack} className="absolute top-4 left-4 w-10 h-10 rounded-full glass flex items-center justify-center">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="absolute bottom-4 left-5 right-5">
          <h1 className="text-lg font-bold text-white">{guide.title}</h1>
          <p className="text-xs text-white/70">Step {currentStep + 1} of {guide.steps.length}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="px-5 py-3">
        <div className="flex gap-1.5">
          {guide.steps.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= currentStep ? 'bg-[#4CAF50]' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
        <h2 className="text-xl font-bold text-[#1B5E20] mb-2">{step.title}</h2>
        <p className="text-sm text-[#666] leading-relaxed mb-4">{step.description}</p>

        {/* Tip Box */}
        <div className="glass-card rounded-xl p-3.5 mb-4 flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0"><Sparkles size={16} className="text-amber-500" /></div>
          <div><p className="text-xs font-bold text-[#1B5E20] mb-0.5">Expert Tip</p><p className="text-xs text-[#666]">{step.tip}</p></div>
        </div>

        {/* 3D Flip Card */}
        <div className="mb-4">
          <p className="text-sm font-bold text-[#1B5E20] mb-2">Tap to reveal:</p>
          <div className={`flip-card h-32 ${flippedCards[currentStep] ? 'flipped' : ''}`} onClick={() => toggleFlip(currentStep)}>
            <div className="flip-card-inner">
              <div className="flip-card-front glass-card flex items-center justify-center p-4 cursor-pointer">
                <div className="text-center">
                  <HelpCircle size={28} className="text-[#4CAF50] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#1B5E20]">{step.flipQuestion}</p>
                  <p className="text-xs text-[#666] mt-1">Tap to reveal answer</p>
                </div>
              </div>
              <div className="flip-card-back bg-gradient-to-br from-[#1B5E20] to-[#4CAF50] flex items-center justify-center p-4 cursor-pointer">
                <div className="text-center"><p className="text-sm font-semibold text-white">{step.flipAnswer}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-5 pb-5 pt-2 flex gap-3">
        {currentStep > 0 && (
          <button onClick={() => setCurrentStep(prev => prev - 1)} className="flex-1 h-12 glass rounded-xl text-[#1B5E20] font-semibold flex items-center justify-center gap-1">
            <ArrowLeft size={16} /> Previous
          </button>
        )}
        {currentStep < guide.steps.length - 1 ? (
          <button onClick={() => setCurrentStep(prev => prev + 1)} className="flex-1 h-12 liquid-btn rounded-xl text-white font-semibold flex items-center justify-center gap-1">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={goBack} className="flex-1 h-12 liquid-btn rounded-xl text-white font-semibold flex items-center justify-center gap-1">
            <Check size={16} /> Complete
          </button>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
//  GARDEN SCREEN (CARE / MY GARDEN)
// ═════════════════════════════════════════════════════════
function GardenScreen({ navigate, setSelectedPlantId }: { navigate: (s: Screen) => void; setSelectedPlantId: (id: string) => void }) {
  const [reminders, setReminders] = useState<Reminder[]>(INITIAL_REMINDERS);
  const [activeView, setActiveView] = useState<'tasks' | 'plants'>('tasks');

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const myPlants: GardenPlant[] = [
    { id: 'g1', plantId: '1', plantedDate: '2025-03-15', lastWatered: '2025-05-19', health: 'excellent', notes: 'Thriving! First tomatoes appearing.' },
    { id: 'g2', plantId: '2', plantedDate: '2025-04-01', lastWatered: '2025-05-20', health: 'good', notes: 'Harvested twice this week.' },
    { id: 'g3', plantId: '3', plantedDate: '2024-11-20', lastWatered: '2025-05-18', health: 'excellent', notes: 'New leaf unfurling.' },
    { id: 'g4', plantId: '5', plantedDate: '2025-01-10', lastWatered: '2025-05-15', health: 'good', notes: 'Pup growing well.' },
  ];

  return (
    <div className="pb-4">
      <div className="px-5 pt-6 pb-3">
        <h1 className="text-2xl font-bold text-[#1B5E20]">My Garden</h1>
      </div>

      {/* Stats */}
      <div className="px-5 mb-4">
        <div className="glass-card rounded-xl p-4 grid grid-cols-3 gap-4 text-center">
          <div><p className="text-2xl font-bold text-[#4CAF50]">{myPlants.length}</p><p className="text-[10px] text-[#666]">Plants</p></div>
          <div><p className="text-2xl font-bold text-blue-500">{reminders.filter(r => !r.completed).length}</p><p className="text-[10px] text-[#666]">Pending</p></div>
          <div><p className="text-2xl font-bold text-amber-500">12</p><p className="text-[10px] text-[#666]">Day Streak</p></div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="px-5 mb-4">
        <div className="flex gap-1 bg-white/40 rounded-xl p-1">
          <button onClick={() => setActiveView('tasks')} className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeView === 'tasks' ? 'bg-[#1B5E20] text-white' : 'text-[#666]'}`}>Care Tasks</button>
          <button onClick={() => setActiveView('plants')} className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeView === 'plants' ? 'bg-[#1B5E20] text-white' : 'text-[#666]'}`}>My Plants</button>
        </div>
      </div>

      {activeView === 'tasks' && (
        <div className="px-5 space-y-2.5">
          {reminders.map((r, i) => (
            <div key={r.id} className={`glass-card rounded-xl p-3.5 flex items-center gap-3 transition-all ${r.completed ? 'opacity-60' : ''} stagger-in`} style={{ animationDelay: `${i * 80}ms` }}>
              <button onClick={() => toggleReminder(r.id)} className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${r.completed ? 'bg-[#4CAF50]' : 'bg-blue-50'}`}>
                {r.completed ? <Check size={18} className="text-white" /> :
                 r.icon === 'water' ? <Droplets size={18} className="text-blue-500" /> :
                 r.icon === 'sprout' ? <Sprout size={18} className="text-green-500" /> :
                 r.icon === 'zap' ? <Zap size={18} className="text-amber-500" /> :
                 <Target size={18} className="text-purple-500" />}
              </button>
              <div className="flex-1">
                <p className={`font-medium text-sm ${r.completed ? 'text-gray-400 line-through' : 'text-[#1B5E20]'}`}>{r.task}</p>
                <p className="text-xs text-[#666]">{r.plantName} · {r.dueDate}</p>
              </div>
              {!r.completed && <div className="w-2 h-2 rounded-full bg-red-400 badge-pulse" />}
            </div>
          ))}
        </div>
      )}

      {activeView === 'plants' && (
        <div className="px-5 grid grid-cols-2 gap-3">
          {myPlants.map((gp, i) => {
            const plant = PLANTS.find(p => p.id === gp.plantId);
            if (!plant) return null;
            return (
              <button
                key={gp.id}
                onClick={() => { setSelectedPlantId(plant.id); navigate('plantDetail'); }}
                className="glass-card rounded-2xl overflow-hidden text-left transition-all active:scale-95 stagger-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <img src={plant.image} alt={plant.name} className="w-full h-28 object-cover" />
                <div className="p-3">
                  <p className="font-bold text-sm text-[#1B5E20]">{plant.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className={`w-2 h-2 rounded-full ${gp.health === 'excellent' ? 'bg-green-500' : gp.health === 'good' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                    <span className="text-[10px] text-[#666] capitalize">{gp.health}</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#4CAF50] to-[#8BC34A] rounded-full progress-animated" style={{ width: `${gp.health === 'excellent' ? 90 : gp.health === 'good' ? 70 : 50}%` }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════
//  COMMUNITY SCREEN
// ═════════════════════════════════════════════════════════
function CommunityScreen({ navigate, setSelectedPostId }: { navigate: (s: Screen) => void; setSelectedPostId: (id: string) => void }) {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [activeTab, setActiveTab] = useState<'feed' | 'forum'>('feed');

  const toggleLike = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const toggleBookmark = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, bookmarked: !p.bookmarked } : p));
  };

  return (
    <div className="pb-4">
      <div className="px-5 pt-6 pb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1B5E20]">Community</h1>
        <button className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <Search size={18} className="text-[#1B5E20]" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div className="flex gap-1 bg-white/40 rounded-xl p-1">
          <button onClick={() => setActiveTab('feed')} className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'feed' ? 'bg-[#1B5E20] text-white' : 'text-[#666]'}`}>Feed</button>
          <button onClick={() => setActiveTab('forum')} className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'forum' ? 'bg-[#1B5E20] text-white' : 'text-[#666]'}`}>Forum</button>
        </div>
      </div>

      {activeTab === 'feed' && (
        <div className="px-5 space-y-4">
          {posts.map((post, i) => (
            <div key={post.id} className="glass-card rounded-2xl overflow-hidden stagger-in" style={{ animationDelay: `${i * 80}ms` }}>
              <button
                className="w-full text-left"
                onClick={() => { setSelectedPostId(post.id); navigate('postDetail'); }}
              >
                <div className="p-3 flex items-center gap-2.5">
                  <img src={post.userAvatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1B5E20]">{post.userName}</p>
                    <p className="text-[10px] text-[#666]">{post.timestamp}</p>
                  </div>
                  <MoreHorizontal size={16} className="text-[#666]" />
                </div>
                <img src={post.image} alt="" className="w-full h-48 object-cover" />
                <div className="p-3">
                  <p className="text-sm text-[#1B5E20] line-clamp-2">{post.caption}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {post.tags.map((tag, j) => <span key={j} className="text-[10px] text-[#4CAF50] font-medium">{tag}</span>)}
                  </div>
                </div>
              </button>
              <div className="px-3 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={(e) => { e.stopPropagation(); toggleLike(post.id); }} className="flex items-center gap-1.5">
                    <Heart size={18} className={`transition-all ${post.liked ? 'text-red-500 fill-red-500 heart-beat' : 'text-[#666]'}`} />
                    <span className="text-xs text-[#666]">{post.likes}</span>
                  </button>
                  <button onClick={() => { setSelectedPostId(post.id); navigate('postDetail'); }} className="flex items-center gap-1.5">
                    <MessageCircle size={18} className="text-[#666]" />
                    <span className="text-xs text-[#666]">{post.comments.length}</span>
                  </button>
                  <button className="flex items-center gap-1.5"><Share2 size={18} className="text-[#666]" /></button>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleBookmark(post.id); }}>
                  <Bookmark size={18} className={`transition-all ${post.bookmarked ? 'text-[#4CAF50] fill-[#4CAF50]' : 'text-[#666]'}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'forum' && <ForumTab navigate={navigate} setSelectedPostId={setSelectedPostId} posts={posts} />}
    </div>
  );
}

function ForumTab({ navigate, setSelectedPostId, posts }: { navigate: (s: Screen) => void; setSelectedPostId: (id: string) => void; posts: Post[] }) {
  const topics = [
    { id: '1', title: 'Best organic fertilizers for tomatoes?', author: 'Tom Rivers', replies: 24, views: 342, tag: 'Fertilizing' },
    { id: '2', title: 'Help! My fiddle leaf fig is dropping leaves', author: 'Maya Chen', replies: 18, views: 256, tag: 'Houseplants' },
    { id: '3', title: 'Companion planting chart for vegetables', author: 'Sarah Green', replies: 31, views: 489, tag: 'Planning' },
    { id: '4', title: 'Indoor herb garden lighting setup', author: 'Tom Rivers', replies: 12, views: 178, tag: 'Indoor' },
    { id: '5', title: 'How to propagate pothos in water', author: 'Maya Chen', replies: 45, views: 623, tag: 'Propagation' },
  ];

  return (
    <div className="px-5 space-y-3">
      {/* Trending Tags */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {['All', 'Indoor', 'Vegetables', 'Pests', 'Soil', 'Propagation'].map(tag => (
          <button key={tag} className="snap-start flex-shrink-0 px-4 py-2 bg-white/60 rounded-full text-xs font-medium text-[#1B5E20]">{tag}</button>
        ))}
      </div>

      {topics.map((topic, i) => (
        <button
          key={topic.id}
          onClick={() => { setSelectedPostId(posts[0]?.id || '1'); navigate('postDetail'); }}
          className="w-full glass-card rounded-xl p-4 text-left transition-all active:scale-[0.98] stagger-in"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <span className="px-2 py-0.5 bg-[#C8E6C9] rounded text-[10px] font-semibold text-[#1B5E20]">{topic.tag}</span>
              <h3 className="font-semibold text-sm text-[#1B5E20] mt-1.5">{topic.title}</h3>
              <p className="text-xs text-[#666] mt-1">by {topic.author}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-[#666]">
            <span className="flex items-center gap-1"><MessageCircle size={12} /> {topic.replies} replies</span>
            <span className="flex items-center gap-1"><TrendingUp size={12} /> {topic.views} views</span>
          </div>
        </button>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════
//  POST DETAIL SCREEN
// ═════════════════════════════════════════════════════════
function PostDetailScreen({ postId, goBack }: { postId: string; goBack: () => void }) {
  const [commentText, setCommentText] = useState('');
  const post = INITIAL_POSTS.find(p => p.id === postId) || INITIAL_POSTS[0];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-3 flex items-center gap-3">
        <button onClick={goBack} className="w-10 h-10 rounded-full glass flex items-center justify-center flex-shrink-0">
          <ArrowLeft size={20} className="text-[#1B5E20]" />
        </button>
        <h1 className="text-lg font-bold text-[#1B5E20]">Post</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Post */}
        <div className="px-5 mb-4">
          <div className="flex items-center gap-2.5 mb-3">
            <img src={post.userAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            <div><p className="text-sm font-semibold text-[#1B5E20]">{post.userName}</p><p className="text-[10px] text-[#666]">{post.timestamp}</p></div>
          </div>
          <img src={post.image} alt="" className="w-full h-56 object-cover rounded-2xl mb-3" />
          <p className="text-sm text-[#1B5E20] leading-relaxed mb-3">{post.caption}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.map((tag, j) => <span key={j} className="text-xs text-[#4CAF50] font-medium">{tag}</span>)}
          </div>
          <div className="flex items-center gap-5 py-3 border-t border-b border-gray-100">
            <button className="flex items-center gap-1.5"><Heart size={18} className="text-[#666]" /><span className="text-xs text-[#666]">{post.likes}</span></button>
            <button className="flex items-center gap-1.5"><MessageCircle size={18} className="text-[#666]" /><span className="text-xs text-[#666]">{post.comments.length}</span></button>
            <button className="flex items-center gap-1.5"><Repeat2 size={18} className="text-[#666]" /><span className="text-xs text-[#666]">Share</span></button>
            <button className="flex items-center gap-1.5"><Bookmark size={18} className="text-[#666]" /></button>
          </div>
        </div>

        {/* Comments */}
        <div className="px-5 pb-4">
          <h3 className="font-bold text-[#1B5E20] mb-3">Comments</h3>
          <div className="space-y-4">
            {post.comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <img src={c.userAvatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0 self-start" />
                <div className="glass-card rounded-xl rounded-tl-md px-3 py-2 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-semibold text-[#1B5E20]">{c.userName}</p>
                    <p className="text-[10px] text-[#666]">{c.timestamp}</p>
                  </div>
                  <p className="text-xs text-[#666]">{c.text}</p>
                </div>
              </div>
            ))}
            {post.comments.length === 0 && (
              <p className="text-sm text-[#666] text-center py-4">No comments yet. Be the first!</p>
            )}
          </div>
        </div>
      </div>

      {/* Comment Input */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-center gap-2 glass-card rounded-2xl px-4 py-2">
          <input
            type="text"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-transparent text-sm text-[#1B5E20] placeholder:text-gray-400 focus:outline-none"
          />
          <button disabled={!commentText.trim()} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${commentText.trim() ? 'bg-[#4CAF50] text-white' : 'bg-gray-100 text-gray-400'}`}>
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
//  PROFILE SCREEN
// ═════════════════════════════════════════════════════════
function ProfileScreen({ navigate, setSelectedPlantId }: { navigate: (s: Screen) => void; setSelectedPlantId: (id: string) => void }) {
  const badges = [
    { name: 'First Sprout', icon: <Sprout size={16} />, color: 'bg-green-100 text-green-700', earned: true },
    { name: 'Water Wizard', icon: <Droplets size={16} />, color: 'bg-blue-100 text-blue-700', earned: true },
    { name: 'Plant Doctor', icon: <Shield size={16} />, color: 'bg-purple-100 text-purple-700', earned: true },
    { name: 'Green Thumb', icon: <Award size={16} />, color: 'bg-amber-100 text-amber-700', earned: false },
  ];

  const recentPlants = ['Tomato', 'Basil', 'Monstera', 'Aloe Vera'];
  const historyItems = [
    { action: 'Watered Tomato', date: 'Today, 8:00 AM', icon: <Droplets size={14} />, color: 'text-blue-500' },
    { action: 'Harvested Basil', date: 'Yesterday, 10:30 AM', icon: <ScissorsIcon />, color: 'text-green-500' },
    { action: 'Identified new plant', date: 'May 18', icon: <ScanLine size={14} />, color: 'text-purple-500' },
    { action: 'Added Monstera to garden', date: 'May 15', icon: <Plus size={14} />, color: 'text-[#4CAF50]' },
  ];

  return (
    <div className="pb-4">
      {/* Profile Header */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-br from-[#1B5E20] to-[#4CAF50]" />
        <div className="px-5 -mt-12 relative z-10">
          <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
            <img src="/images/avatar1.jpg" alt="" className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg" />
            <div className="flex-1">
              <h1 className="text-lg font-bold text-[#1B5E20]">Sarah Green</h1>
              <p className="text-xs text-[#666]">Gardening since 2023</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-[#666]">
                <MapPin size={12} className="text-[#4CAF50]" />
                <span>Portland, OR</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 mt-4 mb-4">
        <div className="glass-card rounded-xl p-4 grid grid-cols-4 gap-3 text-center">
          <div><p className="text-xl font-bold text-[#4CAF50]">12</p><p className="text-[10px] text-[#666]">Plants</p></div>
          <div><p className="text-xl font-bold text-[#4CAF50]">48</p><p className="text-[10px] text-[#666]">Harvests</p></div>
          <div><p className="text-xl font-bold text-[#4CAF50]">24</p><p className="text-[10px] text-[#666]">Posts</p></div>
          <div><p className="text-xl font-bold text-[#4CAF50]">156</p><p className="text-[10px] text-[#666]">Streak</p></div>
        </div>
      </div>

      {/* Badges */}
      <div className="px-5 mb-4">
        <h2 className="text-lg font-bold text-[#1B5E20] mb-3">Badges</h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {badges.map((badge, i) => (
            <div key={i} className={`snap-start flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-xl ${badge.earned ? 'glass-card' : 'bg-gray-50 opacity-50'}`}>
              <div className={`w-10 h-10 rounded-full ${badge.color} flex items-center justify-center`}>{badge.icon}</div>
              <p className="text-[10px] font-medium text-[#1B5E20] text-center whitespace-nowrap">{badge.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Digital Garden Preview */}
      <div className="px-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[#1B5E20]">Digital Garden</h2>
          <button onClick={() => navigate('garden')} className="text-sm text-[#4CAF50] font-medium flex items-center gap-0.5">
            View All <ChevronRight size={16} />
          </button>
        </div>
        <div className="glass-card rounded-xl p-3">
          <div className="grid grid-cols-4 gap-2">
            {recentPlants.map((name, i) => {
              const plant = PLANTS.find(p => p.name === name);
              return (
                <button
                  key={i}
                  onClick={() => { if (plant) { setSelectedPlantId(plant.id); navigate('plantDetail'); } }}
                  className="text-center active:scale-95 transition-transform"
                >
                  <img src={plant?.image || '/images/plant-tomato.jpg'} alt={name} className="w-16 h-16 rounded-xl object-cover mx-auto mb-1" />
                  <p className="text-[10px] font-medium text-[#1B5E20]">{name}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity History */}
      <div className="px-5 mb-4">
        <h2 className="text-lg font-bold text-[#1B5E20] mb-3">Recent Activity</h2>
        <div className="space-y-2">
          {historyItems.map((item, i) => (
            <div key={i} className="glass-card rounded-xl p-3 flex items-center gap-3 stagger-in" style={{ animationDelay: `${i * 80}ms` }}>
              <div className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center ${item.color}`}>{item.icon}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1B5E20]">{item.action}</p>
                <p className="text-[10px] text-[#666]">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="px-5 pb-6">
        <h2 className="text-lg font-bold text-[#1B5E20] mb-3">Settings</h2>
        <div className="glass-card rounded-xl divide-y divide-gray-100">
          <SettingsRow icon={<Bell size={18} />} label="Notifications" />
          <SettingsRow icon={<MapPin size={18} />} label="Location & Weather" />
          <SettingsRow icon={<HelpCircle size={18} />} label="Help & Support" />
          <SettingsRow icon={<Shield size={18} />} label="Privacy Policy" />
        </div>
      </div>
    </div>
  );
}

function SettingsRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50 transition-colors">
      <span className="text-[#666]">{icon}</span>
      <span className="flex-1 text-sm text-[#1B5E20]">{label}</span>
      <ChevronRight size={16} className="text-gray-400" />
    </button>
  );
}

function ScissorsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}
