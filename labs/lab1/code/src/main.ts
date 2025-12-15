import type { BlogComment, BlogPost, TrainingPlan, TrainingPlanWorkout, UserProgress, Workout } from './api';
import { initTheme } from './theme.js';

const { getAuthData, logout, requireAuth } = window.GrizzlyAuth;
const api = window.GrizzlyApi;

type PageName =
  | 'landing'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'workouts'
  | 'workout-detail'
  | 'training-plans'
  | 'training-plan-detail'
  | 'blog'
  | 'blog-post'
  | undefined;

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupNavbar();
  routeInit();
});

function setupNavbar(): void {
  const { token, userName } = getAuthData();
  const loginLink = document.querySelector<HTMLAnchorElement>('[data-nav="login"]');
  const registerLink = document.querySelector<HTMLAnchorElement>('[data-nav="register"]');
  const dashboardLink = document.querySelector<HTMLAnchorElement>('[data-nav="dashboard"]');
  const logoutLink = document.querySelector<HTMLAnchorElement>('[data-nav="logout"]');
  const userNameBadge = document.querySelector<HTMLElement>('[data-user-name]');
  const guestOnlyElements = document.querySelectorAll<HTMLElement>('[data-guest-only]');
  const authOnlyElements = document.querySelectorAll<HTMLElement>('[data-auth-only]');

  if (token) {
    loginLink?.classList.add('d-none');
    registerLink?.classList.add('d-none');
    dashboardLink?.classList.remove('d-none');
    logoutLink?.classList.remove('d-none');
    guestOnlyElements.forEach((el) => el.classList.add('d-none'));
    authOnlyElements.forEach((el) => el.classList.remove('d-none'));
    if (userNameBadge) {
      userNameBadge.textContent = userName || 'Athlete';
      userNameBadge.classList.remove('d-none');
    }
    logoutLink?.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  } else {
    loginLink?.classList.remove('d-none');
    registerLink?.classList.remove('d-none');
    dashboardLink?.classList.add('d-none');
    logoutLink?.classList.add('d-none');
    userNameBadge?.classList.add('d-none');
    guestOnlyElements.forEach((el) => el.classList.remove('d-none'));
    authOnlyElements.forEach((el) => el.classList.add('d-none'));
  }
}

function routeInit(): void {
  const page = document.body.dataset.page as PageName;
  switch (page) {
    case 'landing':
      initLanding();
      break;
    case 'login':
      initLogin();
      break;
    case 'register':
      initRegister();
      break;
    case 'dashboard':
      requireAuth();
      initDashboard();
      break;
    case 'workouts':
      initWorkouts();
      break;
    case 'workout-detail':
      initWorkoutDetail();
      break;
    case 'training-plans':
      initTrainingPlans();
      break;
    case 'training-plan-detail':
      initTrainingPlanDetail();
      break;
    case 'blog':
      initBlog();
      break;
    case 'blog-post':
      initBlogPost();
      break;
    default:
      break;
  }
}

function initLanding(): void {
  const workoutsContainer = document.getElementById('workoutsPreview');
  const blogContainer = document.getElementById('blogPreview');

  api.getWorkouts()
    .then((data) => {
      const list = Array.isArray(data) ? data.slice(0, 4) : [];
      renderWorkoutCards(list, workoutsContainer);
    })
    .catch(() => {
      const fallback = [
        { id: 1, title: 'Power HIIT', level: 'advanced', workout_type: 'cardio', duration_min: 25 },
        { id: 2, title: 'Strength 101', level: 'beginner', workout_type: 'strength', duration_min: 40 },
      ];
      renderWorkoutCards(fallback, workoutsContainer);
    });

  api.getBlogPosts()
    .then((posts) => {
      const list = Array.isArray(posts) ? posts.slice(0, 3) : [];
      renderBlogCards(list, blogContainer);
    })
    .catch(() => {
      const fallback = [
        { id: 1, title: 'Fuel like a bear', content: 'Basics of nutrition.', created_at: '2025-01-10' },
        { id: 2, title: 'Mobility every day', content: 'Stretch to grow.', created_at: '2025-01-15' },
      ];
      renderBlogCards(fallback, blogContainer);
    });
}

function getFormValue(form: HTMLFormElement, name: string): string {
  const control = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
  return (control?.value ?? '').trim();
}

