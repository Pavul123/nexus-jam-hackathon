let currentStep = 0;
let userData = {};
let registeredUsers = {};
let currentUser = null;
let mentors = {};
let meetings = {};
let currentMeeting = null;
let isMuted = false;
let isVideoOn = true;


const sampleMentors = [
    {
        id: 'mentor1',
        name: 'Sarah Johnson',
        title: 'Senior Software Engineer at Google',
        experience: '8 years in tech industry',
        specialties: ['Programming', 'Software Design', 'Career Growth', 'Leadership'],
        rating: 4.9,
        sessions: 156,
        avatar: 'SJ',
        price: '$80/hour',
        bio: 'Passionate about helping junior developers grow their careers in tech. Specializes in full-stack development and engineering leadership.',
        availableSlots: [
            { day: 'Monday', time: '10:00 AM', available: true },
            { day: 'Monday', time: '2:00 PM', available: false },
            { day: 'Tuesday', time: '11:00 AM', available: true },
            { day: 'Wednesday', time: '3:00 PM', available: true },
            { day: 'Friday', time: '9:00 AM', available: true }
        ]
    },
    {
        id: 'mentor2',
        name: 'Michael Chen',
        title: 'Product Manager at Meta',
        experience: '10 years in product management',
        specialties: ['Product Strategy', 'Analytics', 'Leadership', 'Business Analysis'],
        rating: 4.8,
        sessions: 203,
        avatar: 'MC',
        price: '$90/hour',
        bio: 'Expert in product strategy and data-driven decision making. Helps professionals transition into product management roles.',
        availableSlots: [
            { day: 'Monday', time: '1:00 PM', available: true },
            { day: 'Tuesday', time: '10:00 AM', available: true },
            { day: 'Wednesday', time: '4:00 PM', available: false },
            { day: 'Thursday', time: '11:00 AM', available: true },
            { day: 'Friday', time: '2:00 PM', available: true }
        ]
    },
    {
        id: 'mentor3',
        name: 'Emily Rodriguez',
        title: 'Creative Director at Adobe',
        experience: '12 years in design & UX',
        specialties: ['Design Thinking', 'User Research', 'Visual Design', 'Creative Leadership'],
        rating: 5.0,
        sessions: 89,
        avatar: 'ER',
        price: '$75/hour',
        bio: 'Award-winning designer with expertise in UX/UI design and creative team leadership. Passionate about design thinking methodologies.',
        availableSlots: [
            { day: 'Monday', time: '9:00 AM', available: true },
            { day: 'Tuesday', time: '2:00 PM', available: true },
            { day: 'Thursday', time: '10:00 AM', available: true },
            { day: 'Thursday', time: '3:00 PM', available: false },
            { day: 'Friday', time: '11:00 AM', available: true }
        ]
    }
];


sampleMentors.forEach(mentor => {
    mentors[mentor.id] = mentor;
});


function showMentors() {
    document.getElementById('welcome').style.display = 'none';
    document.getElementById('mentorshipSection').style.display = 'block';
    loadMentors();
}

function loadMentors(filter = null) {
    const mentorGrid = document.getElementById('mentorGrid');
    mentorGrid.innerHTML = '';
    let mentorsToShow = Object.values(mentors);
    
    if (filter && userData.currentSkills) {
        mentorsToShow = mentorsToShow.filter(mentor => 
            mentor.specialties.some(specialty => 
                userData.currentSkills.some(skill => 
                    specialty.toLowerCase().includes(skill.toLowerCase()) ||
                    skill.toLowerCase().includes(specialty.toLowerCase())
                )
            )
        );
    }
    
    mentorsToShow.forEach(mentor => {
        const mentorCard = createMentorCard(mentor);
        mentorGrid.appendChild(mentorCard);
    });
}

