// Data Storage Keys
const STORAGE_KEYS = {
    USERS: 'lostFoundUsers',
    POSTS: 'lostFoundPosts',
    COMMENTS: 'lostFoundComments',
    MESSAGES: 'lostFoundMessages',
    NOTIFICATIONS: 'lostFoundNotifications',
    CURRENT_USER: 'currentUser'
};

// Initialize default admin account
function initializeAdmin() {
    const users = getUsers();
    const adminExists = users.some(u => u.username === 'admin' && u.role === 'admin');
    
    if (!adminExists) {
        const admin = {
            id: 'admin',
            username: 'admin',
            password: 'admin123', // Default password
            role: 'admin',
            fullName: 'Administrator',
            location: 'Local Government Unit',
            contactNumber: 'N/A',
            isApproved: true,
            createdAt: new Date().toISOString()
        };
        users.push(admin);
        saveUsers(users);
    }
}

// Storage Functions
function getUsers() {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function getPosts() {
    const data = localStorage.getItem(STORAGE_KEYS.POSTS);
    return data ? JSON.parse(data) : [];
}

function savePosts(posts) {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
}

function getComments() {
    const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    return data ? JSON.parse(data) : [];
}

function saveComments(comments) {
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
}

function getMessages() {
    const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return data ? JSON.parse(data) : [];
}

function saveMessages(messages) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
}

function getNotifications() {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : [];
}

function saveNotifications(notifications) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
}

function getCurrentUser() {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
}

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function convertImageToBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        callback(e.target.result);
    };
    reader.readAsDataURL(file);
}

// Notification Functions
function createNotification(userId, message, type = 'info') {
    const notifications = getNotifications();
    const notification = {
        id: generateId(),
        userId: userId,
        message: message,
        type: type,
        read: false,
        createdAt: new Date().toISOString()
    };
    notifications.push(notification);
    saveNotifications(notifications);
    return notification;
}

// DOM Elements
const authModal = document.getElementById('authModal');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const mainContainer = document.getElementById('mainContainer');
const loginFormElement = document.getElementById('loginFormElement');
const signupFormElement = document.getElementById('signupFormElement');
const showSignupLink = document.getElementById('showSignup');
const showLoginLink = document.getElementById('showLogin');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const createPostBtn = document.getElementById('createPostBtn');
const createPostModal = document.getElementById('createPostModal');
const createPostForm = document.getElementById('createPostForm');
const postDetailsModal = document.getElementById('postDetailsModal');
const adminRequestsColumn = document.getElementById('adminRequestsColumn');

// Initialize
initializeAdmin();
checkAuthStatus();

// Check if user is logged in
function checkAuthStatus() {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.isApproved) {
        showDashboard(currentUser);
    } else {
        showAuthModal();
    }
}

// Show Auth Modal
function showAuthModal() {
    authModal.style.display = 'block';
    mainContainer.style.display = 'none';
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
}

// Show Dashboard
function showDashboard(user) {
    authModal.style.display = 'none';
    mainContainer.style.display = 'block';
    userInfo.textContent = `Welcome, ${user.fullName} (${user.role === 'admin' ? 'Admin' : 'User'})`;
    
    const dashboardContainer = document.querySelector('.dashboard-container');
    
    if (user.role === 'admin') {
        adminRequestsColumn.style.display = 'block';
        createPostBtn.style.display = 'block';
        dashboardContainer.classList.add('admin-view');
    } else {
        adminRequestsColumn.style.display = 'none';
        createPostBtn.style.display = 'block';
        dashboardContainer.classList.remove('admin-view');
    }
    
    loadDashboard();
}

// Load Dashboard Content
function loadDashboard() {
    loadPosts();
    loadMessages();
    loadNotifications();
    if (getCurrentUser()?.role === 'admin') {
        loadAccountRequests();
        loadPostRequests();
        loadManageAccounts();
    }
    loadMessageRecipients();
}

