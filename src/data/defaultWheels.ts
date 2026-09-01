import { DecisionWheel } from '../types/decision';

export const DEFAULT_DECISION_WHEELS: DecisionWheel[] = [
  {
    id: 'wheel-scripture-study',
    title: 'Scripture Focus',
    titleTa: 'வேத வாசிப்புப் பகுதி',
    icon: 'BookOpen',
    createdAt: '2026-01-01T00:00:00.000Z',
    options: [
      { id: 'opt-1', text: 'Gospel of John / சுவிசேஷம்', color: '#F59E0B' },
      { id: 'opt-2', text: 'Psalms & Praises / சங்கீதம்', color: '#10B981' },
      { id: 'opt-3', text: 'Proverbs (Wisdom) / நீதிமொழிகள்', color: '#8B5CF6' },
      { id: 'opt-4', text: 'Paul’s Epistles / நிருபங்கள்', color: '#EC4899' },
      { id: 'opt-5', text: 'Old Testament / பழைய ஏற்பாடு', color: '#06B6D4' },
      { id: 'opt-6', text: 'Parables of Jesus / உவமைகள்', color: '#3B82F6' },
    ],
  },
  {
    id: 'wheel-prayer-intercession',
    title: 'Prayer Intercession',
    titleTa: 'ஜெபப் பரிந்துபேசுதல்',
    icon: 'Heart',
    createdAt: '2026-01-01T00:00:00.000Z',
    options: [
      { id: 'opt-p1', text: 'Family & Loved Ones / குடும்பம்', color: '#EF4444' },
      { id: 'opt-p2', text: 'Pastors & Church / சபை & ஊழியர்', color: '#F59E0B' },
      { id: 'opt-p3', text: 'Sick & Brokenhearted / சுகவீனர்கள்', color: '#10B981' },
      { id: 'opt-p4', text: 'Youth & Salvation / வாலிபர் இரட்சிப்பு', color: '#06B6D4' },
      { id: 'opt-p5', text: 'Nation & Leaders / தேசத்தின் தலைவர்கள்', color: '#8B5CF6' },
      { id: 'opt-p6', text: 'Personal Holiness / தனிப்பட்ட பரிசுத்தம்', color: '#EC4899' },
    ],
  },
  {
    id: 'wheel-kindness-mission',
    title: 'Act of Kindness & Love',
    titleTa: 'அன்பின் செயல் / ஊழியம்',
    icon: 'Sparkles',
    createdAt: '2026-01-01T00:00:00.000Z',
    options: [
      { id: 'opt-k1', text: 'Call & Pray with a Friend / நண்பருக்கு அழைப்பு', color: '#10B981' },
      { id: 'opt-k2', text: 'Send Scripture Encouragement / வசன பகிர்வு', color: '#F59E0B' },
      { id: 'opt-k3', text: 'Give a Secret Gift / இரகசிய உதவி', color: '#EC4899' },
      { id: 'opt-k4', text: 'Help a Family Member / குடும்ப உதவி', color: '#3B82F6' },
      { id: 'opt-k5', text: 'Fast One Meal for Mission / உபவாசம்', color: '#8B5CF6' },
    ],
  },
  {
    id: 'wheel-daily-focus',
    title: 'Daily Task Priority',
    titleTa: 'இன்றைய முதன்மை காரியம்',
    icon: 'Target',
    createdAt: '2026-01-01T00:00:00.000Z',
    options: [
      { id: 'opt-d1', text: 'Deep Study / Work / படிப்பு & வேலை', color: '#06B6D4' },
      { id: 'opt-d2', text: 'House Chores & Clean / இல்லப் பராமரிப்பு', color: '#10B981' },
      { id: 'opt-d3', text: 'Quiet Time Meditation / தியானம்', color: '#F59E0B' },
      { id: 'opt-d4', text: 'Walk & Physical Exercise / நடைப்பயிற்சி', color: '#EC4899' },
      { id: 'opt-d5', text: 'Review Budget & Tithes / நிதி மேலாண்மை', color: '#8B5CF6' },
    ],
  },
];
