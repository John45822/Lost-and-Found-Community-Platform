// API functions are loaded from api.js

// Current user storage (session only)
const CURRENT_USER_KEY = 'currentUser';

// Utility Functions
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

// Current User Functions (session only)
function getCurrentUser() {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(CURRENT_USER_KEY);
    }
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
const logoutConfirmModal = document.getElementById('logoutConfirmModal');
const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');

// Initialize
window.addEventListener('load', async () => {
    setTimeout(async () => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                checkAuthStatus();
            }, 300);
        } else {
            checkAuthStatus();
        }
    }, 500);
});

// Check if user is logged in
async function checkAuthStatus() {
    try {
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.isApproved) {
            showDashboard(currentUser);
        } else {
            showAuthModal();
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
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
async function loadDashboard() {
    try {
        await Promise.all([
            loadPosts(),
            loadMessages(),
            loadNotifications()
        ]);
        
        const currentUser = getCurrentUser();
        if (currentUser?.role === 'admin') {
            await Promise.all([
                loadAccountRequests(),
                loadPostRequests(),
                loadManageAccounts()
            ]);
        }
        await loadMessageRecipients();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        alert('Error loading dashboard. Please refresh the page.');
    }
}

// Auth Form Switchers
showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    document.getElementById('activationStatus').textContent = '';
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
    document.getElementById('activationStatus').textContent = '';
});

// Login Handler
loginFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await authAPI.login(username, password);
        setCurrentUser(response.user);
        showDashboard(response.user);
        loginFormElement.reset();
    } catch (error) {
        alert(error.message || 'Login failed');
    }
});

// Signup Handler - Combined with Request Activation
signupFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    const fullName = document.getElementById('fullName').value;
    const location = document.getElementById('location').value;
    const contactNumber = document.getElementById('contactNumber').value;
    const idPictureFile = document.getElementById('idPicture').files[0];
    const statusMessage = document.getElementById('activationStatus');
    
    if (!idPictureFile) {
        statusMessage.textContent = 'Please upload a valid ID picture';
        statusMessage.style.color = '#dc3545';
        return;
    }
    
    convertImageToBase64(idPictureFile, async (base64Image) => {
        try {
            const response = await authAPI.signup({
                username,
                password,
                fullName,
                location,
                contactNumber,
                idPicture: base64Image
            });
            
            statusMessage.textContent = response.message;
            statusMessage.style.color = '#28a745';
            signupFormElement.reset();
            
            setTimeout(() => {
                statusMessage.textContent = '';
            }, 5000);
        } catch (error) {
            statusMessage.textContent = error.message || 'Registration failed';
            statusMessage.style.color = '#dc3545';
        }
    });
});

// Logout Confirmation Modal Elements
confirmLogoutBtn.addEventListener('click', () => {
    setCurrentUser(null);
    logoutConfirmModal.style.display = 'none';
    showAuthModal();
});

cancelLogoutBtn.addEventListener('click', () => {
    logoutConfirmModal.style.display = 'none';
});

logoutConfirmModal.addEventListener('click', (e) => {
    if (e.target === logoutConfirmModal) {
        logoutConfirmModal.style.display = 'none';
    }
});