// Auth Form Switchers
showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    document.getElementById('activationRequestSection').style.display = 'none';
    lastRegisteredUsername = null;
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
    document.getElementById('activationRequestSection').style.display = 'none';
    lastRegisteredUsername = null;
});

// Login Handler
loginFormElement.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        if (!user.isApproved && user.role !== 'admin') {
            alert('Your account is pending approval. Please wait for admin approval.');
            return;
        }
        setCurrentUser(user);
        showDashboard(user);
        loginFormElement.reset();
    } else {
        alert('Invalid username or password');
    }
});

// Signup Handler
signupFormElement.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    const fullName = document.getElementById('fullName').value;
    const location = document.getElementById('location').value;
    const contactNumber = document.getElementById('contactNumber').value;
    const idPictureFile = document.getElementById('idPicture').files[0];
    
    if (!idPictureFile) {
        alert('Please upload a valid ID picture');
        return;
    }
    
    const users = getUsers();
    if (users.some(u => u.username === username)) {
        alert('Username already exists');
        return;
    }
    
    convertImageToBase64(idPictureFile, (base64Image) => {
        const newUser = {
            id: generateId(),
            username: username,
            password: password,
            role: 'user',
            fullName: fullName,
            location: location,
            contactNumber: contactNumber,
            idPicture: base64Image,
            isApproved: false,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        saveUsers(users);
        
        lastRegisteredUsername = username;
        document.getElementById('activationRequestSection').style.display = 'block';
        document.getElementById('activationStatus').textContent = 'Registration successful! Click "Request Account Activation" to notify admin.';
        document.getElementById('requestActivationBtn').disabled = false;
        signupFormElement.reset();
    });
});

// Request Activation Handler
let lastRegisteredUsername = null;

document.getElementById('requestActivationBtn').addEventListener('click', () => {
    const username = lastRegisteredUsername || document.getElementById('signupUsername').value;
    if (!username) {
        alert('Please complete registration first');
        return;
    }
    
    const users = getUsers();
    const user = users.find(u => u.username === username);
    
    if (user && !user.isApproved) {
        // Notify admin
        const admin = users.find(u => u.role === 'admin');
        if (admin) {
            createNotification(admin.id, `New account activation request from ${user.fullName} (${user.username})`, 'account_request');
        }
        
        document.getElementById('activationStatus').textContent = 'Activation request sent! Please wait for admin approval.';
        document.getElementById('requestActivationBtn').disabled = true;
    } else if (user && user.isApproved) {
        document.getElementById('activationStatus').textContent = 'Account already approved! You can login now.';
    } else {
        document.getElementById('activationStatus').textContent = 'User not found. Please register first.';
    }
});

// Logout Confirmation Modal Elements
const logoutConfirmModal = document.getElementById('logoutConfirmModal');
const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');

// Logout Handler
logoutBtn.addEventListener('click', () => {
    logoutConfirmModal.style.display = 'block';
});

// Confirm Logout
confirmLogoutBtn.addEventListener('click', () => {
    setCurrentUser(null);
    logoutConfirmModal.style.display = 'none';
    showAuthModal();
});

// Cancel Logout
cancelLogoutBtn.addEventListener('click', () => {
    logoutConfirmModal.style.display = 'none';
});

// Close logout modal when clicking outside
logoutConfirmModal.addEventListener('click', (e) => {
    if (e.target === logoutConfirmModal) {
        logoutConfirmModal.style.display = 'none';
    }
});

// Close Modal Handlers
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', (e) => {
        e.target.closest('.modal').style.display = 'none';
    });
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Load Posts
function loadPosts() {
    const posts = getPosts();
    const approvedPosts = posts.filter(p => p.isApproved);
    
    const lostItems = approvedPosts.filter(p => p.type === 'lost');
    const foundItems = approvedPosts.filter(p => p.type === 'found');
    
    displayPosts(lostItems, 'lostItemsList');
    displayPosts(foundItems, 'foundItemsList');
}

