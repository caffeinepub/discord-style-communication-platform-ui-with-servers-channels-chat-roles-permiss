import type { ChannelCategory, TextChannel, VoiceChannel, ServerOrdering, CategoryLevelOrdering } from '../backend';

/**
 * Merge persisted ordering with current server data
 * Ensures missing IDs are appended and unknown IDs are ignored
 */
export function applyOrderingToCategories(
  categories: ChannelCategory[],
  ordering: ServerOrdering | null
): ChannelCategory[] {
  if (!ordering || !ordering.categoryOrder || ordering.categoryOrder.length === 0) {
    return categories;
  }

  const ordered: ChannelCategory[] = [];
  const categoryMap = new Map(categories.map(c => [c.id.toString(), c]));

  // Add categories in the specified order
  ordering.categoryOrder.forEach(catId => {
    const cat = categoryMap.get(catId.toString());
    if (cat) {
      ordered.push(cat);
      categoryMap.delete(catId.toString());
    }
  });

  // Add any remaining categories not in the ordering
  categoryMap.forEach(cat => ordered.push(cat));

  return ordered;
}

/**
 * Apply ordering to text channels within a category
 */
export function applyOrderingToTextChannels(
  category: ChannelCategory,
  ordering: ServerOrdering | null
): TextChannel[] {
  if (!ordering || !ordering.categories || ordering.categories.length === 0) {
    return category.textChannels;
  }

  const categoryOrdering = ordering.categories.find(c => c.id === category.id);
  if (!categoryOrdering || categoryOrdering.textChannels.length === 0) {
    return category.textChannels;
  }

  const ordered: TextChannel[] = [];
  const channelMap = new Map(category.textChannels.map(ch => [ch.id.toString(), ch]));

  categoryOrdering.textChannels.forEach(chId => {
    const ch = channelMap.get(chId.toString());
    if (ch) {
      ordered.push(ch);
      channelMap.delete(chId.toString());
    }
  });

  // Add any remaining channels not in the ordering
  channelMap.forEach(ch => ordered.push(ch));

  return ordered;
}

/**
 * Apply ordering to voice channels within a category
 */
export function applyOrderingToVoiceChannels(
  category: ChannelCategory,
  ordering: ServerOrdering | null
): VoiceChannel[] {
  if (!ordering || !ordering.categories || ordering.categories.length === 0) {
    return category.voiceChannels;
  }

  const categoryOrdering = ordering.categories.find(c => c.id === category.id);
  if (!categoryOrdering || categoryOrdering.voiceChannels.length === 0) {
    return category.voiceChannels;
  }

  const ordered: VoiceChannel[] = [];
  const channelMap = new Map(category.voiceChannels.map(ch => [ch.id.toString(), ch]));

  categoryOrdering.voiceChannels.forEach(chId => {
    const ch = channelMap.get(chId.toString());
    if (ch) {
      ordered.push(ch);
      channelMap.delete(chId.toString());
    }
  });

  // Add any remaining channels not in the ordering
  channelMap.forEach(ch => ordered.push(ch));

  return ordered;
}

/**
 * Build CategoryLevelOrdering array from current ordering state
 */
export function buildCategoryLevelOrdering(
  categories: ChannelCategory[],
  ordering: ServerOrdering | null
): CategoryLevelOrdering[] {
  return categories.map(category => {
    const existingOrdering = ordering?.categories.find(c => c.id === category.id);
    
    return {
      id: category.id,
      textChannels: existingOrdering?.textChannels || category.textChannels.map(ch => ch.id),
      voiceChannels: existingOrdering?.voiceChannels || category.voiceChannels.map(ch => ch.id),
    };
  });
}
