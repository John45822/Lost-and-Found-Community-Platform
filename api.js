// API Configuration
const API_BASE_URL = window.location.origin + '/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth API
const authAPI = {
    login: async (username, password) => {
        return await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },
    
    signup: async (userData) => {
        return await apiCall('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }
};

// Users API
const usersAPI = {
    getAll: async () => {
        return await apiCall('/users');
    },
    
    getApproved: async () => {
        return await apiCall('/users/approved');
    },
    
    getPending: async () => {
        return await apiCall('/users/pending');
    },
    
    approve: async (userId) => {
        return await apiCall(`/users/${userId}/approve`, {
            method: 'PUT'
        });
    },
    
    decline: async (userId) => {
        return await apiCall(`/users/${userId}/decline`, {
            method: 'DELETE'
        });
    },
    
    delete: async (userId) => {
        return await apiCall(`/users/${userId}`, {
            method: 'DELETE'
        });
    }
};

// Posts API
const postsAPI = {
    getApproved: async () => {
        return await apiCall('/posts/approved');
    },
    
    getPending: async () => {
        return await apiCall('/posts/pending');
    },
    
    create: async (postData) => {
        return await apiCall('/posts', {
            method: 'POST',
            body: JSON.stringify(postData)
        });
    },
    
    approve: async (postId) => {
        return await apiCall(`/posts/${postId}/approve`, {
            method: 'PUT'
        });
    },
    
    decline: async (postId) => {
        return await apiCall(`/posts/${postId}/decline`, {
            method: 'DELETE'
        });
    },
    
    update: async (postId, content) => {
        return await apiCall(`/posts/${postId}`, {
            method: 'PUT',
            body: JSON.stringify({ content })
        });
    },
    
    delete: async (postId) => {
        return await apiCall(`/posts/${postId}`, {
            method: 'DELETE'
        });
    }
};

// Comments API
const commentsAPI = {
    getByPost: async (postId) => {
        return await apiCall(`/comments/post/${postId}`);
    },
    
    create: async (commentData) => {
        return await apiCall('/comments', {
            method: 'POST',
            body: JSON.stringify(commentData)
        });
    },
    
    update: async (commentId, content) => {
        return await apiCall(`/comments/${commentId}`, {
            method: 'PUT',
            body: JSON.stringify({ content })
        });
    }
};

// Messages API
const messagesAPI = {
    getByUser: async (userId) => {
        return await apiCall(`/messages/user/${userId}`);
    },
    
    send: async (messageData) => {
        return await apiCall('/messages', {
            method: 'POST',
            body: JSON.stringify(messageData)
        });
    }
};

// Notifications API
const notificationsAPI = {
    getByUser: async (userId) => {
        return await apiCall(`/notifications/user/${userId}`);
    },
    
    markRead: async (notificationId) => {
        return await apiCall(`/notifications/${notificationId}/read`, {
            method: 'PUT'
        });
    }
};