function displayPosts(posts, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (posts.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No posts yet</p>';
        return;
    }
    
    posts.forEach(post => {
        const postElement = createPostElement(post);
        container.appendChild(postElement);
    });
}

function createPostElement(post) {
    const users = getUsers();
    const author = users.find(u => u.id === post.authorId);
    const currentUser = getCurrentUser();
    
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.dataset.postId = post.id;
    
    let content = post.content;
    // Process mentions
    const mentionRegex = /@(\w+)/g;
    content = content.replace(mentionRegex, (match, username) => {
        const mentionedUser = users.find(u => u.username === username);
        if (mentionedUser) {
            return `<span class="mention">@${username}</span>`;
        }
        return match;
    });
    
    postDiv.innerHTML = `
        <div class="post-header">
            <span class="post-author">${author ? author.fullName : 'Unknown'}</span>
            <span class="post-date">${formatDate(post.createdAt)}</span>
        </div>
        <div class="post-content">${content}</div>
        ${post.image ? `<img src="${post.image}" class="post-image" alt="Post image">` : ''}
        <div class="post-actions">
            <button class="view-post-btn" data-post-id="${post.id}">View Details</button>
            ${currentUser?.role === 'admin' ? `
                <button class="btn-edit edit-post-btn" data-post-id="${post.id}">Edit</button>
                <button class="btn-delete delete-post-btn" data-post-id="${post.id}">Delete</button>
            ` : ''}
        </div>
    `;
    
    postDiv.querySelector('.view-post-btn').addEventListener('click', () => showPostDetails(post.id));
    
    if (currentUser?.role === 'admin') {
        postDiv.querySelector('.edit-post-btn').addEventListener('click', () => editPost(post.id));
        postDiv.querySelector('.delete-post-btn').addEventListener('click', () => deletePost(post.id));
    }
    
    return postDiv;
}

// Create Post Handler
createPostBtn.addEventListener('click', () => {
    createPostModal.style.display = 'block';
});

// Cancel post button
document.getElementById('cancelPostBtn').addEventListener('click', () => {
    createPostModal.style.display = 'none';
    createPostForm.reset();
});

// File upload label update
document.getElementById('postImage').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const label = document.querySelector('.file-upload-text');
    if (file) {
        label.textContent = file.name;
        label.style.color = '#667eea';
        label.style.fontWeight = '600';
    } else {
        label.textContent = 'Choose image or drag here';
        label.style.color = '#666';
        label.style.fontWeight = 'normal';
    }
});

createPostForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const type = document.getElementById('postType').value;
    const content = document.getElementById('postContent').value;
    const imageFile = document.getElementById('postImage').files[0];
    
    if (!type) {
        alert('Please select post type');
        return;
    }
    
    const postData = {
        id: generateId(),
        authorId: currentUser.id,
        type: type,
        content: content,
        image: null,
        isApproved: currentUser.role === 'admin',
        createdAt: new Date().toISOString()
    };
    
    if (imageFile) {
        convertImageToBase64(imageFile, (base64Image) => {
            postData.image = base64Image;
            savePost(postData);
        });
    } else {
        savePost(postData);
    }
    
    createPostForm.reset();
    createPostModal.style.display = 'none';
});

function savePost(postData) {
    const posts = getPosts();
    posts.push(postData);
    savePosts(posts);
    
    if (postData.isApproved) {
        loadPosts();
    } else {
        // Notify admin
        const users = getUsers();
        const admin = users.find(u => u.role === 'admin');
        if (admin) {
            createNotification(admin.id, `New post request from ${getCurrentUser().fullName}`, 'post_request');
        }
        alert('Post submitted! Waiting for admin approval.');
        if (getCurrentUser()?.role === 'admin') {
            loadPostRequests();
        }
    }
}