function initLogin(): void {
  const form = document.getElementById('loginForm') as HTMLFormElement | null;
  const alertBox = document.getElementById('loginAlert');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertBox?.classList.add('d-none');
    const email = getFormValue(form, 'email');
    const password = getFormValue(form, 'password');
    try {
      const res = await api.login(email, password);
      const token = res?.token || (res as any)?.access_token || (res as any)?.authToken;
      if (!token) throw new Error('No token returned');
      const userData = await api.getCurrentUserByEmail(email);
      window.GrizzlyAuth.setAuthData({
        token,
        userId: String(userData?.id ?? ''),
        userEmail: email,
        userName: userData?.name,
      });
      window.location.href = 'dashboard.html';
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to login. Please try again.';
      if (alertBox) {
        alertBox.textContent = message;
        alertBox.classList.remove('d-none');
      }
    }
  });
}

function initRegister(): void {
  const form = document.getElementById('registerForm') as HTMLFormElement | null;
  const alertBox = document.getElementById('registerAlert');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertBox?.classList.add('d-none');
    const payload = {
      name: getFormValue(form, 'name'),
      email: getFormValue(form, 'email'),
      password_hash: getFormValue(form, 'password'),
      date_of_birth: getFormValue(form, 'date_of_birth'),
      gender: getFormValue(form, 'gender'),
    };
    try {
      await api.registerUser(payload);
      const res = await api.login(payload.email, payload.password_hash);
      const token = res?.token || (res as any)?.access_token || (res as any)?.authToken;
      const userData = await api.getCurrentUserByEmail(payload.email);
      window.GrizzlyAuth.setAuthData({
        token,
        userId: String(userData?.id ?? ''),
        userEmail: payload.email,
        userName: userData?.name || payload.name,
      });
      window.location.href = 'dashboard.html';
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      if (alertBox) {
        alertBox.textContent = message;
        alertBox.classList.remove('d-none');
      }
    }
  });
}

function initDashboard(): void {
  const { userName, userEmail, userId } = getAuthData();
  const userNameElement = document.getElementById('userName');
  if (userNameElement) {
    userNameElement.textContent = userName || 'Athlete';
  }

  const userEmailElement = document.getElementById('userEmail');
  if (userEmailElement) {
    userEmailElement.textContent = userEmail || '';
  }
  const initials = (userName || 'GG')
    .split(' ')
    .filter(Boolean)
    .map((part: string) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2);
  const userInitialsElement = document.getElementById('userInitials');
  if (userInitialsElement) {
    userInitialsElement.textContent = initials || 'GG';
  }

  const progressContainer = document.getElementById('progressContainer');
  const progressHistoryContainer = document.getElementById('progressHistory');
  const trainingPlansContainer = document.getElementById('trainingPlansContainer');

  loadProgress(userId, progressContainer, progressHistoryContainer);

  api.getUserTrainingPlans()
    .then(async (plans) => {
      const userPlans = (plans || []).filter((plan) => String(plan.user_id) === String(userId));
      if (!trainingPlansContainer) return;
      if (!userPlans.length) {
        trainingPlansContainer.innerHTML = '<p class="mb-0">No training plans linked yet.</p>';
        return;
      }
      const listItems = await Promise.all(userPlans.map(async (p) => {
        try {
          const planInfo = await api.getTrainingPlan(p.training_plan_id);
          const planTitle = getPlanTitle(planInfo, p.training_plan_id);
          const planDescription = getPlanDescription(planInfo);
          return `
            <li class="list-group-item d-flex flex-column">
              <strong>${planTitle}</strong>
              <small class="text-muted">${planDescription}</small>
              <div class="mt-2 d-flex gap-2">
                <a class="btn btn-sm btn-brand-primary" href="training-plan.html?id=${p.training_plan_id}">View plan</a>
              </div>
            </li>
          `;
        } catch (e) {
          const fallbackTitle = getPlanTitle(p as { title?: unknown; plan_name?: string; name?: string }, p.training_plan_id);
          const fallbackDescription = getPlanDescription(p as { description?: unknown; training_plan?: { description?: unknown } });
          return `
            <li class="list-group-item d-flex flex-column">
              <strong>${fallbackTitle}</strong>
              <small class="text-muted">${fallbackDescription}</small>
              <div class="mt-2 d-flex gap-2">
                <span class="badge bg-light text-dark">Plan #${p.training_plan_id}</span>
              </div>
            </li>
          `;
        }
      }));
      trainingPlansContainer.innerHTML = `<ul class="list-group list-group-flush">${listItems.join('')}</ul>`;
    })
    .catch(() => {
      if (trainingPlansContainer) {
        trainingPlansContainer.innerHTML = '<p class="text-danger">Unable to load plans.</p>';
      }
    });
}

