import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase }    from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import AppLayout       from '@/components/layout/AppLayout'
import {
  MessageSquare, Heart, Bookmark, Share2, Search,
  Plus, ChevronDown, ChevronUp, Pin, Flame, Clock,
  TrendingUp, Filter, X, Send, Award, Sparkles,
  Globe, BookOpen, Volume2, HelpCircle, Star
} from 'lucide-react'
import clsx from 'clsx'

// ── Categories ────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',        label: 'All Posts',       icon: Globe,       color: 'bg-stone-100 text-stone-600'     },
  { id: 'question',   label: 'Questions',        icon: HelpCircle,  color: 'bg-blue-50 text-blue-600'        },
  { id: 'grammar',    label: 'Grammar',          icon: BookOpen,    color: 'bg-purple-50 text-purple-600'    },
  { id: 'vocabulary', label: 'Vocabulary',       icon: Star,        color: 'bg-amber-50 text-amber-600'      },
  { id: 'culture',    label: 'Culture',          icon: Globe,       color: 'bg-green-50 text-green-600'      },
  { id: 'listening',  label: 'Listening',        icon: Volume2,     color: 'bg-pink-50 text-pink-600'        },
  { id: 'general',    label: 'General',          icon: MessageSquare, color: 'bg-orange-50 text-orange-600'  },
]

const SORT_OPTIONS = [
  { id: 'trending', label: 'Trending',  icon: TrendingUp },
  { id: 'newest',   label: 'Newest',    icon: Clock      },
  { id: 'top',      label: 'Top Liked', icon: Flame      },
]