// Logout Handler
logoutBtn.addEventListener('click', () => {
    logoutConfirmModal.style.display = 'block';
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
async function loadPosts() {
    try {
        const posts = await postsAPI.getApproved();
        const lostItems = (posts || []).filter(p => p.type === 'lost');
        const foundItems = (posts || []).filter(p => p.type === 'found');
        
        displayPosts(lostItems, 'lostItemsList');
        displayPosts(foundItems, 'foundItemsList');
    } catch (error) {
        console.error('Error loading posts:', error);
        // Display empty state on error
        displayPosts([], 'lostItemsList');
        displayPosts([], 'foundItemsList');
    }
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
    const currentUser = getCurrentUser();
    
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.dataset.postId = post._id || post.id;
    
    const author = post.authorId || {};
    let content = post.content;
    // Process mentions
    const mentionRegex = /@(\w+)/g;
    content = content.replace(mentionRegex, (match, username) => {
        return `<span class="mention">@${username}</span>`;
    });
    
    postDiv.innerHTML = `
        <div class="post-header">
            <span class="post-author">${author.fullName || 'Unknown'}</span>
            <span class="post-date">${formatDate(post.createdAt)}</span>
        </div>
        <div class="post-content">${content}</div>
        ${post.image ? `<img src="${post.image}" class="post-image" alt="Post image">` : ''}
        <div class="post-actions">
            <button class="view-post-btn" data-post-id="${post._id || post.id}">View Details</button>
            ${currentUser?.role === 'admin' ? `
                <button class="btn-edit edit-post-btn" data-post-id="${post._id || post.id}">Edit</button>
                <button class="btn-delete delete-post-btn" data-post-id="${post._id || post.id}">Delete</button>
            ` : ''}
        </div>
    `;
    
    postDiv.querySelector('.view-post-btn').addEventListener('click', () => showPostDetails(post._id || post.id));
    
    if (currentUser?.role === 'admin') {
        postDiv.querySelector('.edit-post-btn')?.addEventListener('click', () => editPost(post._id || post.id));
        postDiv.querySelector('.delete-post-btn')?.addEventListener('click', () => deletePost(post._id || post.id));
    }
    
    return postDiv;
}

// Create Post Handler
createPostBtn.addEventListener('click', () => {
    createPostModal.style.display = 'block';
});

createPostForm.addEventListener('submit', async (e) => {
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
        authorId: currentUser._id || currentUser.id,
        type: type,
        content: content,
        image: null
    };
    
    if (imageFile) {
        convertImageToBase64(imageFile, async (base64Image) => {
            postData.image = base64Image;
            await savePost(postData);
        });
    } else {
        await savePost(postData);
    }
    
    createPostForm.reset();
    createPostModal.style.display = 'none';
});

async function savePost(postData) {
    try {
        const response = await postsAPI.create(postData);
        alert(response.message);
        await loadPosts();
        const currentUser = getCurrentUser();
        if (currentUser?.role === 'admin') {
            await loadPostRequests();
        }
    } catch (error) {
        alert('Error creating post: ' + error.message);
    }
}

// Show Post Details
async function showPostDetails(postId) {
    try {
        const posts = await postsAPI.getApproved();
        const post = posts.find(p => (p._id || p.id) === postId);
        if (!post) return;
        
        const comments = await commentsAPI.getByPost(postId);
        const currentUser = getCurrentUser();
        
        const author = post.authorId || {};
        let content = post.content;
        const mentionRegex = /@(\w+)/g;
        content = content.replace(mentionRegex, (match, username) => {
            return `<span class="mention">@${username}</span>`;
        });
        
        const postDetails = document.getElementById('postDetails');
        postDetails.innerHTML = `
            <h2>${post.type === 'lost' ? 'Lost Item' : 'Found Item'}</h2>
            <div class="post-header">
                <span class="post-author">${author.fullName || 'Unknown'}</span>
                <span class="post-date">${formatDate(post.createdAt)}</span>
            </div>
            <div class="post-content">${content}</div>
            ${post.image ? `<img src="${post.image}" class="post-image" alt="Post image">` : ''}
            
            <div class="comments-section">
                <h3>Comments (${comments.length})</h3>
                <div id="commentsList">
                    ${comments.map(comment => {
                        const commentAuthor = comment.authorId || {};
                        return `
                            <div class="comment" data-comment-id="${comment._id || comment.id}">
                                <div class="comment-header">
                                    <span class="comment-author">${commentAuthor.fullName || 'Unknown'}</span>
                                    ${currentUser?.role === 'admin' ? `
                                        <button class="btn-edit edit-comment-btn" data-comment-id="${comment._id || comment.id}">Edit</button>
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
        
        document.getElementById('submitCommentBtn').addEventListener('click', async () => {
            const commentText = document.getElementById('newCommentText').value;
            if (commentText.trim()) {
                await addComment(postId, commentText);
            }
        });
        
        if (currentUser?.role === 'admin') {
            document.querySelectorAll('.edit-comment-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const commentId = e.target.dataset.commentId;
                    await editComment(commentId);
                });
            });
        }
        
        postDetailsModal.style.display = 'block';
    } catch (error) {
        console.error('Error loading post details:', error);
        alert('Error loading post details');
    }
}

async function addComment(postId, content) {
    try {
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        
        await commentsAPI.create({
            postId: postId,
            authorId: currentUser._id || currentUser.id,
            content: content
        });
        
        await showPostDetails(postId);
        await loadPosts();
    } catch (error) {
        alert('Error adding comment: ' + error.message);
    }
}

async function editComment(commentId) {
    try {
        // Get the post ID from the modal
        const postId = document.querySelector('#postDetails').closest('.modal')?.querySelector('[data-post-id]')?.dataset?.postId;
        if (!postId) {
            alert('Unable to find post');
            return;
        }
        
        const comments = await commentsAPI.getByPost(postId);
        const currentComment = comments.find(c => (c._id || c.id) === commentId);
        if (!currentComment) {
            alert('Comment not found');
            return;
        }
        
        const newContent = prompt('Edit comment:', currentComment.content);
        if (newContent && newContent.trim()) {
            await commentsAPI.update(commentId, newContent.trim());
            await showPostDetails(postId);
        }
    } catch (error) {
        alert('Error editing comment: ' + error.message);
    }
}

async function editPost(postId) {
    try {
        const posts = await postsAPI.getApproved();
        const post = posts.find(p => (p._id || p.id) === postId);
        if (!post) return;
        
        const newContent = prompt('Edit post content:', post.content);
        if (newContent !== null && newContent.trim()) {
            await postsAPI.update(postId, newContent.trim());
            await loadPosts();
        }
    } catch (error) {
        alert('Error editing post: ' + error.message);
    }
}

async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
        await postsAPI.delete(postId);
        await loadPosts();
    } catch (error) {
        alert('Error deleting post: ' + error.message);
    }
}

// Load Messages
async function loadMessages() {
    try {
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        
        const messages = await messagesAPI.getByUser(currentUser._id || currentUser.id);
        
        const messagesList = document.getElementById('messagesList');
        messagesList.innerHTML = '';
        
        if (!messages || messages.length === 0) {
            messagesList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No messages yet</p>';
            return;
        }
        
        messages.forEach(message => {
            const sender = message.senderId || {};
            const recipient = message.recipientId || {};
            const isSender = (message.senderId?._id || message.senderId?.id) === (currentUser._id || currentUser.id);
            
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            messageDiv.innerHTML = `
                <div class="message-header">
                    <span class="message-sender">${isSender ? 'You' : (sender.fullName || 'Unknown')} → ${!isSender ? 'You' : (recipient.fullName || 'Unknown')}</span>
                    <span class="message-time">${formatDate(message.createdAt)}</span>
                </div>
                <div class="message-content">${message.content}</div>
            `;
            messagesList.appendChild(messageDiv);
        });
    } catch (error) {
        console.error('Error loading messages:', error);
        const messagesList = document.getElementById('messagesList');
        if (messagesList) {
            messagesList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Error loading messages</p>';
        }
    }
}

// Load Message Recipients
async function loadMessageRecipients() {
    try {
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        
        const users = await usersAPI.getApproved();
        const recipients = users.filter(u => (u._id || u.id) !== (currentUser._id || currentUser.id));
        
        const recipientSelect = document.getElementById('messageRecipient');
        recipientSelect.innerHTML = '<option value="">Select recipient...</option>';
        
        recipients.forEach(user => {
            const option = document.createElement('option');
            option.value = user._id || user.id;
            option.textContent = `${user.fullName} (${user.role === 'admin' ? 'Admin' : 'User'})`;
            recipientSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading recipients:', error);
    }
}

// Send Message Handler
document.getElementById('sendMessageBtn').addEventListener('click', async () => {
    try {
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
        
        await messagesAPI.send({
            senderId: currentUser._id || currentUser.id,
            recipientId: recipientId,
            content: content.trim()
        });
        
        document.getElementById('messageText').value = '';
        await loadMessages();
        await loadNotifications();
    } catch (error) {
        alert('Error sending message: ' + error.message);
    }
});

// Load Notifications
async function loadNotifications() {
    try {
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        
        const notifications = await notificationsAPI.getByUser(currentUser._id || currentUser.id);
        
        const notificationsList = document.getElementById('notificationsList');
        notificationsList.innerHTML = '';
        
        if (!notifications || notifications.length === 0) {
            notificationsList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No notifications</p>';
            return;
        }
        
        notifications.forEach(notification => {
            const notificationDiv = document.createElement('div');
            notificationDiv.className = `notification ${notification.read ? '' : 'unread'}`;
            notificationDiv.innerHTML = `
                <div>${notification.message}</div>
                <div style="font-size: 11px; color: #666; margin-top: 5px;">${formatDate(notification.createdAt)}</div>
            `;
            notificationDiv.addEventListener('click', async () => {
                if (!notification.read) {
                    await notificationsAPI.markRead(notification._id || notification.id);
                    await loadNotifications();
                }
            });
            notificationsList.appendChild(notificationDiv);
        });
    } catch (error) {
        console.error('Error loading notifications:', error);
        const notificationsList = document.getElementById('notificationsList');
        if (notificationsList) {
            notificationsList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Error loading notifications</p>';
        }
    }
}

// Admin Functions
async function loadAccountRequests() {
    try {
        const users = await usersAPI.getPending();
        
        const accountRequestsList = document.getElementById('accountRequestsList');
        accountRequestsList.innerHTML = '';
        
        if (users.length === 0) {
            accountRequestsList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No pending account requests</p>';
            return;
        }
        
        users.forEach(user => {
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
                            <button class="btn-approve approve-account-btn" data-user-id="${user._id || user.id}">Approve</button>
                            <button class="btn-decline decline-account-btn" data-user-id="${user._id || user.id}">Decline</button>
                        </div>
                    </div>
                </div>
            `;
            
            requestDiv.querySelector('.approve-account-btn').addEventListener('click', () => approveAccount(user._id || user.id));
            requestDiv.querySelector('.decline-account-btn').addEventListener('click', () => declineAccount(user._id || user.id));
            
            accountRequestsList.appendChild(requestDiv);
        });
    } catch (error) {
        console.error('Error loading account requests:', error);
    }
}

