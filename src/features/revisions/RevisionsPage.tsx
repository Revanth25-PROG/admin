import React, { useState } from 'react';
import {
  RefreshCw,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Plus,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useStudyVerse } from '../../hooks/useStudyVerse';
import { RevisionItem, ExamTrack } from '../../types';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TrackBadge, Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';

export const RevisionsPage: React.FC = () => {
  const {
    revisions,
    subjects,
    topics,
    completeRevisionItem,
    saveRevisionItem,
    saveTask,
  } = useStudyVerse();

  const [activeTab, setActiveTab] = useState<'due' | 'all' | 'flashcards'>('due');
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Add Revision Item Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [revTitle, setRevTitle] = useState('');
  const [revTrack, setRevTrack] = useState<ExamTrack>('appsc-prelims');
  const [revSubjectId, setRevSubjectId] = useState('');
  const [revFacts, setRevFacts] = useState('');
  const [revDefs, setRevDefs] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const dueItems = revisions.filter(
    (r) => r.isDue || r.isOverdue || r.nextDueDate <= todayStr
  );
  const activeList = activeTab === 'due' ? dueItems : revisions;

  // Flashcards queue
  const flashcardsList = dueItems.length > 0 ? dueItems : revisions;
  const currentCard = flashcardsList[flashcardIndex];

  const handleNextCard = () => {
    setIsFlipped(false);
    setFlashcardIndex((prev) => (prev + 1) % flashcardsList.length);
  };

  const handleRateCard = (rating: 'easy' | 'good' | 'hard') => {
    if (!currentCard) return;
    completeRevisionItem(currentCard.id, rating);
    handleNextCard();
  };

  // Sync revision queue to study timetable
  const handleSyncToTimetable = () => {
    if (dueItems.length === 0) return;

    dueItems.forEach((rev) => {
      saveTask({
        id: `task-rev-sync-${Date.now()}-${rev.id}`,
        topicId: rev.topicId,
        subjectId: rev.subjectId,
        track: rev.track,
        title: `Spaced Revision: ${rev.title}`,
        date: todayStr,
        durationMinutes: 45,
        isRevision: true,
        revisionCycle: rev.repetitionStage,
        isCompleted: false,
        notes: `Synced from Revision Centre. Repetition Stage ${rev.repetitionStage}`,
      });
    });

    alert(`Successfully synced ${dueItems.length} revision sessions into today's timetable!`);
  };

  const handleAddRevisionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revTitle.trim()) return;

    const factsArr = revFacts
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const defsArr = revDefs
      .split('\n')
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    const newItem: RevisionItem = {
      id: `rev-${Date.now()}`,
      topicId: 'custom-topic',
      subjectId: revSubjectId || subjects[0]?.id || 'sub-general',
      track: revTrack,
      title: revTitle.trim(),
      keyFacts: factsArr.length > 0 ? factsArr : undefined,
      formulaeOrDefs: defsArr.length > 0 ? defsArr : undefined,
      repetitionStage: 1,
      nextDueDate: todayStr,
      isDue: true,
      isOverdue: false,
    };

    saveRevisionItem(newItem);
    setIsAddModalOpen(false);
    setRevTitle('');
    setRevFacts('');
    setRevDefs('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Revision Centre & Spaced Repetition
            </h1>
            <Badge variant="amber">Intervals Active</Badge>
          </div>
          <p className="text-xs md:text-sm text-slate-400">
            Ebbinghaus forgetting curve intervals (1, 3, 7, 14, 30 days) to lock in conceptual memory for APPSC and B.Tech.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {dueItems.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Calendar size={14} />}
              onClick={handleSyncToTimetable}
            >
              Sync Due ({dueItems.length}) to Timetable
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Revision Item
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('due')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
            activeTab === 'due'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Due Today ({dueItems.length})
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          All Topics in Queue ({revisions.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('flashcards');
            setIsFlipped(false);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
            activeTab === 'flashcards'
              ? 'bg-violet-600 text-white shadow-md shadow-violet-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Flashcards Mode
        </button>
      </div>

      {/* Content Rendering */}
      {activeTab === 'flashcards' ? (
        /* INTERACTIVE FLASHCARDS MODE */
        <div className="max-w-2xl mx-auto space-y-4">
          {currentCard ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Card {flashcardIndex + 1} of {flashcardsList.length}</span>
                <TrackBadge track={currentCard.track} />
              </div>

              {/* 3D Flip Card Effect */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="min-h-[300px] p-8 rounded-3xl bg-gradient-to-tr from-[#131d2e] via-[#0d131f] to-[#182338] border border-slate-700/80 shadow-2xl flex flex-col justify-between cursor-pointer transition-all hover:border-blue-500/60"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                    <span className="font-semibold uppercase tracking-wider text-blue-400">
                      {isFlipped ? 'Answer & Derivation' : 'Concept / Question'}
                    </span>
                    <Badge variant="amber">Stage {currentCard.repetitionStage}</Badge>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold text-white text-center py-6 leading-relaxed">
                    {currentCard.title}
                  </h3>
                </div>

                {isFlipped ? (
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    {currentCard.keyFacts && (
                      <div className="text-xs text-slate-300 space-y-1">
                        <strong className="text-blue-400 block">Key Facts:</strong>
                        {currentCard.keyFacts.map((fact, i) => (
                          <p key={i}>• {fact}</p>
                        ))}
                      </div>
                    )}
                    {currentCard.formulaeOrDefs && (
                      <div className="text-xs text-emerald-300 font-mono space-y-1">
                        <strong className="text-emerald-400 block font-sans">Formulae & Notes:</strong>
                        {currentCard.formulaeOrDefs.map((def, i) => (
                          <p key={i}>• {def}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center">
                    Click card to reveal key facts and derivations
                  </p>
                )}

                <div className="text-center text-[11px] text-slate-400 pt-2">
                  {isFlipped ? 'Rate your recall to adjust spaced interval:' : 'Tap anywhere to flip'}
                </div>
              </div>

              {/* Recall Rating Buttons */}
              {isFlipped && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button
                    variant="danger"
                    size="md"
                    onClick={() => handleRateCard('hard')}
                    className="flex-1 text-xs"
                  >
                    Hard (Reset to 1 Day)
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleRateCard('good')}
                    className="flex-1 text-xs"
                  >
                    Good (Advance Stage)
                  </Button>
                  <Button
                    variant="success"
                    size="md"
                    onClick={() => handleRateCard('easy')}
                    className="flex-1 text-xs"
                  >
                    Easy (Mastered)
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={<RotateCw size={28} />}
              title="No Cards in Queue"
              description="Add topics to your revision queue to start flashcards review."
              actionLabel="Add Card"
              onAction={() => setIsAddModalOpen(true)}
            />
          )}
        </div>
      ) : (
        /* DUE / ALL REVISION ITEMS LIST */
        <div className="space-y-3">
          {activeList.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 size={28} className="text-emerald-400" />}
              title={activeTab === 'due' ? 'No Revisions Due Today!' : 'No Revision Items'}
              description={
                activeTab === 'due'
                  ? 'All scheduled repetitions are up to date. Excellent retention discipline!'
                  : 'Add revision cards or fail mock test questions to automatically populate this queue.'
              }
              actionLabel="Add Revision Item"
              onAction={() => setIsAddModalOpen(true)}
            />
          ) : (
            activeList.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-sm font-semibold text-slate-100">{item.title}</h3>
                    <TrackBadge track={item.track} />
                    <Badge variant="amber">Stage {item.repetitionStage} of 5</Badge>
                  </div>

                  {item.keyFacts && (
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {item.keyFacts[0]}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <Clock size={12} />
                    <span>Next Due: {item.nextDueDate}</span>
                    {item.lastReviewedDate && <span>• Last: {item.lastReviewedDate}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => completeRevisionItem(item.id, 'good')}
                    className="text-xs"
                  >
                    Mark Reviewed
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal: Add Revision Item */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Spaced Revision Item"
        description="Enter important definitions, facts, or formulas for spaced repetition review."
      >
        <form onSubmit={handleAddRevisionItem} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Topic / Item Title *</label>
            <input
              type="text"
              required
              value={revTitle}
              onChange={(e) => setRevTitle(e.target.value)}
              placeholder="e.g. Fundamental Rights Exceptions (Article 31A, 31B, 31C)"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Track</label>
              <select
                value={revTrack}
                onChange={(e) => setRevTrack(e.target.value as ExamTrack)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="appsc-prelims">APPSC Prelims</option>
                <option value="appsc-mains">APPSC Mains</option>
                <option value="semester">B.Tech Semester</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
              <select
                value={revSubjectId}
                onChange={(e) => setRevSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {subjects
                  .filter((s) => s.track === revTrack)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Key Facts (One per line)
            </label>
            <textarea
              rows={3}
              value={revFacts}
              onChange={(e) => setRevFacts(e.target.value)}
              placeholder="Fact 1...&#10;Fact 2..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Formulae or Key Definitions (One per line)
            </label>
            <textarea
              rows={2}
              value={revDefs}
              onChange={(e) => setRevDefs(e.target.value)}
              placeholder="Formula / Rule..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Add to Queue
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
