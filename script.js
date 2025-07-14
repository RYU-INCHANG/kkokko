// --- DOM 요소 선택 ---
const voiceSelectionPopup = document.getElementById('voice-selection-popup');
const selectChickenBtn = document.getElementById('select-chicken');
const selectTigerBtn = document.getElementById('select-tiger');
// V03: 모든 팝업 닫기 버튼을 포함하도록 선택자 업데이트
const closePopupButtons = document.querySelectorAll('.close-popup-button, .close-popup-button-flat');

const mainScreenFemale = document.getElementById('main-screen-female');
const mainScreenMale = document.getElementById('main-screen-male');
const todayScheduleScreen = document.getElementById('today-schedule-screen');
const memoListScreen = document.getElementById('memo-list-screen');

const btnTodayScheduleFemale = document.getElementById('btn-today-schedule-female');
const btnMemoRegisterFemale = document.getElementById('btn-memo-register-female');
const btnScheduleRegisterFemale = document.getElementById('btn-schedule-register-female');

const btnTodayScheduleMale = document.getElementById('btn-today-schedule-male');
const btnMemoRegisterMale = document.getElementById('btn-memo-register-male');
const btnScheduleRegisterMale = document.getElementById('btn-schedule-register-male');

const scheduleRegisterPopup = document.getElementById('schedule-register-popup');
// V02 업데이트: 일정 등록 팝업의 새로운 ID들
const scheduleDateInput = document.getElementById('schedule-date-input');
const scheduleTimeInput = document.getElementById('schedule-time-input');
const scheduleAlarmTimeInput = document.getElementById('schedule-alarm-time-input');
const alarmOnceRadio = document.getElementById('alarm-once');
const alarmDailyRadio = document.getElementById('alarm-daily');
const scheduleTypeSelect = document.getElementById('schedule-type-select');
const scheduleContentTextarea = document.getElementById('schedule-content-textarea');

const saveScheduleFlatBtn = document.getElementById('save-schedule-flat');
const loadScheduleFlatBtn = document.getElementById('load-schedule-flat');
const newScheduleFlatBtn = document.getElementById('new-schedule-flat');


const btnOtherSchedule = document.getElementById('btn-other-schedule');
const btnRegisterFromScheduleRoom = document.getElementById('btn-register-from-schedule-room');
const scheduleListDisplay = document.getElementById('schedule-list-display'); // 일정 목록 표시 영역

const memoInputPopup = document.getElementById('memo-input-popup');
const btnNewMemo = document.getElementById('btn-new-memo');
const memoTitleInput = document.getElementById('memo-title-input');
const memoContentInput = document.getElementById('memo-content-input');
const saveMemoButton = document.getElementById('save-memo-button');
const memoListDisplay = document.getElementById('memo-list-display'); // 메모 목록 표시 영역
const btnMemoPrev = document.getElementById('btn-memo-prev');
const btnMemoNext = document.getElementById('btn-memo-next');

const navBackBtn = document.getElementById('nav-back');
const navHomeBtn = document.getElementById('nav-home');
const navForwardBtn = document.getElementById('nav-forward');

const comingSoonPopup = document.getElementById('coming-soon-popup');

// --- 오디오 요소 선택 및 관련 변수 ---
const chickenAudio = document.getElementById('chicken-audio');
const tigerAudio = document.getElementById('tiger-audio');
let currentPlayingAudio = null; // 현재 재생 중인 오디오를 관리하기 위한 변수

let currentScreen = null; // 현재 활성화된 화면 ID
let screenHistory = [];    // 화면 이동 기록 (앞으로/뒤로 버튼용)

// --- 데이터 관리 클래스 ---
class DataManager {
    static getSchedules() {
        const schedules = JSON.parse(localStorage.getItem('schedules')) || [];
        return schedules;
    }

    static addSchedule(schedule) {
        const schedules = DataManager.getSchedules();
        schedules.push(schedule);
        localStorage.setItem('schedules', JSON.stringify(schedules));
        console.log('일정 저장됨:', schedule);
        // 실제 알림 설정 로직 (PWA Push API, Notification API 등)은 여기에 추가되어야 함
        alert(`일정이 등록되었습니다!\n날짜: ${schedule.date}\n시간: ${schedule.time}\n내용: ${schedule.content}\n알림: ${schedule.alertType}`);
    }

