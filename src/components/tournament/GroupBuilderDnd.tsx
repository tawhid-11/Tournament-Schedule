"use client";

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { EngineTeam } from "@/lib/fixture-engine/types";
import { StoredGroup } from "@/lib/tournament-store";
import { validateGroupSizes } from "@/lib/fixture-engine/groups";
import {
  AlertTriangle,
  Sparkles,
  Plus,
  Trash2,
  GripVertical,
  CheckCircle2,
} from "lucide-react";

interface SortableTeamCardProps {
  team: EngineTeam;
  groupId: string;
}

function SortableTeamCard({ team }: SortableTeamCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: team.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-background/80 hover:border-primary/50 transition-all select-none group"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground group-hover:text-foreground"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: team.primaryColor || "#3b82f6" }}
        />
        <span className="text-sm font-semibold text-foreground truncate">
          {team.name}
        </span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {team.seed && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            Seed #{team.seed}
          </span>
        )}
      </div>
    </div>
  );
}

interface GroupBuilderDndProps {
  initialGroups: StoredGroup[];
  allTeams: EngineTeam[];
  tournamentId: string;
  onSave: (groups: StoredGroup[]) => Promise<void>;
  onAutoDraw: (options: {
    method: "SEEDED_POTS" | "RANDOM" | "SNAKE";
    numberOfGroups: number;
    advancePerGroup: number;
  }) => Promise<void>;
}

export function GroupBuilderDnd({
  initialGroups,
  allTeams,
  onSave,
  onAutoDraw,
}: GroupBuilderDndProps) {
  const [groups, setGroups] = useState<StoredGroup[]>(initialGroups);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [drawMethod, setDrawMethod] = useState<"SEEDED_POTS" | "RANDOM" | "SNAKE">("SEEDED_POTS");
  const [drawGroupCount, setDrawGroupCount] = useState<number>(
    initialGroups.length || 4
  );
  const [advanceCount, setAdvanceCount] = useState<number>(2);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const assignedTeamIds = new Set(
    groups.flatMap((g) => g.teams.map((t) => t.id))
  );
  const unassignedTeams = allTeams.filter((t) => !assignedTeamIds.has(t.id));

  const validation = validateGroupSizes(
    groups.map((g) => ({
      id: g.id,
      name: g.name,
      sortOrder: g.sortOrder,
      teams: g.teams,
      advanceCount: g.advanceCount,
    }))
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTeamId = active.id as string;
    const overId = over.id as string;

    // Find source group
    let sourceGroupIndex = groups.findIndex((g) =>
      g.teams.some((t) => t.id === activeTeamId)
    );

    // Target could be a group container or a team inside a group
    let targetGroupIndex = groups.findIndex((g) => g.id === overId);
    if (targetGroupIndex === -1) {
      targetGroupIndex = groups.findIndex((g) =>
        g.teams.some((t) => t.id === overId)
      );
    }

    if (targetGroupIndex === -1) return;

    const activeTeam = allTeams.find((t) => t.id === activeTeamId);
    if (!activeTeam) return;

    setGroups((prev) => {
      const updated = prev.map((g) => ({ ...g, teams: [...g.teams] }));

      // Remove from source if it was in a group
      if (sourceGroupIndex !== -1) {
        updated[sourceGroupIndex].teams = updated[sourceGroupIndex].teams.filter(
          (t) => t.id !== activeTeamId
        );
      }

      // Add to target group if not already present
      if (!updated[targetGroupIndex].teams.some((t) => t.id === activeTeamId)) {
        updated[targetGroupIndex].teams.push(activeTeam);
      }

      return updated;
    });
  };

  const handleAddGroup = () => {
    const nextCode = String.fromCharCode(65 + groups.length);
    const newGroup: StoredGroup = {
      id: `grp-${Date.now()}`,
      name: `Group ${nextCode}`,
      sortOrder: groups.length + 1,
      advanceCount: 2,
      teams: [],
    };
    setGroups([...groups, newGroup]);
  };

  const handleRemoveGroup = (groupId: string) => {
    setGroups(groups.filter((g) => g.id !== groupId));
  };

  const handleRunAutoDraw = async () => {
    setIsSaving(true);
    try {
      await onAutoDraw({
        method: drawMethod,
        numberOfGroups: drawGroupCount,
        advancePerGroup: advanceCount,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(groups);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-card/60 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-foreground">
            Auto Draw Pots:
          </span>
          <select
            value={drawMethod}
            onChange={(e) => setDrawMethod(e.target.value as any)}
            className="h-9 px-3 rounded-md bg-background border border-border text-sm font-medium focus:ring-1 focus:ring-primary text-foreground"
          >
            <option value="SEEDED_POTS">Seeded Pots (FIFA Style)</option>
            <option value="SNAKE">Snake Draft</option>
            <option value="RANDOM">Completely Random</option>
          </select>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>Groups:</span>
            <input
              type="number"
              min={1}
              max={16}
              value={drawGroupCount}
              onChange={(e) => setDrawGroupCount(Number(e.target.value))}
              className="w-16 h-9 px-2 rounded-md bg-background border border-border text-sm text-center font-bold text-foreground"
            />
          </div>

          <button
            onClick={handleRunAutoDraw}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-md bg-primary/20 text-primary hover:bg-primary/30 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            Run Auto Draw
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddGroup}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Group
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Saved!
              </>
            ) : (
              "Save Groups"
            )}
          </button>
        </div>
      </div>

      {/* Warnings & Validation */}
      {validation.warnings.length > 0 && (
        <div className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
          <div className="space-y-0.5">
            {validation.warnings.map((w, i) => (
              <p key={i}>{w}</p>
            ))}
          </div>
        </div>
      )}

      {/* DnD Context Area */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {groups.map((group) => (
            <div
              key={group.id}
              id={group.id}
              className="p-4 rounded-xl border border-border/60 bg-card flex flex-col justify-between shadow-sm min-h-[300px]"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground text-base">
                      {group.name}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-semibold">
                      {group.teams.length} teams
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveGroup(group.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    title="Delete Group"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Team cards in group */}
                <SortableContext
                  items={group.teams.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 min-h-[120px]">
                    {group.teams.map((team) => (
                      <SortableTeamCard
                        key={team.id}
                        team={team}
                        groupId={group.id}
                      />
                    ))}
                    {group.teams.length === 0 && (
                      <div className="h-28 rounded-lg border-2 border-dashed border-border/40 flex items-center justify-center text-xs text-muted-foreground">
                        Drop teams here
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>

              {/* Group Qualification Setting */}
              <div className="pt-3 border-t border-border/40 mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>Top qualify:</span>
                <span className="font-bold text-foreground">
                  {group.advanceCount} advance
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Unassigned Teams Pool */}
        {unassignedTeams.length > 0 && (
          <div className="p-4 rounded-xl border border-border/50 bg-secondary/30">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Unassigned Teams Pool ({unassignedTeams.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {unassignedTeams.map((team) => (
                <div
                  key={team.id}
                  className="px-3 py-1.5 rounded-md border border-border bg-background text-sm font-medium flex items-center gap-2"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: team.primaryColor || "#3b82f6" }}
                  />
                  <span>{team.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DndContext>
    </div>
  );
}
