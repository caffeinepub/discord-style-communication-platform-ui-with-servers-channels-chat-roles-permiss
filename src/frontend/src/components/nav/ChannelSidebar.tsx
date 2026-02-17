import { Hash, Volume2, ChevronDown, Settings, Plus } from 'lucide-react';
import { useNavigation } from '../../state/navigation';
import { useGetServer, useGetCategories, useIsCallerAdmin } from '../../hooks/useQueries';
import { useState } from 'react';
import CreateCategoryDialog from '../channels/CreateCategoryDialog';
import type { Category } from '../../backend';
import { Skeleton } from '@/components/ui/skeleton';

interface ChannelSidebarProps {
  serverId: string | null;
}

export default function ChannelSidebar({ serverId }: ChannelSidebarProps) {
  const { selectedChannelId, selectedChannelType, selectChannel, setShowServerSettings, expandedCategories, toggleCategory } = useNavigation();
  const { data: server, isLoading: serverLoading } = useGetServer(serverId);
  const { data: categories = [], isLoading: categoriesLoading } = useGetCategories(serverId);
  const { data: isAdmin } = useIsCallerAdmin();
  const [createCategoryDialogOpen, setCreateCategoryDialogOpen] = useState(false);

  if (!serverId) {
    return (
      <div className="w-60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r border-border flex flex-col">
        <div className="h-12 border-b border-border flex items-center justify-center px-4">
          <span className="text-sm text-muted-foreground">No server selected</span>
        </div>
      </div>
    );
  }

  const isLoading = serverLoading || categoriesLoading;

  return (
    <div className="w-60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r border-border flex flex-col">
      {/* Server Header */}
      <button
        onClick={() => setShowServerSettings(true)}
        className="h-12 border-b border-border flex items-center justify-between px-4 hover:bg-accent transition-colors group"
      >
        {serverLoading ? (
          <Skeleton className="h-5 w-32" />
        ) : (
          <span className="font-semibold truncate">{server?.name || 'Loading...'}</span>
        )}
        <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </button>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="space-y-2 px-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : categories.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">No categories yet</p>
            {isAdmin && (
              <button
                onClick={() => setCreateCategoryDialogOpen(true)}
                className="text-sm text-primary hover:underline"
              >
                Create your first category
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {categories.map((category: Category) => {
              const isExpanded = expandedCategories[category.id] !== false;
              
              return (
                <div key={category.id} className="group">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex w-full items-center gap-1 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronDown
                      className={`h-3 w-3 transition-transform ${
                        isExpanded ? '' : '-rotate-90'
                      }`}
                    />
                    <span className="flex-1 text-left">{category.name}</span>
                    {isAdmin && (
                      <Plus
                        className="h-4 w-4 opacity-0 group-hover:opacity-100 hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Open create channel dialog for this category
                        }}
                      />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="space-y-0.5 mt-1">
                      {/* Placeholder for channels - will be populated when channels are fetched */}
                      <div className="px-4 py-2 text-xs text-muted-foreground">
                        No channels yet
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add Category Button */}
        {isAdmin && !isLoading && (
          <button
            onClick={() => setCreateCategoryDialogOpen(true)}
            className="flex items-center gap-2 px-2 py-1.5 mx-2 mt-2 rounded text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        )}
      </div>

      {serverId && (
        <CreateCategoryDialog
          open={createCategoryDialogOpen}
          onOpenChange={setCreateCategoryDialogOpen}
          serverId={serverId}
        />
      )}
    </div>
  );
}
