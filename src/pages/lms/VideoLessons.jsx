import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import AppLayout   from '@/components/layout/AppLayout'
import { Play, X, Video, ChevronRight, ArrowLeft, BookOpen, List } from 'lucide-react'
import clsx from 'clsx'

const LEVELS = ['All', 'A1', 'A2', 'B1', 'B2', 'C1']

function getYouTubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

function resolveVideo(url) {
  if (!url) return { type: 'unknown', src: '', ytId: null }
  const ytId = getYouTubeId(url)
  if (ytId) return { type: 'iframe', src: `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`, ytId }
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`, ytId: null }
  const gdrive = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  if (gdrive) return { type: 'iframe', src: `https://drive.google.com/file/d/${gdrive[1]}/preview`, ytId: null }
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)) return { type: 'video', src: url, ytId: null }
  return { type: 'iframe', src: url, ytId: null }
}

function VideoThumbnail({ video, className }) {
  const ytId = getYouTubeId(video.video_url)
  const thumb = video.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null)
  return thumb ? (
    <img src={thumb} alt={video.title_en} className={clsx('object-cover', className)} />
  ) : (
    <div className={clsx('flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200', className)}>
      <Video size={22} className="text-brand-400" />
    </div>
  )
}

function SidebarItem({ video, isActive, onClick, index }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex gap-3 p-2.5 rounded-xl text-left transition-all group',
        isActive ? 'bg-brand-50/20 border border-brand-400/40' : 'hover:bg-white/5 border border-transparent'
      )}
    >
      <div className="relative shrink-0 rounded-lg overflow-hidden" style={{ width: 100, height: 56 }}>
        <VideoThumbnail video={video} className="w-full h-full" />
        {isActive ? (
          <div className="absolute inset-0 bg-brand-500/40 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
              <Play size={10} className="text-brand-600 ml-0.5" fill="currentColor" />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center transition-opacity">
              <Play size={11} className="text-stone-700 ml-0.5" fill="currentColor" />
            </div>
          </div>
        )}
        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1 rounded">
          {video.level}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={clsx(
          'text-[12px] font-semibold leading-snug line-clamp-2',
          isActive ? 'text-brand-300' : 'text-white/80 group-hover:text-white'
        )}>
          {index !== undefined && <span className="text-white/30 mr-1">{index + 1}.</span>}
          {video.title_en}
        </p>
        {video.title_am && <p className="text-[11px] text-white/40 mt-0.5 truncate">{video.title_am}</p>}
      </div>
    </button>
  )
}