// ── Seed posts for great first experience ─────────────────────
const SEED_POSTS = [
  {
    id: 'seed-1',
    category: 'question',
    title: 'What is the difference between ሰላም (selam) and ቴዎ (tew)?',
    body: 'I keep hearing both used as greetings but I\'m not sure when to use which one. Can someone explain the difference? Also is there a formal vs informal version?',
    author: 'Marta H.',
    avatar: '🇬🇧',
    level: 'A1',
    likes: 24,
    comments: 8,
    isPinned: true,
    isLiked: false,
    tags: ['greetings', 'beginner'],
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    replies: [
      { id: 'r1', author: 'Dawit T.', avatar: '🇪🇹', level: 'Native', body: 'Great question! ሰላም (selam) means "hello/peace" — you can use it any time. It is the most common informal greeting. ቴዎ is not standard — you might be thinking of ቴዎ as a name. The formal greeting is ጤና ይስጥልኝ (ṭena yisṭilliñ) which means "May God give you health."', likes: 12, created_at: new Date(Date.now() - 3600000).toISOString() },
      { id: 'r2', author: 'Sara M.', avatar: '🇺🇸', level: 'A2', body: 'Adding to that — I learned that in Addis Ababa people also say እንደምን አደርክ (indemen aderk) for "how are you (masculine)" or እንደምን አደርሽ for feminine. It helped me a lot once I understood the gender distinction!', likes: 7, created_at: new Date(Date.now() - 1800000).toISOString() },
    ]
  },
  {
    id: 'seed-2',
    category: 'grammar',
    title: 'How do verb endings change for masculine vs feminine?',
    body: 'I notice that Amharic changes verb endings based on who you\'re speaking to. Can someone give me a simple breakdown? The lesson mentions -ክ and -ሽ but I get confused.',
    author: 'James K.',
    avatar: '🇦🇺',
    level: 'A1',
    likes: 31,
    comments: 5,
    isPinned: false,
    isLiked: false,
    tags: ['grammar', 'verbs'],
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    replies: [
      { id: 'r3', author: 'Hanna B.', avatar: '🇪🇹', level: 'Native', body: 'Simple rule:\n• Speaking to a man → use -ክ (e.g. ደህና ነህ? = Are you well, man?)\n• Speaking to a woman → use -ሽ (e.g. ደህና ነሽ? = Are you well, woman?)\n• Speaking to a group → use -ን (plural)\n\nAmharic has grammatical gender for 2nd person pronouns which affects verbs, adjectives, and even commands. Once you get this pattern everything clicks!', likes: 19, created_at: new Date(Date.now() - 3600000 * 7).toISOString() },
    ]
  },
  {
    id: 'seed-3',
    category: 'culture',
    title: 'The Ethiopian coffee ceremony — what Amharic phrases should I know?',
    body: 'I\'m travelling to Addis next month and want to be respectful during a coffee ceremony. What should I say and what is the cultural etiquette? Any Amharic phrases specifically for this would be amazing.',
    author: 'Priya N.',
    avatar: '🇮🇳',
    level: 'A1',
    likes: 47,
    comments: 11,
    isPinned: true,
    isLiked: false,
    tags: ['culture', 'travel', 'coffee'],
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    replies: [
      { id: 'r4', author: 'Tigist A.', avatar: '🇪🇹', level: 'Native', body: 'The coffee ceremony (ቡና ቤት) is so special — I\'m glad you asked! Key phrases:\n\n• ቡና ጠጣ (buna ṭeṭa) — "Drink coffee"\n• አመሰግናለሁ (ameseginallehu) — "Thank you" (very important!)\n• ጥሩ ቡና ነው (ṭiru buna new) — "It is good coffee"\n• ሁለት ጽዋ (hulet ṭswa) — "Two cups" (drink at least 3 rounds — refusing early is rude!)\n\nThe ceremony has 3 rounds: Abol (first), Tona (second), Baraka (blessing). Always accept at least the first!', likes: 33, created_at: new Date(Date.now() - 3600000 * 23).toISOString() },
      { id: 'r5', author: 'Michael S.', avatar: '🇬🇧', level: 'A2', body: 'I visited last year — this guide was so useful. I\'d add: bring small gifts (ሽልማት / shilmat) if invited to a home ceremony. Even something small shows respect. The incense (ዕጣን / iṭan) is also part of the ritual so don\'t be surprised!', likes: 14, created_at: new Date(Date.now() - 3600000 * 22).toISOString() },
    ]
  },
  {
    id: 'seed-4',
    category: 'vocabulary',
    title: 'What are the numbers 1-20 in Amharic? Easy memory tricks?',
    body: 'I\'m struggling to remember the numbers especially 11-20. Does anyone have good mnemonics or tricks? The Ge\'ez script makes it harder to remember than Latin numerals.',
    author: 'Aiko T.',
    avatar: '🇯🇵',
    level: 'A1',
    likes: 22,
    comments: 4,
    isLiked: false,
    tags: ['numbers', 'vocabulary', 'beginner'],
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    replies: [
      { id: 'r6', author: 'Yonas G.', avatar: '🇪🇹', level: 'Native', body: 'Numbers 1-10:\n1=አንድ (and), 2=ሁለት (hulet), 3=ሶስት (sost), 4=አራት (arat), 5=አምስት (amst)\n6=ስድስት (sidst), 7=ሰባት (sebat), 8=ስምንት (simint), 9=ዘጠኝ (zeṭeñ), 10=አስር (asir)\n\nFor 11-19: say "asir" + number (like English teen). 11=አስራ አንድ, 12=አስራ ሁለት, etc.\n20=ሃያ (haya), 30=ሰላሳ (selasa), 100=መቶ (meto)\n\nTrick: "hulet" sounds like "bullet" (2 bullets), "sost" like "toast" (3 slices), "arat" like "erratic" (4 letters!)', likes: 16, created_at: new Date(Date.now() - 3600000 * 47).toISOString() },
    ]
  },
  {
    id: 'seed-5',
    category: 'listening',
    title: 'Best Ethiopian music/movies to improve Amharic listening skills?',
    body: 'I learn best by listening. Are there any Amharic songs, movies, YouTube channels or podcasts that are good for learners? Preferably with subtitles if possible.',
    author: 'Carlos R.',
    avatar: '🇧🇷',
    level: 'A2',
    likes: 58,
    comments: 14,
    isPinned: false,
    isLiked: false,
    tags: ['listening', 'media', 'culture'],
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    replies: [
      { id: 'r7', author: 'Liya F.', avatar: '🇪🇹', level: 'Native', body: 'Great resources!\n\n🎵 Music: Teddy Afro (his songs are poetic and full of culture), Aster Aweke (classic), Mahmoud Ahmed\n\n🎬 Movies: "Lamb" (2015, Ethiopian/Norwegian, some Amharic), EBC (Ethiopian Broadcasting Corp) on YouTube\n\n📺 YouTube: "Amharic with Feven" channel is great for learners, also "LearnAmharic247"\n\n📻 Podcasts: VOA Amharic Service is free and has news in clear Amharic — good for B1+\n\nStart with Teddy Afro — his pronunciation is very clear!', likes: 41, created_at: new Date(Date.now() - 3600000 * 71).toISOString() },
    ]
  },
  {
    id: 'seed-6',
    category: 'general',
    title: '🎉 30-day streak achieved! Tips from my learning journey',
    body: 'Just hit 30 days on Amharican! I started knowing literally zero Amharic and now I can have basic greetings and understand simple sentences. Here\'s what worked for me: 10 min daily sessions (non-negotiable), shadowing the audio immediately, and using the AI chat to practice in between lessons. The key was consistency not duration. Ask me anything!',
    author: 'Sam W.',
    avatar: '🇺🇸',
    level: 'A2',
    likes: 74,
    comments: 19,
    isPinned: false,
    isLiked: false,
    tags: ['motivation', 'tips', 'streak'],
    created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
    replies: [
      { id: 'r8', author: 'Fatima A.', avatar: '🇳🇬', level: 'A1', body: 'This is so motivating! I\'m on day 12 and already feeling like giving up. How did you handle the days when you just didn\'t feel like studying?', likes: 8, created_at: new Date(Date.now() - 3600000 * 90).toISOString() },
      { id: 'r9', author: 'Sam W.', avatar: '🇺🇸', level: 'A2', body: 'I set an absolute minimum of just OPENING the app. Even 2 minutes counts toward the streak. On bad days I\'d just do one exercise and call it done. More often than not I ended up doing more once I started. Don\'t break the chain!', likes: 22, created_at: new Date(Date.now() - 3600000 * 89).toISOString() },
    ]
  },
]