    static deleteSchedule(id) {
        let schedules = DataManager.getSchedules();
        schedules = schedules.filter(schedule => schedule.id !== id);
        localStorage.setItem('schedules', JSON.stringify(schedules));
        console.log('일정 삭제됨:', id);
    }

    static getMemos() {
        const memos = JSON.parse(localStorage.getItem('memos')) || [];
        return memos;
    }

    static addMemo(memo) {
        const memos = DataManager.getMemos();
        memos.push(memo);
        localStorage.setItem('memos', JSON.stringify(memos));
        console.log('메모 저장됨:', memo);
        alert('메모가 저장되었습니다!');
    }

    static deleteMemo(id) {
        let memos = DataManager.getMemos();
        memos = memos.filter(memo => memo.id !== id);
        localStorage.setItem('memos', JSON.stringify(memos));
        console.log('메모 삭제됨:', id);
    }
}

// --- 화면 및 팝업 제어 함수 ---
function showScreen(screenId) {
    const allScreens = document.querySelectorAll('.screen');
    allScreens.forEach(screen => screen.classList.add('hidden'));

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        if (currentScreen !== screenId) { // 같은 화면으로 이동하는 경우 제외
            screenHistory.push(currentScreen);
            // 기록이 너무 길어지면 정리 (예: 10개까지만 유지)
            if (screenHistory.length > 10) {
                screenHistory.shift();
            }
        }
        currentScreen = screenId;

        // 특정 화면으로 이동 시 데이터 새로고침
        if (screenId === 'today-schedule-screen') {
            displaySchedules();
        } else if (screenId === 'memo-list-screen') {
            displayMemos();
        }
    } else {
        console.error(`Screen with ID '${screenId}' not found.`);
        showComingSoonPopup(); // 화면을 찾지 못하면 '준비중' 팝업
    }
}

function showPopup(popupId) {
    const popup = document.getElementById(popupId);
    if (popup) {
        popup.classList.remove('hidden');
    } else {
        console.error(`Popup with ID '${popupId}' not found.`);
    }
}

function hidePopup(popupId) {
    const popup = document.getElementById(popupId);
    if (popup) {
        popup.classList.add('hidden');
    } else {
        console.error(`Popup with ID '${popupId}' not found.`);
    }
}

function showComingSoonPopup() {
    showPopup('coming-soon-popup');
}

// --- 오디오 재생 기능 ---
// audioElement: 재생할 HTMLAudioElement 객체
// duration: 페이드인 되는 시간 (밀리초)
// maxVolume: 최종 볼륨 (0.0 ~ 1.0)
function playAudioWithFadeIn(audioElement, duration = 2000, maxVolume = 0.8) {
    // 이미 재생 중인 오디오가 있다면 중지하고 초기화
    if (currentPlayingAudio && currentPlayingAudio !== audioElement) {
        currentPlayingAudio.pause();
        currentPlayingAudio.currentTime = 0;
        currentPlayingAudio.volume = 0;
    }

    audioElement.volume = 0; // 시작 볼륨을 0으로 설정
    audioElement.play().catch(e => console.error("Audio play error:", e)); // 오디오 재생 시도, 에러 처리
    currentPlayingAudio = audioElement; // 현재 재생 중인 오디오 업데이트

    const fadeInterval = 50; // 볼륨을 조절하는 간격 (ms)
    let currentVolume = 0;
    const steps = duration / fadeInterval; // 총 스텝 수
    const volumeIncrement = maxVolume / steps; // 스텝당 증가할 볼륨

    const fadeInIntervalId = setInterval(() => {
        currentVolume += volumeIncrement;
        if (currentVolume >= maxVolume) {
            currentVolume = maxVolume;
            clearInterval(fadeInIntervalId); // 목표 볼륨에 도달하면 인터벌 중지
        }
        audioElement.volume = currentVolume;
    }, fadeInterval);

    // 일정 시간 후 오디오를 자동으로 멈추고 초기화 (울음소리처럼 짧은 효과음용)
    setTimeout(() => {
        if (audioElement === currentPlayingAudio) { // 아직 이 오디오가 재생 중이라면
            audioElement.pause();
            audioElement.currentTime = 0; // 재생 위치를 처음으로 리셋
            audioElement.volume = 0; // 볼륨도 리셋
            currentPlayingAudio = null;
        }
    }, duration + 1000); // 페이드인 시간 + 1초 정도 더 재생 후 중지
}


