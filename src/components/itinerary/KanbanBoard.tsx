import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Activity } from '../../types/activity';
import KanbanColumn from './KanbanColumn';

interface DayInfo {
  dayNumber: number;
  dateFormatted: string;
  barrioPrincipal: string;
  summary?: string;
  isDepartureDay?: boolean;
}

interface KanbanBoardProps {
  visibleDays: DayInfo[];
  activities: Activity[];
  exchangeRate: number;
  filterActivityItem: (act: Activity) => boolean;
  onMoveActivityWithToast: (actId: string, targetDayNum: number) => void;
  onOpenAddModal: (dayNum: number) => void;
  onJumpToDayTimeline: (dayNum: number) => void;
  onToggleComplete: (id: string) => void;
  onToggleWithFriend: (id: string) => void;
  onInspect: (act: Activity) => void;
  onQuickMove: (act: Activity) => void;
  onEdit: (act: Activity) => void;
  onDelete: (id: string) => void;
}

export default function KanbanBoard({
  visibleDays,
  activities,
  exchangeRate,
  filterActivityItem,
  onMoveActivityWithToast,
  onOpenAddModal,
  onJumpToDayTimeline,
  onToggleComplete,
  onToggleWithFriend,
  onInspect,
  onQuickMove,
  onEdit,
  onDelete
}: KanbanBoardProps) {
  const [expandedPurchases, setExpandedPurchases] = useState<Record<string, boolean>>({});
  const [draggedActivityId, setDraggedActivityId] = useState<string | null>(null);
  const [dragOverDayNumber, setDragOverDayNumber] = useState<number | null>(null);

  const boardScrollRef = useRef<HTMLDivElement>(null);

  const toggleExpandPurchase = (id: string) => {
    setExpandedPurchases(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Auto-scroll Kanban board horizontally during edge drag
  useEffect(() => {
    if (!draggedActivityId) return;

    const handleDragOverWindow = (e: DragEvent) => {
      const container = boardScrollRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const edgeThreshold = 80;
      const scrollSpeed = 16;

      if (e.clientX < rect.left + edgeThreshold) {
        container.scrollLeft -= scrollSpeed;
      } else if (e.clientX > rect.right - edgeThreshold) {
        container.scrollLeft += scrollSpeed;
      }
    };

    window.addEventListener('dragover', handleDragOverWindow);
    return () => window.removeEventListener('dragover', handleDragOverWindow);
  }, [draggedActivityId]);

  const scrollBoard = (direction: 'left' | 'right') => {
    if (boardScrollRef.current) {
      const offset = direction === 'left' ? -340 : 340;
      boardScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, act: Activity) => {
    e.dataTransfer.setData('text/plain', act.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedActivityId(act.id);
  };

  const handleDragEnd = () => {
    setDraggedActivityId(null);
    setDragOverDayNumber(null);
  };

  const handleDragOverColumn = (e: React.DragEvent<HTMLDivElement>, dayNum: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverDayNumber !== dayNum) {
      setDragOverDayNumber(dayNum);
    }
  };

  const handleDragLeaveColumn = (_e: React.DragEvent<HTMLDivElement>, dayNum: number) => {
    if (dragOverDayNumber === dayNum) {
      setDragOverDayNumber(null);
    }
  };

  const handleDropOnColumn = (e: React.DragEvent<HTMLDivElement>, targetDayNum: number) => {
    e.preventDefault();
    const actId = e.dataTransfer.getData('text/plain') || draggedActivityId;
    if (actId) {
      onMoveActivityWithToast(actId, Number(targetDayNum));
    }
    setDraggedActivityId(null);
    setDragOverDayNumber(null);
  };

  return (
    <div className="kanban-view-container animate-fade-in">
      {/* Quick instructions and scroll buttons */}
      <div className="kanban-header-info">
        <div className="kanban-legend">
          <span className="legend-hint">
            💡 <strong>Tip de organización:</strong> Arrastra cualquier plan entre días o usa el botón <strong>"Mover"</strong> en la tarjeta para trasladarlo con 1 clic.
          </span>
        </div>

        <div className="kanban-nav-scroll-btns">
          <button
            type="button"
            className="btn-scroll-col"
            onClick={() => scrollBoard('left')}
            title="Desplazar columnas a la izquierda"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="btn-scroll-col"
            onClick={() => scrollBoard('right')}
            title="Desplazar columnas a la derecha"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Kanban Board Horizontal Track */}
      <div className="kanban-board-track" ref={boardScrollRef}>
        {visibleDays.map((day) => {
          const dayActs = activities.filter(a => a.dayNumber === day.dayNumber);
          const filteredDayActs = dayActs.filter(filterActivityItem);

          return (
            <KanbanColumn
              key={day.dayNumber}
              day={day}
              dayActsCount={dayActs.length}
              filteredDayActs={filteredDayActs}
              exchangeRate={exchangeRate}
              isOver={dragOverDayNumber === day.dayNumber}
              draggedActivityId={draggedActivityId}
              expandedPurchases={expandedPurchases}
              onToggleExpandPurchase={toggleExpandPurchase}
              onDragOverColumn={handleDragOverColumn}
              onDragLeaveColumn={handleDragLeaveColumn}
              onDropOnColumn={handleDropOnColumn}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onOpenAddModal={onOpenAddModal}
              onJumpToDayTimeline={onJumpToDayTimeline}
              onToggleComplete={onToggleComplete}
              onToggleWithFriend={onToggleWithFriend}
              onInspect={onInspect}
              onQuickMove={onQuickMove}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        })}
      </div>
    </div>
  );
}