function loadProgress(
  userId: string | number | null,
  container: HTMLElement | null,
  historyContainer: HTMLElement | null,
): void {
  api.getUserProgress()
    .then((rows) => {
      const userRows = filterUserProgress(rows, userId);
      const sorted = sortProgressRecords(userRows);
      const latest = sorted[0];
      if (!latest) {
        if (container) {
          container.innerHTML = '<p class="mb-2">No progress yet. Log your first update below to start tracking.</p>';
        }
        if (historyContainer) {
          historyContainer.innerHTML = '<p class="text-muted small mb-0">No updates yet. Your history will appear here after the first save.</p>';
        }
        attachProgressForm(undefined, userId, container, historyContainer);
        return;
      }
      if (container) {
        renderProgress(latest, container);
      }
      renderProgressHistory(sorted, historyContainer, latest.id);
      attachProgressForm(latest, userId, container, historyContainer);
    })
    .catch(() => {
      if (container) {
        container.innerHTML = '<p class="text-danger">Unable to load progress.</p>';
      }
      if (historyContainer) {
        historyContainer.innerHTML = '<p class="text-danger">Unable to load progress history.</p>';
      }
    });
}

function filterUserProgress(rows: UserProgress[] | null | undefined, userId: string | number | null): UserProgress[] {
  return (rows || []).filter((row) => String(row.user_id) === String(userId));
}

