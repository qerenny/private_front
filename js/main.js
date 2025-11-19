(function () {
  const { getAuthData, logout, requireAuth } = window.GrizzlyAuth;
  const api = window.GrizzlyApi;

  document.addEventListener('DOMContentLoaded', () => {
    setupNavbar();
    routeInit();
  });

  function setupNavbar() {
    const { token, userName } = getAuthData();
    const loginLink = document.querySelector('[data-nav="login"]');
    const registerLink = document.querySelector('[data-nav="register"]');
    const dashboardLink = document.querySelector('[data-nav="dashboard"]');
    const logoutLink = document.querySelector('[data-nav="logout"]');
    const userNameBadge = document.querySelector('[data-user-name]');

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

  function routeInit() {
    const page = document.body.dataset.page;
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

  function initLanding() {
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

  function initLogin() {
    const form = document.getElementById('loginForm');
    const alertBox = document.getElementById('loginAlert');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      alertBox?.classList.add('d-none');
      const email = form.email.value.trim();
      const password = form.password.value.trim();
      try {
        const res = await api.login(email, password);
        const token = res?.token || res?.access_token || res?.authToken;
        if (!token) throw new Error('No token returned');
        const userData = await api.getCurrentUserByEmail(email);
        window.GrizzlyAuth.setAuthData({
          token,
          userId: userData?.id,
          userEmail: email,
          userName: userData?.name,
        });
        window.location.href = 'dashboard.html';
      } catch (err) {
        alertBox.textContent = err.message || 'Unable to login. Please try again.';
        alertBox.classList.remove('d-none');
      }
    });
  }

  function initRegister() {
    const form = document.getElementById('registerForm');
    const alertBox = document.getElementById('registerAlert');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      alertBox?.classList.add('d-none');
      const payload = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        password_hash: form.password.value.trim(),
        date_of_birth: form.date_of_birth.value,
        gender: form.gender.value,
      };
      try {
        await api.registerUser(payload);
        const res = await api.login(payload.email, payload.password_hash);
        const token = res?.token || res?.access_token || res?.authToken;
        const userData = await api.getCurrentUserByEmail(payload.email);
        window.GrizzlyAuth.setAuthData({
          token,
          userId: userData?.id,
          userEmail: payload.email,
          userName: userData?.name || payload.name,
        });
        window.location.href = 'dashboard.html';
      } catch (err) {
        alertBox.textContent = err.message || 'Registration failed. Please try again.';
        alertBox.classList.remove('d-none');
      }
    });
  }

  function initDashboard() {
    const { userName, userEmail, userId } = getAuthData();
    document.getElementById('userName')?.textContent = userName || 'Athlete';
    document.getElementById('userEmail')?.textContent = userEmail || '';
    const initials = (userName || 'GG')
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .join('')
      .slice(0, 2);
    document.getElementById('userInitials')?.textContent = initials || 'GG';

    const progressContainer = document.getElementById('progressContainer');
    const trainingPlansContainer = document.getElementById('trainingPlansContainer');

    api.getUserProgress()
      .then((rows) => {
        const record = (rows || []).find((row) => String(row.user_id) === String(userId));
        if (!record) {
          progressContainer.innerHTML = '<p class="mb-2">No progress yet.</p><a class="btn btn-brand-primary" href="#">Create progress card</a>';
          return;
        }
        renderProgress(record, progressContainer);
        attachProgressForm(record.id);
      })
      .catch(() => {
        progressContainer.innerHTML = '<p class="text-danger">Unable to load progress.</p>';
      });

    api.getUserTrainingPlans()
      .then(async (plans) => {
        const userPlans = (plans || []).filter((plan) => String(plan.user_id) === String(userId));
        if (!userPlans.length) {
          trainingPlansContainer.innerHTML = '<p class="mb-0">No training plans linked yet.</p>';
          return;
        }
        const listItems = await Promise.all(userPlans.map(async (p) => {
          try {
            const planInfo = await api.getTrainingPlan(p.training_plan_id);
            return `<li class="list-group-item d-flex flex-column"><strong>${planInfo.title}</strong><small class="text-muted">${planInfo.description || ''}</small></li>`;
          } catch (e) {
            return `<li class="list-group-item">Plan #${p.training_plan_id}</li>`;
          }
        }));
        trainingPlansContainer.innerHTML = `<ul class="list-group list-group-flush">${listItems.join('')}</ul>`;
      })
      .catch(() => {
        trainingPlansContainer.innerHTML = '<p class="text-danger">Unable to load plans.</p>';
      });
  }

  function attachProgressForm(progressId) {
    const form = document.getElementById('progressForm');
    if (!form) return;
    form.classList.remove('d-none');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        current_weight: form.current_weight.value,
        target_weight: form.target_weight.value,
        steps_walked: form.steps_walked.value,
        water_intake: form.water_intake.value,
      };
      const alertBox = document.getElementById('progressAlert');
      alertBox?.classList.add('d-none');
      try {
        await api.updateUserProgress(progressId, payload);
        alertBox.textContent = 'Progress updated!';
        alertBox.classList.remove('d-none');
        alertBox.classList.add('alert-success');
      } catch (err) {
        alertBox.textContent = err.message || 'Failed to update progress';
        alertBox.classList.remove('d-none');
      }
    });
  }

  function renderProgress(record, container) {
    container.innerHTML = `
      <div class="progress-card">
        <div class="d-flex justify-content-between">
          <div>
            <p class="mb-1 text-muted">Current weight</p>
            <h5 class="fw-bold">${record.current_weight || '-'} kg</h5>
          </div>
          <div>
            <p class="mb-1 text-muted">Target weight</p>
            <h5 class="fw-bold">${record.target_weight || '-'} kg</h5>
          </div>
        </div>
        <div class="mt-3 d-flex justify-content-between">
          <div>
            <p class="mb-1 text-muted">Steps walked</p>
            <h6>${record.steps_walked || 0}</h6>
          </div>
          <div>
            <p class="mb-1 text-muted">Water intake</p>
            <h6>${record.water_intake || 0} L</h6>
          </div>
        </div>
      </div>
    `;
  }

  function initWorkouts() {
    const grid = document.getElementById('workoutsGrid');
    const levelSelect = document.getElementById('filterLevel');
    const typeSelect = document.getElementById('filterType');
    const durationSelect = document.getElementById('filterDuration');
    let workoutsData = [];

    const debounce = (fn, wait = 200) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), wait);
      };
    };

    const applyFilters = () => {
      const level = levelSelect.value;
      const type = typeSelect.value;
      const duration = durationSelect.value;
      const filtered = workoutsData.filter((w) => {
        const matchLevel = !level || w.level === level;
        const matchType = !type || w.workout_type === type;
        const matchDuration = (() => {
          if (!duration) return true;
          if (duration === '<20') return w.duration_min < 20;
          if (duration === '20-40') return w.duration_min >= 20 && w.duration_min <= 40;
          if (duration === '>40') return w.duration_min > 40;
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

  function renderWorkoutCards(list, container) {
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

  function renderBlogCards(list, container) {
    if (!container) return;
    if (!list?.length) {
      container.innerHTML = '<p class="text-muted">No posts yet.</p>';
      return;
    }
    container.innerHTML = list
      .map((post) => `
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <span class="card-tag card-tag--accent mb-2">Blog</span>
            <h5 class="card-title">${post.title}</h5>
            <p class="card-text text-muted small">${new Date(post.created_at || Date.now()).toLocaleDateString()}</p>
            <p class="card-text flex-grow-1">${(post.content || '').slice(0, 120)}...</p>
            <a class="btn btn-sm btn-brand-primary mt-auto align-self-start" href="blog-post.html?id=${post.id}">Read more</a>
          </div>
        </div>
      `)
      .join('');
  }

  function initWorkoutDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const container = document.getElementById('workoutDetail');
    const ctaButton = document.getElementById('addPlanButton');
    const { userId, token } = getAuthData();

    if (!id) {
      container.innerHTML = '<p class="text-danger">Workout not found.</p>';
      return;
    }

    if (!token) {
      ctaButton?.classList.add('d-none');
    }

    api.getWorkout(id)
      .then((workout) => renderWorkoutDetail(workout, container))
      .catch(() => {
        container.innerHTML = '<p class="text-danger">Could not load workout details.</p>';
      });

    ctaButton?.addEventListener('click', async () => {
      if (!token) {
        window.location.href = 'login.html';
        return;
      }
      try {
        await api.addUserTrainingPlan({ user_id: userId, training_plan_id: id });
        ctaButton.textContent = 'Added!';
        ctaButton.disabled = true;
      } catch (err) {
        alert(err.message || 'Failed to add to plan');
      }
    });
  }

  function renderWorkoutDetail(workout, container) {
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

  function initBlog() {
    const container = document.getElementById('blogList');
    api.getBlogPosts()
      .then((posts) => renderBlogCards(posts, container))
      .catch(() => {
        const fallback = [
          { id: 1, title: 'Recovery basics', content: 'Sleep, hydration, and rest days.', created_at: '2025-01-05' },
        ];
        renderBlogCards(fallback, container);
      });
  }

  function initBlogPost() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const container = document.getElementById('blogPost');
    const commentsContainer = document.getElementById('commentsList');
    const commentForm = document.getElementById('commentForm');
    const { userId, token, userName } = getAuthData();

    if (!id) {
      container.innerHTML = '<p class="text-danger">Post not found.</p>';
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
        container.innerHTML = '<p class="text-danger">Could not load post.</p>';
      });

    commentForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = commentForm.comment_text.value.trim();
      if (!text) return;
      const alertBox = document.getElementById('commentAlert');
      alertBox?.classList.add('d-none');
      try {
        await api.createBlogComment({ post_id: Number(id), user_id: userId, comment_text: text });
        commentForm.reset();
        const post = await api.getBlogPost(id);
        renderComments(post.comments || [], commentsContainer);
      } catch (err) {
        alertBox.textContent = err.message || 'Failed to post comment';
        alertBox.classList.remove('d-none');
      }
    });
  }

  function renderBlogPost(post, container) {
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

  function renderComments(comments, container) {
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
})();