async function loadPostRequests() {
    try {
        const posts = await postsAPI.getPending();
        
        const postRequestsList = document.getElementById('postRequestsList');
        postRequestsList.innerHTML = '';
        
        if (posts.length === 0) {
            postRequestsList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No pending post requests</p>';
            return;
        }
        
        posts.forEach(post => {
            const author = post.authorId || {};
            const requestDiv = document.createElement('div');
            requestDiv.className = 'request-item post-request-card';
            
            let content = post.content;
            const mentionRegex = /@(\w+)/g;
            content = content.replace(mentionRegex, (match, username) => {
                return `<span class="mention">@${username}</span>`;
            });
            
            requestDiv.innerHTML = `
                <div class="post-card-content">
                    <div class="post-info">
                        <p><strong>Author:</strong> ${author.fullName || 'Unknown'}</p>
                        <p><strong>Type:</strong> <span class="post-type-badge ${post.type}">${post.type === 'lost' ? 'Lost Item' : 'Found Item'}</span></p>
                        <p><strong>Content:</strong> ${content.length > 100 ? content.substring(0, 100) + '...' : content}</p>
                        <p><strong>Submitted:</strong> ${formatDate(post.createdAt)}</p>
                    </div>
                    <div class="post-image-section">
                        ${post.image ? `<img src="${post.image}" class="post-request-image" alt="Post image">` : '<div class="no-image">No Image</div>'}
                        <div class="post-actions">
                            <button class="btn-approve approve-post-btn" data-post-id="${post._id || post.id}">Approve</button>
                            <button class="btn-decline decline-post-btn" data-post-id="${post._id || post.id}">Decline</button>
                        </div>
                    </div>
                </div>
            `;
            
            requestDiv.querySelector('.approve-post-btn').addEventListener('click', () => approvePost(post._id || post.id));
            requestDiv.querySelector('.decline-post-btn').addEventListener('click', () => declinePost(post._id || post.id));
            
            postRequestsList.appendChild(requestDiv);
        });
    } catch (error) {
        console.error('Error loading post requests:', error);
    }
}