function getProgressTimestamp(record: UserProgress): number {
  const dateValue = record.updated_at || record.created_at;
  const parsed = dateValue ? new Date(dateValue).getTime() : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatProgressDateTime(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function sortProgressRecords(records: UserProgress[]): UserProgress[] {
  return [...records].sort((a, b) => getProgressTimestamp(b) - getProgressTimestamp(a));
}

function attachProgressForm(
  latestRecord: UserProgress | undefined,
  userId?: string | number | null,
  container?: HTMLElement | null,
  historyContainer?: HTMLElement | null,
): void {
  const form = document.getElementById('progressForm') as HTMLFormElement | null;
  if (!form) return;
  form.classList.remove('d-none');
  setNumberInputValue(form, 'current_weight', latestRecord?.current_weight);
  setNumberInputValue(form, 'target_weight', latestRecord?.target_weight);
  setNumberInputValue(form, 'steps_walked', latestRecord?.steps_walked);
  setNumberInputValue(form, 'water_intake', latestRecord?.water_intake);
  const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (submitBtn) {
    submitBtn.textContent = latestRecord ? 'Log new progress' : 'Save first progress entry';
  }
  form.onsubmit = async (e) => {
    e.preventDefault();
    const numericUserId = Number(userId);
    const payload = {
      user_id: Number.isFinite(numericUserId) ? numericUserId : undefined,
      current_weight: parseNumericInput(getFormValue(form, 'current_weight'), latestRecord?.current_weight),
      target_weight: parseNumericInput(getFormValue(form, 'target_weight'), latestRecord?.target_weight),
      steps_walked: parseNumericInput(getFormValue(form, 'steps_walked'), latestRecord?.steps_walked),
      water_intake: parseNumericInput(getFormValue(form, 'water_intake'), latestRecord?.water_intake),
    };
    const alertBox = document.getElementById('progressAlert');
    alertBox?.classList.add('d-none');
    try {
      if (!Number.isFinite(numericUserId)) {
        throw new Error('Unable to identify user for progress update.');
      }
      await api.updateUserProgress(payload);
      if (alertBox) {
        alertBox.textContent = 'Progress saved!';
        alertBox.classList.remove('d-none');
        alertBox.classList.remove('alert-danger');
        alertBox.classList.add('alert-success');
      }
      if (userId !== undefined) {
        loadProgress(userId ?? null, container ?? null, historyContainer ?? null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update progress';
      if (alertBox) {
        alertBox.textContent = message;
        alertBox.classList.remove('d-none');
        alertBox.classList.remove('alert-success');
        alertBox.classList.add('alert-danger');
      }
    }
  };
}

function setNumberInputValue(form: HTMLFormElement, name: string, value: number | undefined): void {
  const control = form.elements.namedItem(name) as HTMLInputElement | null;
  if (!control) return;
  if (value === undefined || value === null) {
    control.value = '';
    return;
  }
  control.value = String(value);
}

function parseNumericInput(raw: string, fallback?: number): number | undefined {
  if (raw === '') return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function renderProgress(
  record: { current_weight?: number; target_weight?: number; steps_walked?: number; water_intake?: number; updated_at?: string; created_at?: string },
  container: HTMLElement,
): void {
  const lastUpdated = formatProgressDateTime(record.updated_at || record.created_at);
  container.innerHTML = `
    <div class="progress-card">
      <div class="d-flex justify-content-between">
        <div>
          <p class="mb-1 text-muted">Current weight</p>
          <h5 class="fw-bold">${record.current_weight ?? '-'} kg</h5>
        </div>
        <div>
          <p class="mb-1 text-muted">Target weight</p>
          <h5 class="fw-bold">${record.target_weight ?? '-'} kg</h5>
        </div>
      </div>
      <div class="mt-3 d-flex justify-content-between">
        <div>
          <p class="mb-1 text-muted">Steps walked</p>
          <h6>${record.steps_walked ?? 0}</h6>
        </div>
        <div>
          <p class="mb-1 text-muted">Water intake</p>
          <h6>${record.water_intake ?? 0} L</h6>
        </div>
      </div>
      <p class="text-muted small mb-0 mt-3">Last updated: ${lastUpdated}</p>
    </div>
  `;
}

function renderProgressHistory(records: UserProgress[], container: HTMLElement | null, liveRecordId?: number): void {
  if (!container) return;
  const historyRecords = [...records]
    .sort((a, b) => getProgressTimestamp(b) - getProgressTimestamp(a))
    .slice(0, 7);
  if (!historyRecords.length) {
    container.innerHTML = '<p class="text-muted small mb-0">No previous updates yet.</p>';
    return;
  }
  const items = historyRecords
    .map((record) => {
      const friendlyDate = formatProgressDateTime(record.updated_at || record.created_at);
      const isLatest = liveRecordId !== undefined ? record.id === liveRecordId : false;
      const badge = isLatest ? '<span class="badge bg-dark ms-2">Latest</span>' : '';
      return `
        <li class="d-flex justify-content-between align-items-start py-2 border-bottom small gap-3">
          <div class="flex-grow-1">
            <div class="fw-semibold">${record.current_weight ?? '-'} kg</div>
            <div class="text-muted">Target: ${record.target_weight ?? '-'} kg</div>
            <div class="text-muted">Steps: ${record.steps_walked ?? 0} · Water: ${record.water_intake ?? 0} L</div>
          </div>
          <div class="text-end text-muted">${friendlyDate}${badge}</div>
        </li>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="mt-3">
      <h6 class="fw-bold mb-2">Recent updates</h6>
      <ul class="list-unstyled mb-0">${items}</ul>
    </div>
  `;
}

function getPlanTitle(planInfo: { title?: unknown; plan_name?: string; name?: string; workout?: { title?: string }; training_plan?: { title?: string; plan_name?: string; name?: string } }, id: number | string): string {
  if (planInfo && typeof planInfo === 'object' && 'training_plan' in planInfo) {
    const nested = (planInfo as { training_plan?: { title?: string; plan_name?: string; name?: string } }).training_plan;
    if (nested) {
      const nestedTitle = getPlanTitle(nested, id);
      if (nestedTitle) return nestedTitle;
    }
  }
  if (typeof planInfo.plan_name === 'string') return planInfo.plan_name;
  if (typeof planInfo.title === 'string') return planInfo.title;
  if (typeof planInfo.name === 'string') return planInfo.name;
  if (typeof planInfo?.workout?.title === 'string') return planInfo.workout.title;
  return `Plan #${id}`;
}

function getPlanDescription(planInfo: { description?: unknown; training_plan?: { description?: unknown } }): string {
  if (planInfo && typeof planInfo === 'object' && 'training_plan' in planInfo) {
    const nested = (planInfo as { training_plan?: { description?: unknown } }).training_plan;
    if (nested) {
      const nestedDescription = getPlanDescription(nested);
      if (nestedDescription) return nestedDescription;
    }
  }
  if (typeof planInfo.description === 'string' && planInfo.description.trim()) return planInfo.description.trim();
  return 'No description available.';
}

async function isPlanAlreadySelected(planId: string | number, userId: string | number | null): Promise<boolean> {
  const { token } = getAuthData();
  if (!token) return false;
  try {
    const plans = await api.getUserTrainingPlans();
    return (plans || []).some(
      (plan) => String(plan.user_id) === String(userId) && String(plan.training_plan_id) === String(planId),
    );
  } catch (err) {
    return false;
  }
}

function formatPersonName(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value.trim()) return value;
  if (value && typeof value === 'object') {
    const candidate = (value as { name?: string; fullName?: string; username?: string }).name
      || (value as { name?: string; fullName?: string; username?: string }).fullName
      || (value as { name?: string; fullName?: string; username?: string }).username;
    if (candidate && candidate.trim()) return candidate;
  }
  return fallback;
}

function getPostContentText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (content && typeof content === 'object' && 'text' in content && typeof (content as { text?: string }).text === 'string') {
    return (content as { text?: string }).text ?? '';
  }
  return '';
}

function getPostPreview(content: unknown): string {
  const text = getPostContentText(content).trim();
  if (!text) return 'Read the full story inside.';
  const snippet = text.slice(0, 120);
  return snippet.length < text.length ? `${snippet}...` : snippet;
}

function initWorkouts(): void {
  const grid = document.getElementById('workoutsGrid');
  const levelSelect = document.getElementById('filterLevel') as HTMLSelectElement | null;
  const typeSelect = document.getElementById('filterType') as HTMLSelectElement | null;
  const durationSelect = document.getElementById('filterDuration') as HTMLSelectElement | null;
  let workoutsData: Workout[] = [];

  const debounce = (fn: (...args: unknown[]) => void, wait = 200) => {
    let timeout: number | undefined;
    return (...args: unknown[]) => {
      if (timeout) window.clearTimeout(timeout);
      timeout = window.setTimeout(() => fn.apply(undefined, args), wait);
    };
  };

  const applyFilters = () => {
    const level = levelSelect?.value ?? '';
    const type = typeSelect?.value ?? '';
    const duration = durationSelect?.value ?? '';
    const filtered = workoutsData.filter((w) => {
      const matchLevel = !level || w.level === level;
      const matchType = !type || w.workout_type === type;
      const matchDuration = (() => {
        if (!duration) return true;
        if (duration === '<20') return (w.duration_min ?? 0) < 20;
        if (duration === '20-40') return (w.duration_min ?? 0) >= 20 && (w.duration_min ?? 0) <= 40;
        if (duration === '>40') return (w.duration_min ?? 0) > 40;
        return true;
      })();
      return matchLevel && matchType && matchDuration;
    });
    renderWorkoutCards(filtered, grid);
  };

  [levelSelect, typeSelect, durationSelect].forEach((el) => {
    el?.addEventListener('change', debounce(applyFilters));
  });

  const loadWorkouts = async () => {
    try {
      const data = await api.getWorkouts();
      workoutsData = Array.isArray(data) ? data : [];
      applyFilters();
    } catch (error) {
      workoutsData = [
        { id: 1, title: 'Quick Cardio', level: 'beginner', workout_type: 'cardio', duration_min: 18, description: 'Fast fat-burner' },
        { id: 2, title: 'Barbell Strength', level: 'advanced', workout_type: 'strength', duration_min: 50, description: 'Compound lifts' },
        { id: 3, title: 'Stretch & Flex', level: 'intermediate', workout_type: 'flexibility', duration_min: 30, description: 'Mobility focus' },
      ];
      applyFilters();
    }
  };

  loadWorkouts();
}

function renderWorkoutCards(list: Workout[], container: HTMLElement | null): void {
  if (!container) return;
  if (!list?.length) {
    container.innerHTML = '<p class="text-muted">No workouts found.</p>';
    return;
  }
  container.innerHTML = list
    .map((w) => `
      <div class="card workout-card">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="card-title mb-0">${w.title}</h5>
            <span class="card-tag">${w.level || 'all levels'}</span>
          </div>
          <p class="card-text text-muted small">${w.workout_type || 'mixed'} · ${w.duration_min || 0} min</p>
          <p class="card-text flex-grow-1">${w.description || ''}</p>
          <a class="btn btn-sm btn-brand-primary mt-auto align-self-start" href="workout.html?id=${w.id}">View details</a>
        </div>
      </div>
    `)
    .join('');
}

function renderBlogCards(list: BlogPost[], container: HTMLElement | null): void {
  if (!container) return;
  if (!list?.length) {
    container.innerHTML = '<p class="text-muted">No posts yet.</p>';
    return;
  }
  container.innerHTML = list
    .map((post) => `
      <div class="card h-100">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${post.title}</h5>
          <p class="card-text text-muted small">${new Date(post.created_at || Date.now()).toLocaleDateString()}</p>
          <p class="card-text flex-grow-1">${getPostPreview(post.content)}</p>
          <a class="btn btn-sm btn-brand-primary mt-auto align-self-start" href="blog-post.html?id=${post.id}">Read more</a>
        </div>
      </div>
    `)
    .join('');
}

function initWorkoutDetail(): void {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const container = document.getElementById('workoutDetail');

  if (!id) {
    if (container) {
      container.innerHTML = '<p class="text-danger">Workout not found.</p>';
    }
    return;
  }

  api.getWorkout(id)
    .then((workout) => renderWorkoutDetail(workout, container))
    .catch(() => {
      if (container) {
        container.innerHTML = '<p class="text-danger">Could not load workout details.</p>';
      }
    });
}

function renderWorkoutDetail(workout: Workout, container: HTMLElement | null): void {
  if (!container) return;
  container.innerHTML = `
    <div class="card">
      <div class="card-body">
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">
          <div>
            <h2 class="section-title mb-2">${workout.title}</h2>
            <p class="text-muted mb-0">${workout.workout_type || ''} · ${workout.level || ''} · ${workout.duration_min || 0} minutes</p>
          </div>
          <span class="card-tag card-tag--accent">Featured</span>
        </div>
        <p>${workout.description || 'No description provided.'}</p>
        <h6 class="fw-bold">Instructions</h6>
        <p>${workout.instructions || 'Follow the trainer guidance and maintain form.'}</p>
        ${workout.video_url ? `<div class="ratio ratio-16x9"><iframe src="${workout.video_url}" title="Workout video" allowfullscreen></iframe></div>` : ''}
      </div>
    </div>
  `;
}

function initTrainingPlans(): void {
  const grid = document.getElementById('trainingPlansGrid');
  const { userId, token } = getAuthData();
  let plans: TrainingPlan[] = [];
  let planWorkouts: TrainingPlanWorkout[] = [];
  let selectedPlanIds = new Set<number>();

  const renderPlans = () => {
    if (!grid) return;
    if (!plans.length) {
      grid.innerHTML = '<p class="text-muted">No training plans found.</p>';
      return;
    }

    grid.innerHTML = plans
      .map((plan) => {
        const workoutsForPlan = planWorkouts.filter((pw) => String(pw.training_plan_id) === String(plan.id));
        const workoutCount = workoutsForPlan.length;
        const title = getPlanTitle(plan, plan.id);
        const description = typeof plan.description === 'string' ? plan.description : 'Stay consistent with this program.';
        const alreadySelected = selectedPlanIds.has(Number(plan.id));
        const cta = token
          ? `<button class="btn btn-sm ${alreadySelected ? 'btn-secondary' : 'btn-brand-primary'}" data-add-plan="${plan.id}" ${
              alreadySelected ? 'disabled' : ''
            }>${alreadySelected ? 'Added to your plans' : 'Add to my plans'}</button>`
          : '<a class="btn btn-sm btn-outline-dark" href="login.html">Log in to add</a>';

        return `
          <div class="card h-100 training-plan-card">
            <div class="card-body d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h5 class="card-title mb-1">${title}</h5>
                  <p class="text-muted small mb-1">${workoutCount || 'No'} workouts included</p>
                </div>
                <span class="card-tag card-tag--accent">Plan</span>
              </div>
              <p class="card-text flex-grow-1">${description}</p>
              <div class="mt-3 d-flex gap-2 flex-wrap align-items-center">
                ${cta}
                <a class="btn btn-sm btn-outline-dark" href="training-plan.html?id=${plan.id}">View details</a>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    grid.querySelectorAll<HTMLButtonElement>('[data-add-plan]').forEach((button) => {
      button.addEventListener('click', async () => {
        const planId = Number(button.dataset.addPlan);
        if (!Number.isFinite(planId)) return;
        if (!token) {
          window.location.href = 'login.html';
          return;
        }
        button.disabled = true;
        try {
          await api.addUserTrainingPlan({ user_id: userId ? Number(userId) : undefined, training_plan_id: planId });
          selectedPlanIds.add(planId);
          button.textContent = 'Added to your plans';
          button.classList.remove('btn-brand-primary');
          button.classList.add('btn-secondary');
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to add plan';
          alert(message);
          button.disabled = false;
        }
      });
    });
  };

  const loadSelectedPlans = async () => {
    if (!token) {
      selectedPlanIds = new Set();
      return;
    }
    try {
      const userPlans = await api.getUserTrainingPlans();
      selectedPlanIds = new Set(
        (userPlans || [])
          .filter((plan) => String(plan.user_id) === String(userId))
          .map((plan) => Number(plan.training_plan_id))
          .filter((id) => Number.isFinite(id)),
      );
    } catch (err) {
      selectedPlanIds = new Set();
    }
  };

  const loadPlans = async () => {
    try {
      const [plansResponse, planWorkoutsResponse] = await Promise.all([
        api.getTrainingPlans(),
        api.getTrainingPlanWorkouts().catch(() => [] as TrainingPlanWorkout[]),
      ]);
      plans = Array.isArray(plansResponse) ? plansResponse : [];
      planWorkouts = Array.isArray(planWorkoutsResponse) ? planWorkoutsResponse : [];
      await loadSelectedPlans();
      renderPlans();
    } catch (err) {
      plans = [];
      if (grid) {
        grid.innerHTML = '<p class="text-danger">Unable to load training plans.</p>';
      }
    }
  };

  loadPlans();
}

function initTrainingPlanDetail(): void {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const container = document.getElementById('trainingPlanDetail');
  const ctaButton = document.getElementById('addTrainingPlanButton') as HTMLButtonElement | null;
  const { userId, token } = getAuthData();

  if (!id) {
    if (container) {
      container.innerHTML = '<p class="text-danger">Training plan not found.</p>';
    }
    return;
  }

  const checkIfAlreadySelected = async () => {
    if (!ctaButton) return;
    const alreadyAdded = await isPlanAlreadySelected(id, userId);
    if (alreadyAdded) {
      ctaButton.textContent = 'Already in your plans';
      ctaButton.disabled = true;
      ctaButton.classList.remove('btn-brand-primary');
      ctaButton.classList.add('btn-secondary');
    }
  };

  const loadPlan = async () => {
    try {
      const [plan, planWorkouts] = await Promise.all([
        api.getTrainingPlan(id),
        api.getTrainingPlanWorkouts().catch(() => [] as TrainingPlanWorkout[]),
      ]);
      const workoutsForPlan = (planWorkouts || [])
        .filter((pw) => String(pw.training_plan_id) === String(id))
        .map((pw) => pw.workout)
        .filter(Boolean) as Workout[];
      renderTrainingPlanDetail(plan, workoutsForPlan, container);
    } catch (err) {
      if (container) {
        container.innerHTML = '<p class="text-danger">Could not load training plan details.</p>';
      }
    }
  };

  loadPlan();
  checkIfAlreadySelected();

  ctaButton?.addEventListener('click', async () => {
    if (!token) {
      window.location.href = 'login.html';
      return;
    }
    try {
      await api.addUserTrainingPlan({ user_id: userId ? Number(userId) : undefined, training_plan_id: Number(id) });
      ctaButton.textContent = 'Added!';
      ctaButton.disabled = true;
      ctaButton.classList.remove('btn-brand-primary');
      ctaButton.classList.add('btn-secondary');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add to plans';
      alert(message);
    }
  });
}

function renderTrainingPlanDetail(plan: TrainingPlan, workouts: Workout[], container: HTMLElement | null): void {
  if (!container) return;
  const title = getPlanTitle(plan, plan.id);
  const description = typeof plan.description === 'string' ? plan.description : 'No description provided for this plan yet.';
  const workoutItems = workouts.length
    ? workouts
        .map(
          (workout) => `
            <li class="list-group-item">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <strong>${workout.title}</strong>
                  <p class="mb-0 text-muted small">${workout.workout_type || 'mixed'} · ${workout.level || 'all levels'} · ${
            workout.duration_min || 0
          } min</p>
                </div>
                <a class="small" href="workout.html?id=${workout.id}">View workout</a>
              </div>
            </li>
          `,
        )
        .join('')
    : '<li class="list-group-item text-muted">No workouts linked yet.</li>';

  container.innerHTML = `
    <div class="card">
      <div class="card-body">
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">
          <div>
            <h2 class="section-title mb-2">${title}</h2>
            <p class="text-muted mb-0">${workouts.length || 'No'} workouts included</p>
          </div>
          <span class="card-tag card-tag--accent">Training plan</span>
        </div>
        <p>${description}</p>
        <h6 class="fw-bold">Workouts in this plan</h6>
        <ul class="list-group list-group-flush">${workoutItems}</ul>
      </div>
    </div>
  `;
}

function initBlog(): void {
  const container = document.getElementById('blogList');
  api.getBlogPosts()
    .then((posts) => renderBlogCards(posts, container))
    .catch(() => {
      const fallback: BlogPost[] = [
        { id: 1, title: 'Recovery basics', content: 'Sleep, hydration, and rest days.', created_at: '2025-01-05' },
      ];
      renderBlogCards(fallback, container);
    });
}

function initBlogPost(): void {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const container = document.getElementById('blogPost');
  const commentsContainer = document.getElementById('commentsList');
  const commentForm = document.getElementById('commentForm') as HTMLFormElement | null;
  const { userId, token, userName, userEmail } = getAuthData();

  if (!id) {
    if (container) container.innerHTML = '<p class="text-danger">Post not found.</p>';
    return;
  }

  if (!token) {
    commentForm?.classList.add('d-none');
  }

  api.getBlogPost(id)
    .then((post) => {
      renderBlogPost(post, container);
      renderComments(post.comments || [], commentsContainer);
    })
    .catch(() => {
      if (container) container.innerHTML = '<p class="text-danger">Could not load post.</p>';
    });

  commentForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = getFormValue(commentForm, 'comment_text');
    if (!text) return;
    const alertBox = document.getElementById('commentAlert');
    alertBox?.classList.add('d-none');
    try {
      const displayName = userName || userEmail || 'Athlete';
      await api.createBlogComment({ post_id: Number(id), user_id: Number(userId), comment_text: text, user_name: displayName });
      commentForm.reset();
      const post = await api.getBlogPost(id);
      renderComments(post.comments || [], commentsContainer);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to post comment';
      if (alertBox) {
        alertBox.textContent = message;
        alertBox.classList.remove('d-none');
      }
    }
  });
}

function renderBlogPost(post: BlogPost, container: HTMLElement | null): void {
  if (!container) return;
  const authorName = formatPersonName(post.author, 'Grizzly Coach');
  const contentText = getPostContentText(post.content) || 'No content provided.';
  container.innerHTML = `
    <div class="card">
      <div class="card-body">
        <span class="card-tag mb-2">${new Date(post.created_at || Date.now()).toLocaleDateString()}</span>
        <h2 class="section-title">${post.title}</h2>
        <p class="text-muted">${authorName}</p>
        <p>${contentText}</p>
      </div>
    </div>
  `;
}

function renderComments(comments: BlogComment[], container: HTMLElement | null): void {
  if (!container) return;
  if (!comments.length) {
    container.innerHTML = '<p class="text-muted">No comments yet.</p>';
    return;
  }
  container.innerHTML = comments
    .map((c) => `
      <div class="comment-box mb-2">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <strong>${formatPersonName(c.user_name ?? c.user, 'Athlete')}</strong>
          <small class="text-muted">${new Date(c.created_at || Date.now()).toLocaleDateString()}</small>
        </div>
        <p class="mb-0">${c.comment_text}</p>
      </div>
    `)
    .join('');
}
