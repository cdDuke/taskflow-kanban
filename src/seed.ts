import type { Board, Lang, Task } from './types';

export const uid = () => Math.random().toString(36).slice(2, 10);

const day = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

type Seed = Omit<Task, 'id' | 'createdAt' | 'checklist' | 'labels'> & { labels: number[]; checklist?: [string, boolean][] };

const text = {
  ru: {
    boards: ['Запуск продукта', 'Дизайн-система', 'Личное'],
    columns: ['Бэклог', 'К выполнению', 'В работе', 'На ревью', 'Готово'],
    labels: ['Фронтенд', 'Бэкенд', 'Дизайн', 'Баг', 'Маркетинг', 'Исследование'],
    tasks: [
      { title: 'Лендинг для запуска', description: 'Hero, тарифы, FAQ и форма предзаказа. Адаптив под телефоны.', labels: [0, 2], priority: 'high', due: day(3), assignees: ['РМ', 'АК'], checklist: [['Макет в Figma', true], ['Вёрстка hero', true], ['Тарифы', false], ['Форма предзаказа', false]] },
      { title: 'Настроить аналитику событий', description: 'Воронка регистрации, клики по CTA и глубина скролла.', labels: [1, 4], priority: 'medium', due: day(6), assignees: ['ДС'] },
      { title: 'Исправить мигание темы при загрузке', description: 'Тема применяется после гидратации — нужно ставить класс до первого рендера.', labels: [0, 3], priority: 'urgent', due: day(-1), assignees: ['РМ'] },
      { title: 'API для приглашений в команду', description: 'POST /invites, письмо со ссылкой, срок жизни 72 часа.', labels: [1], priority: 'high', due: day(5), assignees: ['ИП'], checklist: [['Схема БД', true], ['Эндпоинт', false], ['Письмо', false]] },
      { title: 'Интервью с 5 пользователями', description: 'Понять, почему люди бросают онбординг на 3-м шаге.', labels: [5], priority: 'medium', assignees: ['АК'] },
      { title: 'Пресс-релиз и пост в блог', description: '', labels: [4], priority: 'low', due: day(10), assignees: ['ЕЛ'] },
      { title: 'Онбординг: пустые состояния', description: 'Иллюстрации и подсказки для пустых досок и списков.', labels: [2, 0], priority: 'medium', assignees: ['АК', 'РМ'] },
      { title: 'Оптимизировать изображения', description: 'AVIF + lazy loading, цель — LCP < 2 с.', labels: [0], priority: 'low', assignees: ['РМ'], checklist: [['Аудит Lighthouse', true], ['Конвертация', true]] },
      { title: 'Rate limiting для публичного API', description: '', labels: [1], priority: 'high', assignees: ['ИП'] },
      { title: 'Настроить CI и превью-деплои', description: 'Линтер, тесты и превью на каждый PR.', labels: [1, 0], priority: 'medium', assignees: ['ДС'], checklist: [['Линтер', true], ['Тесты', true], ['Превью', true]] },
      { title: 'Логотип и фирменные цвета', description: '', labels: [2], priority: 'medium', assignees: ['ЕЛ'] },
    ] as Seed[],
    distribution: [[4, 5, 10], [1, 6, 8], [0, 2, 3], [7], [9]] as number[][],
    board2: [['Токены цветов и типографики', 'Кнопки: все состояния', 'Модальные окна'], ['Иконки 24px', 'Документация в Storybook']],
    board3: [['Купить билеты в Стамбул', 'Записаться к стоматологу'], ['Прочитать «Чистую архитектуру»']],
  },
  en: {
    boards: ['Product launch', 'Design system', 'Personal'],
    columns: ['Backlog', 'To do', 'In progress', 'In review', 'Done'],
    labels: ['Frontend', 'Backend', 'Design', 'Bug', 'Marketing', 'Research'],
    tasks: [
      { title: 'Launch landing page', description: 'Hero, pricing, FAQ and pre-order form. Mobile first.', labels: [0, 2], priority: 'high', due: day(3), assignees: ['RM', 'AK'], checklist: [['Figma mockup', true], ['Build hero', true], ['Pricing', false], ['Pre-order form', false]] },
      { title: 'Set up event analytics', description: 'Sign-up funnel, CTA clicks and scroll depth.', labels: [1, 4], priority: 'medium', due: day(6), assignees: ['DS'] },
      { title: 'Fix theme flash on load', description: 'Theme is applied after hydration — set the class before first paint.', labels: [0, 3], priority: 'urgent', due: day(-1), assignees: ['RM'] },
      { title: 'Team invites API', description: 'POST /invites, email with link, 72h expiry.', labels: [1], priority: 'high', due: day(5), assignees: ['IP'], checklist: [['DB schema', true], ['Endpoint', false], ['Email', false]] },
      { title: 'Interview 5 users', description: 'Find out why people drop off at onboarding step 3.', labels: [5], priority: 'medium', assignees: ['AK'] },
      { title: 'Press release & blog post', description: '', labels: [4], priority: 'low', due: day(10), assignees: ['EL'] },
      { title: 'Onboarding empty states', description: 'Illustrations and hints for empty boards and lists.', labels: [2, 0], priority: 'medium', assignees: ['AK', 'RM'] },
      { title: 'Optimise images', description: 'AVIF + lazy loading, target LCP < 2s.', labels: [0], priority: 'low', assignees: ['RM'], checklist: [['Lighthouse audit', true], ['Convert', true]] },
      { title: 'Rate limiting for public API', description: '', labels: [1], priority: 'high', assignees: ['IP'] },
      { title: 'CI and preview deployments', description: 'Lint, tests and a preview for every PR.', labels: [1, 0], priority: 'medium', assignees: ['DS'], checklist: [['Linter', true], ['Tests', true], ['Previews', true]] },
      { title: 'Logo and brand colours', description: '', labels: [2], priority: 'medium', assignees: ['EL'] },
    ] as Seed[],
    distribution: [[4, 5, 10], [1, 6, 8], [0, 2, 3], [7], [9]] as number[][],
    board2: [['Colour & type tokens', 'Buttons: all states', 'Modals'], ['24px icon set', 'Storybook docs']],
    board3: [['Book tickets to Istanbul', 'Dentist appointment'], ['Read “Clean Architecture”']],
  },
};

