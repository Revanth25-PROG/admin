import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Bookmark,
  ExternalLink,
  Download,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Eye,
  BookOpen,
  Tag,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useStudyVerse } from '../../hooks/useStudyVerse';
import { ResourceItem, ExamTrack } from '../../types';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TrackBadge, Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';

export const ResourcesPage: React.FC = () => {
  const {
    resources,
    subjects,
    topics,
    saveResource,
    deleteResource,
    toggleBookmark,
    recordResourceOpened,
  } = useStudyVerse();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<'all' | ExamTrack>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  // Resource Viewer Modal
  const [viewingResource, setViewingResource] = useState<ResourceItem | null>(null);
  const [isLightReadingMode, setIsLightReadingMode] = useState(false);

  // Upload / Create Resource Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resType, setResType] = useState<ResourceItem['type']>('notes');
  const [resTrack, setResTrack] = useState<ExamTrack>('appsc-prelims');
  const [resSubjectId, setResSubjectId] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resContent, setResContent] = useState('');
  const [resTags, setResTags] = useState('');
  const [resLang, setResLang] = useState<'en' | 'te'>('en');
  const [resSourceUrl, setResSourceUrl] = useState('');
  const [resIsVerified, setResIsVerified] = useState(true);
  const [resFile, setResFile] = useState<File | null>(null);
  const [resFileDataUrl, setResFileDataUrl] = useState<string>('');
  const [resFileSize, setResFileSize] = useState<string>('');

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResFile(file);
    setResFileSize(formatBytes(file.size));
    if (!resTitle) {
      const clean = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setResTitle(clean.charAt(0).toUpperCase() + clean.slice(1));
    }
    const reader = new FileReader();
    reader.onload = () => {
      setResFileDataUrl(reader.result as string);
    };
    reader.onerror = () => {
      try {
        setResFileDataUrl(URL.createObjectURL(file));
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsDataURL(file);
  };

  // Filter resources
  const filteredResources = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTrack = selectedTrack === 'all' || r.track === selectedTrack;
    const matchesType = selectedType === 'all' || r.type === selectedType;
    const matchesSubject = selectedSubjectId === 'all' || r.subjectId === selectedSubjectId;
    const matchesBookmark = !bookmarkedOnly || r.isBookmarked;

    return matchesSearch && matchesTrack && matchesType && matchesSubject && matchesBookmark;
  });

  const handleOpenViewer = (res: ResourceItem) => {
    recordResourceOpened(res.id);
    setViewingResource(res);
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim()) return;

    const tagsArray = resTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newRes: ResourceItem = {
      id: `res-${Date.now()}`,
      title: resTitle.trim(),
      type: resType,
      track: resTrack,
      subjectId: resSubjectId || subjects.find((s) => s.track === resTrack)?.id,
      topicIds: [],
      description: resDesc.trim() || undefined,
      content: resContent.trim() || undefined,
      fileUrl: resFileDataUrl || resSourceUrl.trim() || undefined,
      fileName: resFile ? resFile.name : undefined,
      fileSize: resFileSize || undefined,
      fileSizeBytes: resFile ? resFile.size : undefined,
      tags: tagsArray,
      language: resLang,
      isVerified: resIsVerified,
      sourceUrl: resSourceUrl.trim() || undefined,
      isBookmarked: false,
      publicationDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    saveResource(newRes);
    setIsCreateModalOpen(false);
    setResTitle('');
    setResDesc('');
    setResContent('');
    setResTags('');
    setResSourceUrl('');
    setResFile(null);
    setResFileDataUrl('');
    setResFileSize('');
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete "${title}"?`)) {
      deleteResource(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Notes & PDF Resource Library
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Searchable repository of concept notes, PDFs, verified source references, and previous-year question papers.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Add Resource / Note
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-[#101726]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search size={14} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search keyword, tag, subject, title..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Track Filter */}
          <div>
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Exam Tracks</option>
              <option value="appsc-prelims">APPSC Prelims</option>
              <option value="appsc-mains">APPSC Mains</option>
              <option value="semester">B.Tech Semester</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Formats</option>
              <option value="pdf">PDF Document</option>
              <option value="notes">Personal Notes</option>
              <option value="pyq">Previous Year Paper</option>
              <option value="link">Web Reference Link</option>
            </select>
          </div>

          {/* Bookmark Toggle */}
          <div className="flex items-center">
            <button
              onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                bookmarkedOnly
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              <Bookmark size={14} className={bookmarkedOnly ? 'fill-amber-400' : ''} />
              <span>Bookmarked Only</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <EmptyState
          icon={<FileText size={28} />}
          title="No Resources Found"
          description="Try adjusting your search filters or add a new study document to your library."
          actionLabel="Add Resource"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((res) => {
            const subject = subjects.find((s) => s.id === res.subjectId);
            return (
              <div
                key={res.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <FileText size={16} />
                      </span>
                      <TrackBadge track={res.track} />
                    </div>

                    <button
                      onClick={() => toggleBookmark(res.id)}
                      className="text-slate-400 hover:text-amber-400 transition-colors p-1"
                      title={res.isBookmarked ? 'Remove Bookmark' : 'Bookmark Resource'}
                    >
                      <Bookmark
                        size={16}
                        className={res.isBookmarked ? 'text-amber-400 fill-amber-400' : ''}
                      />
                    </button>
                  </div>

                  <h3
                    onClick={() => handleOpenViewer(res)}
                    className="text-sm font-semibold text-slate-100 group-hover:text-blue-300 transition-colors cursor-pointer line-clamp-2"
                  >
                    {res.title}
                  </h3>

                  {res.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 mb-3">
                      {res.description}
                    </p>
                  )}

                  {/* Tags */}
                  {res.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {res.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                    <span className="font-medium text-slate-300">{res.type.toUpperCase()}</span>
                    <span>{res.language === 'te' ? 'Telugu' : 'English'}</span>
                    {res.isVerified ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle size={11} /> Verified
                      </span>
                    ) : (
                      <span className="text-slate-500">Unverified</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Eye size={13} />}
                      onClick={() => handleOpenViewer(res)}
                      className="text-xs px-2.5 py-1"
                    >
                      Read & Preview
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={13} className="text-rose-400" />}
                      onClick={() => handleDelete(res.id, res.title)}
                      className="p-1.5"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* In-App PDF & Notes Reader Modal */}
      <Modal
        isOpen={!!viewingResource}
        onClose={() => setViewingResource(null)}
        title={viewingResource?.title || 'Resource Viewer'}
        description={`${viewingResource?.type.toUpperCase()} • Language: ${
          viewingResource?.language === 'te' ? 'Telugu' : 'English'
        }`}
        maxWidth="4xl"
      >
        {viewingResource && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLightReadingMode(!isLightReadingMode)}
                  className="text-xs"
                >
                  {isLightReadingMode ? 'Dark Dashboard Mode' : 'Light Reading Mode'}
                </Button>
                {viewingResource.sourceUrl && (
                  <a
                    href={viewingResource.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:underline px-2 py-1"
                  >
                    <ExternalLink size={12} />
                    <span>Source Link</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleBookmark(viewingResource.id)}
                  className="flex items-center gap-1 text-slate-300 hover:text-amber-400 px-2 py-1"
                >
                  <Bookmark
                    size={14}
                    className={viewingResource.isBookmarked ? 'text-amber-400 fill-amber-400' : ''}
                  />
                  <span>Bookmark</span>
                </button>
              </div>
            </div>

            {/* Reading Container with Clean Light / Dark toggle or Embedded PDF */}
            {viewingResource.fileUrl ? (
              <div className="w-full h-[60vh] rounded-2xl overflow-hidden border border-slate-800 bg-white shadow-md">
                <iframe
                  src={viewingResource.fileUrl}
                  title={viewingResource.title}
                  className="w-full h-full border-0"
                />
              </div>
            ) : (
              <div
                className={`p-6 rounded-2xl border min-h-[400px] max-h-[60vh] overflow-y-auto leading-relaxed transition-colors ${
                  isLightReadingMode
                    ? 'bg-slate-50 text-slate-900 border-slate-300 font-serif'
                    : 'bg-slate-950 text-slate-200 border-slate-800 font-sans'
                }`}
              >
                {viewingResource.content ? (
                  <div className="whitespace-pre-wrap text-sm md:text-base space-y-4">
                    {viewingResource.content}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                    <FileText size={48} className="mb-3 opacity-40 text-blue-400" />
                    <p className="font-semibold text-base text-slate-300">
                      PDF / File Resource Attached
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      {viewingResource.fileName || 'Document loaded from storage.'}
                    </p>
                    {(viewingResource.sourceUrl || viewingResource.fileUrl) && (
                      <a
                        href={viewingResource.fileUrl || viewingResource.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        download={viewingResource.fileName || viewingResource.title}
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                      >
                        <Download size={14} /> Download Document
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Verification Footer */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>
                Tags: {viewingResource.tags.length > 0 ? viewingResource.tags.join(', ') : 'None'}
              </span>
              <span>
                {viewingResource.isVerified ? '✓ Verified Study Material' : 'Illustrative Study Material'}
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Add Resource / Note */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Notes or Resource"
        description="Add notes or register a PDF reference with tags and syllabus associations."
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateResource} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Resource Title *</label>
            <input
              type="text"
              required
              value={resTitle}
              onChange={(e) => setResTitle(e.target.value)}
              placeholder="e.g. APPSC Indian History Ch 2 Revision Notes or OS Banker Algorithm PDF"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Resource Type</label>
              <select
                value={resType}
                onChange={(e) => setResType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="notes">Personal Markdown Notes</option>
                <option value="pdf">PDF Document</option>
                <option value="pyq">Previous Year Paper</option>
                <option value="link">Web Reference Link</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Track</label>
              <select
                value={resTrack}
                onChange={(e) => setResTrack(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="appsc-prelims">APPSC Prelims</option>
                <option value="appsc-mains">APPSC Mains</option>
                <option value="semester">B.Tech Semester</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Language</label>
              <select
                value={resLang}
                onChange={(e) => setResLang(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="en">English</option>
                <option value="te">Telugu</option>
              </select>
            </div>
          </div>

          {resType === 'pdf' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Upload PDF File (.pdf)
              </label>
              <div className="p-4 border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-xl text-center">
                <input
                  type="file"
                  id="resources-pdf-input"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {resFile ? (
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-100 text-sm">{resFile.name}</p>
                    <p className="text-xs text-slate-400">{resFileSize}</p>
                    <label
                      htmlFor="resources-pdf-input"
                      className="inline-block mt-2 px-3 py-1 bg-slate-800 text-slate-300 hover:text-white rounded cursor-pointer text-xs"
                    >
                      Change File
                    </label>
                  </div>
                ) : (
                  <label htmlFor="resources-pdf-input" className="cursor-pointer block">
                    <p className="text-sm font-semibold text-slate-300">Click to select PDF document</p>
                    <p className="text-xs text-slate-500 mt-1">Supports local study PDFs, notifications, textbooks</p>
                  </label>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={resDesc}
              onChange={(e) => setResDesc(e.target.value)}
              placeholder="Brief summary of concepts covered..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Formatted Study Notes Content (Markdown Supported)
            </label>
            <textarea
              rows={6}
              value={resContent}
              onChange={(e) => setResContent(e.target.value)}
              placeholder="# Key Concepts&#10;- Important points...&#10;- Formulas and definitions..."
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={resTags}
                onChange={(e) => setResTags(e.target.value)}
                placeholder="e.g. History, Prelims, 1857, High Yield"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">External / Source URL</label>
              <input
                type="url"
                value={resSourceUrl}
                onChange={(e) => setResSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="verifiedResCheckbox"
              checked={resIsVerified}
              onChange={(e) => setResIsVerified(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="verifiedResCheckbox" className="text-xs text-slate-300 cursor-pointer">
              Mark as verified source material
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save to Library
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
