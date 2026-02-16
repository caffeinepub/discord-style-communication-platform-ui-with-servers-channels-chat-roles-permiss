import React, { useState } from 'react';
import { Plus, Settings } from 'lucide-react';
import { useNavigation } from '../../state/navigation';
import { useGetCategories, useIsCallerAdmin, useGetCategoryChannelOrdering, useUpdateCategoryChannelOrdering, useGetServer } from '../../hooks/useQueries';
import { CategorySection } from '../channels/CategorySection';
import CreateCategoryDialog from '../channels/CreateCategoryDialog';
import type { ChannelCategory, ServerOrdering } from '../../backend';
import { applyOrderingToCategories, buildCategoryLevelOrdering } from '../../utils/channelOrdering';

export function ChannelSidebar() {
  const { selectedServerId, expandedCategories, toggleCategory, setShowServerSettings } = useNavigation();
  const { data: categories = [], isLoading } = useGetCategories(selectedServerId);
  const { data: server, isLoading: serverLoading } = useGetServer(selectedServerId);
  const { data: isAdmin } = useIsCallerAdmin();
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const { data: persistedOrdering } = useGetCategoryChannelOrdering(selectedServerId);
  const updateOrdering = useUpdateCategoryChannelOrdering();

  const [draggedCategory, setDraggedCategory] = useState<bigint | null>(null);

  // Apply persisted ordering to categories
  const orderedCategories = applyOrderingToCategories(categories, persistedOrdering ?? null);

  // Merge expansion state
  const categoriesWithExpansion = orderedCategories.map((cat) => ({
    ...cat,
    isExpanded: expandedCategories[cat.id.toString()] ?? cat.isExpanded,
  }));

  const handleCategoryDragStart = (categoryId: bigint) => {
    if (!isAdmin) return;
    setDraggedCategory(categoryId);
  };

  const handleCategoryDragOver = (e: React.DragEvent, targetCategoryId: bigint) => {
    if (!isAdmin || !draggedCategory) return;
    e.preventDefault();
  };

  const handleCategoryDrop = (e: React.DragEvent, targetCategoryId: bigint) => {
    e.preventDefault();
    if (!isAdmin || !draggedCategory || draggedCategory === targetCategoryId || !selectedServerId) {
      setDraggedCategory(null);
      return;
    }

    const currentOrder = orderedCategories.map(cat => cat.id);
    const draggedIndex = currentOrder.findIndex(id => id === draggedCategory);
    const targetIndex = currentOrder.findIndex(id => id === targetCategoryId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedCategory(null);
      return;
    }

    const newOrder = [...currentOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedCategory);

    // Build the full ordering structure
    const categoryLevelOrdering = buildCategoryLevelOrdering(orderedCategories, persistedOrdering ?? null);

    const newServerOrdering: ServerOrdering = {
      categoryOrder: newOrder,
      categories: categoryLevelOrdering,
    };

    updateOrdering.mutate({
      serverId: selectedServerId,
      ordering: newServerOrdering,
    });

    setDraggedCategory(null);
  };

  const handleHeaderClick = () => {
    if (selectedServerId) {
      setShowServerSettings(true);
    }
  };

  const handleCreateCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCreateCategoryOpen(true);
  };

  if (!selectedServerId) {
    return (
      <div className="w-60 bg-secondary border-r border-border flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No server selected</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-60 bg-secondary border-r border-border flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading channels...</p>
      </div>
    );
  }

  // Determine the header text
  const headerText = serverLoading ? 'Loading...' : (server?.name || 'Server');

  return (
    <div className="w-60 bg-secondary border-r border-border flex flex-col">
      <div 
        className="h-12 border-b border-border flex items-center justify-between px-4 cursor-pointer hover:bg-accent/50 transition-colors group"
        onClick={handleHeaderClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleHeaderClick();
          }
        }}
        title="Server Settings"
      >
        <h2 className="font-semibold text-sm truncate flex-1">{headerText}</h2>
        {isAdmin && (
          <button
            onClick={handleCreateCategoryClick}
            className="p-1 hover:bg-accent rounded transition-colors z-10"
            title="Create Category"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {categoriesWithExpansion.map((category: ChannelCategory) => (
          <div
            key={category.id.toString()}
            draggable={isAdmin}
            onDragStart={() => handleCategoryDragStart(category.id)}
            onDragOver={(e) => handleCategoryDragOver(e, category.id)}
            onDrop={(e) => handleCategoryDrop(e, category.id)}
            className={isAdmin ? 'cursor-move' : ''}
          >
            <CategorySection
              serverId={selectedServerId}
              category={category}
              allCategories={orderedCategories}
              onToggleExpanded={toggleCategory}
            />
          </div>
        ))}
      </div>

      <CreateCategoryDialog
        open={createCategoryOpen}
        onOpenChange={setCreateCategoryOpen}
        serverId={selectedServerId}
      />
    </div>
  );
}