// --- 일정 관련 기능 ---
function displaySchedules() {
    scheduleListDisplay.innerHTML = ''; // 기존 목록 초기화
    const schedules = DataManager.getSchedules();

    if (schedules.length === 0) {
        scheduleListDisplay.innerHTML = '<p class="no-data">등록된 일정이 없습니다.</p>';
        return;
    }

    // 오늘 날짜 필터링 (간단 예시, 실제는 더 복잡한 날짜 비교 필요)
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const todaySchedules = schedules.filter(s => s.date === today);

    if (todaySchedules.length === 0) {
        scheduleListDisplay.innerHTML = '<p class="no-data">오늘 등록된 일정이 없습니다.</p>';
        return;
    }

    todaySchedules.sort((a, b) => a.time.localeCompare(b.time)); // 시간 순 정렬

    todaySchedules.forEach(schedule => {
        const scheduleItem = document.createElement('div');
        scheduleItem.classList.add('schedule-item');
        scheduleItem.dataset.id = schedule.id; // 데이터 삭제를 위해 id 저장

        scheduleItem.innerHTML = `
            <span class="schedule-time">${schedule.time}</span>
            <span class="schedule-content">${schedule.content}</span>
        `;
        // 클릭 시 상세 팝업 (준비중)
        scheduleItem.addEventListener('click', () => {
            alert(`[${schedule.time}] ${schedule.content}\n\n알림: ${schedule.alertType}`);
            //showComingSoonPopup(); // 상세 팝업 대신 임시 알림
        });
        scheduleListDisplay.appendChild(scheduleItem);
    });
}

// --- 메모 관련 기능 ---
function displayMemos() {
    memoListDisplay.innerHTML = ''; // 기존 목록 초기화
    const memos = DataManager.getMemos();

    if (memos.length === 0) {
        memoListDisplay.innerHTML = '<p class="no-data">등록된 메모가 없습니다.</p>';
        return;
    }

    memos.forEach(memo => {
        const memoItem = document.createElement('div');
        memoItem.classList.add('memo-item');
        memoItem.dataset.id = memo.id; // 데이터 삭제를 위해 id 저장

        memoItem.innerHTML = `
            <p class="memo-title">${memo.title}</p>
        `;
        // 클릭 시 상세 팝업 (준비중)
        memoItem.addEventListener('click', () => {
            alert(`[${memo.title}]\n\n${memo.content}`);
            //showComingSoonPopup(); // 상세 팝업 대신 임시 알림
        });
        memoListDisplay.appendChild(memoItem);
    });
}

// --- 이벤트 리스너 ---

// 앱 시작 시 목소리 선택 팝업 표시 (V03: 초기화 로직 강화)
document.addEventListener('DOMContentLoaded', () => {
    // 뷰포트 높이 설정 (모바일 하단 바 문제 해결)
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    window.addEventListener('resize', () => {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    });

    // V03: 모든 화면과 팝업을 먼저 숨긴 후, 원하는 팝업만 표시하여 초기 상태 강제
    document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
    document.querySelectorAll('.popup').forEach(popup => popup.classList.add('hidden'));

    showPopup('voice-selection-popup'); // 동물 선택 팝업만 표시
    currentScreen = null; // 초기 화면은 팝업이므로 스크린 기록 안함
});

// 목소리 선택 버튼
selectChickenBtn.addEventListener('click', () => {
    hidePopup('voice-selection-popup');
    showScreen('main-screen-female');
    playAudioWithFadeIn(chickenAudio, 1500, 0.8); // 닭 울음소리 재생
});

selectTigerBtn.addEventListener('click', () => {
    hidePopup('voice-selection-popup');
    showScreen('main-screen-male');
    playAudioWithFadeIn(tigerAudio, 1500, 0.8); // 호랑이 울음소리 재생
});

// 모든 팝업 닫기 버튼
closePopupButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        // closest()를 사용하여 클릭된 버튼의 가장 가까운 .close-popup-button 또는 .close-popup-button-flat을 찾음
        const popupTriggerButton = event.target.closest('.close-popup-button, .close-popup-button-flat');
        if (popupTriggerButton) {
            const popupId = popupTriggerButton.dataset.popup;
            hidePopup(popupId);
        }
    });
});