// Show Post Details
function showPostDetails(postId) {
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const users = getUsers();
    const author = users.find(u => u.id === post.authorId);
    const comments = getComments().filter(c => c.postId === postId);
    const currentUser = getCurrentUser();
    
    let content = post.content;
    const mentionRegex = /@(\w+)/g;
    content = content.replace(mentionRegex, (match, username) => {
        const mentionedUser = users.find(u => u.username === username);
        if (mentionedUser) {
            return `<span class="mention">@${username}</span>`;
        }
        return match;
    });
    
    const postDetails = document.getElementById('postDetails');
    postDetails.innerHTML = `
        <h2>${post.type === 'lost' ? 'Lost Item' : 'Found Item'}</h2>
        <div class="post-header">
            <span class="post-author">${author ? author.fullName : 'Unknown'}</span>
            <span class="post-date">${formatDate(post.createdAt)}</span>
        </div>
        <div class="post-content">${content}</div>
        ${post.image ? `<img src="${post.image}" class="post-image" alt="Post image">` : ''}
        
        <div class="comments-section">
            <h3>Comments (${comments.length})</h3>
            <div id="commentsList">
                ${comments.map(comment => {
                    const commentAuthor = users.find(u => u.id === comment.authorId);
                    return `
                        <div class="comment" data-comment-id="${comment.id}">
                            <div class="comment-header">
                                <span class="comment-author">${commentAuthor ? commentAuthor.fullName : 'Unknown'}</span>
                                ${currentUser?.role === 'admin' ? `
                                    <button class="btn-edit edit-comment-btn" data-comment-id="${comment.id}">Edit</button>
                                ` : ''}
                            </div>
                            <div class="comment-content">${comment.content}</div>
                            <div class="comment-date" style="font-size: 11px; color: #666; margin-top: 5px;">${formatDate(comment.createdAt)}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="comment-form">
                <textarea id="newCommentText" placeholder="Write a comment..."></textarea>
                <button id="submitCommentBtn" data-post-id="${postId}">Post Comment</button>
            </div>
        </div>
    `;
    
    // Add comment handlers
    document.getElementById('submitCommentBtn').addEventListener('click', () => {
        const commentText = document.getElementById('newCommentText').value;
        if (commentText.trim()) {
            addComment(postId, commentText);
        }
    });
    
    // Add edit comment handlers for admin
    if (currentUser?.role === 'admin') {
        document.querySelectorAll('.edit-comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const commentId = e.target.dataset.commentId;
                editComment(commentId);
            });
        });
    }
    
    postDetailsModal.style.display = 'block';
}

function addComment(postId, content) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const comments = getComments();
    const comment = {
        id: generateId(),
        postId: postId,
        authorId: currentUser.id,
        content: content,
        createdAt: new Date().toISOString()
    };
    
    comments.push(comment);
    saveComments(comments);
    
    showPostDetails(postId);
    loadPosts();
}

function editComment(commentId) {
    const comments = getComments();
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    
    const newContent = prompt('Edit comment:', comment.content);
    if (newContent && newContent.trim()) {
        comment.content = newContent.trim();
        saveComments(comments);
        showPostDetails(comment.postId);
    }
}

function editPost(postId) {
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const newContent = prompt('Edit post content:', post.content);
    if (newContent !== null && newContent.trim()) {
        post.content = newContent.trim();
        savePosts(posts);
        loadPosts();
    }
}

function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    const posts = getPosts();
    const filteredPosts = posts.filter(p => p.id !== postId);
    savePosts(filteredPosts);
    
    // Delete associated comments
    const comments = getComments();
    const filteredComments = comments.filter(c => c.postId !== postId);
    saveComments(filteredComments);
    
    loadPosts();
}

// Load Messages
function loadMessages() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const messages = getMessages();
    const userMessages = messages.filter(m => 
        m.senderId === currentUser.id || m.recipientId === currentUser.id
    );
    
    const messagesList = document.getElementById('messagesList');
    messagesList.innerHTML = '';
    
    if (userMessages.length === 0) {
        messagesList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No messages yet</p>';
        return;
    }
    
    const users = getUsers();
    userMessages.forEach(message => {
        const sender = users.find(u => u.id === message.senderId);
        const recipient = users.find(u => u.id === message.recipientId);
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-sender">${message.senderId === currentUser.id ? 'You' : (sender ? sender.fullName : 'Unknown')} → ${message.recipientId === currentUser.id ? 'You' : (recipient ? recipient.fullName : 'Unknown')}</span>
                <span class="message-time">${formatDate(message.createdAt)}</span>
            </div>
            <div class="message-content">${message.content}</div>
        `;
        messagesList.appendChild(messageDiv);
    });
}

