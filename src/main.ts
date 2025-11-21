import type { BlogComment, BlogPost, Workout } from './api';

const { getAuthData, logout, requireAuth } = window.GrizzlyAuth;
const api = window.GrizzlyApi;

type PageName = 'landing' | 'login' | 'register' | 'dashboard' | 'workouts' | 'workout-detail' | 'blog' | 'blog-post' | undefined;

document.addEventListener('DOMContentLoaded', () => {
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

  if (token) {
    loginLink?.classList.add('d-none');
    registerLink?.classList.add('d-none');
    dashboardLink?.classList.remove('d-none');
    logoutLink?.classList.remove('d-none');
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
  const trainingPlansContainer = document.getElementById('trainingPlansContainer');

  api.getUserProgress()
    .then((rows) => {
      const record = (rows || []).find((row) => String(row.user_id) === String(userId));
      if (!record) {
        if (progressContainer) {
          progressContainer.innerHTML = '<p class="mb-2">No progress yet.</p><button class="btn btn-brand-primary" type="button" id="createProgressBtn">Create progress plan</button>';
          const createBtn = progressContainer.querySelector<HTMLButtonElement>('#createProgressBtn');
          createBtn?.addEventListener('click', () => createProgressRecord(userId ?? undefined, progressContainer));
        }
        return;
      }
      if (progressContainer) {
        renderProgress(record, progressContainer);
      }
      attachProgressForm(record.id);
    })
    .catch(() => {
      if (progressContainer) {
        progressContainer.innerHTML = '<p class="text-danger">Unable to load progress.</p>';
      }
    });

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
          const planTitle = planInfo.title || planInfo.plan_name || `Plan #${p.training_plan_id}`;
          const planDescription = planInfo.description || 'No description available.';
          return `
            <li class="list-group-item d-flex flex-column">
              <strong>${planTitle}</strong>
              <small class="text-muted">${planDescription}</small>
            </li>
          `;
        } catch (e) {
          return `<li class="list-group-item">Plan #${p.training_plan_id}</li>`;
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

async function createProgressRecord(userId: string | number | undefined, container: HTMLElement | null): Promise<void> {
  if (!container) return;
  const alertBox = document.getElementById('progressAlert');
  alertBox?.classList.add('d-none');
  const numericUserId = Number(userId);
  if (!Number.isFinite(numericUserId)) {
    if (alertBox) {
      alertBox.textContent = 'Unable to identify user for progress creation.';
      alertBox.classList.remove('d-none');
    }
    return;
  }

  try {
    const record = await api.createUserProgress({
      user_id: numericUserId,
      current_weight: 0,
      target_weight: 0,
      steps_walked: 0,
      water_intake: 0,
    });
    renderProgress(record, container);
    attachProgressForm(record.id);
    if (alertBox) {
      alertBox.textContent = 'Progress card created! Update it with your stats.';
      alertBox.classList.remove('d-none');
      alertBox.classList.remove('alert-danger');
      alertBox.classList.add('alert-success');
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create progress record';
    if (alertBox) {
      alertBox.textContent = message;
      alertBox.classList.remove('d-none');
      alertBox.classList.remove('alert-success');
      alertBox.classList.add('alert-danger');
    }
  }
}

function attachProgressForm(progressId: number): void {
  const form = document.getElementById('progressForm') as HTMLFormElement | null;
  if (!form) return;
  form.classList.remove('d-none');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      current_weight: Number(getFormValue(form, 'current_weight')),
      target_weight: Number(getFormValue(form, 'target_weight')),
      steps_walked: Number(getFormValue(form, 'steps_walked')),
      water_intake: Number(getFormValue(form, 'water_intake')),
    };
    const alertBox = document.getElementById('progressAlert');
    alertBox?.classList.add('d-none');
    try {
      await api.updateUserProgress(progressId, payload);
      if (alertBox) {
        alertBox.textContent = 'Progress updated!';
        alertBox.classList.remove('d-none');
        alertBox.classList.add('alert-success');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update progress';
      if (alertBox) {
        alertBox.textContent = message;
        alertBox.classList.remove('d-none');
      }
    }
  });
}

function renderProgress(record: { current_weight?: number; target_weight?: number; steps_walked?: number; water_intake?: number }, container: HTMLElement): void {
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
    </div>
  `;
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

  api.getWorkouts()
    .then((data) => {
      workoutsData = Array.isArray(data) ? data : [];
      renderWorkoutCards(workoutsData, grid);
    })
    .catch(() => {
      workoutsData = [
        { id: 1, title: 'Quick Cardio', level: 'beginner', workout_type: 'cardio', duration_min: 18, description: 'Fast fat-burner' },
        { id: 2, title: 'Barbell Strength', level: 'advanced', workout_type: 'strength', duration_min: 50, description: 'Compound lifts' },
        { id: 3, title: 'Stretch & Flex', level: 'intermediate', workout_type: 'flexibility', duration_min: 30, description: 'Mobility focus' },
      ];
      renderWorkoutCards(workoutsData, grid);
    });
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
          <h5 class="card-title card-tag--accent">${post.title}</h5>
          <p class="card-text text-muted small">${new Date(post.created_at || Date.now()).toLocaleDateString()}</p>
          <p class="card-text flex-grow-1">${(post.content || '').slice(0, 120)}...</p>
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
  const ctaButton = document.getElementById('addPlanButton') as HTMLButtonElement | null;
  const { userId, token } = getAuthData();

  if (!id) {
    if (container) {
      container.innerHTML = '<p class="text-danger">Workout not found.</p>';
    }
    return;
  }

  if (!token) {
    ctaButton?.classList.add('d-none');
  }

  api.getWorkout(id)
    .then((workout) => renderWorkoutDetail(workout, container))
    .catch(() => {
      if (container) {
        container.innerHTML = '<p class="text-danger">Could not load workout details.</p>';
      }
    });

  ctaButton?.addEventListener('click', async () => {
    if (!token) {
      window.location.href = 'login.html';
      return;
    }
    try {
      await api.addUserTrainingPlan({ user_id: userId ? Number(userId) : undefined, training_plan_id: Number(id) });
      if (ctaButton) {
        ctaButton.textContent = 'Added!';
        ctaButton.disabled = true;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add to plan';
      alert(message);
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
  const { userId, token, userName } = getAuthData();

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
      await api.createBlogComment({ post_id: Number(id), user_id: Number(userId), comment_text: text, user_name: userName || undefined });
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
  container.innerHTML = `
    <div class="card">
      <div class="card-body">
        <span class="card-tag card-tag--accent mb-2">${new Date(post.created_at || Date.now()).toLocaleDateString()}</span>
        <h2 class="section-title">${post.title}</h2>
        <p class="text-muted">${post.author || 'Grizzly Coach'}</p>
        <p>${post.content}</p>
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
          <strong>${c.user_name || c.user || 'Athlete'}</strong>
          <small class="text-muted">${new Date(c.created_at || Date.now()).toLocaleDateString()}</small>
        </div>
        <p class="mb-0">${c.comment_text}</p>
      </div>
    `)
    .join('');
}