// ── Helpers ────────────────────────────────────────────────────
const timeAgo = (iso) => {
  const d = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (d < 60)   return 'just now'
  if (d < 3600) return `${Math.floor(d/60)}m ago`
  if (d < 86400) return `${Math.floor(d/3600)}h ago`
  return `${Math.floor(d/86400)}d ago`
}

const catInfo = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[0]

// ── New Post Modal ─────────────────────────────────────────────
function NewPostModal({ onClose, onSubmit, saving }) {
  const [title,    setTitle]    = useState('')
  const [body,     setBody]     = useState('')
  const [category, setCategory] = useState('question')

  const canSubmit = title.trim().length > 5 && body.trim().length > 10

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-float w-full max-w-lg max-h-[90vh] overflow-y-auto animate-rise">
        <div className="sticky top-0 bg-white rounded-t-3xl flex items-center justify-between px-6 py-5 border-b border-stone-100 z-10">
          <h3 className="font-bold text-[17px] text-stone-900">Ask the Community</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-[12px] font-semibold text-stone-500 uppercase tracking-widest mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                <button key={cat.id} onClick={() => setCategory(cat.id)}
                  className={clsx('px-3 py-1.5 rounded-xl text-[13px] font-semibold transition-all',
                    category === cat.id ? 'bg-brand-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  )}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[12px] font-semibold text-stone-500 uppercase tracking-widest mb-2">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="input text-[15px]"
              placeholder="Ask your question or share something…" maxLength={140} />
            <p className="text-[11px] text-stone-300 mt-1 text-right">{title.length}/140</p>
          </div>

          {/* Body */}
          <div>
            <label className="block text-[12px] font-semibold text-stone-500 uppercase tracking-widest mb-2">Details *</label>
            <textarea value={body} onChange={e => setBody(e.target.value)}
              className="input resize-none text-[14px] leading-relaxed"
              rows={5}
              placeholder="Provide context, examples, or your specific question. The more detail you give, the better answers you'll get." />
          </div>

          <div className="bg-brand-50 rounded-2xl px-4 py-3 flex items-start gap-2">
            <Sparkles size={14} className="text-brand-500 shrink-0 mt-0.5" />
            <p className="text-[12px] text-brand-700">Include Amharic script examples if you can — it helps native speakers understand your question better.</p>
          </div>

          <button onClick={() => canSubmit && onSubmit({ title, body, category })}
            disabled={!canSubmit || saving}
            className="btn-primary w-full flex items-center justify-center gap-2">
            {saving
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><Send size={15} /> Post to Community</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Post card ─────────────────────────────────────────────────
function PostCard({ post, onLike, onOpen, isOpen, onReply, replyText, setReplyText, replySaving, onDelete, currentUserId }) {
  const cat = catInfo(post.category)

  return (
    <div className={clsx('bg-white rounded-3xl border transition-all duration-200',
      isOpen ? 'border-brand-200 shadow-lifted' : 'border-stone-100 shadow-card hover:shadow-lifted hover:-translate-y-0.5'
    )}>
      {/* Post header */}
      <div className="p-5 pb-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          {post.author_profile?.avatar_url || post.avatar_url ? (
            <img
              src={post.author_profile?.avatar_url || post.avatar_url}
              alt={post.author}
              className="w-9 h-9 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm font-bold shrink-0">
              {(post.author || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[13px] font-semibold text-stone-800">{post.author}</span>
              <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full', post.level === 'Native' ? 'bg-green-50 text-green-600' : 'bg-brand-50 text-brand-600')}>
                {post.level}
              </span>
              {post.isPinned && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  <Pin size={9} /> Pinned
                </span>
              )}
              <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full', cat.color)}>{cat.label}</span>
            </div>
            <p className="text-[11px] text-stone-400">{timeAgo(post.created_at)}</p>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-[15px] text-stone-900 mt-3 mb-2 leading-snug">{post.title}</h3>

        {/* Body preview */}
        <p className={clsx('text-[13px] text-stone-500 leading-relaxed', isOpen ? '' : 'line-clamp-3')}>
          {post.body}
        </p>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags.map(t => (
              <span key={t} className="text-[11px] text-stone-400 bg-stone-50 px-2.5 py-1 rounded-full border border-stone-100">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions bar */}
      <div className="flex items-center gap-1 px-5 py-3 border-t border-stone-50">
        <button onClick={() => onLike(post.id)}
          className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-semibold transition-all',
            post.isLiked ? 'bg-red-50 text-red-500' : 'text-stone-400 hover:bg-stone-50 hover:text-red-400'
          )}>
          <Heart size={14} fill={post.isLiked ? 'currentColor' : 'none'} /> {post.likes}
        </button>
        <button onClick={() => onOpen(post.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-semibold text-stone-400 hover:bg-stone-50 hover:text-brand-500 transition-all">
          <MessageSquare size={14} /> {post.replies?.length || post.comments || 0} {isOpen ? 'Hide' : 'Replies'}
          {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        <div className="flex-1" />
        {onDelete && !post.id.startsWith('seed-') && (
          <button onClick={() => onDelete(post.id)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-stone-200 hover:text-red-400 hover:bg-red-50 transition-all text-[12px]"
            title="Delete post">
            <X size={13} />
          </button>
        )}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-stone-300 hover:text-stone-500 hover:bg-stone-50 transition-all text-[13px]">
          <Share2 size={14} />
        </button>
      </div>

      {/* Replies section */}
      {isOpen && (
        <div className="border-t border-stone-100 animate-rise">
          {/* Existing replies */}
          {post.replies?.map((reply, i) => (
            <div key={reply.id} className={clsx('px-5 py-4', i < post.replies.length - 1 && 'border-b border-stone-50')}>
              <div className="flex items-start gap-3">
                {reply.author_profile?.avatar_url || reply.avatar_url ? (
                  <img
                    src={reply.author_profile?.avatar_url || reply.avatar_url}
                    alt={reply.author}
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {(reply.author || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-semibold text-stone-800">{reply.author}</span>
                    <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded-full', reply.level === 'Native' ? 'bg-green-50 text-green-600' : 'bg-stone-100 text-stone-500')}>
                      {reply.level}
                    </span>
                    <span className="text-[11px] text-stone-400">{timeAgo(reply.created_at)}</span>
                  </div>
                  <p className="text-[13px] text-stone-600 leading-relaxed whitespace-pre-line">{reply.body}</p>
                  <button className="flex items-center gap-1 mt-2 text-[12px] text-stone-400 hover:text-red-400 transition-colors">
                    <Heart size={12} /> {reply.likes}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Reply input */}
          <div className="px-5 py-4 bg-stone-50/50">
            <div className="flex gap-2 items-end">
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                rows={2}
                className="input resize-none text-[13px] flex-1"
                placeholder="Add your reply… (include Amharic examples if helpful)" />
              <button onClick={() => onReply(post.id)}
                disabled={!replyText.trim() || replySaving}
                className="btn-primary p-3 rounded-2xl shrink-0">
                {replySaving
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Send size={15} />
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function Community() {
  const { user, profile } = useAuthStore()

  const [posts,        setPosts]        = useState(SEED_POSTS)
  const [loading,      setLoading]      = useState(true)
  const [category,     setCategory]     = useState('all')
  const [sort,         setSort]         = useState('trending')
  const [search,       setSearch]       = useState('')
  const [openPost,     setOpenPost]     = useState(null)
  const [showNew,      setShowNew]      = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [replySaving,  setReplySaving]  = useState(false)
  const [replyTexts,   setReplyTexts]   = useState({})

  // ── Fetch posts from Supabase ─────────────────────────────
  const fetchPosts = useCallback(async () => {
    try {
      // Step 1: fetch posts (no join — avoid FK ambiguity issues)
      const { data: rows, error } = await supabase
        .from('community_posts')
        .select('id, user_id, category, title, body, tags, is_pinned, likes_count, replies_count, created_at')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('[Community] fetchPosts error:', error)
        throw error
      }

      console.log('[Community] fetched rows:', rows?.length)

      if (!rows || rows.length === 0) {
        // No DB posts yet — show seed posts as content
        setPosts(SEED_POSTS)
        setLoading(false)
        return
      }

      // Step 2: fetch user profiles for all post authors
      const authorIds = [...new Set(rows.map(r => r.user_id).filter(Boolean))]
      const { data: profiles } = authorIds.length > 0
        ? await supabase
            .from('users')
            .select('id, name, avatar_url, level')
            .in('id', authorIds)
        : { data: [] }

      const profileMap = {}
      ;(profiles || []).forEach(p => { profileMap[p.id] = p })

      // Step 3: fetch replies
      const postIds = rows.map(r => r.id)
      const { data: replyRows } = await supabase
        .from('community_replies')
        .select('id, post_id, user_id, body, likes_count, created_at')
        .in('post_id', postIds)
        .order('created_at', { ascending: true })

      // Step 4: fetch reply author profiles
      const replyAuthorIds = [...new Set((replyRows || []).map(r => r.user_id).filter(Boolean))]
      const newAuthorIds = replyAuthorIds.filter(id => !profileMap[id])
      if (newAuthorIds.length > 0) {
        const { data: replyProfiles } = await supabase
          .from('users')
          .select('id, name, avatar_url, level')
          .in('id', newAuthorIds)
        ;(replyProfiles || []).forEach(p => { profileMap[p.id] = p })
      }

      // Step 5: fetch which posts this user has liked
      let likedIds = new Set()
      if (user) {
        const { data: likeRows } = await supabase
          .from('community_likes')
          .select('post_id')
          .eq('user_id', user.id)
        likedIds = new Set((likeRows || []).map(l => l.post_id))
      }

      // Step 6: group replies by post
      const repliesByPost = {}
      ;(replyRows || []).forEach(r => {
        if (!repliesByPost[r.post_id]) repliesByPost[r.post_id] = []
        repliesByPost[r.post_id].push(r)
      })

      // Step 7: shape everything — attach profiles manually
      const shaped = rows.map(row => {
        const authorProfile = profileMap[row.user_id]
        const replies = (repliesByPost[row.id] || []).map(r => {
          const rp = profileMap[r.user_id]
          return {
            id:         r.id,
            author:     rp?.name || 'Community Member',
            avatar_url: rp?.avatar_url || null,
            avatar:     rp?.avatar_url || '👤',
            level:      rp?.level || 'A1',
            body:       r.body,
            likes:      r.likes_count ?? 0,
            created_at: r.created_at,
          }
        })
        return {
          id:         row.id,
          category:   row.category,
          title:      row.title,
          body:       row.body,
          author:     authorProfile?.name || 'Community Member',
          avatar_url: authorProfile?.avatar_url || null,
          avatar:     authorProfile?.avatar_url || '👤',
          level:      authorProfile?.level || 'A1',
          likes:      row.likes_count ?? 0,
          comments:   row.replies_count ?? replies.length,
          isPinned:   row.is_pinned || false,
          isLiked:    likedIds.has(row.id),
          tags:       row.tags || [],
          created_at: row.created_at,
          replies,
        }
      })

      console.log('[Community] shaped posts:', shaped.length)
      // Show DB posts only — no seed posts mixed in once there's real data
      setPosts(shaped)
    } catch (err) {
      console.error('[Community] fetch failed, using seed posts:', err)
      setPosts(SEED_POSTS)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  // ── Filter + sort ─────────────────────────────────────────
  const filtered = posts
    .filter(p => {
      const matchCat = category === 'all' || p.category === category
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.body.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
    .sort((a, b) => {
      if (sort === 'newest')   return new Date(b.created_at) - new Date(a.created_at)
      if (sort === 'top')      return b.likes - a.likes
      const score = p => (p.likes * 2 + (p.replies?.length || 0)) + (p.isPinned ? 1000 : 0)
      return score(b) - score(a)
    })

  // ── Like / unlike ─────────────────────────────────────────
  const handleLike = async (postId) => {
    if (!user) return
    const post = posts.find(p => p.id === postId)
    if (!post || post.id.startsWith('seed-')) {
      // Seed post — local only
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked } : p
      ))
      return
    }
    // Optimistic update
    const wasLiked = post.isLiked
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, likes: wasLiked ? p.likes - 1 : p.likes + 1, isLiked: !wasLiked } : p
    ))
    if (wasLiked) {
      await supabase.from('community_likes').delete().eq('user_id', user.id).eq('post_id', postId)
      await supabase.from('community_posts').update({ likes_count: Math.max(0, (post.likes - 1)) }).eq('id', postId)
    } else {
      await supabase.from('community_likes').upsert({ user_id: user.id, post_id: postId }, { onConflict: 'user_id,post_id' })
      await supabase.from('community_posts').update({ likes_count: post.likes + 1 }).eq('id', postId)
    }
  }

  const handleOpen = (postId) => {
    setOpenPost(prev => prev === postId ? null : postId)
  }

  // ── Create post ───────────────────────────────────────────
  const handleNewPost = async ({ title, body, category }) => {
    setSaving(true)
    if (!user) {
      // Not logged in — local only
      const newPost = { id: `post-${Date.now()}`, category, title, body, author: profile?.name || 'You', avatar: '👤', level: profile?.level || 'A1', likes: 0, comments: 0, isLiked: false, tags: [], created_at: new Date().toISOString(), replies: [] }
      setPosts(prev => [newPost, ...prev])
      setSaving(false)
      setShowNew(false)
      setOpenPost(newPost.id)
      return
    }
    // Step 1: insert
    const { data: inserted, error: insertErr } = await supabase
      .from('community_posts')
      .insert({ user_id: user.id, category, title, body, tags: [], likes_count: 0, replies_count: 0 })
      .select('id')
      .single()

    if (insertErr || !inserted) {
      console.error('[Community] Insert failed:', insertErr)
      // Fallback: show locally so the user sees it immediately
      const newPost = { id: `post-${Date.now()}`, category, title, body, author: profile?.name || 'You', avatar: '👤', level: profile?.level || 'A1', likes: 0, comments: 0, isLiked: false, tags: [], created_at: new Date().toISOString(), replies: [] }
      setPosts(prev => [newPost, ...prev])
      setSaving(false)
      setShowNew(false)
      setOpenPost(newPost.id)
      return
    }

    // Step 2: fetch the full row with user join
    const { data: full, error: fetchErr } = await supabase
      .from('community_posts')
      .select(`id, category, title, body, tags, is_pinned, likes_count, replies_count, created_at, users ( name, avatar_url, level )`)
      .eq('id', inserted.id)
      .single()

    if (full && !fetchErr) {
      const newPost = {
        id:         full.id,
        category:   full.category,
        title:      full.title,
        body:       full.body,
        author:     profile?.name || 'Community Member',
        avatar:     profile?.avatar_url || '👤',
        level:      profile?.level || 'A1',
        likes:      full.likes_count ?? 0,
        comments:   full.replies_count ?? 0,
        isPinned:   full.is_pinned || false,
        isLiked:    false,
        tags:       full.tags || [],
        created_at: full.created_at,
        replies:    [],
      }
      setPosts(prev => [newPost, ...prev])
      setOpenPost(newPost.id)
    } else {
      // Still show something locally
      const newPost = { id: inserted.id, category, title, body, author: profile?.name || 'You', avatar: '👤', level: profile?.level || 'A1', likes: 0, comments: 0, isLiked: false, tags: [], created_at: new Date().toISOString(), replies: [] }
      setPosts(prev => [newPost, ...prev])
      setOpenPost(inserted.id)
    }
    setSaving(false)
    setShowNew(false)
  }

  // ── Delete post ───────────────────────────────────────────
  const handleDeletePost = async (postId) => {
    if (!user || postId.startsWith('seed-')) return
    await supabase.from('community_posts').delete().eq('id', postId).eq('user_id', user.id)
    setPosts(prev => prev.filter(p => p.id !== postId))
    setOpenPost(null)
  }

  // ── Reply ─────────────────────────────────────────────────
  const handleReply = async (postId) => {
    const text = (replyTexts[postId] || '').trim()
    if (!text) return
    setReplySaving(true)

    if (!user || postId.startsWith('seed-')) {
      // Local only
      const newReply = { id: `reply-${Date.now()}`, author: profile?.name || 'You', avatar_url: profile?.avatar_url || null, avatar: profile?.avatar_url || '👤', level: profile?.level || 'A1', body: text, likes: 0, created_at: new Date().toISOString() }
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, replies: [...(p.replies || []), newReply], comments: (p.comments || 0) + 1 } : p
      ))
      setReplyTexts(prev => ({ ...prev, [postId]: '' }))
      setReplySaving(false)
      return
    }

    const { data: inserted, error: insertErr } = await supabase
      .from('community_replies')
      .insert({ post_id: postId, user_id: user.id, body: text, likes_count: 0 })
      .select('id')
      .single()

    if (insertErr || !inserted) {
      console.error('[Community] Reply insert failed:', insertErr)
      // Show locally
      const newReply = { id: `reply-${Date.now()}`, author: profile?.name || 'You', avatar_url: profile?.avatar_url || null, avatar: profile?.avatar_url || '👤', level: profile?.level || 'A1', body: text, likes: 0, created_at: new Date().toISOString() }
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, replies: [...(p.replies || []), newReply], comments: (p.comments || 0) + 1 } : p
      ))
      setReplyTexts(prev => ({ ...prev, [postId]: '' }))
      setReplySaving(false)
      return
    }

    // Fetch full reply — no join needed, we know the user
    const newReply = {
      id:         inserted.id,
      author:     profile?.name || 'Community Member',
      avatar:     profile?.avatar_url || '👤',
      level:      profile?.level || 'A1',
      body:       text,
      likes:      0,
      created_at: new Date().toISOString(),
    }
    const post = posts.find(p => p.id === postId)
    if (post) {
      await supabase.from('community_posts')
        .update({ replies_count: (post.comments || 0) + 1 })
        .eq('id', postId)
    }
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, replies: [...(p.replies || []), newReply], comments: (p.comments || 0) + 1 } : p
    ))
    setReplyTexts(prev => ({ ...prev, [postId]: '' }))
    setReplySaving(false)
  }

  const totalPosts    = posts.filter(p => !p.id.startsWith('seed-')).length
  const totalMembers  = 1247
  const totalReplies  = posts.reduce((n, p) => n + (p.replies?.length || 0), 0)

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-7">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-6">
          <div className="flex-1">
            <h1 className="text-[24px] font-bold text-stone-900 tracking-tight">Community</h1>
            <p className="text-[13px] text-stone-400 mt-0.5">Ask anything. Help everyone. Learn together.</p>
          </div>
          <button onClick={() => setShowNew(true)}
            className="btn-primary flex items-center gap-1.5 px-4 py-2.5 text-[13px] self-start shrink-0">
            <Plus size={15} /> New Post
          </button>
        </div>

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: '👥', label: 'Members',     val: totalMembers.toLocaleString() },
            { icon: '💬', label: 'Discussions',  val: totalPosts },
            { icon: '✅', label: 'Replies',      val: totalReplies },
          ].map(({ icon, label, val }) => (
            <div key={label} className="bg-white rounded-2xl border border-stone-100 p-4 text-center">
              <p className="text-xl mb-1">{icon}</p>
              <p className="text-[18px] font-bold text-stone-900 leading-none">{val}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Search ── */}
        <div className="relative mb-4">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search discussions…"
            className="input pl-10 text-[14px]" />
        </div>

        {/* ── Category filter ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon
            return (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className={clsx('flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold shrink-0 transition-all',
                  category === cat.id ? 'bg-brand-500 text-white shadow-sm' : 'bg-white border border-stone-100 text-stone-500 hover:border-brand-200 hover:text-brand-600'
                )}>
                <Icon size={12} /> {cat.label}
              </button>
            )
          })}
        </div>

        {/* ── Sort ── */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[12px] text-stone-400 font-medium shrink-0">Sort by:</span>
          {SORT_OPTIONS.map(opt => {
            const Icon = opt.icon
            return (
              <button key={opt.id} onClick={() => setSort(opt.id)}
                className={clsx('flex items-center gap-1 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all',
                  sort === opt.id ? 'bg-brand-50 text-brand-600 border border-brand-100' : 'text-stone-400 hover:text-stone-700'
                )}>
                <Icon size={12} /> {opt.label}
              </button>
            )
          })}
        </div>

        {/* ── Posts ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-[13px] text-stone-400">Loading discussions…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-100 p-10 text-center">
            <MessageSquare size={32} className="text-stone-200 mx-auto mb-3" strokeWidth={1.5} />
            <p className="font-semibold text-stone-500">No discussions yet</p>
            <p className="text-[13px] text-stone-400 mt-1">Be the first to start a conversation!</p>
            <button onClick={() => setShowNew(true)} className="btn-primary mt-4 text-sm">
              Ask the Community
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onOpen={handleOpen}
                isOpen={openPost === post.id}
                onReply={handleReply}
                replyText={replyTexts[post.id] || ''}
                setReplyText={t => setReplyTexts(prev => ({ ...prev, [post.id]: t }))}
                replySaving={replySaving}
                onDelete={handleDeletePost}
                currentUserId={user?.id}
              />
            ))}
          </div>
        )}

        {/* ── Community rules callout ── */}
        <div className="mt-8 bg-brand-50 border border-brand-100 rounded-2xl p-5">
          <p className="font-bold text-[14px] text-brand-800 mb-2 flex items-center gap-2">
            <Award size={15} /> Community Guidelines
          </p>
          <ul className="space-y-1 text-[12px] text-brand-700">
            <li>✦ Be kind and encouraging — everyone is at a different stage</li>
            <li>✦ Include Amharic script in examples whenever possible</li>
            <li>✦ Credit native speakers and cite your sources</li>
            <li>✦ Search before posting — your question may already be answered</li>
          </ul>
        </div>

        <div className="h-6" />
      </div>

      {showNew && (
        <NewPostModal
          onClose={() => setShowNew(false)}
          onSubmit={handleNewPost}
          saving={saving}
        />
      )}
    </AppLayout>
  )
}