const COLORS = ['#8b7bff', '#4f9dff', '#34d399', '#fbbf24', '#f87171', '#f472b6'];
const COLUMN_COLORS = ['#8b90a0', '#4f9dff', '#fbbf24', '#8b7bff', '#34d399'];

function makeBoard(lang: Lang, name: string, emoji: string, groups: { seed: Seed; col: number }[]): Board {
  const t = text[lang];
  const labels = t.labels.map((n, i) => ({ id: `l${i}`, name: n, color: COLORS[i] }));
  const columns = t.columns.map((title, i) => ({ id: uid(), title, color: COLUMN_COLORS[i], taskIds: [] as string[], wip: i === 2 ? 4 : undefined }));
  const tasks: Board['tasks'] = {};
  groups.forEach(({ seed, col }, i) => {
    const id = uid();
    tasks[id] = {
      ...seed,
      id,
      labels: seed.labels.map((l) => labels[l].id),
      checklist: (seed.checklist ?? []).map(([text, done]) => ({ id: uid(), text, done })),
      createdAt: Date.now() - (groups.length - i) * 3600_000,
    };
    columns[col].taskIds.push(id);
  });
  return { id: uid(), name, emoji, columns, tasks, labels };
}

export function seedBoards(lang: Lang): Board[] {
  const t = text[lang];
  const main = t.distribution.flatMap((ids, col) => ids.map((i) => ({ seed: t.tasks[i], col })));
  const simple = (titles: string[][], cols: number[]) =>
    titles.flatMap((list, gi) =>
      list.map((title) => ({ seed: { title, description: '', labels: [], priority: 'medium', assignees: [] } as Seed, col: cols[gi] }))
    );
  return [
    makeBoard(lang, t.boards[0], '🚀', main),
    makeBoard(lang, t.boards[1], '🎨', simple(t.board2, [1, 0])),
    makeBoard(lang, t.boards[2], '🌿', simple(t.board3, [1, 0])),
  ];
}