async function approveAccount(userId) {
    try {
        await usersAPI.approve(userId);
        await loadAccountRequests();
        await loadNotifications();
    } catch (error) {
        alert('Error approving account: ' + error.message);
    }
}

async function declineAccount(userId) {
    if (!confirm('Are you sure you want to decline this account request?')) return;
    
    try {
        await usersAPI.decline(userId);
        await loadAccountRequests();
    } catch (error) {
        alert('Error declining account: ' + error.message);
    }
}

async function approvePost(postId) {
    try {
        await postsAPI.approve(postId);
        await loadPostRequests();
        await loadPosts();
        await loadNotifications();
    } catch (error) {
        alert('Error approving post: ' + error.message);
    }
}

async function declinePost(postId) {
    if (!confirm('Are you sure you want to decline this post?')) return;
    
    try {
        await postsAPI.decline(postId);
        await loadPostRequests();
    } catch (error) {
        alert('Error declining post: ' + error.message);
    }
}

async function loadManageAccounts() {
    try {
        const users = await usersAPI.getAll();
        const allUsers = users.filter(u => u.role !== 'admin');
        
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
                            <button class="btn-delete delete-account-btn" data-user-id="${user._id || user.id}">Delete Account</button>
                        </div>
                    </div>
                </div>
            `;
            
            accountDiv.querySelector('.delete-account-btn').addEventListener('click', () => deleteAccount(user._id || user.id));
            manageAccountsList.appendChild(accountDiv);
        });
    } catch (error) {
        console.error('Error loading manage accounts:', error);
    }
}

async function deleteAccount(userId) {
    if (!confirm('Are you sure you want to delete this account? This will also delete all their posts, comments, and messages.')) return;
    
    try {
        await usersAPI.delete(userId);
        
        const currentUser = getCurrentUser();
        if (currentUser && (currentUser._id || currentUser.id) === userId) {
            setCurrentUser(null);
            showAuthModal();
        } else {
            await loadManageAccounts();
            await loadPosts();
        }
    } catch (error) {
        alert('Error deleting account: ' + error.message);
    }
}

// Admin Tab Switcher
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        const tabName = btn.dataset.tab;
        
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
        
        const currentUser = getCurrentUser();
        if (currentUser?.role === 'admin') {
            if (tabName === 'accountRequests') {
                await loadAccountRequests();
            } else if (tabName === 'postRequests') {
                await loadPostRequests();
            } else if (tabName === 'manageAccounts') {
                await loadManageAccounts();
            }
        }
    });
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

