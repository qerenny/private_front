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
    const guestOnlyElements = document.querySelectorAll('[data-guest-only]');
    if (token) {
        loginLink === null || loginLink === void 0 ? void 0 : loginLink.classList.add('d-none');
        registerLink === null || registerLink === void 0 ? void 0 : registerLink.classList.add('d-none');
        dashboardLink === null || dashboardLink === void 0 ? void 0 : dashboardLink.classList.remove('d-none');
        logoutLink === null || logoutLink === void 0 ? void 0 : logoutLink.classList.remove('d-none');
        if (userNameBadge) {
            userNameBadge.textContent = userName || 'Athlete';
            userNameBadge.classList.remove('d-none');
        }
        logoutLink === null || logoutLink === void 0 ? void 0 : logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
        guestOnlyElements.forEach((el) => el.classList.add('d-none'));
    }
    else {
        loginLink === null || loginLink === void 0 ? void 0 : loginLink.classList.remove('d-none');
        registerLink === null || registerLink === void 0 ? void 0 : registerLink.classList.remove('d-none');
        dashboardLink === null || dashboardLink === void 0 ? void 0 : dashboardLink.classList.add('d-none');
        logoutLink === null || logoutLink === void 0 ? void 0 : logoutLink.classList.add('d-none');
        userNameBadge === null || userNameBadge === void 0 ? void 0 : userNameBadge.classList.add('d-none');
        guestOnlyElements.forEach((el) => el.classList.remove('d-none'));
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
function getFormValue(form, name) {
    var _a;
    const control = form.elements.namedItem(name);
    return ((_a = control === null || control === void 0 ? void 0 : control.value) !== null && _a !== void 0 ? _a : '').trim();
}
function initLogin() {
    const { token } = getAuthData();
    if (token) {
        window.location.replace('dashboard.html');
        return;
    }
    const form = document.getElementById('loginForm');
    const alertBox = document.getElementById('loginAlert');
    form === null || form === void 0 ? void 0 : form.addEventListener('submit', async (e) => {
        var _a;
        e.preventDefault();
        alertBox === null || alertBox === void 0 ? void 0 : alertBox.classList.add('d-none');
        const email = getFormValue(form, 'email');
        const password = getFormValue(form, 'password');
        try {
            const res = await api.login(email, password);
            const token = (res === null || res === void 0 ? void 0 : res.token) || (res === null || res === void 0 ? void 0 : res.access_token) || (res === null || res === void 0 ? void 0 : res.authToken);
            if (!token)
                throw new Error('No token returned');
            const userData = await api.getCurrentUserByEmail(email);
            window.GrizzlyAuth.setAuthData({
                token,
                userId: String((_a = userData === null || userData === void 0 ? void 0 : userData.id) !== null && _a !== void 0 ? _a : ''),
                userEmail: email,
                userName: userData === null || userData === void 0 ? void 0 : userData.name,
            });
            window.location.href = 'dashboard.html';
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unable to login. Please try again.';
            if (alertBox) {
                alertBox.textContent = message;
                alertBox.classList.remove('d-none');
            }
        }
    });
}
function initRegister() {
    const { token } = getAuthData();
    if (token) {
        window.location.replace('dashboard.html');
        return;
    }
    const form = document.getElementById('registerForm');
    const alertBox = document.getElementById('registerAlert');
    form === null || form === void 0 ? void 0 : form.addEventListener('submit', async (e) => {
        var _a;
        e.preventDefault();
        alertBox === null || alertBox === void 0 ? void 0 : alertBox.classList.add('d-none');
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
            const token = (res === null || res === void 0 ? void 0 : res.token) || (res === null || res === void 0 ? void 0 : res.access_token) || (res === null || res === void 0 ? void 0 : res.authToken);
            const userData = await api.getCurrentUserByEmail(payload.email);
            window.GrizzlyAuth.setAuthData({
                token,
                userId: String((_a = userData === null || userData === void 0 ? void 0 : userData.id) !== null && _a !== void 0 ? _a : ''),
                userEmail: payload.email,
                userName: (userData === null || userData === void 0 ? void 0 : userData.name) || payload.name,
            });
            window.location.href = 'dashboard.html';
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
            if (alertBox) {
                alertBox.textContent = message;
                alertBox.classList.remove('d-none');
            }
        }
    });
}
function initDashboard() {
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
        .map((part) => { var _a; return (_a = part[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase(); })
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
                progressContainer.innerHTML = '<p class="mb-2">No progress yet.</p><a class="btn btn-brand-primary" href="#">Create progress card</a>';
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
        if (!trainingPlansContainer)
            return;
        if (!userPlans.length) {
            trainingPlansContainer.innerHTML = '<p class="mb-0">No training plans linked yet.</p>';
            return;
        }
        const listItems = await Promise.all(userPlans.map(async (p) => {
            try {
                const planInfo = await api.getTrainingPlan(p.training_plan_id);
                return `<li class="list-group-item d-flex flex-column"><strong>${planInfo.title}</strong><small class="text-muted">${planInfo.description || ''}</small></li>`;
            }
            catch (e) {
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
function attachProgressForm(progressId) {
    const form = document.getElementById('progressForm');
    if (!form)
        return;
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
        alertBox === null || alertBox === void 0 ? void 0 : alertBox.classList.add('d-none');
        try {
            await api.updateUserProgress(progressId, payload);
            if (alertBox) {
                alertBox.textContent = 'Progress updated!';
                alertBox.classList.remove('d-none');
                alertBox.classList.add('alert-success');
            }
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update progress';
            if (alertBox) {
                alertBox.textContent = message;
                alertBox.classList.remove('d-none');
            }
        }
    });
}
function renderProgress(record, container) {
    var _a, _b, _c, _d;
    container.innerHTML = `
    <div class="progress-card">
      <div class="d-flex justify-content-between">
        <div>
          <p class="mb-1 text-muted">Current weight</p>
          <h5 class="fw-bold">${(_a = record.current_weight) !== null && _a !== void 0 ? _a : '-'} kg</h5>
        </div>
        <div>
          <p class="mb-1 text-muted">Target weight</p>
          <h5 class="fw-bold">${(_b = record.target_weight) !== null && _b !== void 0 ? _b : '-'} kg</h5>
        </div>
      </div>
      <div class="mt-3 d-flex justify-content-between">
        <div>
          <p class="mb-1 text-muted">Steps walked</p>
          <h6>${(_c = record.steps_walked) !== null && _c !== void 0 ? _c : 0}</h6>
        </div>
        <div>
          <p class="mb-1 text-muted">Water intake</p>
          <h6>${(_d = record.water_intake) !== null && _d !== void 0 ? _d : 0} L</h6>
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
            if (timeout)
                window.clearTimeout(timeout);
            timeout = window.setTimeout(() => fn.apply(undefined, args), wait);
        };
    };
    const applyFilters = () => {
        var _a, _b, _c;
        const level = (_a = levelSelect === null || levelSelect === void 0 ? void 0 : levelSelect.value) !== null && _a !== void 0 ? _a : '';
        const type = (_b = typeSelect === null || typeSelect === void 0 ? void 0 : typeSelect.value) !== null && _b !== void 0 ? _b : '';
        const duration = (_c = durationSelect === null || durationSelect === void 0 ? void 0 : durationSelect.value) !== null && _c !== void 0 ? _c : '';
        const filtered = workoutsData.filter((w) => {
            const matchLevel = !level || w.level === level;
            const matchType = !type || w.workout_type === type;
            const matchDuration = (() => {
                var _a, _b, _c, _d;
                if (!duration)
                    return true;
                if (duration === '<20')
                    return ((_a = w.duration_min) !== null && _a !== void 0 ? _a : 0) < 20;
                if (duration === '20-40')
                    return ((_b = w.duration_min) !== null && _b !== void 0 ? _b : 0) >= 20 && ((_c = w.duration_min) !== null && _c !== void 0 ? _c : 0) <= 40;
                if (duration === '>40')
                    return ((_d = w.duration_min) !== null && _d !== void 0 ? _d : 0) > 40;
                return true;
            })();
            return matchLevel && matchType && matchDuration;
        });
        renderWorkoutCards(filtered, grid);
    };
    [levelSelect, typeSelect, durationSelect].forEach((el) => {
        el === null || el === void 0 ? void 0 : el.addEventListener('change', debounce(applyFilters));
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
    if (!container)
        return;
    if (!(list === null || list === void 0 ? void 0 : list.length)) {
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
    if (!container)
        return;
    if (!(list === null || list === void 0 ? void 0 : list.length)) {
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
        if (container) {
            container.innerHTML = '<p class="text-danger">Workout not found.</p>';
        }
        return;
    }
    if (!token) {
        ctaButton === null || ctaButton === void 0 ? void 0 : ctaButton.classList.add('d-none');
    }
    api.getWorkout(id)
        .then((workout) => renderWorkoutDetail(workout, container))
        .catch(() => {
        if (container) {
            container.innerHTML = '<p class="text-danger">Could not load workout details.</p>';
        }
    });
    ctaButton === null || ctaButton === void 0 ? void 0 : ctaButton.addEventListener('click', async () => {
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
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to add to plan';
            alert(message);
        }
    });
}
function renderWorkoutDetail(workout, container) {
    if (!container)
        return;
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
        if (container)
            container.innerHTML = '<p class="text-danger">Post not found.</p>';
        return;
    }
    if (!token) {
        commentForm === null || commentForm === void 0 ? void 0 : commentForm.classList.add('d-none');
    }
    api.getBlogPost(id)
        .then((post) => {
        renderBlogPost(post, container);
        renderComments(post.comments || [], commentsContainer);
    })
        .catch(() => {
        if (container)
            container.innerHTML = '<p class="text-danger">Could not load post.</p>';
    });
    commentForm === null || commentForm === void 0 ? void 0 : commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = getFormValue(commentForm, 'comment_text');
        if (!text)
            return;
        const alertBox = document.getElementById('commentAlert');
        alertBox === null || alertBox === void 0 ? void 0 : alertBox.classList.add('d-none');
        try {
            const commentAuthor = userName || getAuthData().userEmail || undefined;
            await api.createBlogComment({ post_id: Number(id), user_id: Number(userId), comment_text: text, user_name: commentAuthor });
            commentForm.reset();
            const post = await api.getBlogPost(id);
            renderComments(post.comments || [], commentsContainer);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to post comment';
            if (alertBox) {
                alertBox.textContent = message;
                alertBox.classList.remove('d-none');
            }
        }
    });
}
function renderBlogPost(post, container) {
    if (!container)
        return;
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
    if (!container)
        return;
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
export {};
