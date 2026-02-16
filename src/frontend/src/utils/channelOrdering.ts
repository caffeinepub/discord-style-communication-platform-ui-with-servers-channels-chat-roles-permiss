import type { ChannelCategory, TextChannel, VoiceChannel, ServerOrdering, CategoryLevelOrdering } from '../types/local';

/**
 * Apply ordering to categories
 */
export function applyOrderingToCategories(
  categories: ChannelCategory[],
  ordering: ServerOrdering | null
): ChannelCategory[] {
  if (!ordering) return categories;

  const categoryMap = new Map<bigint, ChannelCategory>();
  categories.forEach((cat) => categoryMap.set(cat.id, cat));

  const ordered: ChannelCategory[] = [];
  for (const catId of ordering.categoryOrder) {
    const category = categoryMap.get(catId);
    if (category) {
      ordered.push(category);
      categoryMap.delete(catId);
    }
  }

  // Add any categories not in the ordering
  categoryMap.forEach((cat) => ordered.push(cat));

  return ordered;
}

/**
 * Apply ordering to text channels within a category
 */
export function applyOrderingToTextChannels(
  category: ChannelCategory,
  ordering: ServerOrdering | null
): TextChannel[] {
  if (!ordering) return category.textChannels;

  const catOrdering = ordering.categories.find((c) => c.id === category.id);
  if (!catOrdering) return category.textChannels;

  const channelMap = new Map<bigint, TextChannel>();
  category.textChannels.forEach((ch) => channelMap.set(ch.id, ch));

  const ordered: TextChannel[] = [];
  for (const chId of catOrdering.textChannels) {
    const channel = channelMap.get(chId);
    if (channel) {
      ordered.push(channel);
      channelMap.delete(chId);
    }
  }

  // Add any channels not in the ordering
  channelMap.forEach((ch) => ordered.push(ch));

  return ordered;
}

/**
 * Apply ordering to voice channels within a category
 */
export function applyOrderingToVoiceChannels(
  category: ChannelCategory,
  ordering: ServerOrdering | null
): VoiceChannel[] {
  if (!ordering) return category.voiceChannels;

  const catOrdering = ordering.categories.find((c) => c.id === category.id);
  if (!catOrdering) return category.voiceChannels;

  const channelMap = new Map<bigint, VoiceChannel>();
  category.voiceChannels.forEach((ch) => channelMap.set(ch.id, ch));

  const ordered: VoiceChannel[] = [];
  for (const chId of catOrdering.voiceChannels) {
    const channel = channelMap.get(chId);
    if (channel) {
      ordered.push(channel);
      channelMap.delete(chId);
    }
  }

  // Add any channels not in the ordering
  channelMap.forEach((ch) => ordered.push(ch));

  return ordered;
}

/**
 * Build CategoryLevelOrdering array from categories
 */
export function buildCategoryLevelOrdering(
  categories: ChannelCategory[]
): CategoryLevelOrdering[] {
  return categories.map((category) => ({
    id: category.id,
    textChannels: category.textChannels.map((ch) => ch.id),
    voiceChannels: category.voiceChannels.map((ch) => ch.id),
  }));
}

/**
 * Build ServerOrdering from categories
 */
export function buildServerOrdering(
  categories: ChannelCategory[]
): ServerOrdering {
  return {
    categoryOrder: categories.map((cat) => cat.id),
    categories: buildCategoryLevelOrdering(categories),
  };
}

/**
 * Merge persisted ordering with current server data
 */
export function applyOrdering(
  categories: ChannelCategory[],
  ordering: ServerOrdering | null
): ChannelCategory[] {
  if (!ordering) return categories;

  // Create a map of categories by ID for quick lookup
  const categoryMap = new Map<bigint, ChannelCategory>();
  categories.forEach((cat) => categoryMap.set(cat.id, cat));

  // Apply category order
  const orderedCategories: ChannelCategory[] = [];
  for (const catId of ordering.categoryOrder) {
    const category = categoryMap.get(catId);
    if (category) {
      // Find ordering for this category
      const catOrdering = ordering.categories.find((c) => c.id === catId);
      if (catOrdering) {
        // Apply channel ordering within category
        const orderedTextChannels = applyChannelOrdering(
          category.textChannels,
          catOrdering.textChannels
        );
        const orderedVoiceChannels = applyChannelOrdering(
          category.voiceChannels,
          catOrdering.voiceChannels
        );

        orderedCategories.push({
          ...category,
          textChannels: orderedTextChannels,
          voiceChannels: orderedVoiceChannels,
        });
      } else {
        orderedCategories.push(category);
      }
      categoryMap.delete(catId);
    }
  }

  // Add any categories not in the ordering
  categoryMap.forEach((cat) => orderedCategories.push(cat));

  return orderedCategories;
}

function applyChannelOrdering<T extends { id: bigint }>(
  channels: T[],
  order: bigint[]
): T[] {
  const channelMap = new Map<bigint, T>();
  channels.forEach((ch) => channelMap.set(ch.id, ch));

  const ordered: T[] = [];
  for (const chId of order) {
    const channel = channelMap.get(chId);
    if (channel) {
      ordered.push(channel);
      channelMap.delete(chId);
    }
  }

  // Add any channels not in the ordering
  channelMap.forEach((ch) => ordered.push(ch));

  return ordered;
}