// --- 메인 화면 버튼 ---
btnTodayScheduleFemale.addEventListener('click', () => showScreen('today-schedule-screen'));
btnMemoRegisterFemale.addEventListener('click', () => showScreen('memo-list-screen'));
btnScheduleRegisterFemale.addEventListener('click', () => showPopup('schedule-register-popup'));

btnTodayScheduleMale.addEventListener('click', () => showScreen('today-schedule-screen'));
btnMemoRegisterMale.addEventListener('click', () => showScreen('memo-list-screen'));
btnScheduleRegisterMale.addEventListener('click', () => showPopup('schedule-register-popup'));

// --- 일정방 버튼 ---
btnOtherSchedule.addEventListener('click', showComingSoonPopup); // '다른 일정'은 준비중 팝업
btnRegisterFromScheduleRoom.addEventListener('click', () => showPopup('schedule-register-popup')); // 일정방에서 '일정 등록'

// --- 일정 등록 팝업 필드 및 버튼 이벤트 리스너 (V02 업데이트) ---
// '일자' 버튼 클릭 시 네이티브 달력 띄우기
// V03: HTML에서 selectDateButton 대신 input에 직접 연결
// selectDateButton.addEventListener('click', () => {
//     scheduleDateInput.click(); // 숨겨진 input[type="date"]를 클릭
// });

// '시간' 버튼 클릭 시 네이티브 시간 선택기 띄우기
// V03: HTML에서 selectTimeButton 대신 input에 직접 연결
// selectTimeButton.addEventListener('click', () => {
//     scheduleTimeInput.click(); // 숨겨진 input[type="time"]을 클릭
// });

// 알림 시간 input 클릭 시 시간 선택기 띄우기 (스크린샷에 알림 시간 필드가 있어서 추가)
// V03: input 자체에 클릭 리스너 연결
scheduleAlarmTimeInput.addEventListener('click', () => {
    // showPicker()는 모바일 브라우저에서만 작동할 수 있습니다.
    // 데스크톱에서는 일반적으로 클릭 시 달력/시간 선택 UI가 자동으로 나타납니다.
    if (typeof scheduleAlarmTimeInput.showPicker === 'function') {
        scheduleAlarmTimeInput.showPicker();
    } else {
        console.log("showPicker() 함수를 지원하지 않는 브라우저입니다.");
        // 필요하다면 여기에 대체 UI 로직 추가
    }
});


// 알림 유형 (소리/진동) 토글 버튼 (V03: 기존 버튼 ID 제거, 새로운 버튼 ID 없음)
// HTML에서 해당 버튼들이 제거되었으므로 이 리스너는 더 이상 필요 없습니다.
// 만약 스크린샷의 '소리', '진동' 라디오 버튼에 대한 알림 유형 선택 로직이라면
// HTML의 라디오 버튼 'alarm-once', 'alarm-daily'를 통해 처리됩니다.
// 이 부분은 현재 일정 등록 팝업 디자인에 맞춰 제거되었습니다.
/*
selectSoundTypeBtn.addEventListener('click', () => {
    selectSoundTypeBtn.classList.add('active');
    selectVibrationTypeBtn.classList.remove('active');
});
selectVibrationTypeBtn.addEventListener('click', () => {
    selectVibrationTypeBtn.classList.add('active');
    selectSoundTypeBtn.classList.remove('active');
});
*/


// 일정 저장 버튼 (스크린샷의 '저장' 버튼)
saveScheduleFlatBtn.addEventListener('click', () => {
    const date = scheduleDateInput.value;
    const time = scheduleTimeInput.value;
    const alarmTime = scheduleAlarmTimeInput.value; // 알림 시간 추가
    const alarmFrequency = alarmOnceRadio.checked ? 'once' : 'daily'; // 알림 주기 추가
    const type = scheduleTypeSelect.value; // 유형 추가
    const content = scheduleContentTextarea.value.trim();

    if (!date || !time || !content) {
        alert('날짜, 시간, 내용을 모두 입력해주세요.');
        return;
    }

    const newSchedule = {
        id: Date.now(),
        date: date,
        time: time,
        alarmTime: alarmTime,
        alarmFrequency: alarmFrequency,
        type: type,
        content: content
    };

    DataManager.addSchedule(newSchedule);
    // 입력 필드 초기화
    scheduleDateInput.value = '';
    scheduleTimeInput.value = '';
    scheduleAlarmTimeInput.value = '';
    alarmOnceRadio.checked = true; // 1회로 초기화
    scheduleTypeSelect.value = '';
    scheduleContentTextarea.value = '';

    hidePopup('schedule-register-popup');
    displaySchedules(); // 목록 새로고침
});