function createMentorCard(mentor) {
    const card = document.createElement('div');
    card.className = 'mentor-card';
    card.innerHTML = `
        <div class="mentor-avatar">${mentor.avatar}</div>
        <h3>${mentor.name}</h3>
        <div class="mentor-title">${mentor.title}</div>
        <div class="mentor-experience">${mentor.experience}</div>
        <div class="mentor-rating">
            <span class="stars">${'★'.repeat(Math.floor(mentor.rating))}${mentor.rating % 1 ? '☆' : ''}</span>
            <span>${mentor.rating} (${mentor.sessions} sessions)</span>
        </div>
        <div class="mentor-specialties">
            ${mentor.specialties.map(specialty => `<span class="specialty-tag">${specialty}</span>`).join('')}
        </div>
        <div class="mentor-actions">
            <button class="mentor-btn primary" onclick="scheduleMeeting('${mentor.id}')">Schedule Meeting</button>
            <button class="mentor-btn secondary" onclick="viewProfile('${mentor.id}')">View Profile</button>
        </div>
    `;
    return card;
}

function scheduleMeeting(mentorId) {
    const mentor = mentors[mentorId];
    if (!mentor) return;
    
    if (!currentUser) {
        showMessage('Please create an account or login to schedule a meeting.', 'error');
        return;
    }
    
    const schedulerModal = document.getElementById('schedulerModal');
    const schedulerContent = document.getElementById('schedulerContent');
    
    schedulerContent.innerHTML = `
        <div class="mentor-info">
            <h3>Schedule Meeting with ${mentor.name}</h3>
            <p>${mentor.title}</p>
            <p><strong>Rate:</strong> ${mentor.price}</p>
        </div>
        <div class="form-group">
            <label>Select Date & Time:</label>
            <div class="time-slots">
                ${mentor.availableSlots.map((slot, index) => `
                    <div class="time-slot ${slot.available ? '' : 'unavailable'}" 
                         onclick="${slot.available ? `selectTimeSlot(${index})` : ''}"
                         data-slot-index="${index}">
                        <strong>${slot.day}</strong><br>
                        ${slot.time}
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="form-group">
            <label for="meetingTopic">Meeting Topic:</label>
            <input type="text" id="meetingTopic" placeholder="e.g., Career transition advice, Resume review">
        </div>
        <div class="form-group">
            <label for="meetingDescription">Additional Details:</label>
            <textarea id="meetingDescription" rows="3" placeholder="Describe what you'd like to discuss..."></textarea>
        </div>
        <div class="nav-buttons">
            <button type="button" class="nav-btn" onclick="closeScheduler()">Cancel</button>
            <button type="button" class="nav-btn" onclick="confirmMeeting('${mentorId}')">Confirm Meeting</button>
        </div>
    `;
    
    schedulerModal.classList.add('active');
    schedulerModal.scrollIntoView({ behavior: 'smooth' });
}

function selectTimeSlot(slotIndex) {
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    const selectedSlot = document.querySelector(`[data-slot-index="${slotIndex}"]`);
    if (selectedSlot && !selectedSlot.classList.contains('unavailable')) {
        selectedSlot.classList.add('selected');
    }
}

function confirmMeeting(mentorId) {
    const mentor = mentors[mentorId];
    const selectedSlot = document.querySelector('.time-slot.selected');
    const topic = document.getElementById('meetingTopic').value.trim();
    const description = document.getElementById('meetingDescription').value.trim();
    
    if (!selectedSlot) {
        showMessage('Please select a time slot.', 'error');
        return;
    }
    
    if (!topic) {
        showMessage('Please enter a meeting topic.', 'error');
        return;
    }
    
    const slotIndex = parseInt(selectedSlot.getAttribute('data-slot-index'));
    const selectedTime = mentor.availableSlots[slotIndex];
    
    const meetingId = 'meeting_' + Date.now();
    const meeting = {
        id: meetingId,
        mentorId: mentorId,
        studentId: currentUser.id,
        mentor: mentor,
        student: currentUser,
        topic: topic,
        description: description,
        scheduledTime: selectedTime,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        notes: ''
    };
    
    meetings[meetingId] = meeting;
    mentor.availableSlots[slotIndex].available = false;
    
    showMessage(`Meeting scheduled successfully with ${mentor.name} for ${selectedTime.day} at ${selectedTime.time}!`, 'success');
    
    setTimeout(() => {
        closeScheduler();
        setTimeout(() => {
            joinMeeting(meetingId);
        }, 1000);
    }, 2000);
}

function closeScheduler() {
    document.getElementById('schedulerModal').classList.remove('active');
    clearMessage();
}

function viewProfile(mentorId) {
    const mentor = mentors[mentorId];
    if (!mentor) return;
    
    alert(`Profile: ${mentor.name}\n\n${mentor.bio}\n\nSpecialties: ${mentor.specialties.join(', ')}\nRating: ${mentor.rating}/5.0\nSessions: ${mentor.sessions}\nRate: ${mentor.price}`);
}

function joinMeeting(meetingId) {
    const meeting = meetings[meetingId];
    if (!meeting) return;
    
    currentMeeting = meeting;
    
    document.querySelectorAll('.form-section, .mentorship-section, .welcome-section').forEach(section => {
        section.style.display = 'none';
    });
    
    const meetingInterface = document.getElementById('meetingInterface');
    meetingInterface.classList.add('active');
    
    document.getElementById('meetingTitle').textContent = `Meeting with ${meeting.mentor.name}`;
    document.getElementById('meetingDetails').textContent = `Topic: ${meeting.topic} | ${meeting.scheduledTime.day} at ${meeting.scheduledTime.time}`;
    
    const statusElement = document.getElementById('meetingStatus');
    statusElement.textContent = 'Active';
    statusElement.className = 'meeting-status status-active';
    
    meetingInterface.scrollIntoView({ behavior: 'smooth' });
}

function toggleMute() {
    isMuted = !isMuted;
    const btn = event.target;
    btn.textContent = isMuted ? '🔇' : '🎤';
    btn.style.background = isMuted ? 'rgba(255, 107, 107, 0.8)' : 'rgba(255, 255, 255, 0.2)';
    addChatMessage('system', `Microphone ${isMuted ? 'muted' : 'unmuted'}`);
}

function toggleVideo() {
    isVideoOn = !isVideoOn;
    const btn = event.target;
    btn.textContent = isVideoOn ? '📹' : '📵';
    btn.style.background = !isVideoOn ? 'rgba(255, 107, 107, 0.8)' : 'rgba(255, 255, 255, 0.2)';
    addChatMessage('system', `Camera ${isVideoOn ? 'turned on' : 'turned off'}`);
}

function endMeeting() {
    if (confirm('Are you sure you want to end the meeting?')) {
        leaveMeeting();
    }
}

function leaveMeeting() {
    const meetingInterface = document.getElementById('meetingInterface');
    meetingInterface.classList.remove('active');
    
    if (currentMeeting) {
        currentMeeting.status = 'completed';
        currentMeeting.endedAt = new Date().toISOString();
        currentMeeting = null;
    }
    
    document.getElementById('welcome').style.display = 'block';
    showMessage('Meeting ended. Thank you for using Career Compass!', 'success');
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    if (!message) return;
    
    addChatMessage('sent', message);
    chatInput.value = '';
    
    setTimeout(() => {
        const responses = [
            "That's a great question! Let me share my thoughts...",
            "I understand your concern. Here's what I recommend...",
            "Based on my experience, I suggest...",
            "That's exactly the right mindset to have!",
            "Let me give you a practical example..."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addChatMessage('received', randomResponse);
    }, 1000 + Math.random() * 2000);
}

function addChatMessage(type, message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message message-${type === 'sent' ? 'sent' : 'received'}`;
    
    if (type === 'system') {
        messageElement.innerHTML = `<em>${message}</em>`;
        messageElement.style.textAlign = 'center';
        messageElement.style.color = '#666';
        messageElement.style.background = '#f0f0f0';
    } else {
        const prefix = type === 'sent' ? 'You' : (currentMeeting ? currentMeeting.mentor.name : 'Mentor');
        messageElement.innerHTML = `<strong>${prefix}:</strong> ${message}`;
    }
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function saveNotes() {
    const notes = document.getElementById('meetingNotes').value;
    if (currentMeeting) {
        currentMeeting.notes = notes;
        showMessage('Meeting notes saved successfully!', 'success');
    }
}

function switchTab(tab) {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    if (tab === 'register') {
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
    } else {
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    }
    clearMessage();
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function checkPasswordStrength(password) {
    const strengthElement = document.getElementById('passwordStrength');
    let strength = 0;
    let message = '';
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength < 3) {
        message = 'Weak';
        strengthElement.className = 'password-strength strength-weak';
    } else if (strength < 4) {
        message = 'Medium';
        strengthElement.className = 'password-strength strength-medium';
    } else {
        message = 'Strong';
        strengthElement.className = 'password-strength strength-strong';
    }
    
    strengthElement.textContent = `Password strength: ${message}`;
    return strength >= 3;
}

function showMessage(message, type) {
    const messageContainer = document.getElementById('messageContainer');
    messageContainer.textContent = message;
    messageContainer.className = `message ${type}`;
    messageContainer.style.display = 'block';
    
    if (type === 'success') {
        setTimeout(() => {
            clearMessage();
        }, 3000);
    }
}

function clearMessage() {
    const messageContainer = document.getElementById('messageContainer');
    messageContainer.style.display = 'none';
    messageContainer.className = 'message';
}

function registerUser() {
    const fullName = document.getElementById('regFullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const age = document.getElementById('regAge').value;
    const phone = document.getElementById('regPhone').value.trim();
    const currentStudy = document.getElementById('regCurrentStudy').value;
    const fieldOfStudy = document.getElementById('regFieldOfStudy').value.trim();
    const graduationYear = document.getElementById('regGraduationYear').value;
    const location = document.getElementById('regLocation').value.trim();
    const termsAccepted = document.getElementById('termsAccept').checked;
    const emailUpdates = document.getElementById('emailUpdates').checked;

    if (!fullName || !email || !password || !currentStudy || !graduationYear) {
        showMessage('Please fill in all required fields.', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showMessage('Please enter a valid email address.', 'error');
        return;
    }
    
    if (registeredUsers[email]) {
        showMessage('An account with this email already exists. Please login instead.', 'error');
        return;
    }
    
    if (!checkPasswordStrength(password)) {
        showMessage('Password must be at least 8 characters long and contain a mix of letters, numbers, and special characters.', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match.', 'error');
        return;
    }
    
    if (!termsAccepted) {
        showMessage('Please accept the Terms of Service and Privacy Policy.', 'error');
        return;
    }

    const userId = 'user_' + Date.now();
    const newUser = {
        id: userId,
        fullName,
        email,
        password,
        age,
        phone,
        currentStudy,
        fieldOfStudy,
        graduationYear,
        location,
        emailUpdates,
        registrationDate: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };
function updateUserInfo() {
    const userInfo = document.getElementById('userInfo');
    if (currentUser) {
        userInfo.textContent = `Welcome, ${currentUser.fullName}`;
        userInfo.style.display = 'block';
    } else {
        userInfo.style.display = 'none';
    }
}

function startJourney() {
    document.getElementById('welcome').style.display = 'none';
    document.getElementById('mentorshipSection').style.display = 'none';
    document.getElementById('progressBar').style.display = 'block';
    currentStep = 1;
    showStep(1);
    updateProgress();
}

function showStep(step) {
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('mentorshipSection').style.display = 'none';
    document.getElementById('meetingInterface').classList.remove('active');
    document.getElementById(`step${step}`).classList.add('active');
}

function updateProgress() {
    const progress = (currentStep / 3) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
}

function nextStep(step) {
    if (step === 1) {
        if (!currentUser) {
            showMessage('Please create an account or login to continue.', 'error');
            return;
        }
        currentStep = 2;
        showStep(2);
        updateProgress();
    } else if (step === 2) {
        if (validateAssessment()) {
            collectAssessmentData();
            generateRecommendations();
            currentStep = 3;
            showStep(3);
            updateProgress();
        }
    }
}

function previousStep(step) {
    currentStep = step - 1;
    showStep(currentStep);
    updateProgress();
}

function validateAssessment() {
    const requiredQuestions = ['workEnvironment', 'problemType', 'careerPriority'];
    let isValid = true;
    
    requiredQuestions.forEach(question => {
        const answer = document.querySelector(`input[name="${question}"]:checked`);
        if (!answer) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showMessage('Please answer all assessment questions.', 'error');
    }
    
    return isValid;
}

function collectAssessmentData() {
    userData.workEnvironment = document.querySelector('input[name="workEnvironment"]:checked')?.value;
    userData.problemType = document.querySelector('input[name="problemType"]:checked')?.value;
    userData.careerPriority = document.querySelector('input[name="careerPriority"]:checked')?.value;
    userData.currentSkills = [];
    
    document.querySelectorAll('input[name="currentSkills"]:checked').forEach(skill => {
        userData.currentSkills.push(skill.value);
    });
    
    if (currentUser) {
        currentUser.assessmentData = {
            workEnvironment: userData.workEnvironment,
            problemType: userData.problemType,
            careerPriority: userData.careerPriority,
            currentSkills: userData.currentSkills,
            completedDate: new Date().toISOString()
        };
    }
}

// Recommendations Functions
function generateRecommendations() {
    const recommendations = getCareerRecommendations(userData);
    displayRecommendations(recommendations);
    generateLearningPath(recommendations);
    showRecommendedMentors(recommendations);
}

function getCareerRecommendations(userData) {
    const { workEnvironment, problemType, careerPriority, currentSkills, fieldOfStudy } = userData;
    let recommendations = [];
    
    if (problemType === 'technical' || currentSkills.includes('programming') || fieldOfStudy?.toLowerCase().includes('computer')) {
        recommendations.push({
            title: 'Software Developer',
            description: 'Build applications and systems using various programming languages',
            matchScore: 95,
            requiredSkills: ['Programming', 'Problem Solving', 'Software Design', 'Testing'],
            growthPotential: 'High',
            avgSalary: '$75,000 - $150,000'
        });
    }
    
    if (problemType === 'creative' || currentSkills.includes('design')) {
        recommendations.push({
            title: 'UX/UI Designer',
            description: 'Design user-friendly interfaces and experiences for digital products',
            matchScore: 90,
            requiredSkills: ['Design Thinking', 'Prototyping', 'User Research', 'Visual Design'],
            growthPotential: 'High',
            avgSalary: '$65,000 - $120,000'
        });
    }
    
    if (recommendations.length === 0) {
        recommendations.push({
            title: 'Project Coordinator',
            description: 'Coordinate projects and ensure timely completion of deliverables',
            matchScore: 70,
            requiredSkills: ['Organization', 'Communication', 'Time Management', 'Coordination'],
            growthPotential: 'Medium',
            avgSalary: '$45,000 - $75,000'
        });
    }
    
    return recommendations.slice(0, 3);
}

function displayRecommendations(recommendations) {
    const container = document.getElementById('careerRecommendations');
    container.innerHTML = '';
    
    recommendations.forEach(career => {
        const careerCard = document.createElement('div');
        careerCard.className = 'career-card';
        careerCard.innerHTML = `
            <h3>${career.title} (${career.matchScore}% match)</h3>
            <p>${career.description}</p>
            <p><strong>Average Salary:</strong> ${career.avgSalary}</p>
            <p><strong>Growth Potential:</strong> ${career.growthPotential}</p>
            <div class="skill-tags">
                ${career.requiredSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        `;
        container.appendChild(careerCard);
    });
}

function generateLearningPath(recommendations) {
    const skillGapsContainer = document.getElementById('skillGaps');
    const allRequiredSkills = [...new Set(recommendations.flatMap(career => career.requiredSkills))];
    const currentSkills = userData.currentSkills || [];
    
    const skillGaps = allRequiredSkills.filter(skill => 
        !currentSkills.some(currentSkill => 
            skill.toLowerCase().includes(currentSkill.toLowerCase()) || 
            currentSkill.toLowerCase().includes(skill.toLowerCase())
        )
    );
    
    skillGapsContainer.innerHTML = `
        <h3>Skills to Develop:</h3>
        <div class="skill-tags">
            ${skillGaps.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
        </div>
    `;
    
    generatePlatformLinks(skillGaps);
}

function showRecommendedMentors(recommendations) {
    const recommendedMentorsContainer = document.getElementById('recommendedMentors');
    const allRequiredSkills = [...new Set(recommendations.flatMap(career => career.requiredSkills))];
    
    const recommendedMentors = Object.values(mentors).filter(mentor => 
        mentor.specialties.some(specialty => 
            allRequiredSkills.some(skill => 
                specialty.toLowerCase().includes(skill.toLowerCase()) ||
                skill.toLowerCase().includes(specialty.toLowerCase())
            )
        )
    ).slice(0, 3);
    
    recommendedMentorsContainer.innerHTML = '';
    
    if (recommendedMentors.length > 0) {
        recommendedMentors.forEach(mentor => {
            const mentorCard = createMentorCard(mentor);
            recommendedMentorsContainer.appendChild(mentorCard);
        });
    } else {
        recommendedMentorsContainer.innerHTML = '<p>No specific mentors found for your career path. <button class="mentor-btn primary" onclick="showMentors()">Browse All Mentors</button></p>';
    }
}

function generatePlatformLinks(skillGaps) {
    const courseraContainer = document.getElementById('courseraLinks');
    const udemyContainer = document.getElementById('udemyLinks');
    const linkedinContainer = document.getElementById('linkedinLinks');
    
    const skillMap = {
        'Programming': { title: 'Programming for Everybody (Python)', url: 'https://www.coursera.org/learn/python' },
        'Design Thinking': { title: 'Design Thinking for Innovation', url: 'https://www.coursera.org/learn/uva-darden-design-thinking-innovation' },
        'Communication': { title: 'Effective Communication', url: 'https://www.coursera.org/learn/effective-business-communication' }
    };
    
    const courseraLinks = skillGaps.map(skill => 
        skillMap[skill] || { title: `${skill} Fundamentals`, url: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}` }
    ).slice(0, 3);
    
    const udemyLinks = skillGaps.map(skill => 
        ({ title: `${skill} Complete Course`, url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skill)}` })
    ).slice(0, 3);
    
    const linkedinLinks = skillGaps.map(skill => 
        ({ title: `${skill} Professional Development`, url: `https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(skill)}` })
    ).slice(0, 3);
    
    courseraContainer.innerHTML = courseraLinks.map(link => `<a href="${link.url}" target="_blank">${link.title}</a>`).join('');
    udemyContainer.innerHTML = udemyLinks.map(link => `<a href="${link.url}" target="_blank">${link.title}</a>`).join('');
    linkedinContainer.innerHTML = linkedinLinks.map(link => `<a href="${link.url}" target="_blank">${link.title}</a>`).join('');
}

function startOver() {
    currentStep = 0;
    document.getElementById('progressBar').style.display = 'none';
    document.getElementById('welcome').style.display = 'block';
    document.getElementById('mentorshipSection').style.display = 'none';
    document.getElementById('meetingInterface').classList.remove('active');
    
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('input[type="radio"], input[name="currentSkills"]').forEach(input => {
        input.checked = false;
    });
    
    clearMessage();
}


document.addEventListener('DOMContentLoaded', function() {
    // Password strength checker
    document.getElementById('regPassword').addEventListener('input', function() {
        checkPasswordStrength(this.value);
    });
    
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Form validation on blur
    document.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.style.borderColor = '#ff6b6b';
            } else {
                this.style.borderColor = '#e1e5e9';
            }
        });
        
        field.addEventListener('input', function() {
            if (this.style.borderColor === 'rgb(255, 107, 107)' && this.value.trim()) {
                this.style.borderColor = '#e1e5e9';
            }
        });
    });
    
    
    registeredUsers['demo@example.com'] = {
        id: 'user_demo',
        fullName: 'Demo User',
        email: 'demo@example.com',
        password: 'demo123',
        age: '25',
        phone: '+1234567890',
        currentStudy: 'undergraduate',
        fieldOfStudy: 'Computer Science',
        graduationYear: '2025',
        location: 'New York, USA',
        emailUpdates: true,
        registrationDate: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (document.getElementById('schedulerModal').classList.contains('active')) {
            closeScheduler();
        }
        if (document.getElementById('meetingInterface').classList.contains('active')) {
            if (confirm('Are you sure you want to leave the meeting?')) {
                leaveMeeting();
            }
        }
    }
    
    if (e.key === 'Enter' && e.target.id === 'chatInput') {
        sendMessage();
    }
});
