import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { ProgressRing } from '../common/ProgressRing';
import { AddTodoModal } from '../modals/AddTodoModal';
import { TodoTask } from '../../types/todo';
import {
  CheckSquare,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  Search,
} from 'lucide-react-native';
import { spacing, borderRadius } from '../../theme/spacing';

export const TodoSection: React.FC = () => {
  const {
    theme,
    settings,
    todos,
    toggleTodo,
    deleteTodo,
    toggleSubtask,
    dailyTaskStats,
  } = useApp();

  const isTamil = settings.displayLanguage === 'ta';

  const [activeFilter, setActiveFilter] = useState<'All' | 'Spiritual' | 'Ministry' | 'Personal'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedTodoIds, setExpandedTodoIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpand = (id: string) => {
    const next = new Set(expandedTodoIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedTodoIds(next);
  };

  const filteredTodos = todos.filter((t) => {
    if (activeFilter === 'Spiritual' && !(t.category === 'Spiritual' || t.category === 'Bible Reading' || t.category === 'Prayer Target')) return false;
    if (activeFilter === 'Ministry' && !(t.category === 'Ministry' || t.category === 'Tithe & Giving')) return false;
    if (activeFilter === 'Personal' && !(t.category === 'Personal' || t.category === 'Work' || t.category === 'Family' || t.category === 'Health')) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q));
  });

  const pendingTodos = filteredTodos.filter((t) => !t.isCompleted);
  const completedTodos = filteredTodos.filter((t) => t.isCompleted);

  return (
    <View style={styles.container}>
      {/* Daily Tasks Completion Card */}
      <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
        <View style={styles.heroLeft}>
          <Text style={[styles.heroHeading, { color: theme.text }]}>
            {isTamil ? 'இன்றைய கடமைகள்' : 'Today’s Discipline'}
          </Text>
          <Text style={[styles.heroSub, { color: theme.textMuted }]}>
            {dailyTaskStats.completedToday} / {dailyTaskStats.totalToday} {isTamil ? 'முடிக்கப்பட்டன' : 'tasks finished'}
          </Text>
          <Text style={[styles.scriptureQuote, { color: theme.primary }]}>
            "Whatever you do, work at it with all your heart, as working for the Lord." (Col 3:23)
          </Text>
        </View>

        <ProgressRing
          size={72}
          strokeWidth={6}
          progress={dailyTaskStats.completionRatio}
          color={theme.accentSage}
          bgColor={theme.cardAlt}
        />
      </View>

      {/* Add Task CTA (Clean single icon) */}
      <TouchableOpacity
        style={[styles.addCta, { backgroundColor: theme.primary }, theme.cardShadow]}
        onPress={() => setShowAddModal(true)}
      >
        <Plus size={16} color="#000" />
        <Text style={styles.addCtaText}>
          {isTamil ? 'புதிய பணி சேர்க்க' : 'Add New Task'}
        </Text>
      </TouchableOpacity>

      {/* Category Filter Tabs */}
      <View style={[styles.filterBar, { backgroundColor: theme.cardAlt }]}>
        {[
          { key: 'All', labelEn: 'All', labelTa: 'அனைத்தும்' },
          { key: 'Spiritual', labelEn: 'Spiritual', labelTa: 'ஆவிக்குரியவை' },
          { key: 'Ministry', labelEn: 'Ministry', labelTa: 'ஊழியம்' },
          { key: 'Personal', labelEn: 'Life', labelTa: 'தனிப்பட்டவை' },
        ].map((tab) => {
          const isSelected = activeFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterTab, isSelected && { backgroundColor: theme.primary }]}
              onPress={() => setActiveFilter(tab.key as any)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: isSelected ? '#000' : theme.textMuted },
                ]}
              >
                {isTamil ? tab.labelTa : tab.labelEn}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.cardShadow]}>
        <Search size={15} color={theme.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder={isTamil ? 'பணிகளைத் தேடுக...' : 'Search tasks...'}
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* PENDING TASKS SECTION */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {isTamil ? 'செய்ய வேண்டியவை' : 'Pending'} ({pendingTodos.length})
        </Text>
      </View>

      <View style={styles.tasksList}>
        {pendingTodos.length > 0 ? (
          pendingTodos.map((todo) => renderTodoCard(todo, false))
        ) : (
          <View style={styles.emptyCard}>
            <CheckSquare size={30} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              {isTamil ? 'நிலுவையில் உள்ள பணிகள் இல்லை!' : 'No pending tasks.'}
            </Text>
          </View>
        )}
      </View>

      {/* COMPLETED TASKS SECTION */}
      {completedTodos.length > 0 && (
        <>
          <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
              {isTamil ? 'முடிக்கப்பட்டவை' : 'Completed'} ({completedTodos.length})
            </Text>
          </View>

          <View style={styles.tasksList}>
            {completedTodos.map((todo) => renderTodoCard(todo, true))}
          </View>
        </>
      )}

      {/* Add Todo Modal */}
      <AddTodoModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
    </View>
  );

  function renderTodoCard(todo: TodoTask, isDone: boolean) {
    const isExpanded = expandedTodoIds.has(todo.id);
    const subtasks = todo.subTasks || [];
    const completedSubs = subtasks.filter((s) => s.isDone).length;

    const priorityColor =
      todo.priority === 'urgent'
        ? theme.danger
        : todo.priority === 'high'
        ? theme.warning
        : todo.priority === 'medium'
        ? theme.primary
        : theme.accentSage;

    return (
      <View
        key={todo.id}
        style={[
          styles.todoCard,
          {
            backgroundColor: theme.card,
            borderColor: isDone ? theme.cardBorder : priorityColor + '60',
            opacity: isDone ? 0.75 : 1,
          },
          theme.cardShadow,
        ]}
      >
        <View style={styles.todoMainRow}>
          {/* Checkbox */}
          <TouchableOpacity
            style={[
              styles.todoCheckbox,
              {
                borderColor: isDone ? theme.success : priorityColor,
                backgroundColor: isDone ? theme.success : 'transparent',
              },
            ]}
            onPress={() => toggleTodo(todo.id)}
          >
            {isDone && <Check size={13} color="#FFF" />}
          </TouchableOpacity>

          {/* Details */}
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.todoTitle,
                {
                  color: isDone ? theme.textMuted : theme.text,
                  textDecorationLine: isDone ? 'line-through' : 'none',
                },
              ]}
            >
              {isTamil && todo.title === 'Read Bible Today'
                ? 'இன்றைய வேதாகம வாசிப்பு'
                : isTamil && todo.title === 'Prayer Today'
                ? 'இன்றைய ஜெபம்'
                : todo.title}
            </Text>

            {todo.description ? (
              <Text style={[styles.todoDesc, { color: theme.textMuted }]}>
                {isTamil && todo.id === 'todo-daily-bible'
                  ? 'தினசரி வேதாகம அதிகாரங்களை வாசித்து தியானிக்கவும்.'
                  : isTamil && todo.id === 'todo-daily-prayer'
                  ? 'A.C.T.S மாதிரியில் தேவ சமூகத்தில் ஜெபிக்கவும்.'
                  : todo.description}
              </Text>
            ) : null}

            <View style={styles.todoBadgeRow}>
              <View style={[styles.categoryBadge, { backgroundColor: theme.cardAlt }]}>
                <Text style={[styles.categoryBadgeText, { color: theme.primary }]}>
                  {isTamil && todo.category === 'Spiritual' ? 'ஆவிக்குரியவை' : todo.category}
                </Text>
              </View>

              {todo.priority && todo.priority !== 'low' && (
                <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '25', borderColor: priorityColor }]}>
                  <Text style={[styles.priorityBadgeText, { color: priorityColor }]}>
                    {todo.priority.toUpperCase()}
                  </Text>
                </View>
              )}

              {todo.isDailyRoutine && (
                <View style={[styles.routineBadge, { backgroundColor: theme.primary + '20' }]}>
                  <Sparkles size={10} color={theme.primary} />
                  <Text style={[styles.routineBadgeText, { color: theme.primary }]}>Daily</Text>
                </View>
              )}

              {subtasks.length > 0 && (
                <TouchableOpacity onPress={() => toggleExpand(todo.id)} style={styles.subtaskCounter}>
                  <Text style={[styles.subtaskCounterText, { color: theme.accentSage }]}>
                    {completedSubs}/{subtasks.length}
                  </Text>
                  {isExpanded ? (
                    <ChevronUp size={13} color={theme.accentSage} />
                  ) : (
                    <ChevronDown size={13} color={theme.accentSage} />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Delete Action */}
          <TouchableOpacity onPress={() => deleteTodo(todo.id)} style={styles.deleteBtn}>
            <Trash2 size={14} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Subtasks Accordion */}
        {isExpanded && subtasks.length > 0 && (
          <View style={[styles.subtasksContainer, { borderTopColor: theme.cardBorder }]}>
            {subtasks.map((st) => (
              <TouchableOpacity
                key={st.id}
                style={styles.subtaskRow}
                onPress={() => toggleSubtask(todo.id, st.id)}
              >
                <View
                  style={[
                    styles.subCheckbox,
                    {
                      borderColor: st.isDone ? theme.success : theme.textMuted,
                      backgroundColor: st.isDone ? theme.success : 'transparent',
                    },
                  ]}
                >
                  {st.isDone && <Check size={9} color="#FFF" />}
                </View>
                <Text
                  style={[
                    styles.subtaskText,
                    {
                      color: st.isDone ? theme.textMuted : theme.text,
                      textDecorationLine: st.isDone ? 'line-through' : 'none',
                    },
                  ]}
                >
                  {st.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.hero,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  heroLeft: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  heroHeading: {
    fontSize: 15,
    fontWeight: '800',
  },
  heroSub: {
    fontSize: 11,
    marginTop: 2,
  },
  scriptureQuote: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 6,
    lineHeight: 14,
  },
  addCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  addCtaText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '800',
  },
  filterBar: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: 3,
    marginBottom: spacing.sm,
  },
  filterTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    padding: 0,
  },
  sectionHeader: {
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  tasksList: {
    gap: spacing.sm,
  },
  todoCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  todoMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  todoCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  todoTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  todoDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  todoBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 6,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  priorityBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  priorityBadgeText: {
    fontSize: 8,
    fontWeight: '900',
  },
  routineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  routineBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  subtaskCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  subtaskCounterText: {
    fontSize: 10,
    fontWeight: '800',
  },
  deleteBtn: {
    padding: 4,
    marginTop: 2,
  },
  subtasksContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    gap: 6,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 3,
  },
  subCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  emptyText: {
    fontSize: 12,
  },
});