// Load Message Recipients
function loadMessageRecipients() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const users = getUsers();
    const recipients = users.filter(u => 
        u.id !== currentUser.id && u.isApproved
    );
    
    const recipientSelect = document.getElementById('messageRecipient');
    recipientSelect.innerHTML = '<option value="">Select recipient...</option>';
    
    recipients.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.fullName} (${user.role === 'admin' ? 'Admin' : 'User'})`;
        recipientSelect.appendChild(option);
    });
}

// Send Message Handler
document.getElementById('sendMessageBtn').addEventListener('click', () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const recipientId = document.getElementById('messageRecipient').value;
    const content = document.getElementById('messageText').value;
    
    if (!recipientId) {
        alert('Please select a recipient');
        return;
    }
    
    if (!content.trim()) {
        alert('Please enter a message');
        return;
    }
    
    const messages = getMessages();
    const message = {
        id: generateId(),
        senderId: currentUser.id,
        recipientId: recipientId,
        content: content.trim(),
        createdAt: new Date().toISOString()
    };
    
    messages.push(message);
    saveMessages(messages);
    
    // Notify recipient
    const users = getUsers();
    const recipient = users.find(u => u.id === recipientId);
    if (recipient) {
        createNotification(recipientId, `New message from ${currentUser.fullName}`, 'message');
    }
    
    document.getElementById('messageText').value = '';
    loadMessages();
    loadNotifications();
});

// Load Notifications
function loadNotifications() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const notifications = getNotifications();
    const userNotifications = notifications.filter(n => n.userId === currentUser.id);
    
    // Sort by date (newest first)
    userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const notificationsList = document.getElementById('notificationsList');
    notificationsList.innerHTML = '';
    
    if (userNotifications.length === 0) {
        notificationsList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No notifications</p>';
        return;
    }
    
    userNotifications.forEach(notification => {
        const notificationDiv = document.createElement('div');
        notificationDiv.className = `notification ${notification.read ? '' : 'unread'}`;
        notificationDiv.innerHTML = `
            <div>${notification.message}</div>
            <div style="font-size: 11px; color: #666; margin-top: 5px;">${formatDate(notification.createdAt)}</div>
        `;
        notificationDiv.addEventListener('click', () => {
            notification.read = true;
            saveNotifications(notifications);
            loadNotifications();
        });
        notificationsList.appendChild(notificationDiv);
    });
}

// Admin Functions
function loadAccountRequests() {
    const users = getUsers();
    const pendingUsers = users.filter(u => !u.isApproved && u.role === 'user');
    
    const accountRequestsList = document.getElementById('accountRequestsList');
    accountRequestsList.innerHTML = '';
    
    if (pendingUsers.length === 0) {
        accountRequestsList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No pending account requests</p>';
        return;
    }
    
    pendingUsers.forEach(user => {
        const requestDiv = document.createElement('div');
        requestDiv.className = 'request-item account-request-card';
        requestDiv.innerHTML = `
            <div class="account-card-content">
                <div class="account-info">
                    <p><strong>Username:</strong> ${user.username}</p>
                    <p><strong>Full Name:</strong> ${user.fullName}</p>
                    <p><strong>Location:</strong> ${user.location}</p>
                    <p><strong>Contact:</strong> ${user.contactNumber}</p>
                    <p><strong>Requested:</strong> ${formatDate(user.createdAt)}</p>
                </div>
                <div class="account-image-section">
                    ${user.idPicture ? `<img src="${user.idPicture}" class="account-id-image" alt="ID Picture">` : '<div class="no-image">No Image</div>'}
                    <div class="account-actions">
                        <button class="btn-approve approve-account-btn" data-user-id="${user.id}">Approve</button>
                        <button class="btn-decline decline-account-btn" data-user-id="${user.id}">Decline</button>
                    </div>
                </div>
            </div>
        `;
        
        requestDiv.querySelector('.approve-account-btn').addEventListener('click', () => approveAccount(user.id));
        requestDiv.querySelector('.decline-account-btn').addEventListener('click', () => declineAccount(user.id));
        
        accountRequestsList.appendChild(requestDiv);
    });
}

function loadPostRequests() {
    const posts = getPosts();
    const pendingPosts = posts.filter(p => !p.isApproved);
    
    const postRequestsList = document.getElementById('postRequestsList');
    postRequestsList.innerHTML = '';
    
    if (pendingPosts.length === 0) {
        postRequestsList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No pending post requests</p>';
        return;
    }
    
    const users = getUsers();
    pendingPosts.forEach(post => {
        const author = users.find(u => u.id === post.authorId);
        const requestDiv = document.createElement('div');
        requestDiv.className = 'request-item post-request-card';
        
        let content = post.content;
        const mentionRegex = /@(\w+)/g;
        content = content.replace(mentionRegex, (match, username) => {
            const mentionedUser = users.find(u => u.username === username);
            if (mentionedUser) {
                return `<span class="mention">@${username}</span>`;
            }
            return match;
        });
        
        requestDiv.innerHTML = `
            <div class="post-card-content">
                <div class="post-info">
                    <p><strong>Author:</strong> ${author ? author.fullName : 'Unknown'}</p>
                    <p><strong>Type:</strong> <span class="post-type-badge ${post.type}">${post.type === 'lost' ? 'Lost Item' : 'Found Item'}</span></p>
                    <p><strong>Content:</strong> ${content.length > 100 ? content.substring(0, 100) + '...' : content}</p>
                    <p><strong>Submitted:</strong> ${formatDate(post.createdAt)}</p>
                </div>
                <div class="post-image-section">
                    ${post.image ? `<img src="${post.image}" class="post-request-image" alt="Post image">` : '<div class="no-image">No Image</div>'}
                    <div class="post-actions">
                        <button class="btn-approve approve-post-btn" data-post-id="${post.id}">Approve</button>
                        <button class="btn-decline decline-post-btn" data-post-id="${post.id}">Decline</button>
                    </div>
                </div>
            </div>
        `;
        
        requestDiv.querySelector('.approve-post-btn').addEventListener('click', () => approvePost(post.id));
        requestDiv.querySelector('.decline-post-btn').addEventListener('click', () => declinePost(post.id));
        
        postRequestsList.appendChild(requestDiv);
    });
}

function approveAccount(userId) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
        user.isApproved = true;
        saveUsers(users);
        createNotification(userId, 'Your account has been approved! You can now log in.', 'success');
        loadAccountRequests();
    }
}

function declineAccount(userId) {
    if (!confirm('Are you sure you want to decline this account request?')) return;
    
    const users = getUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    saveUsers(filteredUsers);
    loadAccountRequests();
}

function approvePost(postId) {
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.isApproved = true;
        savePosts(posts);
        createNotification(post.authorId, 'Your post has been approved!', 'success');
        loadPostRequests();
        loadPosts();
    }
}

function declinePost(postId) {
    if (!confirm('Are you sure you want to decline this post?')) return;
    
    const posts = getPosts();
    const filteredPosts = posts.filter(p => p.id !== postId);
    savePosts(filteredPosts);
    
    // Delete associated comments
    const comments = getComments();
    const filteredComments = comments.filter(c => c.postId !== postId);
    saveComments(filteredComments);
    
    loadPostRequests();
}

// Load Manage Accounts (Admin only)
function loadManageAccounts() {
    const users = getUsers();
    const allUsers = users.filter(u => u.role !== 'admin'); // Don't show admin account
    
    const manageAccountsList = document.getElementById('manageAccountsList');
    manageAccountsList.innerHTML = '';
    
    if (allUsers.length === 0) {
        manageAccountsList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No user accounts</p>';
        return;
    }
    
    allUsers.forEach(user => {
        const accountDiv = document.createElement('div');
        accountDiv.className = 'request-item manage-account-card';
        accountDiv.innerHTML = `
            <div class="manage-card-content">
                <div class="manage-info">
                    <p><strong>Username:</strong> ${user.username}</p>
                    <p><strong>Full Name:</strong> ${user.fullName}</p>
                    <p><strong>Location:</strong> ${user.location}</p>
                    <p><strong>Contact:</strong> ${user.contactNumber}</p>
                    <p><strong>Status:</strong> <span class="status-badge ${user.isApproved ? 'approved' : 'pending'}">${user.isApproved ? 'Approved' : 'Pending'}</span></p>
                    <p><strong>Registered:</strong> ${formatDate(user.createdAt)}</p>
                </div>
                <div class="manage-image-section">
                    ${user.idPicture ? `<img src="${user.idPicture}" class="manage-id-image" alt="ID Picture">` : '<div class="no-image">No Image</div>'}
                    <div class="manage-actions">
                        <button class="btn-delete delete-account-btn" data-user-id="${user.id}">Delete Account</button>
                    </div>
                </div>
            </div>
        `;
        
        accountDiv.querySelector('.delete-account-btn').addEventListener('click', () => deleteAccount(user.id));
        manageAccountsList.appendChild(accountDiv);
    });
}

function deleteAccount(userId) {
    if (!confirm('Are you sure you want to delete this account? This will also delete all their posts, comments, and messages.')) return;
    
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    // Delete user
    const filteredUsers = users.filter(u => u.id !== userId);
    saveUsers(filteredUsers);
    
    // Delete user's posts
    const posts = getPosts();
    const userPostIds = posts.filter(p => p.authorId === userId).map(p => p.id);
    const filteredPosts = posts.filter(p => p.authorId !== userId);
    savePosts(filteredPosts);
    
    // Delete comments on deleted posts and user's comments
    const comments = getComments();
    const filteredComments = comments.filter(c => 
        c.postId && !userPostIds.includes(c.postId) && c.authorId !== userId
    );
    saveComments(filteredComments);
    
    // Delete user's messages
    const messages = getMessages();
    const filteredMessages = messages.filter(m => 
        m.senderId !== userId && m.recipientId !== userId
    );
    saveMessages(filteredMessages);
    
    // Delete user's notifications
    const notifications = getNotifications();
    const filteredNotifications = notifications.filter(n => n.userId !== userId);
    saveNotifications(filteredNotifications);
    
    // If deleted user is currently logged in, log them out
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        setCurrentUser(null);
        showAuthModal();
    } else {
        loadManageAccounts();
        loadPosts();
    }
}

// Admin Tab Switcher
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
        
        // Reload data when switching tabs
        if (getCurrentUser()?.role === 'admin') {
            if (tabName === 'accountRequests') {
                loadAccountRequests();
            } else if (tabName === 'postRequests') {
                loadPostRequests();
            } else if (tabName === 'manageAccounts') {
                loadManageAccounts();
            }
        }
    });
});