function VideoPlayerView({ video, allVideos, onSelect, onClose }) {
  const { type, src } = resolveVideo(video.video_url)
  const videoRef = useRef(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const related = [
    ...allVideos.filter(v => v.id !== video.id && v.level === video.level),
    ...allVideos.filter(v => v.id !== video.id && v.level !== video.level),
  ]

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-[#0f0f0f] z-50 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 shrink-0">
        <button onClick={onClose} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-[13px] font-medium">
          <ArrowLeft size={16} /> Back to Videos
        </button>
        <div className="flex-1" />
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all',
            sidebarOpen ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/10'
          )}
        >
          <List size={14} />
          <span className="hidden sm:inline ml-1">Playlist ({allVideos.length})</span>
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Player + info */}
        <div className="flex-1 overflow-y-auto">
          {/* Video embed */}
          <div className="bg-black w-full" style={{ aspectRatio: '16/9', maxHeight: '65vh' }}>
            {type === 'iframe' ? (
              <iframe
                key={src}
                src={src}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                title={video.title_en}
                frameBorder="0"
              />
            ) : type === 'video' ? (
              <video ref={videoRef} src={src} controls autoPlay className="w-full h-full" style={{ background: '#000' }}>
                Your browser does not support this video.
              </video>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
                Unable to play.{' '}
                <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="ml-2 underline text-brand-400">Open link</a>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="px-5 py-5">
            <div className="flex items-start gap-3 mb-2">
              <span className="px-2.5 py-1 bg-brand-600 text-white text-[11px] font-bold rounded-full shrink-0">{video.level}</span>
              <h2 className="text-white font-bold text-[18px] leading-snug">{video.title_en}</h2>
            </div>
            {video.title_am && <p className="text-white/50 text-[14px] mb-3">{video.title_am}</p>}
            {video.description_en && (
              <p className="text-white/60 text-[13px] leading-relaxed border-t border-white/10 pt-3 mt-2">
                {video.description_en}
              </p>
            )}

            {/* Up next on mobile */}
            {related.length > 0 && (
              <div className="mt-6 lg:hidden">
                <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest mb-3">Up Next</p>
                <div className="space-y-1">
                  {related.slice(0, 5).map((v, i) => (
                    <SidebarItem key={v.id} video={v} isActive={false} onClick={() => onSelect(v)} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="hidden lg:flex flex-col w-[340px] border-l border-white/10 overflow-hidden shrink-0">
            <div className="px-4 py-3 border-b border-white/10 shrink-0">
              <p className="text-white/80 text-[13px] font-bold flex items-center gap-2">
                <BookOpen size={13} className="text-brand-400" />
                Playlist — {allVideos.length} video{allVideos.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest px-2 py-1.5">Now Playing</p>
              <SidebarItem video={video} isActive={true} onClick={() => {}} />

              {related.length > 0 && (
                <>
                  <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest px-2 pt-3 pb-1.5">Up Next</p>
                  {related.map((v, i) => (
                    <SidebarItem key={v.id} video={v} isActive={false} onClick={() => onSelect(v)} index={i} />
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function VideoCard({ video, onClick }) {
  const ytId = getYouTubeId(video.video_url)
  const thumb = video.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null)
  return (
    <button onClick={onClick} className="group text-left bg-white rounded-2xl border border-stone-100 overflow-hidden hover:border-brand-200 hover:shadow-md transition-all duration-200 active:scale-[0.98]">
      <div className="relative bg-stone-100 overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {thumb ? (
          <img src={thumb} alt={video.title_en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200">
            <Video size={28} className="text-brand-400" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Play size={18} className="text-brand-600 ml-0.5" fill="currentColor" />
          </div>
        </div>
        <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{video.level}</span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[14px] text-stone-800 leading-snug line-clamp-2">{video.title_en}</p>
            {video.title_am && <p className="text-[12px] text-stone-400 mt-0.5">{video.title_am}</p>}
            {video.description_en && <p className="text-[11px] text-stone-400 mt-1.5 leading-relaxed line-clamp-2">{video.description_en}</p>}
          </div>
          <ChevronRight size={14} className="text-stone-300 shrink-0 mt-0.5 group-hover:text-brand-400 transition-colors" />
        </div>
      </div>
    </button>
  )
}

export default function VideoLessons() {
  const [videos,      setVideos]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [activeVideo, setActiveVideo] = useState(null)
  const [levelFilter, setLevelFilter] = useState('All')

  useEffect(() => {
    supabase
      .from('video_lessons')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setVideos(data || []); setLoading(false) })
  }, [])

  const filtered = levelFilter === 'All' ? videos : videos.filter(v => v.level === levelFilter)

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-[26px] font-bold text-stone-900 tracking-tight">Video Lessons</h1>
          <p className="text-stone-400 text-sm mt-1">Learn Amharic through curated video lessons</p>
        </div>
        <div className="flex gap-2 mb-6 flex-wrap">
          {LEVELS.map(l => (
            <button key={l} onClick={() => setLevelFilter(l)}
              className={clsx('px-3 py-1.5 rounded-xl text-[13px] font-semibold transition-all',
                levelFilter === l ? 'bg-brand-500 text-white shadow-sm' : 'bg-white border border-stone-200 text-stone-500 hover:border-brand-300 hover:text-brand-600'
              )}>
              {l}
            </button>
          ))}
          {videos.length > 0 && (
            <span className="ml-auto text-[12px] text-stone-400 self-center">
              {filtered.length} video{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-[3px] border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <Video size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-[15px]">No video lessons yet</p>
            <p className="text-sm mt-1">Check back soon — your teachers are preparing content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(v => (
              <VideoCard key={v.id} video={v} onClick={() => setActiveVideo(v)} />
            ))}
          </div>
        )}
      </div>

      {activeVideo && (
        <VideoPlayerView
          video={activeVideo}
          allVideos={videos}
          onSelect={v => setActiveVideo(v)}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </AppLayout>
  )
}