// '불러오기' 버튼 (현재 기능 없음, 준비중 팝업)
loadScheduleFlatBtn.addEventListener('click', showComingSoonPopup);

// '새로쓰기' 버튼 (입력 필드 초기화)
newScheduleFlatBtn.addEventListener('click', () => {
    scheduleDateInput.value = '';
    scheduleTimeInput.value = '';
    scheduleAlarmTimeInput.value = '';
    alarmOnceRadio.checked = true;
    scheduleTypeSelect.value = '';
    scheduleContentTextarea.value = '';
    alert('입력 필드가 초기화되었습니다.');
});


// --- 메모 관련 버튼 ---
btnNewMemo.addEventListener('click', () => showPopup('memo-input-popup'));

saveMemoButton.addEventListener('click', () => {
    const title = memoTitleInput.value.trim();
    const content = memoContentInput.value.trim();

    if (!title && !content) {
        alert('메모 내용을 입력해주세요.');
        return;
    }

    const newMemo = {
        id: Date.now(),
        title: title || '(제목 없음)', // 제목이 없으면 '(제목 없음)'
        content: content
    };

    DataManager.addMemo(newMemo);
    memoTitleInput.value = ''; // 입력 필드 초기화
    memoContentInput.value = ''; // 입력 필드 초기화
    hidePopup('memo-input-popup');
    displayMemos(); // 목록 새로고침
});

// 메모 목록 네비게이션 (준비중)
btnMemoPrev.addEventListener('click', showComingSoonPopup);
btnMemoNext.addEventListener('click', showComingSoonPopup);


// --- 하단 네비게이션 바 ---
navHomeBtn.addEventListener('click', () => {
    // 현재 활성화된 메인 화면으로 이동 (여성/남성)
    if (mainScreenFemale.classList.contains('hidden')) {
        showScreen('main-screen-male');
    } else {
        showScreen('main-screen-female');
    }
});

navBackBtn.addEventListener('click', () => {
    if (screenHistory.length > 1) { // 현재 화면 제외하고 이전 기록이 있다면
        const prevScreenId = screenHistory.pop(); // 현재 화면 바로 이전으로 되돌림
        const actualPrevScreenId = screenHistory.pop(); // 실제 돌아갈 화면 (현재 화면은 다시 넣을 것이므로)
        showScreen(actualPrevScreenId); // 이전 화면으로 이동
    } else if (screenHistory.length === 1 && screenHistory[0] === null) {
        // 앱 시작 시 목소리 팝업이 사라지고 첫 화면으로 왔을 때, 뒤로 가면 팝업 다시 띄움
        showPopup('voice-selection-popup');
        screenHistory = []; // 기록 초기화
        currentScreen = null;
        document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden')); // 모든 스크린 숨김
    } else {
        // 더 이상 뒤로 갈 화면이 없으면 홈으로
        alert('더 이상 뒤로 갈 화면이 없습니다. 홈으로 이동합니다.');
        navHomeBtn.click(); // 홈 버튼 클릭 로직 호출
    }
});

navForwardBtn.addEventListener('click', showComingSoonPopup); // '앞으로' 기능은 복잡하므로 '준비중'

// PWA 설치 제안 (선택 사항)
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // 설치 유도 UI 표시 (예: "앱 설치" 버튼)
    console.log('PWA 설치를 제안할 수 있습니다.');
});

// PWA 설치 버튼 (예시)
// const installButton = document.getElementById('install-button');
// if (installButton) {
//     installButton.addEventListener('click', () => {
//         if (deferredPrompt) {
//             deferredPrompt.prompt();
//             deferredPrompt.userChoice.then((choiceResult) => {
//                 if (choiceResult.outcome === 'accepted') {
//                     console.log('사용자가 PWA를 설치했습니다.');
//                 } else {
//                     console.log('사용자가 PWA 설치를 취소했습니다.');
//                 }
//                 deferredPrompt = null;
//             });
//         }
//     });
// }